"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { store, newId } from "@/lib/store";
import { TABLES, type Category } from "@/lib/models";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

const Input = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(2).max(80),
  name_it: z.string().min(1).max(120),
  name_en: z.string().min(1).max(120),
  coverUrl: z.string().url().nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export async function upsertCategoryAction(fd: FormData) {
  const session = await requireAdmin();
  const data = Input.parse({
    id: fd.get("id") || undefined,
    slug: fd.get("slug"),
    name_it: fd.get("name_it"),
    name_en: fd.get("name_en"),
    coverUrl: fd.get("coverUrl") || null,
    sortOrder: fd.get("sortOrder") || 0,
  });

  if (data.id) {
    const before = await store.findOne<Category>(TABLES.categories, (c) => c.id === data.id);
    await store.updateWhere<Category>(TABLES.categories, (c) => c.id === data.id, {
      slug: data.slug,
      nameI18n: { it: data.name_it, en: data.name_en },
      coverUrl: data.coverUrl ?? null,
      sortOrder: data.sortOrder,
    });
    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email ?? null,
      action: "category.update",
      entityType: "category",
      entityId: data.id,
      before,
      after: data,
      headers: await headers(),
    });
  } else {
    const created: Category = {
      id: newId(),
      slug: data.slug,
      nameI18n: { it: data.name_it, en: data.name_en },
      coverUrl: data.coverUrl ?? null,
      sortOrder: data.sortOrder,
    };
    await store.insert<Category>(TABLES.categories, created);
    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email ?? null,
      action: "category.create",
      entityType: "category",
      entityId: created.id,
      after: created,
      headers: await headers(),
    });
  }
  revalidatePath("/admin/categories");
  revalidatePath("/[locale]/catalogue", "page");
  redirect("/admin/categories");
}

export async function deleteCategoryAction(fd: FormData) {
  const session = await requireAdmin();
  const id = z.string().uuid().parse(fd.get("id"));
  const before = await store.findOne<Category>(TABLES.categories, (c) => c.id === id);
  await store.deleteWhere<Category>(TABLES.categories, (c) => c.id === id);
  await logAudit({
    actorId: session.user.id,
    actorEmail: session.user.email ?? null,
    action: "category.delete",
    entityType: "category",
    entityId: id,
    before,
    headers: await headers(),
  });
  revalidatePath("/admin/categories");
}
