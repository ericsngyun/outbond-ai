import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  PRICING_PLANS,
  getPlanLimits,
  isSubscriptionActive,
} from "@/lib/stripe";
import Link from "next/link";
import { Check, CreditCard, TrendingUp } from "lucide-react";
import { ManageBillingButton } from "@/components/manage-billing-button";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get user from database
  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
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

  // Determine current plan
  const activeSubscription = dbUser?.subscriptions[0];
  const currentPlan = activeSubscription
    ? getPlanLimits(activeSubscription.stripePriceId)
    : PRICING_PLANS.FREE;

  const planName =
    Object.entries(PRICING_PLANS).find(
      ([, plan]) => plan.priceId === activeSubscription?.stripePriceId
    )?.[0] || "FREE";

  const isActive = activeSubscription
    ? isSubscriptionActive(activeSubscription.status)
    : false;

  const renewalDate = activeSubscription?.stripeCurrentPeriodEnd;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            Outrep.ai
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="rounded-md px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10">
        <div className="container mx-auto px-4">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Welcome back,{" "}
              {user.firstName || user.emailAddresses[0]?.emailAddress}!
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Current Plan Card */}
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Current Plan</h2>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{currentPlan.name}</span>
                  {planName !== "FREE" && (
                    <span className="text-sm text-muted-foreground">
                      ${currentPlan.price}/mo
                    </span>
                  )}
                </div>
                {isActive && renewalDate && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Renews on {renewalDate.toLocaleDateString()}
                  </p>
                )}
                {activeSubscription?.status === "past_due" && (
                  <p className="mt-2 text-sm text-destructive">
                    Payment failed - Please update payment method
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {currentPlan.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                {planName === "FREE" ? (
                  <Link
                    href="/pricing"
                    className="block w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    Upgrade Plan
                  </Link>
                ) : (
                  <ManageBillingButton />
                )}
              </div>
            </div>

            {/* Usage Card */}
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Usage This Month</h2>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">0</span>
                  <span className="text-sm text-muted-foreground">
                    / {currentPlan.limits.personalizations}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Personalizations
                </p>
              </div>
              <div className="mb-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(0 / currentPlan.limits.personalizations) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentPlan.limits.personalizations} personalizations remaining
              </p>
            </div>

            {/* Quick Actions Card */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/pricing"
                  className="block rounded-lg border border-border p-3 text-sm font-medium transition-colors hover:bg-accent"
                >
                  View All Plans
                </Link>
                {planName !== "FREE" && (
                  <ManageBillingButton variant="outline" />
                )}
                <a
                  href="mailto:support@outrep.ai"
                  className="block rounded-lg border border-border p-3 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>

          {/* Plan Features */}
          <div className="mt-8 rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Your Plan Includes:</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
