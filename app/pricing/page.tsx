import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { PRICING_PLANS } from "@/lib/stripe";
import { Check } from "lucide-react";
import { PricingCardCTA } from "@/components/pricing-card-cta";

export const metadata = {
  title: "Pricing - Outrep.ai",
  description:
    "Choose the perfect plan for your outbound personalization needs",
};

export default function PricingPage() {
  const plans = [
    { key: "FREE" as const, popular: false },
    { key: "STARTER" as const, popular: true },
    { key: "PRO" as const, popular: false },
  ];

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
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-md px-4 py-2 text-sm font-medium hover:bg-accent">
                  Sign In
                </button>
              </SignInButton>
              <Link
                href="/sign-up"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Pricing Content */}
      <main className="flex-1 py-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Choose the plan that fits your outbound personalization needs.
              Start free, upgrade anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-3">
            {plans.map(({ key, popular }) => {
              const plan = PRICING_PLANS[key];
              return (
                <div
                  key={key}
                  className={`relative flex flex-col rounded-2xl border ${
                    popular
                      ? "border-primary shadow-lg ring-2 ring-primary"
                      : "border-border"
                  } bg-card p-8`}
                >
                  {/* Popular Badge */}
                  {popular && (
                    <div className="absolute -top-4 left-0 right-0 mx-auto w-fit">
                      <span className="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan Name */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold tracking-tight">
                        ${plan.price}
                      </span>
                      <span className="ml-2 text-muted-foreground">/month</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="mb-8 flex-1 space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="mr-3 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <SignedOut>
                    <Link
                      href="/sign-up"
                      className={`block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-opacity ${
                        popular
                          ? "bg-primary text-primary-foreground hover:opacity-90"
                          : "border border-border bg-background hover:bg-accent"
                      }`}
                    >
                      Get started
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <PricingCardCTA
                      planKey={key}
                      planName={plan.name}
                      isPopular={popular}
                    />
                  </SignedIn>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mx-auto mt-24 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
            <dl className="mt-10 space-y-8">
              <div>
                <dt className="text-lg font-semibold">
                  Can I change plans at any time?
                </dt>
                <dd className="mt-3 text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. When
                  you upgrade, you&apos;ll be charged a prorated amount for the
                  remainder of the billing period.
                </dd>
              </div>
              <div>
                <dt className="text-lg font-semibold">
                  What happens if I exceed my monthly limit?
                </dt>
                <dd className="mt-3 text-muted-foreground">
                  If you reach your monthly personalization limit, you&apos;ll
                  need to upgrade to a higher tier to continue. We&apos;ll
                  notify you before you hit your limit.
                </dd>
              </div>
              <div>
                <dt className="text-lg font-semibold">
                  Do you offer annual billing?
                </dt>
                <dd className="mt-3 text-muted-foreground">
                  Not yet, but we&apos;re working on it! Annual billing with a
                  discount will be available soon.
                </dd>
              </div>
              <div>
                <dt className="text-lg font-semibold">
                  Can I cancel my subscription?
                </dt>
                <dd className="mt-3 text-muted-foreground">
                  Yes, you can cancel your subscription at any time from your
                  billing settings. You&apos;ll continue to have access until
                  the end of your current billing period.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need help choosing a plan?{" "}
              <a
                href="mailto:support@outrep.ai"
                className="text-primary hover:underline"
              >
                Contact us
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
