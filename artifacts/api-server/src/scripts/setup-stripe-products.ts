import { PLAN_DEFINITIONS, type PlanId } from "../lib/billing/plans";

async function setupStripeProducts() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.log("STRIPE_SECRET_KEY not set — skipping Stripe product setup");
    process.exit(0);
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(stripeKey);

  const plansToSetup: PlanId[] = ["starter", "growth", "business"];

  for (const planId of plansToSetup) {
    const plan = PLAN_DEFINITIONS[planId];
    const productName = `NexsusHR ${plan.name} Plan`;

    const existingProducts = await stripe.products.list({ limit: 100 });
    let product = existingProducts.data.find(
      (p) => p.name === productName && p.active,
    );

    if (!product) {
      product = await stripe.products.create({
        name: productName,
        description: plan.description,
        metadata: { planId, sla: plan.sla, supportLevel: plan.supportLevel },
      });
      console.log(`Created product: ${productName} (${product.id})`);
    } else {
      console.log(`Product already exists: ${productName} (${product.id})`);
    }

    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 10,
    });

    const monthlyPrice = existingPrices.data.find(
      (p) => p.recurring?.interval === "month" && p.unit_amount === plan.monthly * 100,
    );
    if (!monthlyPrice) {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.monthly * 100,
        currency: "usd",
        recurring: { interval: "month" },
        metadata: { planId, cycle: "monthly" },
      });
      console.log(`  Created monthly price: $${plan.monthly}/mo (${price.id})`);
    } else {
      console.log(`  Monthly price exists: $${plan.monthly}/mo (${monthlyPrice.id})`);
    }

    const annualPrice = existingPrices.data.find(
      (p) => p.recurring?.interval === "year" && p.unit_amount === plan.annual * 100 * 12,
    );
    if (!annualPrice) {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.annual * 100 * 12,
        currency: "usd",
        recurring: { interval: "year" },
        metadata: { planId, cycle: "annual" },
      });
      console.log(`  Created annual price: $${plan.annual}/mo billed annually (${price.id})`);
    } else {
      console.log(`  Annual price exists: $${plan.annual}/mo billed annually (${annualPrice.id})`);
    }
  }

  console.log("\nStripe product setup complete!");
}

setupStripeProducts().catch((err) => {
  console.error("Stripe setup failed:", err);
  process.exit(1);
});
