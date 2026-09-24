"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { slugify } from "@/lib/format";

function done() {
  revalidatePath("/", "layout");
}

export async function saveCategory(fd: FormData) {
  const { supabase } = await requireStaff(["admin", "editor"]);
  const id = String(fd.get("id") ?? "");
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return;
  const record = {
    name,
    slug: slugify(String(fd.get("slug") ?? "") || name),
    sort: Number(fd.get("sort")) || 0,
    show_in_nav: fd.get("show_in_nav") === "on",
  };
  if (id) await supabase.from("categories").update(record).eq("id", id);
  else await supabase.from("categories").insert(record);
  done();
}

export async function deleteCategory(fd: FormData) {
  const { supabase } = await requireStaff(["admin", "editor"]);
  await supabase.from("categories").delete().eq("id", String(fd.get("id")));
  done();
}

export async function saveCity(fd: FormData) {
  const { supabase } = await requireStaff(["admin", "editor"]);
  const id = String(fd.get("id") ?? "");
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return;
  const record = { name, slug: slugify(name) };
  if (id) await supabase.from("cities").update(record).eq("id", id);
  else await supabase.from("cities").insert(record);
  done();
}

export async function deleteCity(fd: FormData) {
  const { supabase } = await requireStaff(["admin", "editor"]);
  await supabase.from("cities").delete().eq("id", String(fd.get("id")));
  done();
}
