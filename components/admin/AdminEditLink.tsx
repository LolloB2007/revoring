import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { isPreviewMode } from "@/app/actions/admin-preview";

/**
 * Server-side admin affordance. Renders only when the current session belongs
 * to ADMIN_EMAIL AND the admin isn't in "preview as visitor" mode (toggled
 * from the AdminBar). Use it to drop "Edit" / "New" shortcuts on public pages
 * so the owner can jump straight from the public view into the matching admin
 * editor — without ever leaking the existence of /admin to other visitors.
 */
export async function AdminEditLink({
  href,
  label = "Modifica",
  variant = "pill",
  className = "",
}: {
  href: string;
  label?: string;
  variant?: "pill" | "card" | "floating";
  className?: string;
}) {
  if (!(await isAdmin())) return null;
  if (await isPreviewMode()) return null;

  if (variant === "floating") {
    return (
      <Link
        href={href}
        className={`fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white shadow-lg hover:bg-neutral-800 ${className}`}
      >
        <PencilIcon /> {label}
      </Link>
    );
  }
  if (variant === "card") {
    return (
      <Link
        href={href}
        className={`absolute top-2 right-2 z-10 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-neutral-900 shadow hover:bg-white ${className}`}
      >
        ✎ {label}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 ${className}`}
    >
      <PencilIcon /> {label}
    </Link>
  );
}

function PencilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
