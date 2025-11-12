"use client";

import { useState } from "react";
import { createCheckoutSession } from "@/app/actions/stripe";

interface PricingCardCTAProps {
  planKey: "FREE" | "STARTER" | "PRO";
  planName: string;
  isPopular: boolean;
}

export function PricingCardCTA({
  planKey,
  planName,
  isPopular,
}: PricingCardCTAProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (planKey === "FREE") return;

    setIsLoading(true);
    try {
      await createCheckoutSession(planKey);
    } catch (error) {
      console.error("Error starting checkout:", error);
      alert("Failed to start checkout. Please try again.");
      setIsLoading(false);
    }
  };

  if (planKey === "FREE") {
    return (
      <div className="block w-full rounded-lg border border-border bg-muted px-4 py-3 text-center text-sm font-semibold text-muted-foreground">
        Current Plan
      </div>
    );
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={isLoading}
      className={`block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${
        isPopular
          ? "bg-primary text-primary-foreground hover:opacity-90"
          : "border border-border bg-background hover:bg-accent"
      }`}
    >
      {isLoading ? "Loading..." : `Upgrade to ${planName}`}
    </button>
  );
}
