import { NextRequest, NextResponse } from "next/server";
import { isDemoSession } from "@/lib/demo-request";
import { getDemoStore } from "@/lib/demo";
import { logWeightProgress } from "@/lib/gamification";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { weight } = await request.json();

  if (!weight || weight <= 0) {
    return NextResponse.json({ error: "Peso inválido" }, { status: 400 });
  }

  if (await isDemoSession()) {
    const store = getDemoStore();
    const log = {
      id: crypto.randomUUID(),
      user_id: "demo-user",
      weight,
      logged_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    store.weightLogs.push(log);
    store.profile.current_weight = weight;
    store.gamification = logWeightProgress(store.gamification);
    return NextResponse.json({ log });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: log, error } = await supabase
    .from("weight_logs")
    .insert({ user_id: user.id, weight })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("profiles").update({ current_weight: weight }).eq("user_id", user.id);

  return NextResponse.json({ log });
}

export async function GET() {
  if (await isDemoSession()) {
    return NextResponse.json({ logs: getDemoStore().weightLogs });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: logs } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: true });

  return NextResponse.json({ logs: logs ?? [] });
}
