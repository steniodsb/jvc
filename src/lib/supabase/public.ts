import { createClient } from "@supabase/supabase-js";

/** Cliente anônimo, sem cookies — usado nas páginas públicas (cacheáveis/ISR). */
export function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não definidas. " +
        "Na Vercel: Settings → Environment Variables (marque Production, Preview e Development) e faça Redeploy.",
    );
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
