"use client";

/**
 * NUTRI IA — Funil de vendas (Quiz → Oferta)
 * Home pública. Tráfego frio cai direto aqui.
 * Fluxo: QUIZ (cria desejo) → ANÁLISE → OFERTA R$14,99 → checkout Cakto → upsells (no painel Cakto) → /obrigado
 *
 * >>> TROCAR ANTES DE SUBIR ANÚNCIO <<<
 *   CAKTO_CHECKOUT_URL = link do produto FRONT (1º mês R$14,99) gerado no painel da Cakto.
 *   Os 3 upsells one-click são configurados DENTRO do Cakto (não aqui).
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Leaf, Check, Star, Shield, Clock, Lock, ArrowRight, Loader2,
  Camera, Sparkles, MessageCircle, ChevronDown, Utensils, Users, BadgeCheck,
} from "lucide-react";

// ===================================================================
// CONFIG — troque o link da Cakto aqui
// ===================================================================
const CAKTO_CHECKOUT_URL = "https://pay.cakto.com.br/rjy7jee_920129"; // FRONT R$14,99 (assinatura mensal)
const PRICE_FRONT = "14,99";
const PRICE_ANCHOR = "39,90";

// ===================================================================
// QUIZ — cada pergunta instala desejo e tira a culpa do ombro dela
// ===================================================================
type Option = { v: string; emoji: string; label: string };
type Question = { key: string; kicker: string; question: string; sub?: string; options: Option[] };

const QUESTIONS: Question[] = [
  {
    key: "objetivo",
    kicker: "Seu objetivo",
    question: "Quantos quilos você quer eliminar pra voltar a se reconhecer no espelho?",
    options: [
      { v: "ate5", emoji: "✨", label: "Menos de 5 kg — os últimos teimosos que não saem" },
      { v: "5a10", emoji: "⚖️", label: "5 a 10 kg — aquele peso que voltou sem pedir licença" },
      { v: "10a20", emoji: "🎯", label: "10 a 20 kg — quero me sentir leve de novo" },
      { v: "mais20", emoji: "🔥", label: "Mais de 20 kg — um recomeço de verdade" },
    ],
  },
  {
    key: "zona",
    kicker: "Sua zona teimosa",
    question: "Onde a gordura mais insiste em ficar?",
    sub: "Seja sincera — ninguém vê isso aqui.",
    options: [
      { v: "barriga", emoji: "⭕", label: "Barriga e pneuzinho — não importa o que eu faça" },
      { v: "culote", emoji: "🍐", label: "Culote, quadril e coxa" },
      { v: "tudo", emoji: "🌀", label: "Corpo todo — engordei por igual" },
      { v: "bracos", emoji: "👤", label: "Braços e rosto — primeiro lugar que aparece" },
    ],
  },
  {
    key: "tentou",
    kicker: "O que já te decepcionou",
    question: "O que você já tentou que prometeu mundos e fundos e não entregou?",
    options: [
      { v: "internet", emoji: "📱", label: "Dieta da internet / print no grupo do zap" },
      { v: "app", emoji: "📊", label: "Aplicativo genérico de dieta" },
      { v: "detox", emoji: "🍵", label: "Chá, shake ou suplemento 'detox'" },
      { v: "nutri", emoji: "💸", label: "Nutricionista cara — e parei de ir" },
      { v: "tudo", emoji: "😮‍💨", label: "Sinceramente? Já tentei de tudo" },
    ],
  },
  {
    key: "sabota",
    kicker: "O que te sabota de verdade",
    question: "Quando a dieta desanda, normalmente é por quê?",
    options: [
      { v: "noite", emoji: "🌙", label: "A fome (e a ansiedade) que bate à noite" },
      { v: "fds", emoji: "🍕", label: "O fim de semana joga a semana toda no lixo" },
      { v: "enjoo", emoji: "🥗", label: "Enjoo de comer sempre a mesma coisa sem graça" },
      { v: "tempo", emoji: "⏰", label: "Não tenho tempo pra cozinhar nada elaborado" },
      { v: "naosei", emoji: "🤷‍♀️", label: "Eu simplesmente não sei o que comer" },
    ],
  },
  {
    key: "ama",
    kicker: "O que é inegociável",
    question: "Do que você NÃO está disposta a abrir mão pra emagrecer?",
    sub: "Plano que corta tudo que você ama é plano que você abandona na 2ª semana.",
    options: [
      { v: "pao", emoji: "🥖", label: "Meu pão no café da manhã" },
      { v: "doce", emoji: "🍫", label: "Um docinho / sobremesa" },
      { v: "br", emoji: "🍚", label: "Arroz, feijão, comida brasileira de verdade" },
      { v: "massa", emoji: "🍝", label: "Massa, pizza, o que a família come" },
      { v: "tudo", emoji: "🍽️", label: "Quero comer de tudo — só na medida certa" },
    ],
  },
  {
    key: "restricao",
    kicker: "O que seu plano precisa respeitar",
    question: "Tem alguma condição que sua alimentação precisa levar em conta?",
    options: [
      { v: "diabetes", emoji: "🩸", label: "Diabetes ou glicemia alta" },
      { v: "intolerancia", emoji: "🚫", label: "Intolerância (lactose / glúten)" },
      { v: "gravidez", emoji: "🤰", label: "Gravidez ou pós-parto" },
      { v: "veg", emoji: "🌱", label: "Sou vegetariana" },
      { v: "nenhuma", emoji: "✅", label: "Nenhuma restrição" },
    ],
  },
  {
    key: "rotina",
    kicker: "Sua rotina real",
    question: "Quanto tempo você tem, de verdade, pra cozinhar no dia a dia?",
    options: [
      { v: "nada", emoji: "⚡", label: "Quase nada — preciso de receita rápida" },
      { v: "pouco", emoji: "🕐", label: "Uns 20 a 30 minutinhos" },
      { v: "gosto", emoji: "👩‍🍳", label: "Gosto de cozinhar quando dá" },
      { v: "fora", emoji: "🥡", label: "Como muito fora / marmita / no trampo" },
    ],
  },
  {
    key: "urgencia",
    kicker: "Seu prazo",
    question: "Pra quando você quer ver o ponteiro da balança finalmente descer?",
    options: [
      { v: "ja", emoji: "🔥", label: "Pra ontem — eu tô decidida dessa vez" },
      { v: "evento", emoji: "📅", label: "Tenho um evento em ~30 dias" },
      { v: "90d", emoji: "🌿", label: "Próximos 90 dias, com consistência" },
      { v: "pesquisando", emoji: "💭", label: "Ainda tô só pesquisando" },
    ],
  },
];

// ===================================================================
// Mapas de personalização — espelham as respostas na oferta
// ===================================================================
const ZONA_FOCO: Record<string, string> = {
  barriga: "queima de gordura abdominal",
  culote: "redução de culote e quadril",
  tudo: "emagrecimento do corpo todo",
  bracos: "definição de braços e rosto",
};
const RESTRICAO_TXT: Record<string, string> = {
  diabetes: "índice glicêmico controlado",
  intolerancia: "zero lactose/glúten quando você marcou",
  gravidez: "segurança pra gestante/pós-parto",
  veg: "100% vegetariano",
  nenhuma: "sem restrições desnecessárias",
};
const AMA_TXT: Record<string, string> = {
  pao: "pão no café",
  doce: "um doce na medida",
  br: "arroz e feijão",
  massa: "massa e pizza",
  tudo: "um pouco de tudo",
};
const OBJ_META: Record<string, string> = {
  ate5: "eliminar os últimos quilos teimosos",
  "5a10": "perder de 5 a 10 kg",
  "10a20": "perder de 10 a 20 kg",
  mais20: "um recomeço acima de 20 kg",
};

// ===================================================================
// Análise — steps que dão sensação de algo feito SÓ pra ela
// ===================================================================
const ANALYZING_STEPS = [
  "Calculando seu gasto calórico real",
  "Selecionando receitas que respeitam suas restrições",
  "Encaixando tudo na sua rotina e no seu tempo",
  "Montando suas 4 semanas de cardápio (renova a cada 7 dias)",
];

function buildQuery(extra: Record<string, string>) {
  const incoming = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const out = new URLSearchParams();
  incoming.forEach((v, k) => out.set(k, v)); // preserva utm_*, rtkcid, etc.
  Object.entries(extra).forEach(([k, v]) => out.set(k, v));
  const s = out.toString();
  return s ? `?${s}` : "";
}

// ===================================================================
// PÁGINA
// ===================================================================
export default function Page() {
  const [phase, setPhase] = useState<"quiz" | "analyzing" | "offer">("quiz");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [aStep, setAStep] = useState(0);

  const total = QUESTIONS.length;
  const q = QUESTIONS[step];

  const select = (key: string, v: string) => {
    const next = { ...answers, [key]: v };
    setAnswers(next);
    if (step < total - 1) {
      setStep(step + 1);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setPhase("analyzing");
    }
  };

  // roda a animação de análise e vai pra oferta
  useEffect(() => {
    if (phase !== "analyzing") return;
    setAStep(0);
    const iv = setInterval(() => setAStep((s) => s + 1), 900);
    const done = setTimeout(() => {
      setPhase("offer");
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    }, ANALYZING_STEPS.length * 900 + 500);
    return () => { clearInterval(iv); clearTimeout(done); };
  }, [phase]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 to-background">
      {phase === "quiz" && <Quiz q={q} step={step} total={total} answers={answers} onSelect={select} />}
      {phase === "analyzing" && <Analyzing aStep={aStep} />}
      {phase === "offer" && <Offer answers={answers} />}
    </div>
  );
}

// ===================================================================
// QUIZ
// ===================================================================
function Quiz({
  q, step, total, answers, onSelect,
}: {
  q: Question; step: number; total: number; answers: Record<string, string>; onSelect: (k: string, v: string) => void;
}) {
  const pct = (step / total) * 100;
  return (
    <div className="mx-auto max-w-xl px-4 py-6 pb-24">
      {/* topo / marca */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Leaf className="h-4 w-4 text-primary" />
        </div>
        <span className="font-bold tracking-tight">Nutri IA</span>
      </div>

      {/* landing sentence — só na 1ª pergunta */}
      {step === 0 && (
        <div className="text-center mb-6">
          <div className="inline-block rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold tracking-widest uppercase px-3 py-1.5 mb-3">
            Diagnóstico de 30 segundos
          </div>
          <h1 className="text-2xl sm:text-[28px] font-extrabold leading-tight">
            Você não falhou em nenhuma dieta.{" "}
            <span className="text-primary">As dietas é que falharam com você</span> — porque foram feitas pra um corpo genérico, não pro seu.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Responda 8 perguntas rápidas e a nossa IA monta, em 1 minuto, um plano de 30 dias feito pro SEU corpo, sua rotina e o que você gosta de comer — com cardápio novo a cada 7 dias.
          </p>
        </div>
      )}

      {/* progresso */}
      <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <p className="text-right text-[11px] font-semibold text-muted-foreground mb-4">
        Pergunta {step + 1} de {total}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.key}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-sm"
        >
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary mb-2">{q.kicker}</p>
          <h2 className="text-xl sm:text-[22px] font-bold leading-snug">{q.question}</h2>
          {q.sub && <p className="mt-2 text-sm text-muted-foreground">{q.sub}</p>}

          <div className="mt-5 flex flex-col gap-2.5">
            {q.options.map((o) => {
              const active = answers[q.key] === o.v;
              return (
                <button
                  key={o.v}
                  onClick={() => onSelect(q.key, o.v)}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-[15px] font-medium transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-emerald-50/60 active:scale-[0.99] ${
                    active ? "border-primary bg-emerald-50" : "border-border bg-muted/30"
                  }`}
                >
                  <span className="text-xl leading-none">{o.emoji}</span>
                  <span>{o.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="mt-5 text-center text-[11px] text-muted-foreground">
        <Lock className="inline h-3 w-3 mr-1" /> 100% sigiloso · sem cadastro pra responder · grátis
      </p>
    </div>
  );
}

// ===================================================================
// ANÁLISE
// ===================================================================
function Analyzing({ aStep }: { aStep: number }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h2 className="text-2xl font-extrabold">Montando seu plano…</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Cruzando suas respostas com mais de 2.400 planos que já deram certo.
      </p>
      <div className="mx-auto my-8 h-14 w-14 animate-spin rounded-full border-4 border-emerald-100 border-t-primary" />
      <div className="mx-auto max-w-sm text-left">
        {ANALYZING_STEPS.map((s, i) => {
          const done = i < aStep;
          const active = i === aStep;
          return (
            <div
              key={s}
              className={`flex items-center gap-3 py-2 text-sm transition-all ${
                done ? "text-primary font-medium" : active ? "text-foreground font-medium" : "text-muted-foreground/50"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  done ? "bg-primary text-white" : active ? "bg-amber-400 text-white" : "bg-muted"
                }`}
              >
                {done ? "✓" : ""}
              </span>
              {s}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===================================================================
// OFERTA
// ===================================================================
function Offer({ answers }: { answers: Record<string, string> }) {
  const [loading, setLoading] = useState(false);
  const [secs, setSecs] = useState(15 * 60);
  const [showStuck, setShowStuck] = useState(false);
  const offerRef = useRef<HTMLDivElement>(null);

  // contador de reserva
  useEffect(() => {
    const iv = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, []);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  // CTA fixo aparece depois de rolar
  useEffect(() => {
    const onScroll = () => setShowStuck(window.scrollY > 520);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const foco = ZONA_FOCO[answers.zona] ?? "emagrecimento";
  const restr = RESTRICAO_TXT[answers.restricao] ?? "sem restrições desnecessárias";
  const ama = AMA_TXT[answers.ama] ?? "o que você gosta";
  const meta = OBJ_META[answers.objetivo] ?? "emagrecer com saúde";

  const goCheckout = () => {
    setLoading(true);
    const url = CAKTO_CHECKOUT_URL + buildQuery({ ...answers, src: "quiz" });
    window.location.href = url;
  };

  return (
    <div className="pb-28">
      {/* barra de reserva */}
      <div className="bg-primary text-primary-foreground text-center text-[13px] font-semibold py-2 px-3">
        ✓ Seu plano está reservado por <span className="tabular-nums font-bold">{mm}:{ss}</span> — depois a vaga volta pra fila
      </div>

      <div className="mx-auto max-w-xl px-4">
        {/* HERO personalizado */}
        <div ref={offerRef} className="text-center pt-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1.5 mb-4">
            <BadgeCheck className="h-3.5 w-3.5" /> 96% de compatibilidade com seu perfil
          </div>
          <h1 className="text-[26px] sm:text-3xl font-extrabold leading-tight">
            Seu plano pra <span className="text-primary">{meta}</span> está pronto.
          </h1>
          <p className="mt-3 text-[15px] text-muted-foreground">
            Focado em <b className="text-foreground">{foco}</b>, com <b className="text-foreground">{restr}</b>, sem te obrigar a cortar <b className="text-foreground">{ama}</b> — e encaixado na sua rotina.
          </p>
        </div>

        {/* card resumo do perfil */}
        <div className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary mb-3">Seu plano-espelho inclui</p>
          <ul className="space-y-2.5 text-[15px]">
            {[
              "Plano completo de 30 dias com cardápio novo a cada 7 dias — 35 receitas por semana, sem repetir",
              "Lista de compras pronta + passo a passo com foto de cada receita",
              "Calorias e macros já calculados pro SEU objetivo — você não precisa contar nada",
              "Ajuste automático conforme você registra o que comeu",
            ].map((t) => (
              <li key={t} className="flex gap-2.5">
                <Check className="h-5 w-5 shrink-0 text-primary" /> <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* A VIRADA — promessa calibrada */}
        <div className="mt-8 text-center">
          <h2 className="text-xl font-extrabold leading-snug">
            Os primeiros números descendo na balança em <span className="text-primary">7 dias</span> —
            mesmo que você já tenha desistido de 5 dietas, mesmo sem tempo pra cozinhar, sem viver de salada triste.
          </h2>
        </div>

        {/* ancoragem de preço */}
        <div className="mt-6 rounded-2xl border border-border bg-emerald-50/40 p-5 text-center">
          <p className="text-[15px] text-muted-foreground">
            Uma consulta de nutricionista custa <s>R$ 300 a R$ 500</s> e some na gaveta em 1 mês.
          </p>
          <p className="mt-1 text-[15px] font-semibold">
            Aqui você tem uma <b>nutricionista IA 24h</b> + plano que se ajusta toda semana.
          </p>
        </div>

        {/* CARD DE OFERTA */}
        <div className="mt-6 rounded-3xl border-2 border-primary bg-white p-6 shadow-xl shadow-primary/10 text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary">Oferta de lançamento · 1º mês</p>
          <div className="mt-2 flex items-end justify-center gap-2">
            <span className="text-lg text-muted-foreground line-through">R$ {PRICE_ANCHOR}</span>
            <span className="text-5xl font-extrabold">R$ {PRICE_FRONT}</span>
          </div>
          <p className="text-sm text-muted-foreground">no primeiro mês · cancele quando quiser</p>

          <Button
            size="lg"
            onClick={goCheckout}
            disabled={loading}
            className="mt-5 h-14 w-full text-base font-bold gap-2 shadow-lg shadow-primary/25"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>QUERO MEU PLANO POR R$ {PRICE_FRONT} <ArrowRight className="h-5 w-5" /></>}
          </Button>
          <p className="mt-3 text-[12px] text-muted-foreground flex items-center justify-center gap-3 flex-wrap">
            <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Pagamento seguro</span>
            <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Acesso na hora</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 7 dias de garantia</span>
          </p>
        </div>

        {/* prova social */}
        <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4,9/5</span>
          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> +2.400 planos gerados</span>
          <span>resultados em 2 a 8 semanas</span>
        </div>

        {/* depoimentos */}
        <div className="mt-6 space-y-3">
          {[
            { n: "Camila R., 34", t: "Pela primeira vez segui um plano de verdade. As receitas são gostosas e práticas — e não passo mais fome à noite. −9 kg em 8 semanas." },
            { n: "Juliana S., 28", t: "O plano muda toda semana. Nunca comi a mesma coisa dois dias seguidos. −7 kg e o corpo voltou a ficar definido." },
            { n: "Roberto M., 41", t: "A nutricionista IA respondeu todas as minhas dúvidas na hora. Parece consulta de verdade, mas no meu bolso. −9 kg." },
          ].map((d) => (
            <div key={d.n} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <div className="flex mb-1">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</div>
              <p className="text-sm">&ldquo;{d.t}&rdquo;</p>
              <p className="mt-1.5 text-xs font-semibold text-muted-foreground">{d.n}</p>
            </div>
          ))}
        </div>

        {/* o que vem depois (features do app, sem revelar upsell) */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          {[
            { icon: Utensils, t: "Plano de 30 dias" },
            { icon: Camera, t: "Diário com foto do prato" },
            { icon: MessageCircle, t: "Nutricionista IA 24h" },
            { icon: Sparkles, t: "Ajuste toda semana" },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.t} className="rounded-xl border border-border bg-white p-4 text-center shadow-sm">
                <Icon className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-2 text-[13px] font-medium">{f.t}</p>
              </div>
            );
          })}
        </div>

        {/* FAQ — quebra de objeções secundárias */}
        <div className="mt-8">
          <h3 className="text-center text-lg font-bold mb-3">Antes de você decidir</h3>
          <div className="space-y-2.5">
            {[
              { q: "“Já tentei de tudo, por que isso seria diferente?”", a: "Porque tudo que você tentou foi feito pra uma pessoa média que não existe. Aqui o plano nasce das SUAS respostas — seu objetivo, sua zona teimosa, suas restrições e o que você gosta de comer — e muda toda semana conforme você anda." },
              { q: "“Vou ter que cortar pão, arroz, doce?”", a: "Não. Você acabou de marcar o que não quer abrir mão e o plano respeita isso. Dieta que corta tudo é dieta que você larga na 2ª semana." },
              { q: "“E se não funcionar pra mim?”", a: "Você tem 7 dias de garantia. Entrou, não curtiu, é só pedir reembolso — sem perguntas." },
              { q: "“Como recebo o acesso?”", a: "Assim que o pagamento é confirmado, você recebe login e senha no e-mail e já entra. Leva minutos." },
              { q: "“Funciona pra diabético, grávida ou intolerância?”", a: "Sim. Por isso perguntamos suas restrições — o plano é montado respeitando exatamente o que você marcou." },
            ].map((f) => (
              <details key={f.q} className="group rounded-xl border border-border bg-white p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-[15px]">
                  {f.q}
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="mt-8 text-center">
          <h3 className="text-xl font-extrabold">Sua transformação começa hoje</h3>
          <p className="mt-1 text-sm text-muted-foreground">Menos que um lanche pra ter uma nutricionista IA no bolso.</p>
          <Button size="lg" onClick={goCheckout} disabled={loading} className="mt-4 h-14 w-full text-base font-bold gap-2">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>COMEÇAR AGORA POR R$ {PRICE_FRONT} <ArrowRight className="h-5 w-5" /></>}
          </Button>
          <p className="mt-3 text-[11px] text-muted-foreground">
            *Resultados variam de pessoa pra pessoa e dependem da sua dedicação ao plano. Este conteúdo é informativo e não substitui acompanhamento médico.
          </p>
        </div>
      </div>

      {/* CTA fixo mobile */}
      <AnimatePresence>
        {showStuck && (
          <motion.div
            initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          >
            <div className="mx-auto flex max-w-xl items-center gap-3">
              <div className="leading-tight">
                <p className="text-[11px] text-muted-foreground line-through">R$ {PRICE_ANCHOR}</p>
                <p className="text-lg font-extrabold -mt-0.5">R$ {PRICE_FRONT}</p>
              </div>
              <Button onClick={goCheckout} disabled={loading} className="h-12 flex-1 font-bold gap-2">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>QUERO MEU PLANO <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
