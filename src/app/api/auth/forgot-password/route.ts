import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generateTemporaryPassword } from "@/lib/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * "Esqueci minha senha" - gera uma nova senha temporaria, atualiza no Supabase
 * e envia por e-mail (mesmo Resend do e-mail de boas-vindas).
 * A resposta e sempre generica, pra nao revelar se o e-mail tem conta ou nao.
 */

async function sendResetEmail(to: string, password: string, loginUrl: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const from = process.env.EMAIL_FROM ?? "Nutri IA <onboarding@resend.dev>";
    const apiKey = process.env.RESEND_API_KEY;

    const html = `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #111;">
        <h1 style="color: #16a34a;">Sua nova senha do Nutri IA</h1>
        <p>Voce pediu para redefinir sua senha. Aqui esta uma senha temporaria:</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 8px;"><strong>Email:</strong> ${to}</p>
          <p style="margin: 0;"><strong>Senha temporaria:</strong> <code style="background:#dcfce7;padding:4px 8px;border-radius:6px;">${password}</code></p>
        </div>
        <p>Por seguranca, altere sua senha apos entrar, em <strong>Configuracoes</strong>.</p>
        <a href="${loginUrl}" style="display:inline-block;background:#16a34a;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Acessar a plataforma
        </a>
        <p style="color:#999;font-size:12px;">Nutri IA - ${appUrl}</p>
      </div>
    `;

    if (!apiKey) {
          console.log("[reset] e-mail (dev):", to, password, loginUrl);
          return;
        }

    const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from, to: [to], subject: "Sua nova senha do Nutri IA", html }),
        });
    if (!res.ok) {
          console.error("[reset] Resend error:", await res.text());
        }
  }

export async function POST(request: NextRequest) {
    let body: unknown;
    try {
          body = await request.json();
        } catch {
          return NextResponse.json({ error: "invalid json" }, { status: 400 });
        }

    const email = String((body as { email?: string })?.email ?? "").toLowerCase().trim();
    const generic = NextResponse.json({ ok: true });
    if (!email) return generic;

    try {
          const admin = getSupabaseAdmin();
          const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
          const user = list?.users.find((u) => u.email?.toLowerCase() === email);
          if (!user) return generic;

          const tempPassword = generateTemporaryPassword();
          await admin.auth.admin.updateUserById(user.id, {
                  password: tempPassword,
                  user_metadata: { ...user.user_metadata, must_change_password: true },
                });

          const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/login?welcome=1`;
          await sendResetEmail(email, tempPassword, loginUrl);
          return generic;
        } catch (err) {
          console.error("forgot-password error:", err);
          return generic;
        }
  }
