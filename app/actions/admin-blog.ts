"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { store, newId } from "@/lib/store";
import { TABLES, type BlogPost } from "@/lib/models";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { sanitizeHtml } from "@/lib/sanitize";

const I18nShort = z.object({ en: z.string().min(1).max(500), it: z.string().min(1).max(500) });
const I18nHtml = z.object({ en: z.string().min(1).max(60_000), it: z.string().min(1).max(60_000) });

const Input = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug deve contenere solo a-z, 0-9 e trattini").min(2).max(120),
  titleI18n: I18nShort,
  excerptI18n: I18nShort,
  bodyI18n: I18nHtml,
  coverUrl: z.string().url().optional().nullable(),
  coverAlt: z.string().max(300).optional().nullable(),
  tags: z.array(z.string().max(40)).max(10).default([]),
  publish: z.coerce.boolean().default(false),
});

function parse(fd: FormData) {
  return Input.parse({
    id: fd.get("id") || undefined,
    slug: String(fd.get("slug") ?? "").trim().toLowerCase(),
    titleI18n: {
      en: String(fd.get("title_en") ?? "").trim(),
      it: String(fd.get("title_it") ?? "").trim(),
    },
    excerptI18n: {
      en: String(fd.get("excerpt_en") ?? "").trim(),
      it: String(fd.get("excerpt_it") ?? "").trim(),
    },
    bodyI18n: {
      en: sanitizeHtml(String(fd.get("body_en") ?? "")),
      it: sanitizeHtml(String(fd.get("body_it") ?? "")),
    },
    coverUrl: String(fd.get("coverUrl") ?? "").trim() || null,
    coverAlt: String(fd.get("coverAlt") ?? "").trim() || null,
    tags: String(fd.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    publish: fd.get("publish") === "on",
  });
}

/**
 * Same validation-error wrapper as admin-products: log issues + throw a
 * readable message instead of a raw ZodError.
 */
function validate(fd: FormData) {
  try {
    return parse(fd);
  } catch (e) {
    if (e instanceof z.ZodError) {
      const fieldList = e.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("; ");
      console.error("[admin-blog] validation failed:", e.issues);
      throw new Error(`Validazione fallita — ${fieldList}`);
    }
    throw e;
  }
}

export async function upsertPostAction(fd: FormData) {
  const session = await requireAdmin();
  const data = validate(fd);
  const publishedAt = data.publish ? new Date() : null;
  const now = new Date();

  if (data.id) {
    const before = await store.findOne<BlogPost>(TABLES.blogPosts, (p) => p.id === data.id);
    await store.updateWhere<BlogPost>(TABLES.blogPosts, (p) => p.id === data.id, (row) => ({
      slug: data.slug,
      titleI18n: data.titleI18n,
      excerptI18n: data.excerptI18n,
      bodyI18n: data.bodyI18n,
      coverUrl: data.coverUrl ?? null,
      coverAlt: data.coverAlt ?? null,
      tags: data.tags,
      publishedAt: publishedAt ?? row.publishedAt ?? null,
      updatedAt: now,
    }));
    const after = await store.findOne<BlogPost>(TABLES.blogPosts, (p) => p.id === data.id);
    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email ?? null,
      action: "blog.update",
      entityType: "blog_post",
      entityId: data.id,
      before,
      after,
      headers: await headers(),
    });
  } else {
    const created: BlogPost = {
      id: newId(),
      slug: data.slug,
      titleI18n: data.titleI18n,
      excerptI18n: data.excerptI18n,
      bodyI18n: data.bodyI18n,
      coverUrl: data.coverUrl ?? null,
      coverAlt: data.coverAlt ?? null,
      tags: data.tags,
      publishedAt,
      authorId: session.user.id,
      createdAt: now,
      updatedAt: now,
    };
    await store.insert<BlogPost>(TABLES.blogPosts, created);
    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email ?? null,
      action: "blog.create",
      entityType: "blog_post",
      entityId: created.id,
      after: created,
      headers: await headers(),
    });
  }
  revalidatePath("/admin/blog");
  revalidatePath("/[locale]/blog", "page");
  revalidatePath(`/[locale]/blog/${data.slug}`, "page");
  redirect("/admin/blog");
}

export async function deletePostAction(fd: FormData) {
  const session = await requireAdmin();
  const id = z.string().uuid().parse(fd.get("id"));
  const before = await store.findOne<BlogPost>(TABLES.blogPosts, (p) => p.id === id);
  await store.deleteWhere<BlogPost>(TABLES.blogPosts, (p) => p.id === id);
  await logAudit({
    actorId: session.user.id,
    actorEmail: session.user.email ?? null,
    action: "blog.delete",
    entityType: "blog_post",
    entityId: id,
    before,
    headers: await headers(),
  });
  revalidatePath("/admin/blog");
  revalidatePath("/[locale]/blog", "page");
}
