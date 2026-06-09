import { NextResponse } from "next/server";
import { isDemoSession } from "@/lib/demo-request";
import { getDemoStore } from "@/lib/demo";
import { generateDemoMealPlan } from "@/lib/demo-meal-plan";
import { createClient } from "@/lib/supabase/server";
import { generateMealPlan } from "@/lib/openai";
import { canGenerateNewPlan } from "@/lib/utils";
import type { UserProfile } from "@/types";

export const maxDuration = 120;

export async function POST() {
  try {
    if (await isDemoSession()) {
      const store = getDemoStore();

      if (!canGenerateNewPlan(store.lastPlanGeneratedAt)) {
        return NextResponse.json(
          { error: "Você só pode gerar um novo plano uma vez por semana" },
          { status: 429 }
        );
      }

      const planData = generateDemoMealPlan(store.profile);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      store.lastPlanGeneratedAt = new Date().toISOString();
      store.mealPlan = {
        id: store.mealPlan?.id ?? "demo-plan",
        user_id: "demo-user",
        plan_data: planData,
        generated_at: store.lastPlanGeneratedAt,
        expires_at: expiresAt.toISOString(),
        created_at: store.mealPlan?.created_at ?? new Date().toISOString(),
      };

      return NextResponse.json({ mealPlan: store.mealPlan });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!profile?.onboarding_completed) {
      return NextResponse.json({ error: "Complete a consulta primeiro" }, { status: 400 });
    }

    const { data: lastPlan } = await supabase
      .from("meal_plans")
      .select("generated_at")
      .eq("user_id", user.id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();

    if (!canGenerateNewPlan(lastPlan?.generated_at ?? null)) {
      return NextResponse.json(
        { error: "Você só pode gerar um novo plano uma vez por semana" },
        { status: 429 }
      );
    }

    const planData = await generateMealPlan(profile as UserProfile);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: mealPlan, error } = await supabase
      .from("meal_plans")
      .insert({
        user_id: user.id,
        plan_data: planData,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ mealPlan });
  } catch (error) {
    console.error("Meal plan error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao gerar plano" },
      { status: 500 }
    );
  }
}
