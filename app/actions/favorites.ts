"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { store } from "@/lib/store";
import { TABLES, type Favorite } from "@/lib/models";
import { auth } from "@/lib/auth";

const ProductId = z.string().uuid();

export async function toggleFavoriteAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, reason: "auth-required" };
  const parsed = ProductId.safeParse(formData.get("productId"));
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const productId = parsed.data;
  const userId = session.user.id;

  const existing = await store.findOne<Favorite>(
    TABLES.favorites,
    (f) => f.userId === userId && f.productId === productId,
  );
  if (existing) {
    await store.deleteWhere<Favorite>(
      TABLES.favorites,
      (f) => f.userId === userId && f.productId === productId,
    );
    revalidatePath("/[locale]/account/favorites", "page");
    return { ok: true, favorited: false };
  }
  await store.insert<Favorite>(TABLES.favorites, {
    userId,
    productId,
    createdAt: new Date(),
  });
  revalidatePath("/[locale]/account/favorites", "page");
  return { ok: true, favorited: true };
}
