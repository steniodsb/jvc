import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cleanEnv } from "@/lib/supabase/public";

/** Cliente com a sessão do usuário logado (painel). RLS se aplica. */
export async function serverClient() {
  const cookieStore = await cookies();
  return createServerClient(cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL), cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // chamado em Server Component: o proxy cuida da renovação
        }
      },
    },
  });
}
