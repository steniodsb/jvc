import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import { ConfirmSubmit } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import type { Edition } from "@/lib/types";
import EditionForm from "../EditionForm";
import { deleteEdition } from "../actions";

export const metadata = { title: "Editar edição" };

export default async function EditEditionPage({ params }: PageProps<"/admin/edicoes/[id]">) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("editions").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const edition = data as Edition;
  return (
    <>
      <PageHeader title={`Edição nº ${edition.number}`} />
      <EditionForm edition={edition} />
      <form action={deleteEdition} className="mt-10 border-t border-line pt-6">
        <input type="hidden" name="id" value={edition.id} />
        <ConfirmSubmit message="Excluir esta edição do site?">Excluir edição</ConfirmSubmit>
      </form>
    </>
  );
}
