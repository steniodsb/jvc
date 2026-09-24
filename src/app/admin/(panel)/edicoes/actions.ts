"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";

export type FormState = { error?: string } | undefined;

export async function saveEdition(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireStaff();
  const id = String(fd.get("id") ?? "") || null;
  const number = Number(fd.get("number"));
  const date = String(fd.get("date") ?? "");
  const pdf_url = String(fd.get("pdf_url") ?? "");
  if (!number || !date) return { error: "Informe o número e a data da edição." };
  if (!pdf_url) return { error: "Envie o PDF da edição." };

  const record = {
    number,
    date,
    title: String(fd.get("title") ?? "").trim() || null,
    cover_url: String(fd.get("cover_url") ?? "") || null,
    pdf_url,
    published: fd.get("published") === "on",
  };
  const { error } = id ? await supabase.from("editions").update(record).eq("id", id) : await supabase.from("editions").insert(record);
  if (error) return { error: error.code === "23505" ? `Já existe a edição nº ${number}.` : error.message };

  revalidatePath("/", "layout");
  redirect("/admin/edicoes?salvo=1");
}

export async function deleteEdition(fd: FormData) {
  const { supabase } = await requireStaff();
  await supabase.from("editions").delete().eq("id", String(fd.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/edicoes");
}
