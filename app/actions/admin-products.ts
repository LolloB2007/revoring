"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { store, newId } from "@/lib/store";
import { TABLES, type Product, type ProductVariant } from "@/lib/models";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { sanitizeHtml } from "@/lib/sanitize";

const I18n = z.object({ en: z.string().min(1).max(500), it: z.string().min(1).max(500) });
const I18nLong = z.object({ en: z.string().min(1).max(8000), it: z.string().min(1).max(8000) });
const Image = z.object({ url: z.string().url(), alt: z.string().min(1).max(300) });

const ProductInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(2).max(80),
  nameI18n: I18n,
  descriptionI18n: I18nLong,
  priceCents: z.coerce.number().int().min(0).max(100_000_00),
  currency: z.enum(["EUR", "USD", "GBP"]).default("EUR"),
  stock: z.coerce.number().int().min(0).max(100_000),
  isActive: z.coerce.boolean().default(true),
  weightGrams: z.coerce.number().int().min(0).max(1_000_000).optional(),
  images: z.array(Image).max(8),
  categoryId: z.string().uuid().nullable().optional(),
  defaultVariantSku: z.string().min(1).max(80),
});

function parseFromForm(fd: FormData) {
  const images = JSON.parse(String(fd.get("images") ?? "[]"));
  return ProductInput.parse({
    id: fd.get("id") || undefined,
    slug: fd.get("slug"),
    nameI18n: { en: fd.get("name_en"), it: fd.get("name_it") },
    descriptionI18n: {
      en: sanitizeHtml(String(fd.get("description_en") ?? "")),
      it: sanitizeHtml(String(fd.get("description_it") ?? "")),
    },
    priceCents: fd.get("priceCents"),
    currency: fd.get("currency") ?? "EUR",
    stock: fd.get("stock"),
    isActive: fd.get("isActive") === "on",
    weightGrams: fd.get("weightGrams") || undefined,
    images,
    categoryId: (fd.get("categoryId") as string) || null,
    defaultVariantSku: fd.get("defaultVariantSku"),
  });
}

export async function upsertProductAction(fd: FormData) {
  const session = await requireAdmin();
  const data = parseFromForm(fd);
  const now = new Date();

  if (data.id) {
    const before = await store.findOne<Product>(TABLES.products, (p) => p.id === data.id);
    await store.updateWhere<Product>(TABLES.products, (p) => p.id === data.id, {
      slug: data.slug,
      nameI18n: data.nameI18n,
      descriptionI18n: data.descriptionI18n,
      priceCents: data.priceCents,
      currency: data.currency,
      stock: data.stock,
      isActive: data.isActive,
      weightGrams: data.weightGrams ?? null,
      images: data.images,
      categoryId: data.categoryId ?? null,
      updatedAt: now,
    });
    const after = await store.findOne<Product>(TABLES.products, (p) => p.id === data.id);
    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email ?? null,
      action: "product.update",
      entityType: "product",
      entityId: data.id,
      before,
      after,
      headers: await headers(),
    });
  } else {
    const created: Product = {
      id: newId(),
      slug: data.slug,
      nameI18n: data.nameI18n,
      descriptionI18n: data.descriptionI18n,
      priceCents: data.priceCents,
      currency: data.currency,
      stock: data.stock,
      isActive: data.isActive,
      weightGrams: data.weightGrams ?? null,
      images: data.images,
      categoryId: data.categoryId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    await store.insert<Product>(TABLES.products, created);
    await store.insert<ProductVariant>(TABLES.variants, {
      id: newId(),
      productId: created.id,
      sku: data.defaultVariantSku,
      attrs: {},
      priceCents: null,
      stock: data.stock,
    });
    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email ?? null,
      action: "product.create",
      entityType: "product",
      entityId: created.id,
      after: created,
      headers: await headers(),
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/[locale]/catalogue", "page");
  revalidatePath(`/[locale]/catalogue/${data.slug}`, "page");
  redirect("/admin/products");
}

export async function deleteProductAction(fd: FormData) {
  const session = await requireAdmin();
  const id = z.string().uuid().parse(fd.get("id"));
  const before = await store.findOne<Product>(TABLES.products, (p) => p.id === id);
  await store.deleteWhere<ProductVariant>(TABLES.variants, (v) => v.productId === id);
  await store.deleteWhere<Product>(TABLES.products, (p) => p.id === id);
  await logAudit({
    actorId: session.user.id,
    actorEmail: session.user.email ?? null,
    action: "product.delete",
    entityType: "product",
    entityId: id,
    before,
    headers: await headers(),
  });
  revalidatePath("/admin/products");
  revalidatePath("/[locale]/catalogue", "page");
}
