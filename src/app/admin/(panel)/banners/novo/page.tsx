import PageHeader from "@/components/admin/PageHeader";
import AdForm from "../AdForm";

export const metadata = { title: "Novo banner" };

export default function NewAdPage() {
  return (
    <>
      <PageHeader title="Novo banner" />
      <AdForm />
    </>
  );
}
