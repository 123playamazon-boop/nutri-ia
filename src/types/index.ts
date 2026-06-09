export type Gender = "masculino" | "feminino" | "outro";

export type DietProgram =
  | "emagrecimento_rapido"
  | "emagrecimento_moderado"
  | "diabetes"
  | "gravidez"
  | "proteinas";

export const DIET_PROGRAM_LABELS: Record<DietProgram, string> = {
  emagrecimento_rapido: "Emagrecer de forma rápida",
  emagrecimento_moderado: "Emagrecer de forma moderada",
  diabetes: "Dieta para diabetes",
  gravidez: "Dieta para grávidas",
  proteinas: "Dieta de proteínas",
};

export const DIET_PROGRAM_DESCRIPTIONS: Record<DietProgram, string> = {
  emagrecimento_rapido: "Déficit calórico controlado com refeições práticas para resultados em 4–8 semanas.",
  emagrecimento_moderado: "Perda de peso sustentável, sem efeito sanfona, com hábitos duradouros.",
  diabetes: "Controle glicêmico com carboidratos de baixo índice e refeições balanceadas.",
  gravidez: "Nutrição segura para mãe e bebê, com nutrientes essenciais do pré-natal.",
  proteinas: "Alto teor proteico para saciedade, massa magra e recuperação muscular.",
};

/** @deprecated use DietProgram */
export type Goal = "emagrecer" | "ganhar_massa" | "manter_peso";
/** @deprecated use DietProgram */
export type DietType =
  | "low_carb"
  | "cetogenica"
  | "mediterranea"
  | "vegetariana"
  | "vegana"
  | "brasileira";

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  gender: Gender;
  height_cm: number;
  current_weight: number;
  target_weight: number;
  diet_program: DietProgram;
  goal?: Goal;
  diet_type?: DietType;
  disliked_foods: string;
  allergies: string;
  meals_per_day: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: "active" | "inactive" | "canceled" | "past_due" | "trialing";
  plan: "monthly_brl" | "monthly_usd";
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShoppingItem {
  item: string;
  quantity: string;
  category: string;
}

export interface UserGamification {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;
  completedMeals: Record<string, boolean>;
  achievements: string[];
  totalMealsCompleted: number;
}

export const ACHIEVEMENTS = {
  first_meal: { id: "first_meal", title: "Primeira Refeição", desc: "Completou sua primeira refeição do plano", xp: 25 },
  day_complete: { id: "day_complete", title: "Dia Perfeito", desc: "Completou todas as refeições de um dia", xp: 100 },
  streak_3: { id: "streak_3", title: "Consistente", desc: "3 dias seguidos de atividade", xp: 75 },
  streak_7: { id: "streak_7", title: "Disciplinado", desc: "7 dias seguidos de atividade", xp: 200 },
  weight_log: { id: "weight_log", title: "Na Balança", desc: "Registrou peso pela primeira vez", xp: 50 },
  week_half: { id: "week_half", title: "Meio Caminho", desc: "50% do plano semanal concluído", xp: 150 },
  week_done: { id: "week_done", title: "Semana Campeã", desc: "Completou 100% do plano semanal", xp: 500 },
} as const;

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  name: string;
  description: string;
  imageUrl: string;
  prepTimeMinutes: number;
  difficulty: "Fácil" | "Médio" | "Avançado";
  servings: number;
  ingredients: string[];
  steps: string[];
  tips: string[];
  nutrition: NutritionInfo;
}

export interface DayPlan {
  day: number;
  dayName: string;
  meals: {
    breakfast: Meal;
    snack1: Meal;
    lunch: Meal;
    snack2: Meal;
    dinner: Meal;
  };
}

export interface MealPlan {
  id: string;
  user_id: string;
  plan_data: {
    days: DayPlan[];
    shoppingList: ShoppingItem[];
    totalCaloriesPerDay: number;
    planSummary: string;
    dietProgram: DietProgram;
  };
  generated_at: string;
  expires_at: string;
  created_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  weight: number;
  logged_at: string;
  created_at: string;
}

export interface MealEntry {
  id: string;
  user_id: string;
  description: string;
  image_url: string | null;
  nutrition: NutritionInfo;
  source: "text" | "photo";
  logged_at: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface OnboardingData {
  name: string;
  age: number;
  gender: Gender;
  height_cm: number;
  current_weight: number;
  target_weight: number;
  diet_program: DietProgram;
  disliked_foods: string;
  allergies: string;
  meals_per_day: number;
}

export interface InterviewMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  type?: "text" | "choices" | "diet-select" | "generating";
}
