import PageHeader from "@/components/admin/PageHeader";
import { requireStaff } from "@/lib/auth";
import EditionForm from "../EditionForm";

export const metadata = { title: "Nova edição" };

export default async function NewEditionPage() {
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("editions").select("number").order("number", { ascending: false }).limit(1).maybeSingle();
  return (
    <>
      <PageHeader title="Nova edição impressa" />
      <EditionForm nextNumber={(data?.number ?? 0) + 1} />
    </>
  );
}
