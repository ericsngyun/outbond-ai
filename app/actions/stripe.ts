"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { PRICING_PLANS } from "@/lib/stripe";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

/**
 * Create a Stripe Checkout session for subscription upgrade
 *
 * Best Practices:
 * - Never trust client prices (look up from server-side PRICING_PLANS)
 * - Require authentication (auth check)
 * - Store clerkId in metadata for webhook processing
 * - Use type-safe plan keys
 * - Proper error handling
 *
 * Reference: https://docs.stripe.com/checkout/quickstart
 */
export async function createCheckoutSession(plan: "STARTER" | "PRO") {
  // 1. Verify authentication
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await currentUser();
  if (!user) {
    throw new Error("User not found");
  }

  // 2. Validate plan and get price ID (NEVER trust client)
  const planConfig = PRICING_PLANS[plan];
  if (!planConfig.priceId) {
    throw new Error(`Price ID not configured for ${plan} plan`);
  }

  // 3. Get or create user in database
  const dbUser = await db.user.upsert({
    where: { clerkId: userId },
    create: {
      clerkId: userId,
      email: user.emailAddresses[0].emailAddress,
      name: user.fullName,
      imageUrl: user.imageUrl,
    },
    update: {
      email: user.emailAddresses[0].emailAddress,
      name: user.fullName,
      imageUrl: user.imageUrl,
    },
  });

  // 4. Check if user already has an active subscription
  const existingSubscription = await db.subscription.findFirst({
    where: {
      userId: dbUser.id,
      status: {
        in: ["active", "trialing"],
      },
    },
  });

  // If user has active subscription, redirect to billing portal instead
  if (existingSubscription) {
    const billingPortalSession = await stripe.billingPortal.sessions.create({
      customer: existingSubscription.stripeCustomerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });
    redirect(billingPortalSession.url);
  }

  // 5. Create Stripe Checkout session
  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: user.emailAddresses[0].emailAddress,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing?checkout=canceled`,
      metadata: {
        clerkId: userId,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          clerkId: userId,
          plan: plan,
        },
      },
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session");
    }

    // 6. Redirect to Stripe Checkout
    redirect(session.url);
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error("Failed to create checkout session");
  }
}

/**
 * Create a Stripe Billing Portal session for subscription management
 *
 * Allows users to:
 * - Update payment method
 * - Cancel subscription
 * - View invoices
 *
 * Reference: https://docs.stripe.com/billing/subscriptions/integrating-customer-portal
 */
export async function createBillingPortalSession() {
  // 1. Verify authentication
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Get user from database
  const dbUser = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      subscriptions: {
        where: {
          status: {
            in: ["active", "trialing", "past_due"],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!dbUser || dbUser.subscriptions.length === 0) {
    throw new Error("No active subscription found");
  }

  const subscription = dbUser.subscriptions[0];

  // 3. Create billing portal session
  try {
    const billingPortalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    // 4. Redirect to billing portal
    redirect(billingPortalSession.url);
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    throw new Error("Failed to create billing portal session");
  }
}
