import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verify as verifyPassword, hash as hashPassword } from "@node-rs/argon2";
import { z } from "zod";
import { store, newId } from "./store";
import { TABLES, type User } from "./models";
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
const ARGON2_OPTS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 };

/**
 * Hard-coded admin password. Anyone who knows ADMIN_EMAIL and this literal can
 * sign in as admin. We auto-create the admin row on first login so the admin
 * doesn't need to run signup separately.
 *
 * TODO: replace with an admin-set password (via /admin/security) before
 * deploying to production.
 */
const ADMIN_PASSWORD_LITERAL = "admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/it/account/signin",
    error: "/it/account/signin",
  },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        totp: {},
      },
      async authorize(raw) {
        const parsed = z
          .object({
            email: z.string().email().transform((s) => s.toLowerCase().trim()),
            password: z.string().min(1).max(200),
            totp: z.string().optional(),
          })
          .safeParse(raw);
        if (!parsed.success) return null;
        const { email, password, totp: totpCode } = parsed.data;

        // --- Admin bypass: hard-coded literal password for ADMIN_EMAIL --------
        if (email === env.ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD_LITERAL) {
          // Auto-create the admin row on first sign-in so other parts of the
          // app that look up the user by id keep working.
          let admin = await store.findOne<User>(TABLES.users, (u) => u.email === email);
          if (!admin) {
            admin = {
              id: newId(),
              email,
              name: "Admin",
              hashedPassword: null,
              role: "admin",
              totpSecret: null,
              totpEnabled: false,
              backupCodes: null,
              failedLoginCount: 0,
              lockedUntil: null,
              createdAt: new Date(),
            };
            await store.insert<User>(TABLES.users, admin);
          } else if (admin.role !== "admin") {
            await store.updateWhere<User>(TABLES.users, (u) => u.id === admin!.id, {
              role: "admin",
            });
            admin.role = "admin";
          }
          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: "admin",
            totpEnabled: admin.totpEnabled,
          };
        }

        // --- Normal user path -------------------------------------------------
        const user = await store.findOne<User>(TABLES.users, (u) => u.email === email);
        if (!user) return null;
        if (user.lockedUntil && user.lockedUntil > new Date()) return null;

        const hash =
          user.hashedPassword ?? "$argon2id$v=19$m=19456,t=2,p=1$dummy$dummy";
        const ok = await verifyPassword(hash, password).catch(() => false);
        if (!ok || !user.hashedPassword) {
          await bumpFailed(user.id);
          return null;
        }

        if (user.totpEnabled) {
          if (!totpCode || !user.totpSecret) return null;
          const valid = authenticator.check(totpCode, user.totpSecret);
          if (!valid) {
            await bumpFailed(user.id);
            return null;
          }
        }

        // Reset failure counters
        await store.updateWhere<User>(TABLES.users, (u) => u.id === user.id, {
          failedLoginCount: 0,
          lockedUntil: null,
        });

        // Auto-promote admin email even if they signed up the normal way.
        let effectiveRole: "user" | "admin" = user.role;
        if (user.email === env.ADMIN_EMAIL.toLowerCase() && user.role !== "admin") {
          await store.updateWhere<User>(TABLES.users, (u) => u.id === user.id, {
            role: "admin",
          });
          effectiveRole = "admin";
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: effectiveRole,
          totpEnabled: user.totpEnabled,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: "user" | "admin" }).role ?? "user";
        token.totpEnabled = !!(user as { totpEnabled?: boolean }).totpEnabled;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = String(token.id);
        session.user.role = (token.role as "user" | "admin") ?? "user";
        session.user.totpEnabled = !!token.totpEnabled;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: env.NODE_ENV === "production" ? "__Secure-revoring.session" : "revoring.session",
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
  const user = await store.findOne<User>(TABLES.users, (u) => u.id === userId);
  if (!user) return;
  const next = (user.failedLoginCount ?? 0) + 1;
  await store.updateWhere<User>(TABLES.users, (u) => u.id === userId, {
    failedLoginCount: next,
    lockedUntil:
      next >= MAX_FAILED ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null,
  });
}

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.email?.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
}

/** Used by the signup server action. */
export async function createUserWithPassword(input: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  const email = input.email.toLowerCase().trim();
  const existing = await store.findOne<User>(TABLES.users, (u) => u.email === email);
  if (existing) throw new Error("email-taken");
  const hashed = await hashPassword(input.password, ARGON2_OPTS);
  const user: User = {
    id: newId(),
    email,
    name: input.name,
    hashedPassword: hashed,
    role: email === env.ADMIN_EMAIL.toLowerCase() ? "admin" : "user",
    totpSecret: null,
    totpEnabled: false,
    backupCodes: null,
    failedLoginCount: 0,
    lockedUntil: null,
    createdAt: new Date(),
  };
  await store.insert<User>(TABLES.users, user);
  return user;
}
