import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return stripeClient;
}

export const PLANS = {
  monthly_brl: {
    name: "Nutri IA Mensal",
    price: 3990,
    currency: "brl",
    priceId: process.env.STRIPE_PRICE_BRL!,
    display: "R$ 39,90/mês",
  },
  monthly_usd: {
    name: "Nutri IA Monthly",
    price: 990,
    currency: "usd",
    priceId: process.env.STRIPE_PRICE_USD!,
    display: "US$ 9.90/month",
  },
} as const;
