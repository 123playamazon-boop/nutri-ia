"use client";

import { UpsellOffer } from "@/components/upsell-offer";

/**
 * UPSELL 3 — Acesso 1 Ano (R$79,99 pagamento único) — última oferta da esteira
 * >>> TROCAR pelos links do "Gerador de Upsell" da Cakto (produto: Acesso 1 Ano).
 *     Aceitar/Recusar devem redirecionar pra /obrigado.
 */
const OFFER_ID = "zxpggzr"; // Cakto: Nutri IA - Acesso 1 Ano (R$79,99 unico)
const NEXT_URL = "https://nutri-ia-eta.vercel.app/obrigado"; // aceitar OU recusar → pagina final

export default function Page() {
  return (
    <UpsellOffer
      step="Passo 4 de 4"
      badge="Última oferta — e a de melhor custo"
      headline={<>A balança trava no mês 2. <span className="text-emerald-600">Quem vence é quem fica.</span></>}
      sub={<>Você acabou de assinar mês a mês. Deixa eu te mostrar a única opção que faz sentido pra quem leva a sério.</>}
      bullets={[
        "1 ano completo: plano + Nutricionista IA + Análise por Foto, tudo incluso",
        "Pagamento único de R$ 79,99 (dá menos de R$ 6,70 por mês)",
        "Sem mensalidade, sem renovação te pegando de surpresa",
        "Economia de mais de R$ 390 vs. pagar mês a mês",
      ]}
      priceLine="R$ 79,99"
      priceNote="pagamento único · 1 ano blindado · substitui sua mensalidade"
      acceptText="SIM! Quero 1 ANO completo por R$79,99"
      declineText="Não, prefiro pagar mês a mês e gastar até 5x mais"
      offerId={OFFER_ID}
      nextUrl={NEXT_URL}
    >
      <p>
        Ninguém te conta isso: nos primeiros 30 dias <b>todo mundo</b> perde os primeiros quilos — é água, é a animação do começo. O corpo muda de verdade a partir do <b>2º e 3º mês</b>. E é exatamente aí que a maioria cancela… e recupera tudo.
      </p>
      <p>
        Mês a mês, o combo completo (plano + nutricionista IA + análise por foto) sai quase <b>R$40 por mês</b>. Em um ano, passa de <b>R$470</b>.
      </p>
      <p>
        Só nesta página, uma única vez: <b>1 ANO inteiro, com tudo incluso, por R$79,99 à vista.</b> Menos de R$6,70 por mês. Sem renovação surpresa, sem cancelar sem querer — 1 ano blindado pra você focar só em emagrecer.
      </p>
      <p>
        E mesmo que você ache que vai cancelar antes: pelo <b>preço de 2 meses</b> do combo, você garante <b>12</b>. A conta não fecha pra quem é séria deixar passar.
      </p>
    </UpsellOffer>
  );
}
