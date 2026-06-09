import type { UserGamification } from "@/types";
import { ACHIEVEMENTS } from "@/types";

const XP_PER_MEAL = 25;
const XP_WEIGHT_LOG = 50;
const XP_DAY_COMPLETE = 100;

export function xpForLevel(level: number): number {
  return level * level * 50;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

export function xpProgressInLevel(xp: number): { current: number; needed: number; percent: number } {
  const level = levelFromXp(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const current = xp - currentLevelXp;
  const needed = nextLevelXp - currentLevelXp;
  return { current, needed, percent: Math.round((current / needed) * 100) };
}

export function mealKey(day: number, mealSlot: string): string {
  return `d${day}-${mealSlot}`;
}

export function updateStreak(progress: UserGamification): UserGamification {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (progress.lastActiveDate === today) return progress;

  const newStreak =
    progress.lastActiveDate === yesterday ? progress.streak + 1 : 1;

  return { ...progress, streak: newStreak, lastActiveDate: today };
}

export function completeMeal(
  progress: UserGamification,
  day: number,
  mealSlot: string,
  totalMealsInPlan: number
): { progress: UserGamification; newAchievements: string[] } {
  const key = mealKey(day, mealSlot);
  if (progress.completedMeals[key]) {
    return { progress, newAchievements: [] };
  }

  const updated: UserGamification = {
    ...updateStreak(progress),
    completedMeals: { ...progress.completedMeals, [key]: true },
    totalMealsCompleted: progress.totalMealsCompleted + 1,
    xp: progress.xp + XP_PER_MEAL,
  };
  updated.level = levelFromXp(updated.xp);

  const newAchievements: string[] = [];

  if (updated.totalMealsCompleted === 1 && !updated.achievements.includes("first_meal")) {
    newAchievements.push("first_meal");
    updated.achievements = [...updated.achievements, "first_meal"];
    updated.xp += ACHIEVEMENTS.first_meal.xp;
  }

  const dayMeals = ["breakfast", "snack1", "lunch", "snack2", "dinner"];
  const dayComplete = dayMeals.every((m) => updated.completedMeals[mealKey(day, m)]);
  if (dayComplete && !updated.achievements.includes(`day_${day}`)) {
    updated.achievements = [...updated.achievements, `day_${day}`];
    updated.xp += XP_DAY_COMPLETE;
    if (!updated.achievements.includes("day_complete")) {
      newAchievements.push("day_complete");
      updated.achievements = [...updated.achievements, "day_complete"];
    }
  }

  if (updated.streak >= 3 && !updated.achievements.includes("streak_3")) {
    newAchievements.push("streak_3");
    updated.achievements = [...updated.achievements, "streak_3"];
    updated.xp += ACHIEVEMENTS.streak_3.xp;
  }
  if (updated.streak >= 7 && !updated.achievements.includes("streak_7")) {
    newAchievements.push("streak_7");
    updated.achievements = [...updated.achievements, "streak_7"];
    updated.xp += ACHIEVEMENTS.streak_7.xp;
  }

  const half = totalMealsInPlan / 2;
  if (updated.totalMealsCompleted >= half && !updated.achievements.includes("week_half")) {
    newAchievements.push("week_half");
    updated.achievements = [...updated.achievements, "week_half"];
    updated.xp += ACHIEVEMENTS.week_half.xp;
  }
  if (updated.totalMealsCompleted >= totalMealsInPlan && !updated.achievements.includes("week_done")) {
    newAchievements.push("week_done");
    updated.achievements = [...updated.achievements, "week_done"];
    updated.xp += ACHIEVEMENTS.week_done.xp;
  }

  updated.level = levelFromXp(updated.xp);
  return { progress: updated, newAchievements };
}

export function logWeightProgress(progress: UserGamification): UserGamification {
  const updated = { ...updateStreak(progress), xp: progress.xp + XP_WEIGHT_LOG };
  if (!updated.achievements.includes("weight_log")) {
    updated.achievements = [...updated.achievements, "weight_log"];
    updated.xp += ACHIEVEMENTS.weight_log.xp;
  }
  updated.level = levelFromXp(updated.xp);
  return updated;
}

export function createDefaultProgress(): UserGamification {
  return {
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: null,
    completedMeals: {},
    achievements: [],
    totalMealsCompleted: 0,
  };
}

export function getPlanCompletionPercent(completed: Record<string, boolean>, total: number): number {
  const done = Object.values(completed).filter(Boolean).length;
  return total > 0 ? Math.round((done / total) * 100) : 0;
}
