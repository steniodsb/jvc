import "server-only";
import { redirect } from "next/navigation";
import { serverClient } from "./supabase/server";
import type { Profile, Role } from "./types";

/** Garante usuário logado com papel na equipe. Retorna cliente + perfil. */
export async function requireStaff(roles?: Role[]) {
  const supabase = await serverClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
  if (!profile?.role) redirect("/admin/login?erro=sem-acesso");
  if (roles && !roles.includes(profile.role)) redirect("/admin?erro=permissao");

  return { supabase, user, profile };
}
