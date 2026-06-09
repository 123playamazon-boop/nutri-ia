"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, RefreshCw, MessageCircle, UtensilsCrossed } from "lucide-react";
import { AppNav } from "@/components/layout/app-nav";
import { Button } from "@/components/ui/button";
import { MealPlanView } from "@/components/dashboard/meal-plan-view";
import { canGenerateNewPlan, getDaysUntilNewPlan, daysRemaining } from "@/lib/utils";
import type { UserProfile, MealPlan, UserGamification } from "@/types";
import { createDefaultProgress } from "@/lib/gamification";

export default function PlanoPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [gamification, setGamification] = useState<UserGamification>(createDefaultProgress());

  const load = async () => {
    const res = await fetch("/api/dashboard");
    const data = await res.json();
    if (!data.mealPlan && data.profile && !data.profile.onboarding_completed) {
      window.location.href = "/onboarding";
      return;
    }
    setProfile(data.profile);
    setMealPlan(data.mealPlan);
    if (data.gamification) setGamification(data.gamification);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    const res = await fetch("/api/meal-plan/generate", { method: "POST" });
    if (res.ok) await load();
    setGenerating(false);
  };

  if (loading) {
    return (
      <>
        <AppNav />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  const canGenerate = canGenerateNewPlan(mealPlan?.generated_at ?? null);
  const daysUntil = getDaysUntilNewPlan(mealPlan?.generated_at ?? null);

  return (
    <>
      <AppNav />
      <div className="mx-auto max-w-lg space-y-4 px-4 py-4 pb-24">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              Plano Alimentar
            </h1>
            {mealPlan && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {daysRemaining(mealPlan.expires_at)} dias restantes
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGeneratePlan}
            disabled={!canGenerate || generating}
            className="shrink-0 gap-1.5 text-xs h-9"
          >
            {generating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {canGenerate ? "Novo plano" : `${daysUntil}d`}
          </Button>
        </div>

        {mealPlan ? (
          <MealPlanView
            plan={mealPlan}
            userName={profile?.name}
            gamification={gamification}
            onMealComplete={(p) => setGamification(p)}
          />
        ) : (
          <div className="rounded-xl border border-border bg-white py-12 text-center px-4">
            <UtensilsCrossed className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-muted-foreground text-sm">
              Complete a consulta para gerar seu plano.
            </p>
            <Link href="/onboarding">
              <Button className="mt-4 gap-2" size="sm">
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
