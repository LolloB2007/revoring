import Link from "next/link";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { isPreviewMode, togglePreviewAction } from "@/app/actions/admin-preview";

/**
 * Sticky bar pinned to the top of the public site when the current visitor
 * is the admin. Lets them jump back to /admin, toggle "preview as visitor"
 * mode (which hides every AdminEditLink), or sign out. Invisible to everyone
 * else.
 */
export async function AdminBar({ locale }: { locale: string }) {
  const session = await auth();
  if (!session?.user || session.user.email !== env.ADMIN_EMAIL) return null;
  const preview = await isPreviewMode();

  return (
    <div className="sticky top-0 z-50 bg-neutral-950 text-neutral-100 border-b border-neutral-800">
      <div className="container-x flex items-center justify-between gap-4 py-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 font-semibold tracking-wider uppercase">
            <span
              className={`h-2 w-2 rounded-full ${preview ? "bg-neutral-500" : "bg-[color:var(--color-brand)]"}`}
              aria-hidden
            />
            {preview ? "Anteprima visitatore" : "Modalità admin"}
          </span>
          <span className="hidden sm:inline text-neutral-500">·</span>
          <span className="hidden sm:inline text-neutral-400">{session.user.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <form action={togglePreviewAction}>
            <button
              type="submit"
              className="rounded-full border border-neutral-700 px-3 py-1 hover:border-neutral-400 hover:text-white transition"
            >
              {preview ? "Esci da anteprima" : "Anteprima come visitatore"}
            </button>
          </form>
          <Link
            href="/admin"
            className="rounded-full bg-white text-neutral-900 px-3 py-1 font-medium hover:bg-neutral-100"
          >
            Vai all&apos;admin →
          </Link>
        </div>
      </div>
    </div>
  );
}
