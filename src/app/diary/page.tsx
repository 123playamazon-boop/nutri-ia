"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Loader2, Plus } from "lucide-react";
import { AppNav } from "@/components/layout/app-nav";
import { AiDisclaimer } from "@/components/shared/ai-disclaimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { MealEntry } from "@/types";

export default function DiaryPage() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadEntries = async () => {
    const res = await fetch("/api/dashboard");
    const data = await res.json();
    setEntries(data.recentMeals ?? []);
  };

  useEffect(() => { loadEntries(); }, []);

  const analyzeText = async () => {
    if (!description.trim()) return;
    setLoading(true);
    const res = await fetch("/api/meals/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    if (res.ok) {
      setDescription("");
      await loadEntries();
    }
    setLoading(false);
  };

  const analyzePhoto = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("/api/meals/analyze", { method: "POST", body: formData });
    if (res.ok) await loadEntries();
    setLoading(false);
  };

  return (
    <>
      <AppNav />
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold">Diário Alimentar</h1>
          <p className="text-muted-foreground">Registre o que você comeu</p>
        </div>

        <AiDisclaimer />

        <Card className="glass">
          <CardHeader>
            <CardTitle>Adicionar refeição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Descreva o que comeu..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
              <Button onClick={analyzeText} disabled={loading || !description.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">ou envie uma foto</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) analyzePhoto(file);
              }}
            />
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => fileRef.current?.click()}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              Enviar foto do prato
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="font-semibold">Histórico</h2>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma refeição registrada ainda.</p>
          ) : (
            entries.map((entry) => (
              <Card key={entry.id} className="glass">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{entry.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(entry.logged_at)}</p>
                    </div>
                    <span className="text-xs text-primary capitalize">{entry.source === "photo" ? "📷 Foto" : "✏️ Texto"}</span>
                  </div>
                  <div className="mt-3 flex gap-4 text-sm">
                    <span><strong>{entry.nutrition.calories}</strong> kcal</span>
                    <span>P: {entry.nutrition.protein}g</span>
                    <span>C: {entry.nutrition.carbs}g</span>
                    <span>G: {entry.nutrition.fat}g</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
