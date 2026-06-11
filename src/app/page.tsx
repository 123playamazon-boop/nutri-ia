"use client"; declare global { interface Window { fbq?: (...args: unknown[]) => void } }

/**
 * NUTRI IA — Pagina de vendas (home publica, trafego frio cai aqui).
 * Estilo VSL/sales-letter AIDA (copy Amanda Khayat): dor -> reframe villain ->
 * mecanismo (Espelhamento Metabolico) -> resultados -> prova -> CTA gratis.
 * TODO CTA leva pro /quiz PRESERVANDO a query string (utm_*, etc.) -> tracking intacto.
 * O funil (quiz -> analise -> oferta -> checkout Cakto) vive em /quiz.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Leaf, Check, Star, Shield, Clock, Lock, ArrowRight,
  Camera, Sparkles, MessageCircle, ChevronDown, Utensils, Users, Brain, Zap,
} from "lucide-react";

const PRICE_FRONT = "14,99";

// ===================================================================
// Conteudo (em arrays -> render seguro, sem aspas soltas no JSX)
// ===================================================================
const PAINS: string[] = [
  "A dieta do print no grupo do zap, que prometeu mundos e fundos",
  "O app genérico que te manda comer o que você detesta",
  "O chá e o shake “detox” que só esvaziaram seu bolso",
  "A nutricionista cara — que você parou de ir depois de 2 meses",
  "A fome e a ansiedade que batem toda noite e derrubam o dia inteiro",
  "O fim de semana que joga a semana inteira no lixo",
];

const STEPS: { n: string; t: string; d: string }[] = [
  { n: "1", t: "Responda o teste grátis", d: "8 perguntas rápidas: seu objetivo, sua zona teimosa, suas restrições e o que você ama comer. Leva 30 segundos." },
  { n: "2", t: "A IA monta seu plano", d: "Em 1 minuto ela cruza suas respostas com mais de 2.400 planos que já deram certo e desenha um cardápio só seu." },
  { n: "3", t: "Coma e emagreça", d: "Cardápio novo a cada 7 dias, lista de compras pronta e uma nutricionista IA 24h pra tirar qualquer dúvida." },
];

const FEATURES: { icon: typeof Utensils; t: string; d: string }[] = [
  { icon: Utensils, t: "Plano de 30 dias", d: "Cardápio novo toda semana — 35 receitas, sem repetir e sem enjoar." },
  { icon: Camera, t: "Diário com foto do prato", d: "Tire a foto do que comeu: a IA reconhece e conta as calorias por você." },
  { icon: MessageCircle, t: "Nutricionista IA 24h", d: "Pergunte qualquer coisa, a qualquer hora, e receba resposta na hora." },
  { icon: Sparkles, t: "Ajuste automático", d: "O plano se adapta toda semana conforme você registra o que andou comendo." },
];

const TESTIMONIALS: { n: string; t: string }[] = [
  { n: "Camila R., 34", t: "Pela primeira vez segui um plano de verdade. As receitas são gostosas e práticas — e não passo mais fome à noite. Foram 9 kg em 8 semanas." },
  { n: "Juliana S., 28", t: "O plano muda toda semana, nunca comi a mesma coisa dois dias seguidos. Perdi 7 kg e meu corpo voltou a ficar definido." },
  { n: "Roberto M., 41", t: "A nutricionista IA respondeu todas as minhas dúvidas na hora. Parece consulta de verdade, mas no meu bolso. Foram 9 kg." },
];

const FAQS: { q: string; a: string }[] = [
  { q: "Já tentei de tudo, por que isso seria diferente?", a: "Porque tudo que você tentou foi feito pra uma pessoa média que não existe. Aqui o plano nasce das SUAS respostas — seu objetivo, sua zona teimosa, suas restrições e o que você gosta de comer — e muda toda semana conforme você anda." },
  { q: "Vou ter que cortar pão, arroz e doce?", a: "Não. Você diz no teste o que não quer abrir mão e o plano respeita isso. Dieta que corta tudo é dieta que você larga na 2ª semana." },
  { q: "E se não funcionar pra mim?", a: "Você tem 7 dias de garantia. Entrou, não curtiu, é só pedir o reembolso — sem perguntas." },
  { q: "Como eu recebo o acesso?", a: "Assim que o pagamento é confirmado, você recebe login e senha no e-mail e já entra. Leva minutos." },
  { q: "Funciona pra diabético, grávida ou intolerância?", a: "Sim. Por isso o teste pergunta suas restrições — o plano é montado respeitando exatamente o que você marcar." },
];

// ===================================================================
// PAGINA
// ===================================================================
export default function Page() {
  const [showStuck, setShowStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowStuck(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goQuiz = () => {
    if (typeof window !== "undefined") {
      if (window.fbq) window.fbq("trackCustom", "IniciarTeste");
      const qs = window.location.search || "";
      window.location.href = "/quiz" + qs;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 to-background pb-28">
      {/* topo / marca */}
      <header className="mx-auto flex max-w-xl items-center justify-center gap-2 px-4 pt-6 pb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Leaf className="h-4 w-4 text-primary" />
        </div>
        <span className="font-bold tracking-tight">Nutri IA</span>
      </header>

      <main className="mx-auto max-w-xl px-4">
        {/* ===== HERO (Atenção) ===== */}
        <section className="text-center pt-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1.5 mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Novidade no Brasil · Inteligência Artificial
          </div>
          <h1 className="text-[27px] sm:text-4xl font-extrabold leading-[1.12]">
            Você não falhou em nenhuma dieta.{" "}
            <span className="text-primary">Elas é que foram feitas pra um corpo que não é o seu.</span>
          </h1>
          <p className="mt-4 text-[15px] sm:text-base text-muted-foreground">
            Conheça a primeira <b className="text-foreground">IA de nutrição do Brasil</b> que monta sua dieta
            personalizada em 1 minuto — com o que você gosta de comer, na sua rotina, sem passar fome.
          </p>

          <img src="/variedade-pratos.jpg" alt="" className="rounded-2xl object-cover h-52 w-full mt-6 shadow-sm" />

          <Button size="lg" onClick={goQuiz} className="mt-6 h-14 w-full text-base font-bold gap-2 shadow-lg shadow-primary/25">
            FAZER MEU TESTE GRÁTIS <ArrowRight className="h-5 w-5" />
          </Button>
          <p className="mt-3 text-[12px] text-muted-foreground flex items-center justify-center gap-3 flex-wrap">
            <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Sem cadastro pra testar</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 30 segundos</span>
            <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Grátis</span>
          </p>
        </section>

        {/* ===== DOR (Interesse) ===== */}
        <section className="mt-12">
          <h2 className="text-center text-[22px] sm:text-2xl font-extrabold leading-snug">
            Cansou de começar na segunda e largar na quarta?
          </h2>
          <p className="mt-3 text-center text-[15px] text-muted-foreground">
            Se você está aqui, provavelmente já passou por isto:
          </p>
          <ul className="mt-5 space-y-2.5">
            {PAINS.map((p) => (
              <li key={p} className="flex items-start gap-3 rounded-xl border border-border bg-white p-3.5 text-[15px] shadow-sm">
                <span className="mt-0.5 text-lg leading-none">😮‍💨</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-2xl bg-emerald-50/60 border border-emerald-100 p-5 text-center">
            <p className="text-[15px] sm:text-base font-semibold leading-snug">
              E no fim sempre vem a mesma culpa: <span className="text-primary">“o problema sou eu, não tenho força de vontade”.</span>
            </p>
            <p className="mt-3 text-[15px] text-muted-foreground">
              Não é você. Toda dieta que você tentou foi feita pra uma <b className="text-foreground">“pessoa média” que não existe</b> —
              um corpo genérico, uma rotina que não é a sua, comidas que você odeia. Ninguém emagrece seguindo um plano feito pra outra pessoa.
            </p>
          </div>
        </section>

        {/* ===== MECANISMO / DESCOBERTA (Desejo) ===== */}
        <section className="mt-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-widest px-3 py-1.5 mb-3">
              <Brain className="h-3.5 w-3.5" /> O Espelhamento Metabólico™
            </div>
            <h2 className="text-[22px] sm:text-2xl font-extrabold leading-snug">
              A virada: um plano feito pro <span className="text-primary">SEU</span> corpo — em 1 minuto, por IA
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground">
              É a primeira IA de nutrição do Brasil que faz o que uma nutricionista de R$ 300 faz —
              só que em 1 minuto e no seu bolso. Ela espelha o seu metabolismo, a sua rotina e o seu gosto, e monta um cardápio que é só seu.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white font-extrabold">{s.n}</div>
                <div>
                  <p className="font-bold text-[15px]">{s.t}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{s.d}</p>
                </div>
              </div>
            ))}
          </div>

          <Button size="lg" onClick={goQuiz} className="mt-7 h-14 w-full text-base font-bold gap-2 shadow-lg shadow-primary/25">
            QUERO MEU PLANO PERSONALIZADO <ArrowRight className="h-5 w-5" />
          </Button>
        </section>

        {/* ===== RESULTADOS / O QUE VOCE GANHA ===== */}
        <section className="mt-12">
          <div className="rounded-2xl border-2 border-primary/30 bg-white p-6 text-center shadow-sm">
            <Zap className="mx-auto h-7 w-7 text-primary" />
            <h2 className="mt-2 text-xl sm:text-[22px] font-extrabold leading-snug">
              Os primeiros números descendo na balança em <span className="text-primary">7 dias</span>
            </h2>
            <p className="mt-2 text-[15px] text-muted-foreground">
              Mesmo que você já tenha largado 5 dietas, mesmo sem tempo pra cozinhar, sem viver de salada triste e
              <b className="text-foreground"> sem cortar o pão do café</b>.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.t} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                  <Icon className="h-6 w-6 text-primary" />
                  <p className="mt-2 font-bold text-[15px]">{f.t}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{f.d}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== PROVA ===== */}
        <section className="mt-12">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4,9/5</span>
            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> +2.400 planos gerados</span>
            <span>resultados em 2 a 8 semanas</span>
          </div>
          <div className="mt-5 space-y-3">
            {TESTIMONIALS.map((d) => (
              <div key={d.n} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="flex mb-1">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-sm">&ldquo;{d.t}&rdquo;</p>
                <p className="mt-1.5 text-xs font-semibold text-muted-foreground">{d.n}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== OFERTA / PRE-FRAME (Ação) ===== */}
        <section className="mt-12">
          <div className="rounded-3xl border border-border bg-emerald-50/40 p-6 text-center">
            <p className="text-[15px] text-muted-foreground">
              Uma consulta de nutricionista custa <s>R$ 300 a R$ 500</s> e some na gaveta em 1 mês.
            </p>
            <p className="mt-2 text-[15px] font-semibold">
              Aqui você tem uma <b>nutricionista IA 24h</b> + um plano que se ajusta toda semana por
              <span className="text-primary font-extrabold"> R$ {PRICE_FRONT}</span> no primeiro mês.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Cancele quando quiser · 7 dias de garantia</p>
            <Button size="lg" onClick={goQuiz} className="mt-5 h-14 w-full text-base font-bold gap-2 shadow-lg shadow-primary/25">
              FAZER MEU TESTE GRÁTIS <ArrowRight className="h-5 w-5" />
            </Button>
            <p className="mt-3 text-[12px] text-muted-foreground flex items-center justify-center gap-3 flex-wrap">
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Pagamento seguro</span>
              <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Acesso na hora</span>
            </p>
          </div>
        </section>

        {/* ===== FAQ (objeções) ===== */}
        <section className="mt-12">
          <h3 className="text-center text-lg font-bold mb-3">Antes de você decidir</h3>
          <div className="space-y-2.5">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-xl border border-border bg-white p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-[15px]">
                  {f.q}
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ===== CTA FINAL ===== */}
        <section className="mt-12 text-center">
          <h3 className="text-xl sm:text-2xl font-extrabold leading-snug">Sua transformação começa com 8 perguntas</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            O teste é grátis e seu plano fica pronto em 1 minuto. Menos que um lanche pra ter uma nutricionista IA no bolso.
          </p>
          <Button size="lg" onClick={goQuiz} className="mt-5 h-14 w-full text-base font-bold gap-2 shadow-lg shadow-primary/25">
            COMEÇAR MEU TESTE GRÁTIS <ArrowRight className="h-5 w-5" />
          </Button>
          <p className="mt-3 text-[11px] text-muted-foreground">
            *Resultados variam de pessoa pra pessoa e dependem da sua dedicação ao plano. Conteúdo informativo, não substitui acompanhamento médico.
          </p>
        </section>
      </main>

      {/* ===== CTA fixo mobile ===== */}
      {showStuck && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="leading-tight">
              <p className="text-[11px] text-muted-foreground">Teste grátis · 30 seg</p>
              <p className="text-sm font-extrabold -mt-0.5">Plano por R$ {PRICE_FRONT}/mês</p>
            </div>
            <Button onClick={goQuiz} className="h-12 flex-1 font-bold gap-2">
              FAZER TESTE GRÁTIS <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
