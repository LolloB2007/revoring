"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const ProductId = z.string().uuid();

export async function toggleFavoriteAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, reason: "auth-required" };
  const parsed = ProductId.safeParse(formData.get("productId"));
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const productId = parsed.data;

  const [existing] = await db
    .select()
    .from(schema.favorites)
    .where(
      and(
        eq(schema.favorites.userId, session.user.id),
        eq(schema.favorites.productId, productId),
      ),
    );
  if (existing) {
    await db
      .delete(schema.favorites)
      .where(
        and(
          eq(schema.favorites.userId, session.user.id),
          eq(schema.favorites.productId, productId),
        ),
      );
    revalidatePath("/[locale]/account/favorites", "page");
    return { ok: true, favorited: false };
  }
  await db.insert(schema.favorites).values({ userId: session.user.id, productId });
  revalidatePath("/[locale]/account/favorites", "page");
  return { ok: true, favorited: true };
}
