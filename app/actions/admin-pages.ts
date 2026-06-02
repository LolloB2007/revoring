"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { sanitizeHtml } from "@/lib/sanitize";

const Input = z.object({
  key: z.enum(["about", "privacy", "cookies", "terms", "contacts"]),
  body_en: z.string().max(80_000),
  body_it: z.string().max(80_000),
});

export async function savePageAction(fd: FormData) {
  const session = await requireAdmin();
  const parsed = Input.parse({
    key: fd.get("key"),
    body_en: sanitizeHtml(String(fd.get("body_en") ?? "")),
    body_it: sanitizeHtml(String(fd.get("body_it") ?? "")),
  });

  const [before] = await db.select().from(schema.pages).where(eq(schema.pages.key, parsed.key));
  await db
    .insert(schema.pages)
    .values({ key: parsed.key, bodyI18n: { en: parsed.body_en, it: parsed.body_it } })
    .onConflictDoUpdate({
      target: schema.pages.key,
      set: { bodyI18n: { en: parsed.body_en, it: parsed.body_it }, updatedAt: new Date() },
    });

  await logAudit({
    actorId: session.user.id,
    actorEmail: session.user.email ?? null,
    action: "page.update",
    entityType: "page",
    entityId: parsed.key,
    before,
    after: { key: parsed.key, body_en: parsed.body_en.slice(0, 200), body_it: parsed.body_it.slice(0, 200) },
    headers: await headers(),
  });

  revalidatePath(`/[locale]/${pathFor(parsed.key)}`, "page");
}

function pathFor(key: string): string {
  if (["privacy", "cookies", "terms"].includes(key)) return `legal/${key}`;
  return key;
}
