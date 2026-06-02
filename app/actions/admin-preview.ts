"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const PREVIEW_COOKIE = "revoring.preview";

/**
 * Toggle "preview as visitor" mode. When the cookie is set, the AdminEditLink
 * affordances hide themselves on the public site even though the admin is
 * still signed in. Lets the owner check how the site looks to a normal
 * visitor without signing out.
 */
export async function togglePreviewAction() {
  const jar = await cookies();
  const has = jar.get(PREVIEW_COOKIE)?.value === "1";
  if (has) {
    jar.delete(PREVIEW_COOKIE);
  } else {
    jar.set(PREVIEW_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  revalidatePath("/", "layout");
}

export async function isPreviewMode(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(PREVIEW_COOKIE)?.value === "1";
}
