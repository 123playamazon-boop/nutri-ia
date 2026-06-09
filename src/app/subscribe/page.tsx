"use client";

import { useState } from "react";
import { Leaf, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  "Plano alimentar personalizado de 7 dias",
  "Diário alimentar com análise por foto",
  "Nutricionista IA disponível 24h",
  "Acompanhamento de peso com gráfico",
];

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: "monthly_brl" | "monthly_usd") => {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <Leaf className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 text-2xl font-bold">Escolha seu plano</h1>
          <p className="text-muted-foreground">Assine para acessar todas as funcionalidades</p>
        </div>

        <Card className="glass border-primary/30">
          <CardContent className="p-6">
            <ul className="mb-6 space-y-2">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="grid gap-3">
              <Button
                size="lg"
                className="w-full h-14 text-lg"
                onClick={() => handleCheckout("monthly_brl")}
                disabled={!!loading}
              >
                {loading === "monthly_brl" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "R$ 39,90 / mês"
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full h-14 text-lg"
                onClick={() => handleCheckout("monthly_usd")}
                disabled={!!loading}
              >
                {loading === "monthly_usd" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "US$ 9.90 / month"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
