interface WelcomeEmailParams {
  to: string;
  password: string;
  loginUrl: string;
}

export async function sendWelcomeCredentialsEmail({
  to,
  password,
  loginUrl,
}: WelcomeEmailParams): Promise<{ ok: boolean; error?: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const from = process.env.EMAIL_FROM ?? "Nutri IA <onboarding@resend.dev>";

  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #111;">
      <h1 style="color: #16a34a;">Bem-vindo(a) ao Nutri IA! 🎉</h1>
      <p>Seu pagamento foi confirmado. Aqui estão seus dados de acesso:</p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 8px;"><strong>Email:</strong> ${to}</p>
        <p style="margin: 0;"><strong>Senha temporária:</strong> <code style="background:#dcfce7;padding:4px 8px;border-radius:6px;">${password}</code></p>
      </div>
      <p>Por segurança, altere sua senha no primeiro acesso em <strong>Configurações</strong>.</p>
      <a href="${loginUrl}" style="display:inline-block;background:#16a34a;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;margin:16px 0;">
        Acessar a plataforma
      </a>
      <p style="color:#666;font-size:13px;">Se não reconhece esta compra, entre em contato com nosso suporte.</p>
      <p style="color:#999;font-size:12px;">Nutri IA — ${appUrl}</p>
    </div>
  `;

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("\n========== EMAIL (modo dev — RESEND_API_KEY não configurada) ==========");
    console.log(`Para: ${to}`);
    console.log(`Senha temporária: ${password}`);
    console.log(`Login: ${loginUrl}`);
    console.log("=====================================================================\n");
    return { ok: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Seu acesso ao Nutri IA — login e senha",
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return { ok: false, error: err };
    }

    return { ok: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { ok: false, error: String(error) };
  }
}
