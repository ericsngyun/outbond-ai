import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import Stripe from "stripe";

export const runtime = "nodejs";

/**
 * Stripe webhook handler for subscription management
 *
 * Handles critical subscription events:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - checkout.session.completed
 *
 * Security: Verifies webhook signature using STRIPE_WEBHOOK_SECRET
 * Best Practice: Uses await request.text() for raw body (Next.js 15 App Router)
 *
 * Reference: https://docs.stripe.com/webhooks
 */
export async function POST(req: Request) {
  // Get raw body for signature verification (CRITICAL for Next.js 15)
  const body = await req.text();

  // Get signature from headers
  const headerPayload = await headers();
  const signature = headerPayload.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;

  // Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", errorMessage);
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Get subscription details
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          // Find user by clerkId (stored in metadata)
          const clerkId = session.metadata?.clerkId;
          if (!clerkId) {
            throw new Error("No clerkId in session metadata");
          }

          const user = await db.user.findUnique({
            where: { clerkId },
          });

          if (!user) {
            throw new Error(`User not found for clerkId: ${clerkId}`);
          }

          // Create or update subscription
          await db.subscription.upsert({
            where: { stripeCustomerId: session.customer as string },
            create: {
              userId: user.id,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
              status: subscription.status,
            },
            update: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
              status: subscription.status,
            },
          });
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        // Update subscription in database
        await db.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
            status: subscription.status,
          },
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Mark subscription as canceled
        await db.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: "canceled",
          },
        });

        break;
      }

      default:
        console.warn(`Unhandled Stripe webhook event: ${event.type}`);
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error);
    return new Response(
      `Webhook handler failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}
