import { auth } from "@/lib/auth";
import { store } from "@/lib/store";
import { TABLES, type User } from "@/lib/models";
import { redirect } from "next/navigation";

export default async function TwoFactorSuccess() {
  const session = await auth();
  if (!session?.user?.id) redirect("/it/account/signin");
  const row = await store.findOne<User>(TABLES.users, (u) => u.id === session.user.id);
  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-semibold tracking-tight">2FA attivata</h1>
      <p className="mt-2 text-neutral-600">
        Salva questi codici di backup in un password manager. Ciascuno è utilizzabile una sola volta in caso di perdita dell&apos;app authenticator.
      </p>
      <ul className="mt-6 grid grid-cols-2 gap-2 font-mono text-sm bg-white p-4 rounded-lg border border-neutral-200">
        {(row?.backupCodes ?? []).map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  );
}
