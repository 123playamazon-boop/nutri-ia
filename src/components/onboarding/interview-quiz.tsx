"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Send, Loader2, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DIET_PROGRAM_LABELS,
  DIET_PROGRAM_DESCRIPTIONS,
  type DietProgram,
  type Gender,
  type InterviewMessage,
  type OnboardingData,
} from "@/types";

type Step =
  | "name"
  | "age"
  | "gender"
  | "height"
  | "weight"
  | "target"
  | "allergies"
  | "dislikes"
  | "diet"
  | "confirm"
  | "done";

const DIET_OPTIONS: DietProgram[] = [
  "emagrecimento_rapido",
  "emagrecimento_moderado",
  "diabetes",
  "gravidez",
  "proteinas",
];

interface InterviewQuizProps {
  onComplete?: () => void;
  allowRestart?: boolean;
}

export function InterviewQuiz({ onComplete, allowRestart = false }: InterviewQuizProps) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("name");
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [messages, setMessages] = useState<InterviewMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Olá! 👋 Sou sua Nutricionista IA. Antes de montar seu plano personalizado, preciso te conhecer melhor — como numa consulta real.\n\nPara começar, qual é o seu nome?",
      type: "text",
    },
  ]);

  const [data, setData] = useState<Partial<OnboardingData>>({
    meals_per_day: 5,
  });

  const addBot = useCallback((content: string, type: InterviewMessage["type"] = "text") => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "assistant", content, type },
    ]);
  }, []);

  const addUser = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content },
    ]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, step]);

  const finishAndGenerate = async (finalData: OnboardingData) => {
    setGenerating(true);
    addBot(
      "Perfeito! ✨ Estou criando seu plano premium de 7 dias com receitas completas, fotos, passo a passo e dicas exclusivas. Isso leva cerca de 30 segundos...",
      "generating"
    );

    const profileRes = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalData),
    });

    if (!profileRes.ok) {
      setGenerating(false);
      addBot("Ops, houve um erro ao salvar seu perfil. Tente novamente.");
      return;
    }

    const planRes = await fetch("/api/meal-plan/generate", { method: "POST" });

    setGenerating(false);

    if (planRes.ok) {
      setStep("done");
      addBot(
        `Pronto, ${finalData.name}! 🎉 Seu plano personalizado está no dashboard. Cada receita inclui foto, ingredientes, passo a passo, dicas e tempo de preparo.`,
        "text"
      );
      setTimeout(() => {
        onComplete?.();
        router.push("/dashboard");
      }, 2500);
    } else {
      addBot("Não consegui gerar o plano agora. Tente pelo dashboard em instantes.");
    }
  };

  const handleSubmit = () => {
    const value = input.trim();
    if (!value && step !== "diet") return;

    switch (step) {
      case "name": {
        addUser(value);
        setData((d) => ({ ...d, name: value }));
        setInput("");
        setStep("age");
        setTimeout(() => addBot(`Prazer, ${value}! Quantos anos você tem?`), 400);
        break;
      }
      case "age": {
        const age = parseInt(value);
        if (isNaN(age) || age < 10 || age > 100) {
          addBot("Por favor, informe uma idade válida (entre 10 e 100 anos).");
          return;
        }
        addUser(`${age} anos`);
        setData((d) => ({ ...d, age }));
        setInput("");
        setStep("gender");
        setTimeout(
          () =>
            addBot("Qual é o seu sexo biológico? (Isso ajuda no cálculo calórico)", "choices"),
          400
        );
        break;
      }
      case "height": {
        const h = parseFloat(value);
        if (isNaN(h) || h < 100 || h > 250) {
          addBot("Informe sua altura em centímetros (ex: 165).");
          return;
        }
        addUser(`${h} cm`);
        setData((d) => ({ ...d, height_cm: h }));
        setInput("");
        setStep("weight");
        setTimeout(() => addBot("Qual é o seu peso atual, em kg?"), 400);
        break;
      }
      case "weight": {
        const w = parseFloat(value);
        if (isNaN(w) || w < 30 || w > 300) {
          addBot("Informe um peso válido em kg (ex: 72.5).");
          return;
        }
        addUser(`${w} kg`);
        setData((d) => ({ ...d, current_weight: w }));
        setInput("");
        setStep("target");
        setTimeout(() => addBot("Qual peso você gostaria de alcançar?"), 400);
        break;
      }
      case "target": {
        const t = parseFloat(value);
        if (isNaN(t) || t < 30 || t > 300) {
          addBot("Informe um peso meta válido em kg.");
          return;
        }
        addUser(`${t} kg`);
        setData((d) => ({ ...d, target_weight: t }));
        setInput("");
        setStep("allergies");
        setTimeout(
          () =>
            addBot("Você tem alguma alergia alimentar? (Se não, digite \"nenhuma\")"),
          400
        );
        break;
      }
      case "allergies": {
        addUser(value);
        setData((d) => ({ ...d, allergies: value.toLowerCase() === "nenhuma" ? "" : value }));
        setInput("");
        setStep("dislikes");
        setTimeout(
          () =>
            addBot("Algum alimento que você não gosta ou não come de jeito nenhum?"),
          400
        );
        break;
      }
      case "dislikes": {
        addUser(value);
        setData((d) => ({ ...d, disliked_foods: value.toLowerCase() === "nenhum" ? "" : value }));
        setInput("");
        setStep("diet");
        setTimeout(
          () =>
            addBot(
              "Agora a parte mais importante: qual tipo de dieta você precisa? Escolha a opção que melhor descreve seu objetivo:",
              "diet-select"
            ),
          400
        );
        break;
      }
    }
  };

  const selectGender = (gender: Gender, label: string) => {
    addUser(label);
    setData((d) => ({ ...d, gender }));
    setStep("height");
    setTimeout(() => addBot("Qual é a sua altura, em centímetros? (ex: 165)"), 400);
  };

  const selectDiet = (program: DietProgram) => {
    addUser(DIET_PROGRAM_LABELS[program]);
    const updated = { ...data, diet_program: program } as OnboardingData;
    setData(updated);
    setStep("confirm");

    setTimeout(() => {
      addBot(
        `Excelente escolha! Resumo da sua consulta:\n\n` +
          `• Nome: ${updated.name}\n` +
          `• Idade: ${updated.age} anos\n` +
          `• Altura: ${updated.height_cm} cm\n` +
          `• Peso: ${updated.current_weight} kg → meta ${updated.target_weight} kg\n` +
          `• Programa: ${DIET_PROGRAM_LABELS[program]}\n\n` +
          `Vou criar 7 dias de receitas premium com foto, passo a passo e dicas. Posso gerar seu plano?`,
        "text"
      );
    }, 500);
  };

  const confirmGenerate = () => {
    addUser("Sim, gerar meu plano!");
    finishAndGenerate(data as OnboardingData);
  };

  const showInput = !generating && !["gender", "diet", "confirm", "done"].includes(step);
  const showGenderChoices = step === "gender" && !generating;
  const showDietCards = step === "diet" && !generating;
  const showConfirm = step === "confirm" && !generating;

  return (
    <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-2xl flex-col px-4 py-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Consulta com Nutricionista IA</h1>
          <p className="text-xs text-muted-foreground">Entrevista personalizada · Plano premium</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border bg-white/60 p-4 shadow-sm">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-white shadow-sm"
                }`}
              >
                {msg.content}
                {msg.type === "generating" && (
                  <Loader2 className="mt-2 h-5 w-5 animate-spin text-primary" />
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <User className="h-4 w-4" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {showGenderChoices && (
          <div className="flex flex-wrap gap-2 pl-11">
            {(["feminino", "masculino", "outro"] as Gender[]).map((g) => (
              <Button key={g} variant="outline" size="sm" onClick={() => selectGender(g, g.charAt(0).toUpperCase() + g.slice(1))}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Button>
            ))}
          </div>
        )}

        {showDietCards && (
          <div className="space-y-2 pl-11">
            {DIET_OPTIONS.map((program) => (
              <button
                key={program}
                onClick={() => selectDiet(program)}
                className="w-full rounded-xl border border-border bg-white p-4 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <p className="font-medium text-foreground">{DIET_PROGRAM_LABELS[program]}</p>
                <p className="mt-1 text-xs text-muted-foreground">{DIET_PROGRAM_DESCRIPTIONS[program]}</p>
              </button>
            ))}
          </div>
        )}

        {showConfirm && (
          <div className="pl-11">
            <Button size="lg" className="w-full gap-2" onClick={confirmGenerate}>
              <Check className="h-5 w-5" />
              Gerar meu plano personalizado
            </Button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {showInput && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="mt-4 flex gap-2"
        >
          <Input
            placeholder={
              step === "age" ? "Ex: 32"
              : step === "height" ? "Ex: 165"
              : step === "weight" || step === "target" ? "Ex: 72.5"
              : "Digite sua resposta..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={generating}
            className="bg-white"
            autoFocus
          />
          <Button type="submit" size="icon" disabled={!input.trim() || generating}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}

      {allowRestart && step === "done" && (
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Refazer consulta
        </Button>
      )}
    </div>
  );
}
