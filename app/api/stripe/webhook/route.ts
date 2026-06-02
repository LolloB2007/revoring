import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { store } from "@/lib/store";
import { TABLES, type Order } from "@/lib/models";
import { env } from "@/lib/env";
import { clearCart } from "@/lib/cart";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "webhook-not-configured" }, { status: 503 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing-signature" }, { status: 400 });

  const raw = await req.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return NextResponse.json(
      { error: "bad-signature", detail: (e as Error).message },
      { status: 400 },
    );
  }

  const FIVE_MIN = 5 * 60;
  if (event.created < Math.floor(Date.now() / 1000) - FIVE_MIN) {
    return NextResponse.json({ error: "stale" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as unknown as {
      metadata?: Record<string, string>;
      payment_intent?: string;
      shipping_details?: { address?: Record<string, string> };
      customer_details?: { email?: string };
    };
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await store.updateWhere<Order>(TABLES.orders, (o) => o.id === orderId, {
        status: "paid",
        stripePaymentIntent:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        shippingAddress: session.shipping_details?.address ?? null,
        email: session.customer_details?.email ?? "",
      });
      try {
        await clearCart();
      } catch {
        /* ignore */
      }
    }
  } else if (event.type === "charge.refunded" || event.type === "payment_intent.canceled") {
    const obj = event.data.object as { payment_intent?: string; id?: string };
    const pi = "payment_intent" in obj && obj.payment_intent ? obj.payment_intent : obj.id;
    if (pi && typeof pi === "string") {
      await store.updateWhere<Order>(TABLES.orders, (o) => o.stripePaymentIntent === pi, {
        status: event.type.includes("refund") ? "refunded" : "cancelled",
      });
    }
  }

  return NextResponse.json({ received: true });
}
