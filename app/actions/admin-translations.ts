"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { store } from "@/lib/store";
import { TABLES, type UiTranslation } from "@/lib/models";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

const Input = z.object({
  key: z.string().min(1).max(200),
  it: z.string().max(2000),
  en: z.string().max(2000),
});

export async function saveTranslationAction(fd: FormData) {
  const session = await requireAdmin();
  const data = Input.parse({
    key: fd.get("key"),
    it: fd.get("it"),
    en: fd.get("en"),
  });

  const before = await store.findOne<UiTranslation>(TABLES.uiTranslations, (t) => t.key === data.key);
  await store.upsert<UiTranslation>(
    TABLES.uiTranslations,
    (t) => t.key === data.key,
    () => ({ key: data.key, it: data.it, en: data.en, updatedAt: new Date() }),
    { it: data.it, en: data.en, updatedAt: new Date() },
  );
  await logAudit({
    actorId: session.user.id,
    actorEmail: session.user.email ?? null,
    action: "translation.update",
    entityType: "translation",
    entityId: data.key,
    before,
    after: data,
    headers: await headers(),
  });
  revalidatePath("/admin/translations");
}
