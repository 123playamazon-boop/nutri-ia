"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Scale, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { AppNav } from "@/components/layout/app-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeightChart } from "@/components/dashboard/weight-chart";
import { GamificationPanel } from "@/components/dashboard/gamification-panel";
import type { UserProfile, MealPlan, WeightLog, UserGamification } from "@/types";
import { createDefaultProgress } from "@/lib/gamification";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [gamification, setGamification] = useState<UserGamification>(createDefaultProgress());
  const [newWeight, setNewWeight] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);

  const load = async () => {
    const res = await fetch("/api/dashboard");
    const data = await res.json();
    if (!data.mealPlan && data.profile && !data.profile.onboarding_completed) {
      window.location.href = "/onboarding";
      return;
    }
    setProfile(data.profile);
    setMealPlan(data.mealPlan);
    setWeightLogs(data.weightLogs);
    if (data.gamification) setGamification(data.gamification);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRegisterWeight = async () => {
    if (!newWeight) return;
    setSavingWeight(true);
    const res = await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight: parseFloat(newWeight) }),
    });
    if (res.ok) {
      setNewWeight("");
      await load();
    }
    setSavingWeight(false);
  };

  if (loading) {
    return (
      <>
        <AppNav />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </>
    );
  }

  const totalMeals = (mealPlan?.plan_data.days.length ?? 7) * 5;

  return (
    <>
      <AppNav />
      <div className="mx-auto max-w-lg space-y-5 px-4 py-4 pb-24">
        <div>
          <h1 className="text-xl font-bold">Olá, {profile?.name?.split(" ")[0] ?? "!"} 👋</h1>
          <p className="text-sm text-muted-foreground">Seu progresso esta semana</p>
        </div>

        {mealPlan && (
          <GamificationPanel progress={gamification} planCompletionTotal={totalMeals} />
        )}

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Peso", value: `${profile?.current_weight ?? "—"}`, unit: "kg" },
            { label: "Meta", value: `${profile?.target_weight ?? "—"}`, unit: "kg" },
            { label: "Feitas", value: `${gamification.totalMealsCompleted}`, unit: `/${totalMeals}` },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass">
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold text-primary">{stat.value}<span className="text-xs font-normal text-muted-foreground">{stat.unit}</span></p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Scale className="h-4 w-4 text-primary" />
              Registrar Peso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.1"
                placeholder="kg"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleRegisterWeight} disabled={savingWeight || !newWeight} className="shrink-0">
                {savingWeight ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
            {weightLogs.length > 0 && (
              <WeightChart logs={weightLogs} targetWeight={profile?.target_weight} />
            )}
          </CardContent>
        </Card>

        {!mealPlan && (
          <div className="rounded-xl border border-border bg-white py-8 text-center">
            <p className="text-sm text-muted-foreground">Complete a consulta para começar.</p>
            <Link href="/onboarding">
              <Button className="mt-3 gap-2" size="sm">
                <MessageCircle className="h-4 w-4" />
                Iniciar consulta
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
