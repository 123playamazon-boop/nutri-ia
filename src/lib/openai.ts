import OpenAI from "openai";
import type { UserProfile, DayPlan, DietProgram, Meal, ShoppingItem } from "@/types";
import { DIET_PROGRAM_LABELS, DIET_PROGRAM_DESCRIPTIONS } from "@/types";
import { getFoodImageUrl } from "@/lib/food-images";

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

function hasValidOpenAIKey(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return !!key && key.startsWith("sk-") && !key.includes("your-openai");
}

function profileContext(profile: UserProfile): string {
  const program = profile.diet_program ?? "emagrecimento_moderado";
  return `
Nome: ${profile.name}
Idade: ${profile.age} anos
Sexo: ${profile.gender}
Altura: ${profile.height_cm}cm
Peso atual: ${profile.current_weight}kg
Peso desejado: ${profile.target_weight}kg
Programa de dieta: ${DIET_PROGRAM_LABELS[program]}
Detalhes do programa: ${DIET_PROGRAM_DESCRIPTIONS[program]}
Alimentos que não gosta: ${profile.disliked_foods || "Nenhum"}
Alergias: ${profile.allergies || "Nenhuma"}
Refeições por dia: ${profile.meals_per_day}
`.trim();
}

function enrichMeal(meal: Meal): Meal {
  return {
    ...meal,
    imageUrl: meal.imageUrl || getFoodImageUrl(meal.name, meal.ingredients ?? []),
    steps: meal.steps?.length ? meal.steps : [meal.description || "Siga a receita conforme indicado."],
    tips: meal.tips?.length ? meal.tips : ["Use ingredientes frescos para melhor sabor."],
    prepTimeMinutes: meal.prepTimeMinutes || 20,
    difficulty: meal.difficulty || "Fácil",
    servings: meal.servings || 1,
    description: meal.description || "",
  };
}

function enrichPlan(plan: {
  days: DayPlan[];
  shoppingList: ShoppingItem[] | string[];
  totalCaloriesPerDay: number;
  planSummary?: string;
  dietProgram: DietProgram;
}) {
  const shoppingList = Array.isArray(plan.shoppingList)
    ? plan.shoppingList.map((item) =>
        typeof item === "string"
          ? { item, quantity: "conforme necessário", category: "Geral" }
          : item
      )
    : [];

  return {
    days: plan.days.map((day) => ({
      ...day,
      meals: Object.fromEntries(
        Object.entries(day.meals).map(([k, meal]) => [k, enrichMeal(meal as Meal)])
      ) as DayPlan["meals"],
    })),
    shoppingList,
    totalCaloriesPerDay: plan.totalCaloriesPerDay,
    planSummary: plan.planSummary || "Plano personalizado de 7 dias criado pela Nutricionista IA.",
    dietProgram: plan.dietProgram,
  };
}

const MEAL_SCHEMA = `{
  "name": "nome apetitoso da receita",
  "description": "descrição sedutora em 1-2 frases",
  "prepTimeMinutes": 25,
  "difficulty": "Fácil",
  "servings": 1,
  "ingredients": ["quantidade + ingrediente"],
  "steps": ["Passo 1 MUITO detalhado com tempo e técnica", "Passo 2...", "mínimo 6 passos por receita"],
  "tips": ["Dica profissional 1", "Dica 2", "Dica 3"],
  "nutrition": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }
}`;

export async function generateMealPlan(profile: UserProfile): Promise<{
  days: DayPlan[];
  shoppingList: ShoppingItem[];
  totalCaloriesPerDay: number;
  planSummary: string;
  dietProgram: DietProgram;
}> {
  const program = profile.diet_program ?? "emagrecimento_moderado";

  if (!hasValidOpenAIKey()) {
    const { generateDemoMealPlan } = await import("@/lib/demo-meal-plan");
    return generateDemoMealPlan(profile);
  }

  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Você é uma nutricionista brasileira premium, especialista em ${DIET_PROGRAM_LABELS[program]}.
Crie planos alimentares de alto valor — receitas dignas de um produto pago.
Cada receita DEVE ter: passo a passo MUITO detalhado (mínimo 6 passos, com tempos e técnicas), 3 dicas de preparo do nutricionista, tempo em minutos, dificuldade, descrição apetitosa.
Use alimentos acessíveis no Brasil. Respeite alergias e restrições.
IMPORTANTE: NUNCA repita a mesma receita em dias diferentes. Os 7 dias devem ter 35 receitas únicas (5 refeições × 7 dias), com variedade de proteínas, carboidratos e preparos.
Responda SEMPRE em JSON válido em português.`,
      },
      {
        role: "user",
        content: `Crie plano alimentar PREMIUM de 7 dias:\n${profileContext(profile)}

Cada refeição segue este schema: ${MEAL_SCHEMA}

JSON completo:
{
  "days": [{ "day": 1, "dayName": "Segunda-feira", "meals": { "breakfast": {}, "snack1": {}, "lunch": {}, "snack2": {}, "dinner": {} } }],
  "shoppingList": [{ "item": "nome", "quantity": "quantidade exata para 7 dias", "category": "Proteínas|Vegetais|Frutas|Grãos|Laticínios|Temperos" }],
  "totalCaloriesPerDay": 0,
  "planSummary": "resumo personalizado do plano em 2-3 frases para o usuário",
  "dietProgram": "${program}"
}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.75,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Falha ao gerar plano");

  const parsed = JSON.parse(content);
  return enrichPlan({ ...parsed, dietProgram: program });
}

export async function analyzeMealFromText(description: string): Promise<{
  description: string;
  nutrition: { calories: number; protein: number; carbs: number; fat: number };
}> {
  if (!hasValidOpenAIKey()) {
    return {
      description,
      nutrition: { calories: 420, protein: 28, carbs: 35, fat: 16 },
    };
  }

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "Estime valores nutricionais. Responda em JSON." },
      {
        role: "user",
        content: `Estime: "${description}". JSON: { "description": "resumo", "nutrition": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 } }`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Falha ao analisar refeição");
  return JSON.parse(content);
}

export async function analyzeMealFromPhoto(base64Image: string, mimeType: string): Promise<{
  description: string;
  nutrition: { calories: number; protein: number; carbs: number; fat: number };
}> {
  if (!hasValidOpenAIKey()) {
    return {
      description: "Refeição identificada na foto",
      nutrition: { calories: 480, protein: 32, carbs: 40, fat: 18 },
    };
  }

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "Analise fotos de refeições. Responda em JSON em português." },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: 'JSON: { "description": "alimentos identificados", "nutrition": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 } }',
          },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } },
        ],
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Falha ao analisar foto");
  return JSON.parse(content);
}

export async function chatWithNutritionist(
  profile: UserProfile,
  messages: { role: "user" | "assistant"; content: string }[],
  mealPlanSummary?: string
): Promise<string> {
  if (!hasValidOpenAIKey()) {
    const { getDemoChatReply } = await import("@/lib/demo");
    const last = messages.filter((m) => m.role === "user").pop();
    return getDemoChatReply(last?.content ?? "");
  }

  const openai = getOpenAI();
  const systemPrompt = `Você é a Nutricionista IA do Nutri IA. Tom acolhedor e profissional, como consulta real.
Perfil:\n${profileContext(profile)}
${mealPlanSummary ? `\nPlano atual: ${mealPlanSummary}` : ""}
Nunca substitua orientação médica profissional.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content ?? "Desculpe, não consegui responder.";
}
