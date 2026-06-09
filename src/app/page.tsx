"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Leaf, Sparkles, Camera, TrendingUp, Check, Star, Zap,
  ArrowRight, Shield, Clock, Loader2, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const BEFORE_AFTER = [
  {
    name: "Camila R.",
    age: 34,
    before: { weight: "78 kg", feeling: "Sem energia, comendo por impulso" },
    after: { weight: "69 kg", feeling: "−9 kg em 8 semanas, mais disposição" },
    quote: "Pela primeira vez segui um plano de verdade. As receitas são gostosas e práticas.",
  },
  {
    name: "Roberto M.",
    age: 41,
    before: { weight: "98 kg", feeling: "Barriga crescendo, roupas apertando" },
    after: { weight: "89 kg", feeling: "−9 kg em 10 semanas, glicemia controlada" },
    quote: "A Nutricionista IA respondeu todas as minhas dúvidas. Parece consulta de verdade.",
  },
  {
    name: "Juliana S.",
    age: 28,
    before: { weight: "72 kg", feeling: "Dieta genérica da internet que não funcionava" },
    after: { weight: "65 kg", feeling: "−7 kg em 6 semanas, corpo definido" },
    quote: "O plano muda toda semana. Nunca comi a mesma coisa dois dias seguidos.",
  },
];

const FEATURES = [
  { icon: Sparkles, title: "35 receitas únicas/semana", desc: "Plano de 7 dias sem repetição, com passo a passo completo" },
  { icon: Camera, title: "Diário com foto", desc: "Tire foto do prato e receba calorias e macros na hora" },
  { icon: TrendingUp, title: "Gamificação", desc: "XP, níveis, conquistas e streak para manter a disciplina" },
  { icon: Zap, title: "Nutricionista IA 24h", desc: "Tire dúvidas, peça substituições e ajustes a qualquer hora" },
];

export default function LandingPage() {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "monthly_brl", guest: true }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Urgency bar */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm font-medium">
        🔥 Oferta de lançamento — Acesso imediato após o pagamento · Cancele quando quiser
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 to-background px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Leaf className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl leading-tight">
            Emagreça com um plano<br />
            <span className="text-primary">feito só para você</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Nutricionista IA + plano alimentar premium de 7 dias + gamificação + diário com foto.
            Resultados reais, sem dieta genérica.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            <Button size="lg" className="min-w-[280px] h-14 text-lg gap-2 shadow-lg shadow-primary/25" onClick={handleBuy} disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Quero começar agora — R$ 39,90/mês <ArrowRight className="h-5 w-5" /></>}
            </Button>
            <p className="text-sm text-muted-foreground flex items-center gap-4">
              <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> Pagamento seguro Stripe</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Acesso em minutos</span>
            </p>
            <Link href="/login" className="text-sm text-primary hover:underline">
              Já tenho conta — entrar
            </Link>
          </div>

          {/* Social proof strip */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9/5 avaliação</span>
            <span>+2.400 planos gerados</span>
            <span>Resultados em 2–8 semanas</span>
          </div>
        </div>
      </section>

      {/* Before / After */}
      <section className="px-4 py-16 bg-muted/30">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Antes e depois de quem usa</h2>
            <p className="mt-2 text-muted-foreground">Transformações reais com plano personalizado e acompanhamento</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {BEFORE_AFTER.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden"
              >
                <div className="grid grid-cols-2 divide-x divide-border">
                  <div className="p-4 bg-red-50/50">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">Antes</p>
                    <p className="text-2xl font-bold text-red-700">{item.before.weight}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.before.feeling}</p>
                  </div>
                  <div className="p-4 bg-emerald-50/50">
                    <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">Depois</p>
                    <p className="text-2xl font-bold text-primary">{item.after.weight}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.after.feeling}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-sm">{item.name}, {item.age} anos</p>
                  <p className="text-sm text-muted-foreground mt-1 italic">&ldquo;{item.quote}&rdquo;</p>
                  <div className="flex mt-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-10">Tudo que você precisa em um só lugar</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="glass rounded-2xl p-6">
                  <Icon className="h-8 w-8 text-primary" />
                  <h3 className="mt-3 font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="px-4 py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-md text-center">
          <h2 className="text-3xl font-bold">Comece hoje</h2>
          <div className="mt-6 rounded-2xl border-2 border-primary bg-white p-8 shadow-lg">
            <p className="text-sm font-medium text-primary uppercase tracking-wide">Plano mensal</p>
            <p className="mt-2 text-5xl font-extrabold">R$ 39,90</p>
            <p className="text-muted-foreground">/mês · cancele quando quiser</p>
            <ul className="mt-6 space-y-2 text-left text-sm">
              {[
                "Plano alimentar premium 7 dias",
                "35 receitas únicas por semana",
                "Lista de compras + PDF",
                "Diário com análise por foto",
                "Nutricionista IA ilimitada",
                "Gamificação e acompanhamento",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Button size="lg" className="w-full mt-6 h-14 text-lg" onClick={handleBuy} disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Assinar agora"}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Após pagar, você recebe login e senha no email
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-8">Perguntas frequentes</h2>
          <div className="space-y-4">
            {[
              { q: "Como recebo meu acesso?", a: "Após o pagamento confirmado, enviamos um email com login e senha temporária. Você altera a senha no primeiro acesso." },
              { q: "Posso cancelar?", a: "Sim, cancele a qualquer momento pelo portal de assinaturas. Sem multa." },
              { q: "Funciona para diabéticos e grávidas?", a: "Sim! Temos programas específicos selecionados na consulta inicial com a Nutricionista IA." },
              { q: "E se eu digitar meus dados errado?", a: "Sem problema — edite peso, altura e preferências a qualquer momento em Configurações." },
            ].map((faq) => (
              <details key={faq.q} className="rounded-xl border border-border bg-white p-4 group">
                <summary className="font-medium cursor-pointer flex items-center justify-between list-none">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-12 bg-primary text-primary-foreground text-center">
        <h2 className="text-2xl font-bold">Sua transformação começa agora</h2>
        <p className="mt-2 opacity-90">Menos de R$ 1,50 por dia para ter uma nutricionista IA no bolso</p>
        <Button size="lg" variant="secondary" className="mt-6 h-14 text-lg min-w-[240px]" onClick={handleBuy} disabled={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Quero meu plano agora"}
        </Button>
      </section>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        <p>© 2026 Nutri IA · <Link href="/login" className="hover:underline">Entrar</Link></p>
      </footer>
    </div>
  );
}
