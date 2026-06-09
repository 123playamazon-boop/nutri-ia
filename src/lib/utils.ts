import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function daysRemaining(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function canGenerateNewPlan(lastGeneratedAt: string | null): boolean {
  if (!lastGeneratedAt) return true;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return new Date(lastGeneratedAt).getTime() < weekAgo;
}

export function getDaysUntilNewPlan(lastGeneratedAt: string | null): number {
  if (!lastGeneratedAt) return 0;
  const nextAllowed = new Date(lastGeneratedAt).getTime() + 7 * 24 * 60 * 60 * 1000;
  const diff = nextAllowed - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
