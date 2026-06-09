import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generateTemporaryPassword } from "@/lib/password";
import { sendWelcomeCredentialsEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook do Cakto - libera o acesso quando uma venda e aprovada.
 * Cria o usuario no Supabase com senha temporaria e envia o login por e-mail.
 * Idempotente por e-mail: nos upsells (mesmo cliente) so garante o acesso ativo.
 */

const APPROVED_EVENTS = [
    "purchase_approved",
    "purchase_completed",
    "subscription_active",
    "subscription_renewed",
    "pix_approved",
  ];

// le um valor tentando varios caminhos (o aninhamento do payload varia)
function pick(obj: unknown, ...paths: string[]): string | undefined {
    for (const p of paths) {
          const v = p.split(".").reduce<unknown>((a, k) => (a && typeof a === "object" ? (a as Record<string, unknown>)[k] : undefined), obj);
          if (v != null && v !== "") return String(v);
    }
    return undefined;
}

export async function POST(request: NextRequest) {
    let body: unknown;
    try {
          body = await request.json();
    } catch {
          return NextResponse.json({ error: "invalid json" }, { status: 400 });
    }

  // 1) valida o secret (vem no corpo do webhook da Cakto)
  const secret = (pick(body, "secret", "data.secret") ?? "").trim();
    const expected = (process.env.CAKTO_WEBHOOK_SECRET ?? "").trim();
    if (!expected || secret !== expected) {
          console.error("Cakto webhook auth fail", {
                  recv_len: secret.length,
                  recv_head: secret.slice(0, 10),
                  exp_len: expected.length,
                  exp_head: expected.slice(0, 10),
          });
          return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

  // 2) so processa eventos de pagamento aprovado
  const event = pick(body, "event", "type", "data.event") ?? "";
    if (!APPROVED_EVENTS.includes(event)) {
          return NextResponse.json({ received: true, ignored: event });
    }

  // 3) e-mail do comprador
  const email = (pick(
        body,
        "customer.email",
        "data.customer.email",
        "data.customer_email",
        "customer_email",
        "buyer.email",
        "data.buyer.email",
      ) ?? "").toLowerCase().trim();
    const name = pick(body, "customer.name", "data.customer.name", "buyer.name", "data.buyer.name") ?? null;

  if (!email) {
        console.error("Cakto webhook: e-mail nao encontrado no payload");
        return NextResponse.json({ error: "email ausente" }, { status: 422 });
  }

  const admin = getSupabaseAdmin();
    try {
          // cliente ja tem conta? (ex.: cada upsell dispara um webhook)
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
          const existing = list?.users.find((u) => u.email?.toLowerCase() === email);

      if (existing) {
              // garante profile + subscription ativa via UPSERT - cobre contas antigas
            // que nao tinham essas linhas (o UPDATE sozinho nao criava nada e o
            // cliente ficava sem acesso mesmo tendo pago)
            await admin.from("profiles").upsert({ user_id: existing.id }, { onConflict: "user_id" });
              await admin.from("subscriptions").upsert(
                { user_id: existing.id, status: "active", plan: "cakto" },
                { onConflict: "user_id" },
                      );
              return NextResponse.json({ received: true, action: "reactivated" });
      }

      // cria a conta + senha temporaria
      const tempPassword = generateTemporaryPassword();
          const { data: created, error } = await admin.auth.admin.createUser({
                  email,
                  password: tempPassword,
                  email_confirm: true,
                  user_metadata: { must_change_password: true, source: "cakto", name },
          });
          if (error || !created.user) {
                  throw new Error(error?.message ?? "Falha ao criar usuario");
          }
          const userId = created.user.id;

      // o trigger on_auth_user_created cria profile + subscription; aguarda um tick
      await new Promise((r) => setTimeout(r, 600));
          await admin.from("subscriptions").update({ status: "active", plan: "cakto" }).eq("user_id", userId);

      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/login?welcome=1`;
          // e-mail e best-effort: se falhar, a conta ja esta criada
      let emailSent = false;
          try {
                  await sendWelcomeCredentialsEmail({ to: email, password: tempPassword, loginUrl });
                  emailSent = true;
          } catch (mailErr) {
                  console.error("Cakto webhook: e-mail falhou, conta criada mesmo assim:", mailErr);
          }

      return NextResponse.json({ received: true, action: "created", emailSent });
    } catch (err) {
          console.error("Cakto webhook error:", err);
          return NextResponse.json({ error: "processing failed" }, { status: 500 });
    }
}
