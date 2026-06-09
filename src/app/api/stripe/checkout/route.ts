import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, PLANS } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { plan, guest } = await request.json();
    const planKey = plan === "monthly_usd" ? "monthly_usd" : "monthly_brl";
    const selectedPlan = PLANS[planKey];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const stripe = getStripe();

    // Checkout público (venda direta — sem login)
    if (guest) {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
        success_url: `${appUrl}/obrigado?success=true`,
        cancel_url: `${appUrl}/?canceled=true`,
        metadata: { plan: planKey, guest_checkout: "true" },
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        phone_number_collection: { enabled: true },
      });

      return NextResponse.json({ url: session.url });
    }

    // Checkout autenticado (usuário já logado)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("subscriptions")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?success=true`,
      cancel_url: `${appUrl}/subscribe?canceled=true`,
      metadata: { supabase_user_id: user.id, plan: planKey },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Erro ao criar checkout" }, { status: 500 });
  }
}
