import Stripe from "stripe";
import { env } from "./env";

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  cached = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-05-27.dahlia",
    typescript: true,
    appInfo: { name: "revoring.com", version: "1.0.0" },
  });
  return cached;
}
