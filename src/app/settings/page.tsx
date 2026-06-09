"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Settings, Lock, User, Save } from "lucide-react";
import { AppNav } from "@/components/layout/app-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { DIET_PROGRAM_LABELS, type UserProfile, type DietProgram, type Gender } from "@/types";

import { isDemoEnabled } from "@/lib/env";

const IS_DEMO = isDemoEnabled();

function SettingsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forcePassword = searchParams.get("senha") === "1";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "feminino" as Gender,
    height_cm: "",
    current_weight: "",
    target_weight: "",
    diet_program: "emagrecimento_moderado" as DietProgram,
    disliked_foods: "",
    allergies: "",
    meals_per_day: "5",
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          const p = data.profile as UserProfile;
          setForm({
            name: p.name ?? "",
            age: String(p.age ?? ""),
            gender: p.gender ?? "feminino",
            height_cm: String(p.height_cm ?? ""),
            current_weight: String(p.current_weight ?? ""),
            target_weight: String(p.target_weight ?? ""),
            diet_program: p.diet_program ?? "emagrecimento_moderado",
            disliked_foods: p.disliked_foods ?? "",
            allergies: p.allergies ?? "",
            meals_per_day: String(p.meals_per_day ?? 5),
          });
        }
        setEmail(data.email ?? "");
        setMustChangePassword(data.mustChangePassword ?? false);
        setLoading(false);
      });
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        age: parseInt(form.age, 10),
        gender: form.gender,
        height_cm: parseFloat(form.height_cm),
        current_weight: parseFloat(form.current_weight),
        target_weight: parseFloat(form.target_weight),
        diet_program: form.diet_program,
        disliked_foods: form.disliked_foods,
        allergies: form.allergies,
        meals_per_day: parseInt(form.meals_per_day, 10),
      }),
    });

    if (res.ok) {
      setMessage("Perfil atualizado com sucesso!");
    } else {
      const data = await res.json();
      setError(data.error ?? "Erro ao salvar");
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    if (IS_DEMO) {
      setMessage("No modo demo a senha não é alterada. Use demo123.");
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const { error: pwError } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
      data: { must_change_password: false },
    });

    if (pwError) {
      setError(pwError.message);
      setSaving(false);
      return;
    }

    setMustChangePassword(false);
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setMessage("Senha alterada com sucesso!");
    setSaving(false);

    if (forcePassword) {
      router.push("/onboarding");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Configurações
        </h1>
        <p className="text-muted-foreground">Atualize seus dados se digitou algo errado</p>
      </div>

      {(mustChangePassword || forcePassword) && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Primeiro acesso:</strong> altere sua senha temporária abaixo antes de continuar.
        </div>
      )}

      {message && <div className="rounded-xl bg-primary/10 p-3 text-sm text-primary">{message}</div>}
      {error && <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" /> Dados pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email (login)</Label>
            <Input value={email} disabled className="bg-muted" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Idade</Label>
              <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </div>
            <div>
              <Label>Sexo</Label>
              <select
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
              >
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <Label>Altura (cm)</Label>
              <Input type="number" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} />
            </div>
            <div>
              <Label>Peso atual (kg)</Label>
              <Input type="number" step="0.1" value={form.current_weight} onChange={(e) => setForm({ ...form, current_weight: e.target.value })} />
            </div>
            <div>
              <Label>Peso meta (kg)</Label>
              <Input type="number" step="0.1" value={form.target_weight} onChange={(e) => setForm({ ...form, target_weight: e.target.value })} />
            </div>
            <div>
              <Label>Refeições por dia</Label>
              <Input type="number" min={3} max={6} value={form.meals_per_day} onChange={(e) => setForm({ ...form, meals_per_day: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Programa de dieta</Label>
              <select
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                value={form.diet_program}
                onChange={(e) => setForm({ ...form, diet_program: e.target.value as DietProgram })}
              >
                {Object.entries(DIET_PROGRAM_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label>Alergias</Label>
              <Input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="Ex: amendoim, lactose" />
            </div>
            <div className="sm:col-span-2">
              <Label>Alimentos que não gosta</Label>
              <Input value={form.disliked_foods} onChange={(e) => setForm({ ...form, disliked_foods: e.target.value })} placeholder="Ex: fígado, jiló" />
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar perfil
          </Button>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5" /> Alterar senha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nova senha</Label>
            <Input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <Label>Confirmar nova senha</Label>
            <Input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
          </div>
          <Button variant="outline" onClick={handleChangePassword} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Alterar senha"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <>
      <AppNav />
      <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <SettingsForm />
      </Suspense>
    </>
  );
}
