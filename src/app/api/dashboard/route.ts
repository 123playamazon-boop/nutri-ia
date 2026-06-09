import { NextResponse } from "next/server";
import { isDemoSession } from "@/lib/demo-request";
import { getDemoStore } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  if (await isDemoSession()) {
    const store = getDemoStore();
    return NextResponse.json({
      profile: store.profile,
      mealPlan: store.mealPlan,
      weightLogs: store.weightLogs,
      recentMeals: store.mealEntries,
      gamification: store.gamification,
    });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const [profileRes, planRes, weightsRes, entriesRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    supabase.from("meal_plans").select("*").eq("user_id", user.id).order("generated_at", { ascending: false }).limit(1).single(),
    supabase.from("weight_logs").select("*").eq("user_id", user.id).order("logged_at", { ascending: true }),
    supabase.from("meal_entries").select("*").eq("user_id", user.id).order("logged_at", { ascending: false }).limit(10),
  ]);

  return NextResponse.json({
    profile: profileRes.data,
    mealPlan: planRes.data,
    weightLogs: weightsRes.data ?? [],
    recentMeals: entriesRes.data ?? [],
  });
}
