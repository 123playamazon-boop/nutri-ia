/** Verifica se Supabase está configurado de verdade (não placeholder). */
export function hasSupabaseConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return (
    url.startsWith("https://") &&
    url.includes(".supabase.co") &&
    key.length > 20 &&
    !url.includes("your-project") &&
    !key.includes("your-anon")
  );
}

/** Demo explícito OU Supabase ausente → modo demo/fallback. */
export function isDemoEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !hasSupabaseConfig();
}
