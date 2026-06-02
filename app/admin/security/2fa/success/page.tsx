import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function TwoFactorSuccess() {
  const session = await auth();
  if (!session?.user?.id) redirect("/it/account/signin");
  const [row] = await db
    .select({ codes: schema.users.backupCodes })
    .from(schema.users)
    .where(eq(schema.users.id, session.user.id));
  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-semibold tracking-tight">2FA enabled</h1>
      <p className="mt-2 text-neutral-600">
        Save these one-time backup codes in a password manager. Each works once if you lose access to your authenticator app.
      </p>
      <ul className="mt-6 grid grid-cols-2 gap-2 font-mono text-sm bg-white p-4 rounded-lg border border-neutral-200">
        {(row?.codes ?? []).map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  );
}
