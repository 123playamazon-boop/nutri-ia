import { NextRequest, NextResponse } from "next/server";
import { isDemoSession } from "@/lib/demo-request";
import { getDemoStore } from "@/lib/demo";
import { completeMeal, logWeightProgress, createDefaultProgress } from "@/lib/gamification";

export async function GET() {
  if (await isDemoSession()) {
    return NextResponse.json({ progress: getDemoStore().gamification });
  }
  return NextResponse.json({ progress: createDefaultProgress() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!(await isDemoSession())) {
    return NextResponse.json({ error: "Demo only" }, { status: 403 });
  }

  const store = getDemoStore();

  if (body.action === "complete_meal") {
    const { day, mealSlot } = body;
    const totalMeals = (store.mealPlan?.plan_data.days.length ?? 7) * 5;
    const { progress, newAchievements } = completeMeal(
      store.gamification,
      day,
      mealSlot,
      totalMeals
    );
    store.gamification = progress;
    return NextResponse.json({ progress, newAchievements });
  }

  if (body.action === "weight_log") {
    store.gamification = logWeightProgress(store.gamification);
    return NextResponse.json({ progress: store.gamification });
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
