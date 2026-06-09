import { NextRequest, NextResponse } from "next/server";
import { isDemoSession } from "@/lib/demo-request";
import { getDemoStore, getDemoMealAnalysis } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import { analyzeMealFromText, analyzeMealFromPhoto } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    if (await isDemoSession()) {
      const store = getDemoStore();
      const contentType = request.headers.get("content-type") ?? "";

      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const file = formData.get("image") as File;
        const result = getDemoMealAnalysis(`Foto: ${file?.name ?? "refeição"}`);
        const entry = {
          id: crypto.randomUUID(),
          user_id: "demo-user",
          description: result.description,
          image_url: null,
          nutrition: result.nutrition,
          source: "photo" as const,
          logged_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        store.mealEntries.unshift(entry);
        return NextResponse.json({ entry });
      }

      const { description } = await request.json();
      const result = getDemoMealAnalysis(description?.trim() ?? "");
      const entry = {
        id: crypto.randomUUID(),
        user_id: "demo-user",
        description: result.description,
        image_url: null,
        nutrition: result.nutrition,
        source: "text" as const,
        logged_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      store.mealEntries.unshift(entry);
      return NextResponse.json({ entry });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("image") as File;

      if (!file) {
        return NextResponse.json({ error: "Imagem obrigatória" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      const result = await analyzeMealFromPhoto(base64, file.type);

      const { data: entry, error } = await supabase
        .from("meal_entries")
        .insert({
          user_id: user.id,
          description: result.description,
          nutrition: result.nutrition,
          source: "photo",
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ entry });
    }

    const { description } = await request.json();

    if (!description?.trim()) {
      return NextResponse.json({ error: "Descrição obrigatória" }, { status: 400 });
    }

    const result = await analyzeMealFromText(description.trim());

    const { data: entry, error } = await supabase
      .from("meal_entries")
      .insert({
        user_id: user.id,
        description: result.description,
        nutrition: result.nutrition,
        source: "text",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Analyze meal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao analisar refeição" },
      { status: 500 }
    );
  }
}
