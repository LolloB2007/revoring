import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { env } from "@/lib/env";

/**
 * Admin gate. Anyone who isn't the configured ADMIN_EMAIL gets a 404 — the
 * surface is invisible to non-admins. Once the user is in, the layout
 * enforces TOTP and shows the admin navigation.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/it/account/signin?callbackUrl=/admin");
  if (session.user.email !== env.ADMIN_EMAIL) notFound();

  return (
    <html lang="it" className="h-full">
      <body className="min-h-full flex bg-neutral-100 text-neutral-900">
        <aside className="w-64 bg-neutral-950 text-neutral-100 flex flex-col">
          <div className="p-6 border-b border-neutral-800">
            <p className="font-semibold tracking-tight">REVORING · admin</p>
            <Link
              href="/it"
              className="mt-3 inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition"
            >
              ← Torna al sito
            </Link>
          </div>
          <nav className="flex-1 p-4 text-sm space-y-1">
            <Section label="Panoramica">
              <AdminLink href="/admin">Dashboard</AdminLink>
            </Section>
            <Section label="Catalogo">
              <AdminLink href="/admin/products">Prodotti</AdminLink>
              <AdminLink href="/admin/categories">Categorie</AdminLink>
              <AdminLink href="/admin/orders">Ordini</AdminLink>
            </Section>
            <Section label="Contenuti">
              <AdminLink href="/admin/blog">Blog</AdminLink>
              <AdminLink href="/admin/media">Media</AdminLink>
              <AdminLink href="/admin/translations">Traduzioni</AdminLink>
            </Section>
            <Section label="Comunicazione">
              <AdminLink href="/admin/newsletter">Newsletter</AdminLink>
            </Section>
            <Section label="Sistema">
              <AdminLink href="/admin/audit">Registro attività</AdminLink>
              <AdminLink href="/admin/security/2fa">Sicurezza · 2FA</AdminLink>
            </Section>
          </nav>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
            className="p-4 border-t border-neutral-800"
          >
            <button className="text-sm text-neutral-300 hover:text-white">Esci</button>
          </form>
          <div className="p-4 text-[10px] text-neutral-500 leading-relaxed">
            {session.user.email}
            {!session.user.totpEnabled && (
              <p className="mt-2 text-amber-400">
                ⚠ 2FA non attiva —{" "}
                <Link className="underline" href="/admin/security/2fa">
                  attiva ora
                </Link>
              </p>
            )}
          </div>
        </aside>
        <div className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </div>
      </body>
    </html>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pt-3 first:pt-0">
      <p className="px-3 pb-1 text-[10px] uppercase tracking-[0.18em] text-neutral-500">{label}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded hover:bg-neutral-800 transition-colors"
    >
      {children}
    </Link>
  );
}
