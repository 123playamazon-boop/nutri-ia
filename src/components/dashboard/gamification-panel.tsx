"use client";

import { motion } from "framer-motion";
import { Flame, Trophy, Star, Target, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { xpProgressInLevel, getPlanCompletionPercent } from "@/lib/gamification";
import { ACHIEVEMENTS, type UserGamification } from "@/types";

interface GamificationPanelProps {
  progress: UserGamification;
  planCompletionTotal: number;
}

export function GamificationPanel({ progress, planCompletionTotal }: GamificationPanelProps) {
  const xpInfo = xpProgressInLevel(progress.xp);
  const planPercent = getPlanCompletionPercent(progress.completedMeals, planCompletionTotal);

  const unlockedAchievements = progress.achievements.filter((a) => ACHIEVEMENTS[a as keyof typeof ACHIEVEMENTS]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { icon: Star, label: "Nível", value: progress.level, color: "text-amber-500" },
          { icon: Zap, label: "XP Total", value: progress.xp, color: "text-primary" },
          { icon: Flame, label: "Sequência", value: `${progress.streak} dias`, color: "text-orange-500" },
          { icon: Target, label: "Plano", value: `${planPercent}%`, color: "text-blue-500" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-white p-4 text-center shadow-sm"
            >
              <Icon className={`mx-auto h-5 w-5 ${stat.color}`} />
              <p className="mt-1 text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Progresso para Nível {progress.level + 1}</span>
          <span className="text-muted-foreground">{xpInfo.current}/{xpInfo.needed} XP</span>
        </div>
        <Progress value={xpInfo.percent} className="h-2" />
      </div>

      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Plano Semanal</span>
          <span className="text-muted-foreground">{progress.totalMealsCompleted}/{planCompletionTotal} refeições</span>
        </div>
        <Progress value={planPercent} className="h-2" />
      </div>

      {unlockedAchievements.length > 0 && (
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Trophy className="h-4 w-4 text-amber-500" />
            Conquistas ({unlockedAchievements.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {unlockedAchievements.map((id) => {
              const ach = ACHIEVEMENTS[id as keyof typeof ACHIEVEMENTS];
              if (!ach) return null;
              return (
                <div
                  key={id}
                  title={ach.desc}
                  className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-800"
                >
                  🏆 {ach.title}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
