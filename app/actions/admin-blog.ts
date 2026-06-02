"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { sanitizeHtml } from "@/lib/sanitize";

const I18nShort = z.object({ en: z.string().min(1).max(500), it: z.string().min(1).max(500) });
const I18nHtml = z.object({ en: z.string().min(1).max(60_000), it: z.string().min(1).max(60_000) });

const Input = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(2).max(120),
  titleI18n: I18nShort,
  excerptI18n: I18nShort,
  bodyI18n: I18nHtml,
  coverUrl: z.string().url().optional().nullable(),
  coverAlt: z.string().max(300).optional().nullable(),
  tags: z.array(z.string().max(40)).max(10),
  publish: z.coerce.boolean().default(false),
});

function parse(fd: FormData) {
  return Input.parse({
    id: fd.get("id") || undefined,
    slug: fd.get("slug"),
    titleI18n: { en: fd.get("title_en"), it: fd.get("title_it") },
    excerptI18n: { en: fd.get("excerpt_en"), it: fd.get("excerpt_it") },
    bodyI18n: {
      en: sanitizeHtml(String(fd.get("body_en") ?? "")),
      it: sanitizeHtml(String(fd.get("body_it") ?? "")),
    },
    coverUrl: fd.get("coverUrl") || null,
    coverAlt: fd.get("coverAlt") || null,
    tags: String(fd.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    publish: fd.get("publish") === "on",
  });
}

export async function upsertPostAction(fd: FormData) {
  const session = await requireAdmin();
  const data = parse(fd);
  const publishedAt = data.publish ? new Date() : null;

  if (data.id) {
    const [before] = await db.select().from(schema.blogPosts).where(eq(schema.blogPosts.id, data.id));
    const [updated] = await db
      .update(schema.blogPosts)
      .set({
        slug: data.slug,
        titleI18n: data.titleI18n,
        excerptI18n: data.excerptI18n,
        bodyI18n: data.bodyI18n,
        coverUrl: data.coverUrl ?? null,
        coverAlt: data.coverAlt ?? null,
        tags: data.tags,
        publishedAt: publishedAt ?? before?.publishedAt ?? null,
        updatedAt: new Date(),
      })
      .where(eq(schema.blogPosts.id, data.id))
      .returning();
    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email ?? null,
      action: "blog.update",
      entityType: "blog_post",
      entityId: data.id,
      before,
      after: updated,
      headers: await headers(),
    });
  } else {
    const [created] = await db
      .insert(schema.blogPosts)
      .values({
        slug: data.slug,
        titleI18n: data.titleI18n,
        excerptI18n: data.excerptI18n,
        bodyI18n: data.bodyI18n,
        coverUrl: data.coverUrl ?? null,
        coverAlt: data.coverAlt ?? null,
        tags: data.tags,
        publishedAt,
        authorId: session.user.id,
      })
      .returning();
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
  const [before] = await db.select().from(schema.blogPosts).where(eq(schema.blogPosts.id, id));
  await db.delete(schema.blogPosts).where(eq(schema.blogPosts.id, id));
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
