"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { localInputToIso } from "@/lib/datetime";
import { slugify } from "@/lib/format";
import { cleanHtml } from "@/lib/sanitize";

export type FormState = { error?: string } | undefined;

const str = (fd: FormData, k: string) => {
  const v = String(fd.get(k) ?? "").trim();
  return v || null;
};

export async function savePost(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase, user } = await requireStaff();
  const id = str(fd, "id");
  const intent = String(fd.get("intent") ?? "draft"); // draft | publish | unpublish
  const title = str(fd, "title");
  if (!title) return { error: "Informe o título." };

  const body = cleanHtml(String(fd.get("body") ?? ""));
  const scheduled = localInputToIso(str(fd, "published_at"));

  // slug único
  let slug = slugify(str(fd, "slug") || title);
  if (!slug) slug = `materia-${Date.now()}`;
  for (let i = 2; ; i++) {
    let q = supabase.from("posts").select("id").eq("slug", slug);
    if (id) q = q.neq("id", id);
    const { data } = await q.maybeSingle();
    if (!data) break;
    slug = `${slugify(str(fd, "slug") || title)}-${i}`;
  }

  const status = intent === "publish" ? "published" : intent === "unpublish" ? "draft" : (str(fd, "current_status") ?? "draft");
  const record = {
    title,
    slug,
    kicker: str(fd, "kicker"),
    subtitle: str(fd, "subtitle"),
    body,
    type: str(fd, "type") ?? "noticia",
    category_id: str(fd, "category_id"),
    city_id: str(fd, "city_id"),
    cover_url: str(fd, "cover_url"),
    cover_caption: str(fd, "cover_caption"),
    author_name: str(fd, "author_name"),
    author_role: str(fd, "author_role"),
    highlight: str(fd, "highlight"),
    status,
    published_at: status === "published" ? scheduled ?? new Date().toISOString() : scheduled,
  };

  let savedId = id;
  if (id) {
    const { error } = await supabase.from("posts").update(record).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase.from("posts").insert({ ...record, created_by: user.id }).select("id").single();
    if (error) return { error: error.message };
    savedId = data.id;
  }

  revalidatePath("/", "layout");
  redirect(`/admin/materias/${savedId}?salvo=${intent}`);
}

export async function deletePost(fd: FormData) {
  const { supabase } = await requireStaff(["admin", "editor"]);
  const id = String(fd.get("id"));
  await supabase.from("posts").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/materias?removida=1");
}
