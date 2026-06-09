"use client";

/**
 * Página de oferta (upsell one-click). Usada pelas rotas /oferta/*.
 * O cliente cai aqui DEPOIS de pagar (a Cakto redireciona pra cá).
 * Os botões "Sim/Não" apontam pros links gerados no "Gerador de Upsell" da Cakto,
 * que cobram em 1 clique no mesmo cartão e redirecionam pra próxima etapa.
 *
 * >>> Cada página passa acceptUrl (link "aceitar" da Cakto) e declineUrl (link "recusar"). <<<
 */

import { useState, useEffect, type ReactNode } from "react";
import { Check, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";

interface UpsellOfferProps {
  step: string;            // ex: "Passo 2 de 4"
  badge: string;           // ex: "Oferta única — só aparece aqui, agora"
  headline: ReactNode;
  sub: ReactNode;
  bullets: string[];       // o que desbloqueia
  priceLine: string;       // ex: "+ R$ 9,99/mês"
  priceNote: string;       // ex: "somado à sua assinatura · cancele quando quiser"
  acceptText: string;
  declineText: string;
  acceptUrl: string;
  declineUrl: string;
  children?: ReactNode;    // corpo da copy
}

export function UpsellOffer({
  step, badge, headline, sub, bullets, priceLine, priceNote,
  acceptText, declineText, acceptUrl, declineUrl, children,
}: UpsellOfferProps) {
  const [secs, setSecs] = useState(8 * 60);
  useEffect(() => {
    const iv = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, []);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-background">
      {/* confirmação + abertura da oferta */}
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

        {/* corpo da copy */}
        <div className="mt-6 space-y-4 text-[15px] leading-relaxed">{children}</div>

        {/* card da oferta */}
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

          <div className="mt-5 text-center">
            <div className="text-4xl font-extrabold text-emerald-700">{priceLine}</div>
            <p className="text-sm text-muted-foreground mt-1">{priceNote}</p>
          </div>

          {/* SIM — one-click (link gerado na Cakto) */}
          <a
            href={acceptUrl}
            className="mt-5 flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-center text-[17px] font-extrabold text-white shadow-lg shadow-emerald-600/30 transition hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            {acceptText} <ArrowRight className="h-5 w-5" />
          </a>

          <p className="mt-3 text-center text-[12px] text-muted-foreground flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Cobrança 1 clique no mesmo cartão · sem digitar nada de novo
          </p>
        </div>

        {/* contador */}
        <p className="mt-4 text-center text-[13px] text-muted-foreground">
          Esta página não volta. Ela expira em{" "}
          <span className="font-bold tabular-nums text-amber-700">{mm}:{ss}</span>
        </p>

        {/* NÃO — declínio com custo */}
        <div className="mt-5 text-center">
          <a href={declineUrl} className="text-[13px] text-muted-foreground underline underline-offset-2 hover:text-foreground">
            {declineText}
          </a>
        </div>
      </div>
    </div>
  );
}
