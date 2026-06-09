import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generateTemporaryPassword } from "@/lib/password";
import { sendWelcomeCredentialsEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook do Cakto — libera o acesso quando uma venda é aprovada.
 * Cria o usuário no Supabase com senha temporária e envia o login por e-mail.
 * Idempotente por e-mail: nos upsells (mesmo cliente) só garante o acesso ativo,
 * sem criar conta duplicada nem reenviar o e-mail.
 *
 * Configure no painel da Cakto (Integrações → Webhooks):
 *   URL:    https://nutri-ia-eta.vercel.app/api/cakto/webhook
 *   Evento: Compra aprovada (purchase_approved)
 *   Secret: o mesmo valor de CAKTO_WEBHOOK_SECRET (env do Vercel)
 */

const APPROVED_EVENTS = [
  "purchase_approved",
  "purchase_completed",
  "subscription_active",
  "subscription_renewed",
  "pix_approved",
];

// lê um valor tentando vários caminhos (o aninhamento do payload varia)
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
  // .trim() nos dois lados pra tolerar espaço/quebra de linha colados sem querer
  const secret = (pick(body, "secret", "data.secret") ?? "").trim();
  const expected = (process.env.CAKTO_WEBHOOK_SECRET ?? "").trim();
  if (!expected || secret !== expected) {
    // diagnóstico (aparece em Vercel → Functions logs): mostra o tamanho e
    // o começo de cada valor, sem expor o secret inteiro
    console.error("Cakto webhook auth fail", {
      recv_len: secret.length,
      recv_head: secret.slice(0, 10),
      exp_len: expected.length,
      exp_head: expected.slice(0, 10),
    });
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 2) só processa eventos de pagamento aprovado
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
    console.error("Cakto webhook: e-mail não encontrado no payload");
    return NextResponse.json({ error: "email ausente" }, { status: 422 });
  }

  const admin = getSupabaseAdmin();
  try {
    // DEBUG: diagnóstico de credenciais (aparece em Vercel → Functions logs)
    const srk = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
    let srkRole = "n/a", srkRef = "n/a";
    try {
      const p = JSON.parse(Buffer.from(srk.split(".")[1] ?? "", "base64").toString());
      srkRole = String(p.role); srkRef = String(p.ref);
    } catch { /* não é JWT */ }
    console.log("Cakto webhook env check", {
      srk_len: srk.length,
      srk_head: srk.slice(0, 6),
      srk_role: srkRole,
      srk_ref: srkRef,
      url: (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").slice(8, 36),
      resend_len: (process.env.RESEND_API_KEY ?? "").length,
      resend_head: (process.env.RESEND_API_KEY ?? "").slice(0, 4),
      email_from: process.env.EMAIL_FROM,
    });

    // cliente já tem conta? (ex.: cada upsell dispara um webhook)
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = list?.users.find((u) => u.email?.toLowerCase() === email);

    if (existing) {
      await admin.from("subscriptions").update({ status: "active", plan: "cakto" }).eq("user_id", existing.id);
      return NextResponse.json({ received: true, action: "reactivated" });
    }

    // cria a conta + senha temporária
    const tempPassword = generateTemporaryPassword();
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { must_change_password: true, source: "cakto", name },
    });
    if (error || !created.user) {
      throw new Error(error?.message ?? "Falha ao criar usuário");
    }
    const userId = created.user.id;

    // o trigger on_auth_user_created cria profile + subscription; aguarda um tick
    await new Promise((r) => setTimeout(r, 600));
    await admin.from("subscriptions").update({ status: "active", plan: "cakto" }).eq("user_id", userId);

    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/login?welcome=1`;
    // e-mail é best-effort: se falhar, a conta já está criada — não derruba o webhook
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
