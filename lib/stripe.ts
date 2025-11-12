import Stripe from "stripe";
import { env } from "@/lib/env";

/**
 * Stripe client singleton
 *
 * Configured with:
 * - Latest API version (2025-02-24.acacia)
 * - TypeScript support
 * - Server-side only (never expose to client)
 *
 * Reference: https://docs.stripe.com/api
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20", // Latest stable version supported by stripe@16.11.0
  typescript: true,
});

/**
 * Pricing tiers
 *
 * Price IDs come from Stripe Dashboard → Products
 * Should be configured in environment variables
 */
export const PRICING_PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    priceId: null, // No Stripe price for free tier
    features: [
      "50 personalizations/month",
      "Basic AI personalization",
      "CSV export",
      "Email support",
    ],
    limits: {
      personalizations: 50,
    },
  },
  STARTER: {
    name: "Starter",
    price: 49,
    priceId: env.STRIPE_PRICE_ID_STARTER || null,
    features: [
      "500 personalizations/month",
      "Advanced AI personalization",
      "CSV export",
      "Priority email support",
      "Gmail integration",
    ],
    limits: {
      personalizations: 500,
    },
  },
  PRO: {
    name: "Pro",
    price: 149,
    priceId: env.STRIPE_PRICE_ID_PRO || null,
    features: [
      "2,000 personalizations/month",
      "Advanced AI personalization",
      "CSV export",
      "Priority support",
      "Gmail integration",
      "Multi-step sequences",
      "Analytics dashboard",
    ],
    limits: {
      personalizations: 2000,
    },
  },
} as const;

export type PricingPlan = keyof typeof PRICING_PLANS;

/**
 * Get plan limits based on subscription status
 */
export function getPlanLimits(
  priceId: string | null
): (typeof PRICING_PLANS)[PricingPlan] {
  if (priceId === PRICING_PLANS.STARTER.priceId) {
    return PRICING_PLANS.STARTER;
  }
  if (priceId === PRICING_PLANS.PRO.priceId) {
    return PRICING_PLANS.PRO;
  }
  return PRICING_PLANS.FREE;
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(status: string): boolean {
  return ["active", "trialing"].includes(status);
}
