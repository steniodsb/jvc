import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import { ConfirmSubmit } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import type { Category, City, Post } from "@/lib/types";
import PostForm from "../PostForm";
import { deletePost } from "../actions";

export const metadata = { title: "Editar matéria" };

const MESSAGES: Record<string, string> = {
  publish: "Matéria publicada. O site é atualizado em instantes.",
  draft: "Rascunho salvo.",
  unpublish: "Matéria despublicada: voltou a ser rascunho.",
};

export default async function EditPostPage({ params, searchParams }: PageProps<"/admin/materias/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, profile } = await requireStaff();
  const [{ data: post }, { data: categories }, { data: cities }] = await Promise.all([
    supabase.from("posts").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("sort").order("name"),
    supabase.from("cities").select("*").order("name"),
  ]);
  if (!post) notFound();
  const p = post as Post;
  const live = p.status === "published" && p.published_at && new Date(p.published_at) <= new Date();
  const msg = typeof sp.salvo === "string" ? MESSAGES[sp.salvo] : null;

  return (
    <>
      <PageHeader title="Editar matéria" description={`${p.views} visualizações`} />
      {msg && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span>{msg}</span>
          {live && (
            <Link href={`/noticia/${p.slug}`} target="_blank" className="font-semibold underline">
              Ver no site ↗
            </Link>
          )}
        </div>
      )}
      <PostForm key={p.updated_at} post={p} categories={(categories ?? []) as Category[]} cities={(cities ?? []) as City[]} />

      {profile.role !== "redator" && (
        <form action={deletePost} className="mt-10 border-t border-line pt-6">
          <input type="hidden" name="id" value={p.id} />
          <ConfirmSubmit message="Excluir esta matéria definitivamente?">Excluir matéria</ConfirmSubmit>
        </form>
      )}
    </>
  );
}
