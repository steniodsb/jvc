import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import { ConfirmSubmit } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import type { Ad } from "@/lib/types";
import AdForm from "../AdForm";
import { deleteAd } from "../actions";

export const metadata = { title: "Editar banner" };

export default async function EditAdPage({ params }: PageProps<"/admin/banners/[id]">) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("ads").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const ad = data as Ad;
  return (
    <>
      <PageHeader title="Editar banner" description={`${ad.impressions} exibições · ${ad.clicks} cliques`} />
      <AdForm ad={ad} />
      <form action={deleteAd} className="mt-10 border-t border-line pt-6">
        <input type="hidden" name="id" value={ad.id} />
        <ConfirmSubmit message="Excluir este banner?">Excluir banner</ConfirmSubmit>
      </form>
    </>
  );
}
