import { auth } from "@/lib/auth";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * TOTP setup. First load: generate a secret + QR (not persisted until verified).
 * The user scans the QR with an authenticator app, types the 6-digit code, and
 * the action persists the secret + totp_enabled=true and shows backup codes.
 */
export default async function TwoFactorPage({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string; otpauth?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/it/account/signin");

  const sp = await searchParams;
  const secret = sp.secret ?? authenticator.generateSecret();
  const otpauth =
    sp.otpauth ??
    authenticator.keyuri(session.user.email ?? "admin", "Revoring Admin", secret);
  const qrSvg = await QRCode.toString(otpauth, { type: "svg", margin: 1, width: 240 });

  async function enable(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    const code = String(formData.get("code") ?? "");
    const submittedSecret = String(formData.get("secret") ?? "");
    if (!authenticator.check(code, submittedSecret)) {
      // bounce back with the same secret so user can try again
      return redirect(
        `/admin/security/2fa?secret=${encodeURIComponent(submittedSecret)}&error=invalid`,
      );
    }
    const backup = Array.from({ length: 8 }, () =>
      [...crypto.getRandomValues(new Uint8Array(8))]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 10),
    );
    await db
      .update(schema.users)
      .set({ totpSecret: submittedSecret, totpEnabled: true, backupCodes: backup })
      .where(eq(schema.users.id, session.user.id));
    redirect("/admin/security/2fa/success");
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-semibold tracking-tight">Two-factor authentication</h1>
      <p className="mt-2 text-neutral-600">
        Scan the QR code with Google Authenticator, 1Password, or Authy — then enter the 6-digit code to enable 2FA.
      </p>
      <div
        className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 inline-block"
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />
      <p className="mt-2 text-xs text-neutral-500 font-mono break-all">{secret}</p>

      <form action={enable} className="mt-6 space-y-3">
        <input type="hidden" name="secret" value={secret} />
        <Input name="code" placeholder="123456" inputMode="numeric" maxLength={6} required />
        <Button type="submit">Enable 2FA</Button>
      </form>
    </div>
  );
}
