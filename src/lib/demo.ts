import type { UserProfile, MealPlan, WeightLog, MealEntry, ChatMessage } from "@/types";
import { generateDemoMealPlan } from "@/lib/demo-meal-plan";
import { createDefaultProgress } from "@/lib/gamification";

export const DEMO_EMAIL = "demo@nutriia.com";
export const DEMO_PASSWORD = "demo123";
export const DEMO_COOKIE = "nutri_demo_session";

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export function validateDemoCredentials(email: string, password: string): boolean {
  return email.toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
}

export const demoProfile: UserProfile = {
  id: "demo-profile",
  user_id: "demo-user",
  name: "Maria Silva",
  age: 32,
  gender: "feminino",
  height_cm: 165,
  current_weight: 72,
  target_weight: 65,
  diet_program: "emagrecimento_moderado",
  disliked_foods: "Fígado",
  allergies: "",
  meals_per_day: 5,
  onboarding_completed: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function buildDemoMealPlan(profile: UserProfile): MealPlan {
  const planData = generateDemoMealPlan(profile);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return {
    id: "demo-plan",
    user_id: "demo-user",
    plan_data: planData,
    generated_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  };
}

export const demoWeightLogs: WeightLog[] = [
  { id: "w1", user_id: "demo-user", weight: 75, logged_at: new Date(Date.now() - 28 * 86400000).toISOString(), created_at: new Date().toISOString() },
  { id: "w2", user_id: "demo-user", weight: 74.2, logged_at: new Date(Date.now() - 21 * 86400000).toISOString(), created_at: new Date().toISOString() },
  { id: "w3", user_id: "demo-user", weight: 73.5, logged_at: new Date(Date.now() - 14 * 86400000).toISOString(), created_at: new Date().toISOString() },
  { id: "w4", user_id: "demo-user", weight: 72.8, logged_at: new Date(Date.now() - 7 * 86400000).toISOString(), created_at: new Date().toISOString() },
  { id: "w5", user_id: "demo-user", weight: 72, logged_at: new Date().toISOString(), created_at: new Date().toISOString() },
];

export const demoMealEntries: MealEntry[] = [];

export const demoChatMessages: ChatMessage[] = [
  { id: "c1", user_id: "demo-user", role: "assistant", content: "Olá! Sou sua Nutricionista IA. Como posso ajudar hoje?", created_at: new Date().toISOString() },
];

interface DemoStore {
  profile: UserProfile;
  mealPlan: MealPlan | null;
  weightLogs: WeightLog[];
  mealEntries: MealEntry[];
  chatMessages: ChatMessage[];
  lastPlanGeneratedAt: string | null;
  gamification: import("@/types").UserGamification;
}

function createStore(): DemoStore {
  const profile = { ...demoProfile };
  return {
    profile,
    mealPlan: profile.onboarding_completed ? buildDemoMealPlan(profile) : null,
    weightLogs: [...demoWeightLogs],
    mealEntries: [...demoMealEntries],
    chatMessages: [...demoChatMessages],
    lastPlanGeneratedAt: null,
    gamification: createDefaultProgress(),
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __nutriDemoStore: DemoStore | undefined;
}

export function getDemoStore(): DemoStore {
  if (!globalThis.__nutriDemoStore) {
    globalThis.__nutriDemoStore = createStore();
  }
  return globalThis.__nutriDemoStore;
}

export function resetDemoStore(): void {
  globalThis.__nutriDemoStore = createStore();
}

export function getDemoChatReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("troque") || lower.includes("substitu")) {
    return "Claro! Para o almoço, sugiro trocar o frango grelhado por peixe assado ou tofu grelhado. Mantém as proteínas altas e reduz gorduras saturadas. Quer a receita completa com passo a passo?";
  }
  if (lower.includes("ovos")) {
    return "Com ovos você pode fazer: omelete proteico com espinafre (320 kcal), ovos cozidos com salada (280 kcal) ou tapioca com ovo e queijo (350 kcal). Qual prefere?";
  }
  if (lower.includes("pizza")) {
    return "Pizza ocasionalmente cabe no plano! Escolha massa fina, pouco queijo e bastante vegetais. Limite a 2 fatias e compense com refeições mais leves no resto do dia.";
  }
  if (lower.includes("rápid") || lower.includes("rapido")) {
    return "Receita rápida (15 min): Wrap de frango — tortilha integral + frango desfiado + alface + tomate + iogurte. ~380 kcal, 30g proteína.";
  }
  if (lower.includes("não gosto") || lower.includes("nao gosto")) {
    return "Sem problemas! Me diga qual receita não agradou e monto uma alternativa com macros similares, respeitando seu programa de dieta.";
  }
  return "Entendi! Considerando seu perfil e programa de dieta, posso ajustar qualquer refeição do seu plano. O que gostaria de modificar?";
}

export function getDemoMealAnalysis(description: string) {
  return {
    description: description || "Refeição identificada",
    nutrition: { calories: 420, protein: 28, carbs: 35, fat: 16 },
  };
}
