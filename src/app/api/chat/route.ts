import { NextRequest, NextResponse } from "next/server";
import { isDemoSession } from "@/lib/demo-request";
import { getDemoStore, getDemoChatReply } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import { chatWithNutritionist } from "@/lib/openai";
import type { UserProfile } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Mensagem obrigatória" }, { status: 400 });
    }

    if (await isDemoSession()) {
      const store = getDemoStore();
      store.chatMessages.push({
        id: crypto.randomUUID(),
        user_id: "demo-user",
        role: "user",
        content: message.trim(),
        created_at: new Date().toISOString(),
      });
      const reply = getDemoChatReply(message.trim());
      store.chatMessages.push({
        id: crypto.randomUUID(),
        user_id: "demo-user",
        role: "assistant",
        content: reply,
        created_at: new Date().toISOString(),
      });
      return NextResponse.json({ reply });
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

    if (!profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 400 });
    }

    await supabase.from("chat_messages").insert({
      user_id: user.id,
      role: "user",
      content: message.trim(),
    });

    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(20);

    const { data: mealPlan } = await supabase
      .from("meal_plans")
      .select("plan_data")
      .eq("user_id", user.id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();

    const mealPlanSummary = mealPlan?.plan_data
      ? `Plano de ${mealPlan.plan_data.days?.length ?? 0} dias, ~${mealPlan.plan_data.totalCaloriesPerDay} kcal/dia`
      : undefined;

    const reply = await chatWithNutritionist(
      profile as UserProfile,
      (history ?? []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      mealPlanSummary
    );

    await supabase.from("chat_messages").insert({
      user_id: user.id,
      role: "assistant",
      content: reply,
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro no chat" },
      { status: 500 }
    );
  }
}
