import { jsPDF } from "jspdf";
import type { MealPlan, Meal } from "@/types";
import { DIET_PROGRAM_LABELS } from "@/types";

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Café da manhã",
  snack1: "Lanche da manhã",
  lunch: "Almoço",
  snack2: "Lanche da tarde",
  dinner: "Jantar",
};

function addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line: string) => {
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

export function exportMealPlanPDF(plan: MealPlan, userName?: string) {
  const doc = new jsPDF();
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  doc.setFontSize(18);
  doc.setTextColor(22, 163, 74);
  doc.text("Nutri IA — Plano Alimentar", margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  if (userName) {
    doc.text(`Preparado para: ${userName}`, margin, y);
    y += 6;
  }
  doc.text(`Programa: ${DIET_PROGRAM_LABELS[plan.plan_data.dietProgram]}`, margin, y);
  y += 6;
  doc.text(`~${plan.plan_data.totalCaloriesPerDay} kcal/dia · 7 dias`, margin, y);
  y += 8;

  if (plan.plan_data.planSummary) {
    doc.setTextColor(40, 40, 40);
    y = addWrappedText(doc, plan.plan_data.planSummary, margin, y, maxWidth);
    y += 8;
  }

  // Lista de compras
  doc.setFontSize(14);
  doc.setTextColor(22, 163, 74);
  doc.text("Lista de Compras da Semana", margin, y);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);

  const normalizedList = plan.plan_data.shoppingList.map((i) =>
    typeof i === "string" ? { item: i, quantity: "conforme plano", category: "Geral" } : i
  );
  const categories = [...new Set(normalizedList.map((i) => i.category))];
  for (const cat of categories) {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.text(cat, margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    for (const item of normalizedList.filter((i) => i.category === cat)) {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(`• ${item.item} — ${item.quantity}`, margin + 4, y);
      y += 5;
    }
    y += 3;
  }

  // Receitas por dia
  for (const day of plan.plan_data.days) {
    doc.addPage();
    y = 20;
    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74);
    doc.text(`${day.dayName} (Dia ${day.day})`, margin, y);
    y += 10;

    for (const [key, meal] of Object.entries(day.meals)) {
      const m = meal as Meal;
      if (y > 240) { doc.addPage(); y = 20; }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(`${MEAL_LABELS[key] ?? key}: ${m.name}`, margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`${m.prepTimeMinutes} min · ${m.difficulty} · ${m.nutrition.calories} kcal · P${m.nutrition.protein}g C${m.nutrition.carbs}g G${m.nutrition.fat}g`, margin, y);
      y += 6;

      y = addWrappedText(doc, m.description, margin, y, maxWidth, 4.5);
      y += 3;

      doc.setFont("helvetica", "bold");
      doc.text("Ingredientes:", margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      for (const ing of m.ingredients) {
        if (y > 285) { doc.addPage(); y = 20; }
        doc.text(`  • ${ing}`, margin, y);
        y += 4.5;
      }
      y += 2;

      doc.setFont("helvetica", "bold");
      doc.text("Modo de preparo:", margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      m.steps.forEach((step, i) => {
        if (y > 285) { doc.addPage(); y = 20; }
        y = addWrappedText(doc, `${i + 1}. ${step}`, margin, y, maxWidth, 4.5);
      });
      y += 2;

      doc.setFont("helvetica", "italic");
      doc.setTextColor(120, 80, 0);
      for (const tip of m.tips) {
        if (y > 285) { doc.addPage(); y = 20; }
        y = addWrappedText(doc, `💡 ${tip}`, margin, y, maxWidth, 4.5);
      }
      doc.setTextColor(40, 40, 40);
      y += 8;
    }
  }

  doc.save(`nutri-ia-plano-${new Date().toISOString().slice(0, 10)}.pdf`);
}
