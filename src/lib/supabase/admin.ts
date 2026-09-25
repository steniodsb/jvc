import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cleanEnv } from "@/lib/supabase/public";

/** Service role — ignora RLS. Usar só em Server Actions já autorizadas (gestão de usuários). */
export function adminClient() {
  return createClient(cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL), cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
