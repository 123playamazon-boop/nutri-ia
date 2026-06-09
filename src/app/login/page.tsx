"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo";
import { isDemoEnabled } from "@/lib/env";

const IS_DEMO = isDemoEnabled();

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "1";
  const [email, setEmail] = useState(IS_DEMO ? DEMO_EMAIL : "");
  const [password, setPassword] = useState(IS_DEMO ? DEMO_PASSWORD : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (IS_DEMO) {
      const res = await fetch("/api/demo/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push("/dashboard");
        return;
      }
      const data = await res.json();
      setError(data.error ?? "Erro ao entrar");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (data.user?.user_metadata?.must_change_password) {
      router.push("/settings?senha=1");
      return;
    }
    router.push("/dashboard");
  };

  const handleGoogle = async () => {
    if (IS_DEMO) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50/50 to-background px-4">
      <Card className="w-full max-w-md glass">
        <CardContent className="p-8">
          <div className="mb-6 text-center">
            <Leaf className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-3 text-2xl font-bold text-foreground">Entrar</h1>
            <p className="text-sm text-muted-foreground">Acesse sua conta Nutri IA</p>
          </div>

          {isWelcome && !IS_DEMO && (
            <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
              <p className="font-medium text-primary">Bem-vindo(a)!</p>
              <p className="mt-1 text-muted-foreground">
                Use o login e senha enviados por email. Altere sua senha em Configurações no primeiro acesso.
              </p>
            </div>
          )}

          {IS_DEMO && (
            <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
              <p className="font-medium text-primary">Modo demonstração ativo</p>
              <p className="mt-1 text-muted-foreground">
                Email: <strong className="text-foreground">{DEMO_EMAIL}</strong>
              </p>
              <p className="text-muted-foreground">
                Senha: <strong className="text-foreground">{DEMO_PASSWORD}</strong>
              </p>
            </div>
          )}

          {!IS_DEMO && (
            <>
              <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
                Continuar com Google
              </Button>
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">ou</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
            </Button>
          </form>

          {!IS_DEMO && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Não tem conta?{" "}
              <Link href="/signup" className="text-primary hover:underline">Criar conta</Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
