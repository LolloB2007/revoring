"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addToCart, setCartQty } from "@/lib/cart";

const VariantId = z.string().uuid();

export async function addToCartAction(formData: FormData) {
  const parsed = VariantId.safeParse(formData.get("variantId"));
  if (!parsed.success) return;
  const qty = Math.max(1, Math.min(10, Number(formData.get("qty") ?? 1)));
  await addToCart(parsed.data, qty);
  revalidatePath("/[locale]/cart", "page");
}

export async function setQtyAction(formData: FormData) {
  const parsed = VariantId.safeParse(formData.get("variantId"));
  if (!parsed.success) return;
  const qty = Math.max(0, Math.min(99, Number(formData.get("qty") ?? 1)));
  await setCartQty(parsed.data, qty);
  revalidatePath("/[locale]/cart", "page");
}
