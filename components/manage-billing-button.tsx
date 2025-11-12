"use client";

import { useState } from "react";
import { createBillingPortalSession } from "@/app/actions/stripe";

interface ManageBillingButtonProps {
  variant?: "default" | "outline";
}

export function ManageBillingButton({
  variant = "default",
}: ManageBillingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      await createBillingPortalSession();
    } catch (error) {
      console.error("Error opening billing portal:", error);
      alert("Failed to open billing portal. Please try again.");
      setIsLoading(false);
    }
  };

  const baseClasses =
    "block w-full rounded-lg px-4 py-2 text-center text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-50";

  const variantClasses =
    variant === "default"
      ? "bg-primary text-primary-foreground hover:opacity-90"
      : "border border-border bg-background hover:bg-accent";

  return (
    <button
      onClick={handleManageBilling}
      disabled={isLoading}
      className={`${baseClasses} ${variantClasses}`}
    >
      {isLoading ? "Loading..." : "Manage Billing"}
    </button>
  );
}
