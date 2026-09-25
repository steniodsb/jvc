import { createBrowserClient } from "@supabase/ssr";
import { cleanEnv } from "@/lib/supabase/public";

export function browserClient() {
  return createBrowserClient(cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL), cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
}
