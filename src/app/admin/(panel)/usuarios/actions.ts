"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/types";

export type FormState = { error?: string; ok?: string } | undefined;
const ROLES: Role[] = ["admin", "editor", "redator"];

export async function createUser(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireStaff(["admin"]);
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const role = String(fd.get("role")) as Role;
  if (!name || !email) return { error: "Preencha nome e e-mail." };
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres." };
  if (!ROLES.includes(role)) return { error: "Papel inválido." };

  const admin = adminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  });
  if (error) return { error: error.message.includes("already") ? "Já existe um usuário com este e-mail." : error.message };
  // garante o papel escolhido (o gatilho já cria o perfil)
  await admin.from("profiles").upsert({ id: data.user.id, name, email, role });

  revalidatePath("/admin/usuarios");
  return { ok: `Usuário ${email} criado. Envie a senha para a pessoa por um canal seguro.` };
}

export async function updateRole(fd: FormData) {
  const { user } = await requireStaff(["admin"]);
  const id = String(fd.get("id"));
  const role = String(fd.get("role"));
  if (id === user.id) return; // não rebaixa a si mesmo
  await adminClient()
    .from("profiles")
    .update({ role: ROLES.includes(role as Role) ? role : null })
    .eq("id", id);
  revalidatePath("/admin/usuarios");
}

export async function resetPassword(fd: FormData) {
  await requireStaff(["admin"]);
  const id = String(fd.get("id"));
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return;
  await adminClient().auth.admin.updateUserById(id, { password });
  revalidatePath("/admin/usuarios");
}

export async function removeUser(fd: FormData) {
  const { user } = await requireStaff(["admin"]);
  const id = String(fd.get("id"));
  if (id === user.id) return;
  await adminClient().auth.admin.deleteUser(id);
  revalidatePath("/admin/usuarios");
}
