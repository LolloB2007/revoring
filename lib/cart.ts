import { cookies } from "next/headers";
import { store, newId, newToken } from "./store";
import { TABLES, type Cart, type CartItem, type Product, type ProductVariant } from "./models";
import { auth } from "./auth";

const CART_COOKIE = "revoring.cart";

export async function getOrCreateCart(): Promise<{ id: string }> {
  const session = await auth();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CART_COOKIE)?.value;

  if (session?.user?.id) {
    const existing = await store.findOne<Cart>(TABLES.carts, (c) => c.userId === session.user.id);
    if (existing) return { id: existing.id };
    const created: Cart = {
      id: newId(),
      userId: session.user.id,
      sessionToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await store.insert(TABLES.carts, created);
    return { id: created.id };
  }

  if (sessionToken) {
    const existing = await store.findOne<Cart>(
      TABLES.carts,
      (c) => c.sessionToken === sessionToken,
    );
    if (existing) return { id: existing.id };
  }

  const token = newToken(40);
  const created: Cart = {
    id: newId(),
    userId: null,
    sessionToken: token,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await store.insert(TABLES.carts, created);
  cookieStore.set(CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return { id: created.id };
}

export interface CartViewItem {
  itemId: string;
  qty: number;
  variantId: string;
  sku: string;
  attrs: Record<string, string>;
  productId: string;
  productSlug: string;
  nameI18n: { en: string; it: string };
  unitPriceCents: number;
  currency: string;
  image: string | null;
  lineTotalCents: number;
  stock: number;
}

export async function getCartView(): Promise<{
  cartId: string;
  items: CartViewItem[];
  subtotalCents: number;
}> {
  const { id: cartId } = await getOrCreateCart();
  const items = await store.findMany<CartItem>(TABLES.cartItems, (i) => i.cartId === cartId);
  const variants = await store.all<ProductVariant>(TABLES.variants);
  const products = await store.all<Product>(TABLES.products);

  const view: CartViewItem[] = [];
  for (const it of items) {
    const v = variants.find((x) => x.id === it.variantId);
    if (!v) continue;
    const p = products.find((x) => x.id === v.productId);
    if (!p) continue;
    const unit = v.priceCents ?? p.priceCents;
    view.push({
      itemId: it.id,
      qty: it.qty,
      variantId: v.id,
      sku: v.sku,
      attrs: v.attrs,
      productId: p.id,
      productSlug: p.slug,
      nameI18n: p.nameI18n,
      unitPriceCents: unit,
      currency: p.currency,
      image: p.images[0]?.url ?? null,
      lineTotalCents: unit * it.qty,
      stock: v.stock,
    });
  }
  const subtotal = view.reduce((a, b) => a + b.lineTotalCents, 0);
  return { cartId, items: view, subtotalCents: subtotal };
}

export async function setCartQty(variantId: string, qty: number): Promise<void> {
  const { id: cartId } = await getOrCreateCart();
  const safeQty = Math.max(0, Math.min(99, Math.floor(qty)));

  const v = await store.findOne<ProductVariant>(TABLES.variants, (x) => x.id === variantId);
  if (!v) return;
  const clamped = Math.min(safeQty, v.stock);

  const existing = await store.findOne<CartItem>(
    TABLES.cartItems,
    (i) => i.cartId === cartId && i.variantId === variantId,
  );

  if (clamped === 0) {
    if (existing) {
      await store.deleteWhere<CartItem>(TABLES.cartItems, (i) => i.id === existing.id);
    }
    return;
  }
  if (existing) {
    await store.updateWhere<CartItem>(TABLES.cartItems, (i) => i.id === existing.id, {
      qty: clamped,
    });
  } else {
    await store.insert<CartItem>(TABLES.cartItems, {
      id: newId(),
      cartId,
      variantId,
      qty: clamped,
    });
  }
}

export async function addToCart(variantId: string, qty = 1): Promise<void> {
  const view = await getCartView();
  const current = view.items.find((i) => i.variantId === variantId)?.qty ?? 0;
  await setCartQty(variantId, current + qty);
}

export async function clearCart(): Promise<void> {
  const { id: cartId } = await getOrCreateCart();
  await store.deleteWhere<CartItem>(TABLES.cartItems, (i) => i.cartId === cartId);
}
