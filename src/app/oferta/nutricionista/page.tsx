"use client";

import { UpsellOffer } from "@/components/upsell-offer";

/**
 * UPSELL 1 — Nutricionista IA 24h (+R$9,99/mês)
 * Cliente cai aqui após pagar o FRONT.
 * >>> TROCAR pelos links do "Gerador de Upsell" da Cakto (produto: Nutricionista IA 24h).
 *     Aceitar/Recusar devem redirecionar pra /oferta/foto.
 */
const OFFER_ID = "j625u4j"; // Cakto: Nutri IA - Nutricionista IA 24h (R$9,99/mês)
const NEXT_URL = "https://nutri-ia-eta.vercel.app/oferta/foto"; // aceitar OU recusar → próxima oferta

export default function Page() {
  return (
    <UpsellOffer
      step="Passo 2 de 4"
      badge="Oferta única — não aparece depois que você entrar"
      headline={<>Seu plano está pronto. Mas e quando bater a dúvida <span className="text-emerald-600">às 22h, de geladeira aberta?</span></>}
      sub={<>A maioria das dietas não morre na segunda-feira. Morre na primeira dúvida sem resposta.</>}
      bullets={[
        "Respostas ilimitadas, 24 horas por dia, dentro do app",
        "Substituições na hora: “posso trocar o frango por ovo?”",
        "Ajuste pra dia de evento, viagem ou restaurante",
        "Ela lembra do seu objetivo e das suas restrições",
      ]}
      priceLine="+ R$ 9,99/mês"
      priceNote="somado à sua assinatura · cancele quando quiser"
      acceptText="SIM! Quero minha Nutricionista IA 24h"
      declineText="Não, prefiro travar nas dúvidas sozinha"
      offerId={OFFER_ID}
      nextUrl={NEXT_URL}
    >
      <p>
        Daqui a pouco você vai abrir seu plano e, em algum momento, vai travar:
        <b> “posso trocar isso?”, “e se eu comer fora hoje?”, “esse aniversário de domingo acaba comigo?”.</b>
      </p>
      <p>
        É nessa hora — não na balança — que <b>8 em cada 10 mulheres desistem</b>. Não por preguiça. Por falta de uma resposta na hora certa.
      </p>
      <p>
        Uma nutricionista de verdade resolveria isso em 30 segundos. Só que ela cobra <b>R$300 a consulta</b> e não atende às 22h, de pijama, no seu sofá.
      </p>
      <p>
        A <b>Nutricionista IA 24h</b> atende. Você pergunta por texto e ela responde na hora — pode, não pode, troca por isso — já olhando o SEU plano e as suas restrições. Quem ativa tira em média 12 dúvidas na primeira semana. E é exatamente quem <b>não desiste</b>.
      </p>
    </UpsellOffer>
  );
}
