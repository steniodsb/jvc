import { createClient } from "@supabase/supabase-js";

/** Remove espaços, quebras de linha e aspas coladas por engano no painel da hospedagem */
export const cleanEnv = (v: string | undefined) => (v ?? "").trim().replace(/^["']|["']$/g, "");

/** Cliente anônimo, sem cookies — usado nas páginas públicas (cacheáveis/ISR). */
export function publicClient() {
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url) || !key) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL inválida ou ausente. Recebido: "${url.slice(0, 60)}"${url.length > 60 ? "…" : ""} ` +
        `(${url.length} caracteres). Esperado algo como https://xxxx.supabase.co. ` +
        "Na Vercel: Settings → Environment Variables, corrija o valor e faça Redeploy.",
    );
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
