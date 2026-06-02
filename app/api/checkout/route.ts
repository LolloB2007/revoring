import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCartView } from "@/lib/cart";
import { store, newId } from "@/lib/store";
import { TABLES, type Order, type OrderItem } from "@/lib/models";
import { getStripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";

const Body = z.object({ locale: z.enum(["it", "en"]).default("it") });

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  const locale = parsed.success ? parsed.data.locale : "it";

  const session = await auth();
  const view = await getCartView();
  if (view.items.length === 0)
    return NextResponse.json({ error: "empty-cart" }, { status: 400 });

  const stripe = getStripe();

  const order: Order = {
    id: newId(),
    userId: session?.user?.id ?? null,
    email: session?.user?.email ?? "",
    stripePaymentIntent: null,
    stripeCheckoutSession: null,
    status: "pending",
    totalCents: view.subtotalCents,
    currency: view.items[0]?.currency ?? "EUR",
    shippingAddress: null,
    billingAddress: null,
    createdAt: new Date(),
  };
  await store.insert<Order>(TABLES.orders, order);

  const orderItems: OrderItem[] = view.items.map((i) => ({
    id: newId(),
    orderId: order.id,
    variantId: i.variantId,
    productSnapshot: {
      name: i.nameI18n,
      sku: i.sku,
      attrs: i.attrs,
      image: i.image,
    },
    unitPriceCents: i.unitPriceCents,
    qty: i.qty,
  }));
  await store.insertMany<OrderItem>(TABLES.orderItems, orderItems);

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: session?.user?.email ?? undefined,
    line_items: view.items.map((i) => ({
      quantity: i.qty,
      price_data: {
        currency: i.currency.toLowerCase(),
        unit_amount: i.unitPriceCents,
        product_data: {
          name: i.nameI18n[locale] ?? i.nameI18n.en,
          images: i.image ? [i.image] : undefined,
        },
      },
    })),
    locale: locale === "it" ? "it" : "en",
    success_url: `${env.NEXT_PUBLIC_SITE_URL}/${locale}/checkout/success?cs={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_SITE_URL}/${locale}/cart`,
    shipping_address_collection: {
      allowed_countries: ["IT", "FR", "DE", "ES", "AT", "BE", "NL", "PT", "IE", "GB", "US"],
    },
    metadata: { orderId: order.id },
  });

  await store.updateWhere<Order>(TABLES.orders, (o) => o.id === order.id, {
    stripeCheckoutSession: checkout.id,
    stripePaymentIntent:
      typeof checkout.payment_intent === "string" ? checkout.payment_intent : null,
  });

  return NextResponse.json({ url: checkout.url });
}
