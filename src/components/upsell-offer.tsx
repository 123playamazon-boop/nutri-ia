"use client";

/**
 * Página de oferta (upsell one-click). Usada pelas rotas /oferta/*.
 * O cliente cai aqui DEPOIS de pagar (a Cakto redireciona pra cá).
 *
 * Os botões "Sim/Não" são os Web Components do "Gerador de Upsell" da Cakto
 * (<cakto-upsell-accept> / <cakto-upsell-reject>) + o script upsell.js — eles
 * cobram em 1 clique no mesmo cartão e redirecionam pra próxima etapa (nextUrl).
 *
 * Cada página passa:
 *   offerId  = slug do link de checkout da Cakto (parte antes do "_")
 *   nextUrl  = próxima etapa da esteira (aceitar OU recusar vão pra cá)
 */

import { useEffect, type ReactNode } from "react";
import { Check, ShieldCheck, AlertTriangle } from "lucide-react";

const CAKTO_UPSELL_SCRIPT = "https://caktoscripts.nyc3.cdn.digitaloceanspaces.com/upsell.js";

interface UpsellOfferProps {
  step: string;            // ex: "Passo 2 de 4"
  badge: string;
  headline: ReactNode;
  sub: ReactNode;
  bullets: string[];
  priceLine: string;       // ex: "+ R$ 9,99/mês"
  priceNote: string;
  offerId: string;         // slug Cakto (ex: "j625u4j")
  nextUrl: string;         // próxima etapa (aceitar e recusar vão pra cá)
  acceptText: string;
  declineText: string;
  children?: ReactNode;
}

export function UpsellOffer({
  step, badge, headline, sub, bullets, priceLine, priceNote,
  offerId, nextUrl, acceptText, declineText, children,
}: UpsellOfferProps) {
  // carrega o script da Cakto que ativa os web components de upsell 1-clique
  useEffect(() => {
    if (!document.getElementById("cakto-upsell-script")) {
      const s = document.createElement("script");
      s.id = "cakto-upsell-script";
      s.src = CAKTO_UPSELL_SCRIPT;
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  // HTML dos botões one-click da Cakto (offer-id cobra no mesmo cartão da sessão)
  const caktoButtons = `
<style>
  cakto-upsell-accept::part(button){width:100%;height:60px;border-radius:16px;font-size:17px;font-weight:800;letter-spacing:.2px;cursor:pointer;box-shadow:0 8px 22px rgba(16,163,127,.30);}
  cakto-upsell-reject::part(button){background:transparent;border:none;color:#9ca3af;text-decoration:underline;font-size:13px;cursor:pointer;margin-top:16px;}
</style>
<cakto-upsell-buttons>
  <cakto-upsell-accept bg-color="#10a37f" text-color="#ffffff" upsell-accept-url="${nextUrl}" offer-id="${offerId}" app-base-url="https://app.cakto.com.br" offer-type="upsell" upsell-reject-url="${nextUrl}">${acceptText}</cakto-upsell-accept>
  <cakto-upsell-reject upsell-reject-url="${nextUrl}">${declineText}</cakto-upsell-reject>
</cakto-upsell-buttons>`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-background">
      <div className="bg-emerald-600 text-white text-center text-[13px] font-semibold py-2 px-3">
        ✓ Pagamento aprovado! Antes de liberar seu acesso, leia com atenção — {step}
      </div>

      <div className="mx-auto max-w-xl px-4 pb-16">
        <div className="text-center pt-7">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1.5 mb-4">
            <AlertTriangle className="h-3.5 w-3.5" /> {badge}
          </div>
          <h1 className="text-[26px] sm:text-3xl font-extrabold leading-tight">{headline}</h1>
          <div className="mt-3 text-[15px] text-muted-foreground">{sub}</div>
        </div>

        <div className="mt-6 space-y-4 text-[15px] leading-relaxed">{children}</div>

        <div className="mt-7 rounded-3xl border-2 border-emerald-500 bg-white p-6 shadow-xl shadow-emerald-500/10">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 text-center">
            Adicione agora com 1 toque
          </p>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            {bullets.map((b) => (
              <li key={b} className="flex gap-2.5">
                <Check className="h-5 w-5 shrink-0 text-emerald-600" /> <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 mb-4 text-center">
            <div className="text-4xl font-extrabold text-emerald-700">{priceLine}</div>
            <p className="text-sm text-muted-foreground mt-1">{priceNote}</p>
          </div>

          {/* Botões one-click da Cakto (Sim cobra no mesmo cartão / Não pula pra próxima) */}
          <div dangerouslySetInnerHTML={{ __html: caktoButtons }} />

          <p className="mt-3 text-center text-[12px] text-muted-foreground flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Cobrança 1 clique no mesmo cartão · sem digitar nada de novo
          </p>
        </div>
      </div>
    </div>
  );
}
