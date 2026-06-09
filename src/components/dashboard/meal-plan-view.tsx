"use client";

import { useState, useCallback } from "react";
import {
  Clock, ChefHat, Lightbulb,
  Flame, Download, Check, Circle, BookOpen, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { exportMealPlanPDF } from "@/services/export-pdf";
import { mealKey } from "@/lib/gamification";
import type { MealPlan, Meal, UserGamification, ShoppingItem } from "@/types";
import { DIET_PROGRAM_LABELS, ACHIEVEMENTS } from "@/types";

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Café da manhã",
  snack1: "Lanche da manhã",
  lunch: "Almoço",
  snack2: "Lanche da tarde",
  dinner: "Jantar",
};

const MEAL_ICONS: Record<string, string> = {
  breakfast: "☀️",
  snack1: "🍎",
  lunch: "🍽️",
  snack2: "🥤",
  dinner: "🌙",
};

interface MealPlanViewProps {
  plan: MealPlan;
  userName?: string;
  gamification?: UserGamification;
  onMealComplete?: (progress: UserGamification, achievements: string[]) => void;
}

interface SelectedMeal {
  meal: Meal;
  label: string;
  day: number;
  mealSlot: string;
  completed: boolean;
}

function RecipeSheet({
  selected,
  onClose,
  onComplete,
}: {
  selected: SelectedMeal;
  onClose: () => void;
  onComplete: () => void;
}) {
  const { meal, label, completed } = selected;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center sm:p-4">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Fechar" />
      <div className="relative z-10 flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border p-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-primary">{label}</p>
            <h2 className="text-lg font-bold leading-tight">{meal.name}</h2>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{meal.prepTimeMinutes} min</span>
              <span className="flex items-center gap-1"><Flame className="h-3 w-3" />{meal.nutrition.calories} kcal</span>
              <span className="flex items-center gap-1"><ChefHat className="h-3 w-3" />{meal.difficulty}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm">
          <p className="leading-relaxed text-muted-foreground">{meal.description}</p>

          <div className="flex flex-wrap gap-2 rounded-xl bg-secondary/50 px-3 py-2 text-xs">
            <span>P {meal.nutrition.protein}g</span>
            <span>·</span>
            <span>C {meal.nutrition.carbs}g</span>
            <span>·</span>
            <span>G {meal.nutrition.fat}g</span>
            <span>·</span>
            <span>{meal.servings} porção(ões)</span>
          </div>

          <div>
            <p className="mb-2 font-semibold">Ingredientes</p>
            <ul className="space-y-1.5">
              {meal.ingredients.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 font-semibold">Modo de preparo</p>
            <ol className="space-y-3">
              {meal.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed text-muted-foreground">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          {meal.tips.length > 0 && (
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
              <p className="mb-2 flex items-center gap-1.5 font-semibold text-amber-900">
                <Lightbulb className="h-4 w-4" /> Dicas
              </p>
              <ul className="space-y-1">
                {meal.tips.map((tip, i) => (
                  <li key={i} className="text-amber-800">• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            className="w-full gap-2"
            variant={completed ? "outline" : "default"}
            onClick={onComplete}
            disabled={completed}
          >
            {completed ? (
              <><Check className="h-4 w-4" /> Refeição concluída</>
            ) : (
              <><Circle className="h-4 w-4" /> Marcar como feita (+25 XP)</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MealRow({
  meal,
  label,
  mealSlot,
  completed,
  onOpen,
}: {
  meal: Meal;
  label: string;
  mealSlot: string;
  completed: boolean;
  onOpen: () => void;
}) {
  return (
    <div className={cn(
      "rounded-xl border bg-white p-3 transition-colors",
      completed ? "border-primary/30 bg-primary/5" : "border-border"
    )}>
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none mt-0.5">{MEAL_ICONS[mealSlot] ?? "🍴"}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            {completed && <Check className="h-3.5 w-3.5 text-primary" />}
          </div>
          <p className="font-semibold leading-snug">{meal.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {meal.nutrition.calories} kcal · {meal.prepTimeMinutes} min
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full gap-2"
        onClick={onOpen}
      >
        <BookOpen className="h-4 w-4" />
        Ver receita
      </Button>
    </div>
  );
}

function ShoppingListView({ items }: { items: ShoppingItem[] }) {
  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <div className="space-y-4">
      {categories.map((cat) => (
        <div key={cat}>
          <p className="mb-2 text-sm font-semibold text-primary">{cat}</p>
          <div className="space-y-1.5">
            {items.filter((i) => i.category === cat).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2.5 text-sm">
                <span className="font-medium">{item.item}</span>
                <span className="ml-2 shrink-0 text-muted-foreground">{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MealPlanView({ plan, userName, gamification, onMealComplete }: MealPlanViewProps) {
  const [activeDay, setActiveDay] = useState(0);
  const [tab, setTab] = useState<"refeicoes" | "compras">("refeicoes");
  const [selected, setSelected] = useState<SelectedMeal | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const days = plan.plan_data.days;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCompleteMeal = useCallback(async (day: number, mealSlot: string) => {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete_meal", day, mealSlot }),
    });
    if (res.ok) {
      const data = await res.json();
      onMealComplete?.(data.progress, data.newAchievements ?? []);
      if (data.newAchievements?.length) {
        const titles = data.newAchievements
          .map((id: string) => ACHIEVEMENTS[id as keyof typeof ACHIEVEMENTS]?.title)
          .filter(Boolean);
        showToast(`🏆 ${titles.join(", ")}!`);
      } else {
        showToast("✅ +25 XP — Refeição concluída!");
      }
      setSelected((prev) =>
        prev ? { ...prev, completed: true } : null
      );
    }
  }, [onMealComplete]);

  const normalizedShopping: ShoppingItem[] = plan.plan_data.shoppingList.map((item) =>
    typeof item === "string"
      ? { item, quantity: "conforme plano", category: "Geral" }
      : item
  );

  const currentDay = days[activeDay];

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-lg">
          {toast}
        </div>
      )}

      {selected && (
        <RecipeSheet
          selected={selected}
          onClose={() => setSelected(null)}
          onComplete={() => handleCompleteMeal(selected.day, selected.mealSlot)}
        />
      )}

      {plan.plan_data.planSummary && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {plan.plan_data.planSummary}
        </p>
      )}

      {/* Tabs internas: Refeições / Compras */}
      <div className="flex rounded-xl border border-border bg-secondary/30 p-1">
        {(["refeicoes", "compras"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-medium transition-all",
              tab === t ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"
            )}
          >
            {t === "refeicoes" ? "Refeições" : "Compras"}
          </button>
        ))}
      </div>

      {tab === "refeicoes" ? (
        <>
          {/* Seletor de dias — scroll horizontal mobile */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {days.map((day, i) => {
              const dayMeals = ["breakfast", "snack1", "lunch", "snack2", "dinner"];
              const dayDone = dayMeals.every(
                (m) => gamification?.completedMeals[mealKey(day.day, m)]
              );
              return (
                <button
                  key={day.day}
                  onClick={() => setActiveDay(i)}
                  className={cn(
                    "relative shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-all min-w-[52px]",
                    activeDay === i
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-white text-muted-foreground"
                  )}
                >
                  {day.dayName.replace("-feira", "").slice(0, 3)}
                  {dayDone && <span className="absolute -right-0.5 -top-0.5 text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            {currentDay.dayName} · ~{plan.plan_data.totalCaloriesPerDay} kcal
            {plan.plan_data.dietProgram && (
              <> · {DIET_PROGRAM_LABELS[plan.plan_data.dietProgram]}</>
            )}
          </p>

          <div className="space-y-2.5">
            {Object.entries(currentDay.meals).map(([key, meal]) => (
              <MealRow
                key={key}
                meal={meal as Meal}
                label={MEAL_LABELS[key] ?? key}
                mealSlot={key}
                completed={!!gamification?.completedMeals[mealKey(currentDay.day, key)]}
                onOpen={() =>
                  setSelected({
                    meal: meal as Meal,
                    label: MEAL_LABELS[key] ?? key,
                    day: currentDay.day,
                    mealSlot: key,
                    completed: !!gamification?.completedMeals[mealKey(currentDay.day, key)],
                  })
                }
              />
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => exportMealPlanPDF(plan, userName)}
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
          <ShoppingListView items={normalizedShopping} />
        </div>
      )}

      {tab === "refeicoes" && (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => exportMealPlanPDF(plan, userName)}
        >
          <Download className="h-4 w-4" />
          Baixar plano em PDF
        </Button>
      )}
    </div>
  );
}
