import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { clearCart } from "@/lib/cart";

// Stripe webhooks need the raw body for signature verification.
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
    return NextResponse.json({ error: "bad-signature", detail: (e as Error).message }, { status: 400 });
  }

  // Replay-window check: reject events older than 5 minutes.
  const FIVE_MIN = 5 * 60;
  if (event.created < Math.floor(Date.now() / 1000) - FIVE_MIN) {
    return NextResponse.json({ error: "stale" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = (session.metadata as Record<string, string> | null)?.orderId;
    if (orderId) {
      await db
        .update(schema.orders)
        .set({
          status: "paid",
          stripePaymentIntent:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
          shippingAddress:
            // Stripe types differ across versions; cast through unknown.
            ((session as unknown as { shipping_details?: { address?: Record<string, string> } })
              .shipping_details?.address as Record<string, string> | undefined) ?? null,
          email: session.customer_details?.email ?? "",
        })
        .where(eq(schema.orders.id, orderId));
      // Best-effort: clear the cart that produced this order. The Stripe session
      // doesn't carry the cart cookie, so we only do it for logged-in users.
      try {
        await clearCart();
      } catch {
        // ignore
      }
    }
  } else if (event.type === "charge.refunded" || event.type === "payment_intent.canceled") {
    const obj = event.data.object as { payment_intent?: string; id?: string };
    const pi = "payment_intent" in obj && obj.payment_intent ? obj.payment_intent : obj.id;
    if (pi && typeof pi === "string") {
      await db
        .update(schema.orders)
        .set({ status: event.type.includes("refund") ? "refunded" : "cancelled" })
        .where(eq(schema.orders.stripePaymentIntent, pi));
    }
  }

  return NextResponse.json({ received: true });
}
