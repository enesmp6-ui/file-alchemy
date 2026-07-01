import type { Tier } from "@/lib/useWeeklyLimit";

export type Plan = {
  tier: Tier;
  price: string;
  priceSub?: string;
  tagline: string;
  perks: string[];
  cta: string;
  featured?: boolean;
};

export const PLANS: Plan[] = [
  {
    tier: "guest",
    price: "₺0",
    priceSub: "always",
    tagline: "Try without an account.",
    perks: [
      "3 files per week",
      "Max. 5MB / file",
      "In-browser conversion",
      "No data leaves your device",
    ],
    cta: "Continue as Guest",
  },
  {
    tier: "free",
    price: "₺0",
    priceSub: "free with account",
    tagline: "Enough for light use.",
    perks: [
      "50 files per week",
      "Max. 100MB / file",
      "History and preferences",
      "Sync across multiple devices",
    ],
    cta: "Sign Up for Free",
  },
  {
    tier: "pro",
    price: "₺149",
    priceSub: "monthly · 14-day free trial",
    tagline: "Remove the limits.",
    perks: [
      "1000 files per week",
      "Max. 2GB / file",
      "Priority processing queue",
      "Batch ZIP download",
      "Premium support",
    ],
    cta: "Try Pro for 14 Days",
    featured: true,
  },
];
