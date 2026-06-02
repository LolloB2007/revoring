import { redirect, notFound } from "next/navigation";
import { auth } from "./auth";
import { env } from "./env";

/**
 * Server-only guard for admin server actions and routes. Call at the top of
 * every admin server action or page that hasn't already been protected by the
 * /admin layout. Returns the session for convenience.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/it/account/signin?callbackUrl=/admin");
  if (session.user.email !== env.ADMIN_EMAIL) notFound();
  return session;
}
