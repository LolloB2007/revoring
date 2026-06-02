import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db, schema } from "./db";
import { auth } from "./auth";

const CART_COOKIE = "revoring.cart";

/**
 * Find or create the active cart for the current visitor. Logged-in users get
 * a user-scoped cart; guests get a cookie-scoped cart that can be merged into
 * their user cart on sign-in.
 */
export async function getOrCreateCart(): Promise<{ id: string }> {
  const session = await auth();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CART_COOKIE)?.value;

  if (session?.user?.id) {
    const [existing] = await db
      .select()
      .from(schema.carts)
      .where(eq(schema.carts.userId, session.user.id));
    if (existing) return { id: existing.id };
    const [created] = await db
      .insert(schema.carts)
      .values({ userId: session.user.id })
      .returning({ id: schema.carts.id });
    return { id: created.id };
  }

  if (sessionToken) {
    const [existing] = await db
      .select()
      .from(schema.carts)
      .where(eq(schema.carts.sessionToken, sessionToken));
    if (existing) return { id: existing.id };
  }

  const token = nanoid(40);
  const [created] = await db
    .insert(schema.carts)
    .values({ sessionToken: token })
    .returning({ id: schema.carts.id });
  cookieStore.set(CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return { id: created.id };
}

/**
 * Hydrate the cart with product + variant data and DB-priced totals. Never
 * trust client-supplied prices.
 */
export async function getCartView() {
  const { id: cartId } = await getOrCreateCart();
  const rows = await db
    .select({
      itemId: schema.cartItems.id,
      qty: schema.cartItems.qty,
      variantId: schema.productVariants.id,
      sku: schema.productVariants.sku,
      variantAttrs: schema.productVariants.attrs,
      variantPriceCents: schema.productVariants.priceCents,
      productId: schema.products.id,
      productSlug: schema.products.slug,
      productNameI18n: schema.products.nameI18n,
      productPriceCents: schema.products.priceCents,
      productImages: schema.products.images,
      currency: schema.products.currency,
      stock: schema.productVariants.stock,
    })
    .from(schema.cartItems)
    .innerJoin(schema.productVariants, eq(schema.cartItems.variantId, schema.productVariants.id))
    .innerJoin(schema.products, eq(schema.productVariants.productId, schema.products.id))
    .where(eq(schema.cartItems.cartId, cartId));

  const items = rows.map((r) => {
    const unit = r.variantPriceCents ?? r.productPriceCents;
    return {
      itemId: r.itemId,
      qty: r.qty,
      variantId: r.variantId,
      sku: r.sku,
      attrs: r.variantAttrs,
      productId: r.productId,
      productSlug: r.productSlug,
      nameI18n: r.productNameI18n,
      unitPriceCents: unit,
      currency: r.currency,
      image: r.productImages[0]?.url ?? null,
      lineTotalCents: unit * r.qty,
      stock: r.stock,
    };
  });

  const subtotal = items.reduce((a, b) => a + b.lineTotalCents, 0);
  return { cartId, items, subtotalCents: subtotal };
}

export async function setCartQty(variantId: string, qty: number): Promise<void> {
  const { id: cartId } = await getOrCreateCart();
  const safeQty = Math.max(0, Math.min(99, Math.floor(qty)));

  // Stock check
  const [v] = await db
    .select({ stock: schema.productVariants.stock })
    .from(schema.productVariants)
    .where(eq(schema.productVariants.id, variantId));
  if (!v) return;
  const clamped = Math.min(safeQty, v.stock);

  const [existing] = await db
    .select()
    .from(schema.cartItems)
    .where(and(eq(schema.cartItems.cartId, cartId), eq(schema.cartItems.variantId, variantId)));

  if (clamped === 0) {
    if (existing) await db.delete(schema.cartItems).where(eq(schema.cartItems.id, existing.id));
    return;
  }
  if (existing) {
    await db.update(schema.cartItems).set({ qty: clamped }).where(eq(schema.cartItems.id, existing.id));
  } else {
    await db.insert(schema.cartItems).values({ cartId, variantId, qty: clamped });
  }
}

export async function addToCart(variantId: string, qty = 1): Promise<void> {
  const view = await getCartView();
  const current = view.items.find((i) => i.variantId === variantId)?.qty ?? 0;
  await setCartQty(variantId, current + qty);
}

export async function clearCart(): Promise<void> {
  const { id: cartId } = await getOrCreateCart();
  await db.delete(schema.cartItems).where(eq(schema.cartItems.cartId, cartId));
}
