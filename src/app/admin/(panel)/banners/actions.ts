"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { localInputToIso } from "@/lib/datetime";

export type FormState = { error?: string } | undefined;

const str = (fd: FormData, k: string) => {
  const v = String(fd.get(k) ?? "").trim();
  return v || null;
};

export async function saveAd(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireStaff();
  const id = str(fd, "id");
  const title = str(fd, "title");
  const image_url = str(fd, "image_url");
  if (!title) return { error: "Informe um nome para o banner." };
  if (!image_url) return { error: "Envie a imagem do banner." };

  let link = str(fd, "link_url");
  if (link && !/^https?:\/\//i.test(link)) link = `https://${link}`;

  const record = {
    title,
    advertiser: str(fd, "advertiser"),
    image_url,
    image_mobile_url: str(fd, "image_mobile_url"),
    link_url: link,
    position: str(fd, "position") ?? "topo",
    start_at: localInputToIso(str(fd, "start_at")),
    end_at: localInputToIso(str(fd, "end_at")),
    weight: Math.max(1, Math.min(10, Number(fd.get("weight")) || 1)),
    active: fd.get("active") === "on",
  };

  const { error } = id ? await supabase.from("ads").update(record).eq("id", id) : await supabase.from("ads").insert(record);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/admin/banners?salvo=1");
}

export async function toggleAd(fd: FormData) {
  const { supabase } = await requireStaff();
  await supabase.from("ads").update({ active: fd.get("active") === "true" }).eq("id", String(fd.get("id")));
  revalidatePath("/", "layout");
}

export async function deleteAd(fd: FormData) {
  const { supabase } = await requireStaff();
  await supabase.from("ads").delete().eq("id", String(fd.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/banners");
}
