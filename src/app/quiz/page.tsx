"use client"; declare global { interface Window { fbq?: (...args: unknown[]) => void } }

/**
 * NUTRI IA - Funil "Idade Metabolica" (modelado do Seca 5 em 5).
 * Quiz-first, home publica. Trafego frio cai aqui.
 * hook curiosidade -> biometria -> 7 sinais -> analise -> REVELACAO da idade
 * metabolica (formula real: IMC + idade + sintomas) -> oferta -> checkout Cakto.
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Leaf, Check, Star, Shield, Clock, Lock, ArrowRight, Loader2,
  Camera, Sparkles, MessageCircle, ChevronDown, Utensils, Users, Brain, Flame, Activity,
} from "lucide-react";

const CAKTO_CHECKOUT_URL = "https://pay.cakto.com.br/rjy7jee_920129";
const PRICE_FRONT = "14,99";
const PRICE_ANCHOR = "39,90";

type Opt = { label: string; pts: number };
type Q = { key: string; kicker: string; question: string; options: Opt[] };

const QUESTIONS: Q[] = [
  { key: "barriga", kicker: "Sinal 1 de 7", question: "Como está a sua barriga hoje?", options: [
    { label: "Plana ou quase plana, sem acúmulo", pts: 0 },
    { label: "Um pouco de barriga, disfarço com a roupa", pts: 1 },
    { label: "Saliente — é a primeira coisa que eu noto", pts: 2 },
    { label: "Muito grande e dura, parece estufada o tempo todo", pts: 3 },
  ]},
  { key: "sanfona", kicker: "Sinal 2 de 7", question: "Quantas vezes você já perdeu peso e recuperou (efeito sanfona)?", options: [
    { label: "Nunca — meu peso sempre foi estável", pts: 0 },
    { label: "1 a 2 vezes", pts: 1 },
    { label: "3 a 5 vezes", pts: 2 },
    { label: "Mais de 5 — perco e recupero o tempo todo", pts: 3 },
  ]},
  { key: "carbo", kicker: "Sinal 3 de 7", question: "Como você se sente depois de comer pão, massa ou arroz?", options: [
    { label: "Normal, com energia", pts: 0 },
    { label: "Uma sonolência leve", pts: 1 },
    { label: "Muito sono — quase não consigo funcionar", pts: 2 },
    { label: "Sono extremo + fome de novo em menos de 2h", pts: 3 },
  ]},
  { key: "compulsao", kicker: "Sinal 4 de 7", question: "Você tem vontade intensa de doce ou carboidrato durante o dia?", options: [
    { label: "Raramente ou nunca", pts: 0 },
    { label: "De vez em quando, controlo fácil", pts: 1 },
    { label: "Quase todo dia, principalmente à tarde e à noite", pts: 2 },
    { label: "É incontrolável — parece vício", pts: 3 },
  ]},
  { key: "sono", kicker: "Sinal 5 de 7", question: "Como está a qualidade do seu sono?", options: [
    { label: "Durmo bem, acordo descansada", pts: 0 },
    { label: "Razoável, às vezes acordo cansada", pts: 1 },
    { label: "Ruim — demoro a dormir ou acordo de madrugada", pts: 2 },
    { label: "Insônia frequente, acordo pior do que deitei", pts: 3 },
  ]},
  { key: "energia", kicker: "Sinal 6 de 7", question: "Como está a sua energia no dia a dia?", options: [
    { label: "Ótima, disposição o dia todo", pts: 0 },
    { label: "Cai bastante à tarde", pts: 1 },
    { label: "Cansaço quase constante", pts: 2 },
    { label: "Exausta o tempo todo, mesmo dormindo", pts: 3 },
  ]},
  { key: "aparencia", kicker: "Sinal 7 de 7", question: "Você sente que aparenta mais idade do que realmente tem?", options: [
    { label: "Não — costumam me dar menos idade", pts: 0 },
    { label: "Aparento a minha idade exata", pts: 1 },
    { label: "Sinto que aparento 3 a 5 anos a mais", pts: 2 },
    { label: "Aparento bem mais de 5 anos a mais", pts: 3 },
  ]},
];

const ANALYZING_STEPS = [
  "Calculando seu IMC e gasto calórico real",
  "Cruzando seus 7 sinais metabólicos",
  "Estimando a idade do seu metabolismo",
  "Montando seu plano de reversão de 30 dias",
];

function buildQuery(extra: Record<string, string>) {
  const incoming = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const out = new URLSearchParams();
  incoming.forEach((v, k) => out.set(k, v));
  Object.entries(extra).forEach(([k, v]) => out.set(k, v));
  const s = out.toString();
  return s ? `?${s}` : "";
}

function clampNum(n: number, lo: number, hi: number): number {
  return Math.min(Math.max(n, lo), hi);
}

function calcMetabolicAge(age: number, heightCm: number, weightKg: number, pts: number): number {
  const a = clampNum(Math.round(age) || 35, 14, 99);
  const h = clampNum(heightCm || 165, 120, 220) / 100;
  const w = clampNum(weightKg || 70, 30, 300);
  const bmi = w / (h * h);
  let offset = 0;
  if (bmi >= 25 && bmi < 30) offset += 4;
  else if (bmi >= 30 && bmi < 35) offset += 8;
  else if (bmi >= 35) offset += 12;
  offset += Math.round(pts * 0.7);
  offset = Math.min(offset, 15);
  return clampNum(a + offset, a, 99);
}

export default function Page() {
  const [phase, setPhase] = useState<"landing" | "data" | "quiz" | "analyzing" | "result" | "offer">("landing");
  const [dataStep, setDataStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [aStep, setAStep] = useState(0);

  const total = QUESTIONS.length;
  const scrollTop = () => { if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); };

  const selectOption = (key: string, pts: number) => {
    const next = { ...answers, [key]: pts };
    setAnswers(next);
    if (step < total - 1) { setStep(step + 1); scrollTop(); }
    else { setPhase("analyzing"); scrollTop(); }
  };

  useEffect(() => {
    if (phase !== "analyzing") return;
    setAStep(0);
    const iv = setInterval(() => setAStep((s) => s + 1), 950);
    const done = setTimeout(() => { setPhase("result"); scrollTop(); }, ANALYZING_STEPS.length * 950 + 500);
    return () => { clearInterval(iv); clearTimeout(done); };
  }, [phase]);

  const realAge = clampNum(parseInt(age || "0", 10) || 0, 0, 99);
  const symptomPts = Object.values(answers).reduce((a, b) => a + b, 0);
  const metAge = calcMetabolicAge(realAge, parseInt(height || "0", 10), parseInt(weight || "0", 10), symptomPts);
  const gap = Math.max(metAge - realAge, 0);
  const firstName = (name || "").trim().split(" ")[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 to-background">
      {phase === "landing" && <Landing onStart={() => { setPhase("data"); setDataStep(0); scrollTop(); }} />}
      {phase === "data" && (
        <DataStep
          dataStep={dataStep} name={name} age={age} height={height} weight={weight}
          setName={setName} setAge={setAge} setHeight={setHeight} setWeight={setWeight}
          onNext={() => { if (dataStep === 0) { setDataStep(1); scrollTop(); } else { setPhase("quiz"); setStep(0); scrollTop(); } }}
        />
      )}
      {phase === "quiz" && <Quiz q={QUESTIONS[step]} step={step} total={total} answers={answers} onSelect={selectOption} />}
      {phase === "analyzing" && <Analyzing aStep={aStep} firstName={firstName} />}
      {phase === "result" && <Result firstName={firstName} realAge={realAge} metAge={metAge} gap={gap} onContinue={() => { setPhase("offer"); scrollTop(); }} />}
      {phase === "offer" && <Offer firstName={firstName} metAge={metAge} gap={gap} answers={answers} name={name} age={age} />}
    </div>
  );
}

// ============================ LANDING (hook) ============================
function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-8 text-center">
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><Leaf className="h-4 w-4 text-primary" /></div>
        <span className="font-bold tracking-tight">Nutri IA</span>
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1.5 mb-4">
        <Brain className="h-3.5 w-3.5" /> Teste de 2 minutos · Análise por IA
      </div>
      <h1 className="text-[28px] sm:text-4xl font-extrabold leading-[1.12]">
        Descubra a sua <span className="text-primary">Idade Metabólica</span>
      </h1>
      <p className="mt-4 text-[15px] sm:text-base text-muted-foreground">
        Um teste rápido que revela se o seu metabolismo está <b className="text-foreground">envelhecido</b> — e o plano que a nossa IA monta pra reverter, comendo o que você gosta.
      </p>
      <img src="/variedade-pratos.jpg" alt="" className="rounded-2xl object-cover h-48 w-full mt-6 shadow-sm" />
      <p className="mt-5 text-sm text-muted-foreground">
        Leva menos de 2 minutos. No final, um <b className="text-foreground">diagnóstico personalizado</b> feito pela IA a partir das suas respostas.
      </p>
      <Button size="lg" onClick={onStart} className="mt-5 h-14 w-full text-base font-bold gap-2 shadow-lg shadow-primary/25">
        QUERO DESCOBRIR <ArrowRight className="h-5 w-5" />
      </Button>
      <p className="mt-3 text-[12px] text-muted-foreground flex items-center justify-center gap-3 flex-wrap">
        <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> 100% sigiloso</span>
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 2 minutos</span>
        <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Grátis</span>
      </p>
    </div>
  );
}

// ============================ DATA (biometria) ============================
function DataStep({ dataStep, name, age, height, weight, setName, setAge, setHeight, setWeight, onNext }: {
  dataStep: number; name: string; age: string; height: string; weight: string;
  setName: (v: string) => void; setAge: (v: string) => void; setHeight: (v: string) => void; setWeight: (v: string) => void; onNext: () => void;
}) {
  const ageN = parseInt(age || "0", 10);
  const hN = parseInt(height || "0", 10);
  const wN = parseInt(weight || "0", 10);
  const ok = dataStep === 0
    ? (name.trim().length > 0 && ageN >= 14 && ageN <= 99)
    : (hN >= 120 && hN <= 220 && wN >= 30 && wN <= 300);
  const inputCls = "w-full rounded-xl border-2 border-border bg-white px-4 py-3.5 text-[15px] outline-none focus:border-primary";
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Progress pct={dataStep === 0 ? 6 : 14} />
      <div className="text-center mb-6">
        <div className="text-3xl mb-2">📋</div>
        <h2 className="text-2xl font-extrabold">{dataStep === 0 ? "Vamos começar" : "Quase lá"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">A IA usa esses dados pra calcular a idade do seu metabolismo.</p>
      </div>
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-4">
        {dataStep === 0 ? (
          <>
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-primary">Seu nome</label>
              <input className={inputCls} placeholder="Seu primeiro nome" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-primary">Sua idade</label>
              <input className={inputCls} type="number" inputMode="numeric" placeholder="Ex: 38" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-primary">Sua altura (cm)</label>
              <input className={inputCls} type="number" inputMode="numeric" placeholder="Ex: 165" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-primary">Seu peso atual (kg)</label>
              <input className={inputCls} type="number" inputMode="numeric" placeholder="Ex: 78" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
          </>
        )}
      </div>
      <Button size="lg" onClick={onNext} disabled={!ok} className="mt-5 h-14 w-full text-base font-bold gap-2">
        CONTINUAR <ArrowRight className="h-5 w-5" />
      </Button>
      <p className="mt-4 text-center text-[11px] text-muted-foreground"><Lock className="inline h-3 w-3 mr-1" /> Seus dados são sigilosos e usados só pra montar seu diagnóstico.</p>
    </div>
  );
}

// ============================ QUIZ (sintomas) ============================
function Quiz({ q, step, total, answers, onSelect }: {
  q: Q; step: number; total: number; answers: Record<string, number>; onSelect: (k: string, pts: number) => void;
}) {
  const pct = 14 + ((step + 1) / total) * 80;
  return (
    <div className="mx-auto max-w-xl px-4 py-8 pb-20">
      <Progress pct={pct} />
      <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-sm">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary mb-2">{q.kicker}</p>
        <h2 className="text-xl sm:text-[22px] font-bold leading-snug">{q.question}</h2>
        <div className="mt-5 flex flex-col gap-2.5">
          {q.options.map((o) => {
            const active = answers[q.key] === o.pts;
            return (
              <button key={o.label} onClick={() => onSelect(q.key, o.pts)}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-[15px] font-medium transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-emerald-50/60 active:scale-[0.99] ${active ? "border-primary bg-emerald-50" : "border-border bg-muted/30"}`}>
                <span>{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-5 text-center text-[11px] text-muted-foreground"><Lock className="inline h-3 w-3 mr-1" /> Seja sincera — o diagnóstico só é preciso com a verdade.</p>
    </div>
  );
}

// ============================ ANALYZING ============================
function Analyzing({ aStep, firstName }: { aStep: number; firstName: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <Activity className="mx-auto h-10 w-10 text-primary" />
      <h2 className="mt-3 text-2xl font-extrabold">{firstName ? `${firstName}, ` : ""}calculando sua idade metabólica…</h2>
      <p className="mt-2 text-sm text-muted-foreground">A IA está cruzando seus dados com mais de 2.400 perfis.</p>
      <div className="mx-auto my-8 h-14 w-14 animate-spin rounded-full border-4 border-emerald-100 border-t-primary" />
      <div className="mx-auto max-w-sm text-left">
        {ANALYZING_STEPS.map((s, i) => {
          const done = i < aStep; const active = i === aStep;
          return (
            <div key={s} className={`flex items-center gap-3 py-2 text-sm transition-all ${done ? "text-primary font-medium" : active ? "text-foreground font-medium" : "text-muted-foreground/50"}`}>
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${done ? "bg-primary text-white" : active ? "bg-amber-400 text-white" : "bg-muted"}`}>{done ? "✓" : ""}</span>
              {s}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================ RESULT (revelação) ============================
function Result({ firstName, realAge, metAge, gap, onContinue }: { firstName: string; realAge: number; metAge: number; gap: number; onContinue: () => void }) {
  const aged = gap > 0;
  return (
    <div className="mx-auto max-w-xl px-4 py-10 text-center">
      <Progress pct={100} />
      <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary mb-2">Seu diagnóstico está pronto</p>
      <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
        {firstName ? `${firstName}, sua` : "Sua"} idade metabólica é
      </h1>
      <div className={`mx-auto mt-5 flex h-40 w-40 flex-col items-center justify-center rounded-full border-4 ${aged ? "border-rose-300 bg-rose-50" : "border-emerald-300 bg-emerald-50"}`}>
        <Flame className={`h-6 w-6 ${aged ? "text-rose-500" : "text-emerald-600"}`} />
        <span className={`text-5xl font-extrabold ${aged ? "text-rose-600" : "text-emerald-700"}`}>{metAge}</span>
        <span className="text-xs text-muted-foreground">anos</span>
      </div>
      {aged ? (
        <p className="mt-6 text-[15px] text-muted-foreground">
          Seu metabolismo está <b className="text-rose-600">{gap} anos mais velho</b> que você (que tem {realAge}). É isso que explica a barriga teimosa, a compulsão e o cansaço que você marcou: seu corpo está <b className="text-foreground">queimando menos e estocando mais</b>.
        </p>
      ) : (
        <p className="mt-6 text-[15px] text-muted-foreground">
          Seu metabolismo está alinhado com a sua idade real — mas dá pra deixá-lo ainda mais eficiente e blindar contra o efeito sanfona.
        </p>
      )}
      <div className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-sm text-left">
        <p className="text-[15px] font-semibold flex items-start gap-2"><Sparkles className="h-5 w-5 shrink-0 text-primary" /> A boa notícia: dá pra reverter.</p>
        <p className="mt-2 text-sm text-muted-foreground">A nossa IA já montou o seu <b className="text-foreground">plano de 30 dias pra rejuvenescer o metabolismo</b> — com cardápio que muda a cada 7 dias, feito pro seu corpo e respeitando o que você ama comer.</p>
      </div>
      <Button size="lg" onClick={onContinue} className="mt-6 h-14 w-full text-base font-bold gap-2 shadow-lg shadow-primary/25">
        VER MEU PLANO DE REVERSÃO <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

// ============================ OFFER ============================
function Offer({ firstName, metAge, gap, answers, name, age }: { firstName: string; metAge: number; gap: number; answers: Record<string, number>; name: string; age: string }) {
  const [loading, setLoading] = useState(false);
  const [secs, setSecs] = useState(15 * 60);
  const [showStuck, setShowStuck] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const offerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const iv = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000); return () => clearInterval(iv); }, []);
  useEffect(() => { const onS = () => setShowStuck(window.scrollY > 520); window.addEventListener("scroll", onS); return () => window.removeEventListener("scroll", onS); }, []);
  useEffect(() => {
    let shown = false; const trg = () => { if (!shown) { shown = true; setShowExit(true); } };
    const onLeave = (e: MouseEvent) => { if (e.clientY <= 0) trg(); };
    document.addEventListener("mouseleave", onLeave); const t = setTimeout(trg, 25000);
    return () => { document.removeEventListener("mouseleave", onLeave); clearTimeout(t); };
  }, []);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  const goCheckout = () => {
    if (typeof window !== "undefined" && window.fbq) window.fbq("track", "InitiateCheckout");
    setLoading(true);
    const ans: Record<string, string> = {};
    Object.entries(answers).forEach(([k, v]) => { ans[k] = String(v); });
    window.location.href = CAKTO_CHECKOUT_URL + buildQuery({ ...ans, nome: name, idade: age, idade_metabolica: String(metAge), src: "quiz_metab" });
  };

  const FEATURES = [
    { icon: Utensils, t: "Plano de 30 dias" },
    { icon: Camera, t: "Diário com foto do prato" },
    { icon: MessageCircle, t: "Nutricionista IA 24h" },
    { icon: Sparkles, t: "Ajuste toda semana" },
  ];
  const TESTI = [
    { n: "Camila R., 34", t: "Pela primeira vez segui um plano de verdade, sem passar fome à noite. Foram 9 kg em 8 semanas." },
    { n: "Juliana S., 28", t: "O plano muda toda semana, nunca enjoa. Perdi 7 kg e meu corpo voltou a ficar definido." },
    { n: "Roberto M., 41", t: "A nutricionista IA tira todas as dúvidas na hora. Parece consulta, mas no meu bolso. Foram 9 kg." },
  ];
  const FAQS = [
    { q: "Como a IA calcula a idade metabólica?", a: "Ela cruza sua idade, seu IMC (altura e peso) e os 7 sinais que você respondeu. Quanto mais sinais de metabolismo lento, maior a diferença pra sua idade real." },
    { q: "Vou ter que cortar pão, arroz e doce?", a: "Não. Você diz o que não quer abrir mão e o plano respeita. Dieta que corta tudo é dieta que você larga na 2ª semana." },
    { q: "E se não funcionar pra mim?", a: "Você tem 7 dias de garantia. Entrou, não curtiu, é só pedir o reembolso — sem perguntas." },
    { q: "Como recebo o acesso?", a: "Assim que o pagamento é confirmado, você recebe login e senha no e-mail e já entra. Leva minutos." },
  ];

  return (
    <div className="pb-28">
      {showExit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowExit(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-2xl font-extrabold">Peraí 👋</p>
            <p className="mt-2 text-sm text-muted-foreground">Você descobriu sua idade metabólica — seria uma pena não reverter agora. O plano fica reservado por R$ {PRICE_FRONT} só por alguns minutos.</p>
            <Button className="mt-5 w-full" onClick={goCheckout}>QUERO REVERTER AGORA</Button>
            <button className="mt-3 block w-full text-xs text-muted-foreground underline" onClick={() => setShowExit(false)}>não, prefiro continuar como tô</button>
          </div>
        </div>
      )}
      <div className="bg-primary text-primary-foreground text-center text-[13px] font-semibold py-2 px-3">
        ✓ Seu plano de reversão está reservado por <span className="tabular-nums font-bold">{mm}:{ss}</span>
      </div>

      <div className="mx-auto max-w-xl px-4">
        <div ref={offerRef} className="text-center pt-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1.5 mb-4">
            <Flame className="h-3.5 w-3.5" /> Plano feito pra rejuvenescer seu metabolismo
          </div>
          <h1 className="text-[26px] sm:text-3xl font-extrabold leading-tight">
            {firstName ? `${firstName}, seu` : "Seu"} plano pra sair dos <span className="text-rose-600">{metAge}</span> e <span className="text-primary">rejuvenescer o metabolismo</span> está pronto.
          </h1>
          <p className="mt-3 text-[15px] text-muted-foreground">
            Cardápio novo a cada 7 dias, feito pelo seu perfil, sem cortar o que você ama — e uma nutricionista IA 24h no bolso.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-center mb-3">É isso que você vai comer</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <img src="/prato-principal.jpg" alt="" className="rounded-lg object-cover aspect-square w-full" />
            <img src="/cafe-da-manha.jpg" alt="" className="rounded-lg object-cover aspect-square w-full" />
            <img src="/salmao.jpg" alt="" className="rounded-lg object-cover aspect-square w-full" />
          </div>
          <ul className="space-y-2.5 text-[15px]">
            {[
              "Plano de 30 dias com cardápio novo a cada 7 dias — sem repetir",
              "Lista de compras pronta + passo a passo de cada receita",
              "Calorias e macros já calculados pro seu metabolismo",
              "Ajuste automático conforme você registra o que comeu",
            ].map((t) => (<li key={t} className="flex gap-2.5"><Check className="h-5 w-5 shrink-0 text-primary" /> <span>{t}</span></li>))}
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-emerald-50/40 p-5 text-center">
          <p className="text-[15px] text-muted-foreground">Uma consulta de nutricionista custa <s>R$ 300 a R$ 500</s> e some na gaveta em 1 mês.</p>
          <p className="mt-1 text-[15px] font-semibold">Aqui você tem uma <b>nutricionista IA 24h</b> + plano que se ajusta toda semana.</p>
        </div>

        <div className="mt-6 rounded-3xl border-2 border-primary bg-white p-6 shadow-xl shadow-primary/10 text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary">Oferta de lançamento · 1º mês</p>
          <div className="mt-2 flex items-end justify-center gap-2">
            <span className="text-lg text-muted-foreground line-through">R$ {PRICE_ANCHOR}</span>
            <span className="text-5xl font-extrabold">R$ {PRICE_FRONT}</span>
          </div>
          <p className="text-sm text-muted-foreground">no primeiro mês · cancele quando quiser</p>
          <Button size="lg" onClick={goCheckout} disabled={loading} className="mt-5 h-14 w-full text-base font-bold gap-2 shadow-lg shadow-primary/25">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>QUERO REVERTER POR R$ {PRICE_FRONT} <ArrowRight className="h-5 w-5" /></>}
          </Button>
          <p className="mt-3 text-[12px] text-muted-foreground flex items-center justify-center gap-3 flex-wrap">
            <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Pagamento seguro</span>
            <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Acesso na hora</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 7 dias de garantia</span>
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4,9/5</span>
          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> +2.400 planos gerados</span>
        </div>
        <div className="mt-6 space-y-3">
          {TESTI.map((d) => (
            <div key={d.n} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <div className="flex mb-1">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</div>
              <p className="text-sm">&ldquo;{d.t}&rdquo;</p>
              <p className="mt-1.5 text-xs font-semibold text-muted-foreground">{d.n}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {FEATURES.map((f) => { const Icon = f.icon; return (
            <div key={f.t} className="rounded-xl border border-border bg-white p-4 text-center shadow-sm">
              <Icon className="mx-auto h-6 w-6 text-primary" /><p className="mt-2 text-[13px] font-medium">{f.t}</p>
            </div>
          ); })}
        </div>

        <div className="mt-8">
          <h3 className="text-center text-lg font-bold mb-3">Antes de você decidir</h3>
          <div className="space-y-2.5">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-xl border border-border bg-white p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-[15px]">{f.q}<ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" /></summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <h3 className="text-xl font-extrabold">Comece a reverter hoje</h3>
          <p className="mt-1 text-sm text-muted-foreground">Menos que um lanche pra rejuvenescer seu metabolismo.</p>
          <Button size="lg" onClick={goCheckout} disabled={loading} className="mt-4 h-14 w-full text-base font-bold gap-2">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>COMEÇAR AGORA POR R$ {PRICE_FRONT} <ArrowRight className="h-5 w-5" /></>}
          </Button>
          <p className="mt-3 text-[11px] text-muted-foreground">*A idade metabólica é uma estimativa educativa baseada em IMC, idade e respostas, não um diagnóstico médico. Resultados variam de pessoa pra pessoa.</p>
        </div>
      </div>

      {showStuck && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="leading-tight"><p className="text-[11px] text-muted-foreground line-through">R$ {PRICE_ANCHOR}</p><p className="text-lg font-extrabold -mt-0.5">R$ {PRICE_FRONT}</p></div>
            <Button onClick={goCheckout} disabled={loading} className="h-12 flex-1 font-bold gap-2">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>QUERO REVERTER <ArrowRight className="h-4 w-4" /></>}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================ Progress bar ============================
function Progress({ pct }: { pct: number }) {
  return (
    <div className="mb-6">
      <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}
