import { NextRequest, NextResponse } from "next/server";
import { isDemoSession } from "@/lib/demo-request";
import { getDemoStore } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingData, DietProgram, Gender } from "@/types";

export async function GET() {
  if (await isDemoSession()) {
    const store = getDemoStore();
    return NextResponse.json({
      profile: store.profile,
      email: "demo@nutriia.com",
    });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    profile,
    email: user.email,
    mustChangePassword: user.user_metadata?.must_change_password === true,
  });
}

interface ProfileUpdateBody extends Partial<OnboardingData> {
  onboarding?: boolean;
}

export async function PATCH(request: NextRequest) {
  const data: ProfileUpdateBody = await request.json();

  if (await isDemoSession()) {
    const store = getDemoStore();
    store.profile = {
      ...store.profile,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.age !== undefined && { age: data.age }),
      ...(data.gender !== undefined && { gender: data.gender as Gender }),
      ...(data.height_cm !== undefined && { height_cm: data.height_cm }),
      ...(data.current_weight !== undefined && { current_weight: data.current_weight }),
      ...(data.target_weight !== undefined && { target_weight: data.target_weight }),
      ...(data.diet_program !== undefined && { diet_program: data.diet_program as DietProgram }),
      ...(data.disliked_foods !== undefined && { disliked_foods: data.disliked_foods }),
      ...(data.allergies !== undefined && { allergies: data.allergies }),
      ...(data.meals_per_day !== undefined && { meals_per_day: data.meals_per_day }),
      updated_at: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, profile: store.profile });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const updatePayload: Record<string, unknown> = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.age !== undefined) updatePayload.age = data.age;
  if (data.gender !== undefined) updatePayload.gender = data.gender;
  if (data.height_cm !== undefined) updatePayload.height_cm = data.height_cm;
  if (data.current_weight !== undefined) updatePayload.current_weight = data.current_weight;
  if (data.target_weight !== undefined) updatePayload.target_weight = data.target_weight;
  if (data.diet_program !== undefined) updatePayload.diet_program = data.diet_program;
  if (data.disliked_foods !== undefined) updatePayload.disliked_foods = data.disliked_foods;
  if (data.allergies !== undefined) updatePayload.allergies = data.allergies;
  if (data.meals_per_day !== undefined) updatePayload.meals_per_day = data.meals_per_day;

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, profile });
}

export async function POST(request: NextRequest) {
  const data: OnboardingData = await request.json();

  if (await isDemoSession()) {
    const store = getDemoStore();
    store.profile = {
      ...store.profile,
      name: data.name,
      age: data.age,
      gender: data.gender,
      height_cm: data.height_cm,
      current_weight: data.current_weight,
      target_weight: data.target_weight,
      diet_program: data.diet_program,
      disliked_foods: data.disliked_foods ?? "",
      allergies: data.allergies ?? "",
      meals_per_day: data.meals_per_day ?? 5,
      onboarding_completed: true,
    };
    return NextResponse.json({ success: true });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      name: data.name,
      age: data.age,
      gender: data.gender,
      height_cm: data.height_cm,
      current_weight: data.current_weight,
      target_weight: data.target_weight,
      diet_program: data.diet_program,
      disliked_foods: data.disliked_foods ?? "",
      allergies: data.allergies ?? "",
      meals_per_day: data.meals_per_day ?? 5,
      onboarding_completed: true,
    })
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
