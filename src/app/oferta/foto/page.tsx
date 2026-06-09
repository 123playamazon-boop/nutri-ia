"use client";

import { UpsellOffer } from "@/components/upsell-offer";

/**
 * UPSELL 2 — Análise de Calorias por Foto (+R$14,99/mês)
 * >>> TROCAR pelos links do "Gerador de Upsell" da Cakto (produto: Análise por Foto).
 *     Aceitar/Recusar devem redirecionar pra /oferta/anual.
 */
const OFFER_ID = "mirz828"; // Cakto: Nutri IA - Analise por Foto (R$14,99/mês)
const NEXT_URL = "https://nutri-ia-eta.vercel.app/oferta/anual"; // aceitar OU recusar → próxima oferta

export default function Page() {
  return (
    <UpsellOffer
      step="Passo 3 de 4"
      badge="Só nesta tela — depois some"
      headline={<>Odeia contar caloria? Você está prestes a <span className="text-emerald-600">nunca mais precisar.</span></>}
      sub={<>Pesar comida, anotar tudo, abrir tabela… é por isso que app de dieta vira app esquecido.</>}
      bullets={[
        "Tire 1 foto do prato → calorias e macros em segundos",
        "Registro automático no seu diário (zero digitação)",
        "Funciona com comida brasileira, marmita e restaurante",
        "Vê na hora se aquele prato cabe na sua meta do dia",
      ]}
      priceLine="+ R$ 14,99/mês"
      priceNote="somado à sua assinatura · cancele quando quiser"
      acceptText="SIM! Quero analisar meu prato só com uma foto"
      declineText="Não, prefiro contar caloria na unha (ou no chute)"
      offerId={OFFER_ID}
      nextUrl={NEXT_URL}
    >
      <p>
        Vou ser sincera com você: você não larga a dieta por falta de vontade. Larga porque <b>anotar cada coisa é um saco</b> — e depois de 3 dias, cansa.
      </p>
      <p>
        Aí você volta a comer “no olho”, achando que tá tudo sob controle… enquanto a balança <b>não mexe um grama</b> e você não entende por quê.
      </p>
      <p>
        Com a <b>Análise por Foto</b>, esse trabalho todo vira <b>uma foto antes de comer</b>. A IA olha o prato e devolve em 3 segundos: calorias, proteína, carboidrato e gordura — e já anota sozinha no seu diário.
      </p>
      <p>
        O que fazia você desistir na primeira semana deixa de existir. <b>Foto, pronto, segue a vida.</b> É o recurso que mais separa quem só “tenta” de quem realmente acompanha.
      </p>
    </UpsellOffer>
  );
}
