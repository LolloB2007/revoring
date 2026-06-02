import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Nodemailer from "next-auth/providers/nodemailer";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { verify as verifyPassword } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "./db";
import { env } from "./env";
import { authenticator } from "otplib";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "admin";
      totpEnabled: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    role?: "user" | "admin";
    totpEnabled?: boolean;
  }
}

const LOCKOUT_MINUTES = 15;
const MAX_FAILED = 5;

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Casts: the adapter's expected types are tightly coupled to its sample
  // schema; ours is functionally compatible but uses a uuid PK + custom column
  // names, hence the localized any.
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users as never,
    accountsTable: schema.accounts as never,
    sessionsTable: schema.sessions as never,
    verificationTokensTable: schema.verificationTokens as never,
  }),
  session: { strategy: "database" },
  pages: {
    signIn: "/it/account/signin",
    error: "/it/account/signin",
  },
  trustHost: true,
  providers: [
    ...(env.SMTP_HOST
      ? [
          Nodemailer({
            server: {
              host: env.SMTP_HOST,
              port: env.SMTP_PORT,
              secure: env.SMTP_SECURE,
              auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
            },
            from: env.SMTP_FROM,
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: {},
        password: {},
        totp: {},
      },
      async authorize(raw) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(8).max(200),
            totp: z.string().optional(),
          })
          .safeParse(raw);
        if (!parsed.success) return null;
        const { email, password, totp: totpCode } = parsed.data;

        const [user] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email.toLowerCase()));
        // Constant-time-ish: always verify against a dummy hash if user missing.
        const HASH_FOR_MISSING = "$argon2id$v=19$m=19456,t=2,p=1$dummy$dummy";
        const hash = user?.hashedPassword ?? HASH_FOR_MISSING;

        if (user?.lockedUntil && user.lockedUntil > new Date()) return null;

        const ok = await verifyPassword(hash, password).catch(() => false);
        if (!user || !ok) {
          if (user) await bumpFailed(user.id);
          return null;
        }

        // 2FA enforcement for admin (and any user who enabled it).
        if (user.totpEnabled) {
          if (!totpCode || !user.totpSecret) return null;
          const valid = authenticator.check(totpCode, user.totpSecret);
          if (!valid) {
            await bumpFailed(user.id);
            return null;
          }
        } else if (user.email === env.ADMIN_EMAIL) {
          // Admin without TOTP: allow first login so they can set it up.
          // Setup flow at /admin/security/2fa enforces enablement before granting full access.
        }

        await db
          .update(schema.users)
          .set({ failedLoginCount: 0, lockedUntil: null })
          .where(eq(schema.users.id, user.id));

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          totpEnabled: user.totpEnabled,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // user comes from the database adapter
      const [row] = await db
        .select({
          id: schema.users.id,
          role: schema.users.role,
          totpEnabled: schema.users.totpEnabled,
        })
        .from(schema.users)
        .where(eq(schema.users.id, user.id));
      session.user.id = user.id;
      session.user.role = row?.role ?? "user";
      session.user.totpEnabled = row?.totpEnabled ?? false;
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: "__Secure-revoring.session",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: env.NODE_ENV === "production",
      },
    },
  },
});

async function bumpFailed(userId: string) {
  const [u] = await db
    .select({ count: schema.users.failedLoginCount })
    .from(schema.users)
    .where(eq(schema.users.id, userId));
  const next = (u?.count ?? 0) + 1;
  const update: { failedLoginCount: number; lockedUntil?: Date | null } = {
    failedLoginCount: next,
  };
  if (next >= MAX_FAILED) {
    update.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
  }
  await db.update(schema.users).set(update).where(eq(schema.users.id, userId));
}

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.email === env.ADMIN_EMAIL;
}
