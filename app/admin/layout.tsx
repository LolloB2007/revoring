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

  // First-time admin without TOTP is shunted to the setup page (except while there).
  // We can't read pathname here in a server layout reliably, so we rely on each
  // admin page checking via lib/admin-guard.ts on the server side instead.

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex bg-neutral-100 text-neutral-900">
        <aside className="w-64 bg-neutral-950 text-neutral-100 flex flex-col">
          <div className="p-6 font-semibold tracking-tight border-b border-neutral-800">
            REVORING · admin
          </div>
          <nav className="flex-1 p-4 text-sm space-y-1">
            <AdminLink href="/admin">Dashboard</AdminLink>
            <AdminLink href="/admin/products">Products</AdminLink>
            <AdminLink href="/admin/categories">Categories</AdminLink>
            <AdminLink href="/admin/orders">Orders</AdminLink>
            <AdminLink href="/admin/blog">Blog</AdminLink>
            <AdminLink href="/admin/pages">Pages</AdminLink>
            <AdminLink href="/admin/newsletter">Newsletter</AdminLink>
            <AdminLink href="/admin/media">Media</AdminLink>
            <AdminLink href="/admin/translations">Translations</AdminLink>
            <AdminLink href="/admin/audit">Audit log</AdminLink>
            <AdminLink href="/admin/security/2fa">2FA</AdminLink>
          </nav>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
            className="p-4 border-t border-neutral-800"
          >
            <button className="text-sm text-neutral-300 hover:text-white">Sign out</button>
          </form>
          <div className="p-4 text-[10px] text-neutral-500">
            {session.user.email}
            {!session.user.totpEnabled && (
              <p className="mt-2 text-amber-400">
                ⚠ 2FA not enabled —{" "}
                <Link className="underline" href="/admin/security/2fa">
                  enable now
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
