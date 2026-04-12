import type Stripe from "stripe";

let _stripeClient: Stripe | null = null;
let _stripeKey: string | null = null;

export async function getStripeClient(): Promise<Stripe | null> {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (_stripeClient && _stripeKey === process.env.STRIPE_SECRET_KEY) return _stripeClient;
  const StripeModule = (await import("stripe")).default;
  _stripeClient = new StripeModule(process.env.STRIPE_SECRET_KEY);
  _stripeKey = process.env.STRIPE_SECRET_KEY;
  return _stripeClient;
}
