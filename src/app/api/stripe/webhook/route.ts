import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generateTemporaryPassword } from "@/lib/password";
import { sendWelcomeCredentialsEmail } from "@/lib/email";

async function findUserIdByEmail(email: string): Promise<string | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return null;
  const user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return user?.id ?? null;
}

async function activateSubscription(
  userId: string,
  session: Stripe.Checkout.Session,
  plan: string
) {
  const admin = getSupabaseAdmin();
  const sub = await getStripe().subscriptions.retrieve(session.subscription as string);

  await admin.from("subscriptions").update({
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: sub.id,
    status: "active",
    plan,
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
  }).eq("user_id", userId);

  if (session.customer) {
    await getStripe().customers.update(session.customer as string, {
      metadata: { supabase_user_id: userId },
    });
  }
}

async function provisionGuestUser(
  email: string,
  session: Stripe.Checkout.Session,
  plan: string
): Promise<string> {
  const admin = getSupabaseAdmin();
  const existingId = await findUserIdByEmail(email);

  if (existingId) {
    await activateSubscription(existingId, session, plan);
    return existingId;
  }

  const tempPassword = generateTemporaryPassword();
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { must_change_password: true, source: "stripe_checkout" },
  });

  if (error || !created.user) {
    throw new Error(error?.message ?? "Falha ao criar usuário");
  }

  const userId = created.user.id;

  // Trigger cria profile/subscription — aguardamos um tick e atualizamos subscription
  await new Promise((r) => setTimeout(r, 500));
  await activateSubscription(userId, session, plan);

  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login?welcome=1`;
  await sendWelcomeCredentialsEmail({ to: email, password: tempPassword, loginUrl });

  return userId;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook inválido" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const plan = session.metadata?.plan ?? "monthly_brl";
      let userId = session.metadata?.supabase_user_id;
      const isGuest = session.metadata?.guest_checkout === "true";

      if (!userId && isGuest) {
        const email =
          session.customer_details?.email ??
          session.customer_email ??
          (session.customer
            ? (await getStripe().customers.retrieve(session.customer as string) as Stripe.Customer).email
            : null);

        if (email) {
          try {
            userId = await provisionGuestUser(email, session, plan);
          } catch (err) {
            console.error("Guest provisioning error:", err);
          }
        }
      } else if (userId && session.subscription) {
        await activateSubscription(userId, session, plan);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const status = sub.status === "active" ? "active"
        : sub.status === "trialing" ? "trialing"
        : sub.status === "past_due" ? "past_due"
        : "canceled";

      await getSupabaseAdmin().from("subscriptions").update({
        status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      }).eq("stripe_subscription_id", sub.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
