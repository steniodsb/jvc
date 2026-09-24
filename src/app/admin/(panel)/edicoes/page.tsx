import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import { requireStaff } from "@/lib/auth";
import { formatShortDate } from "@/lib/format";
import type { Edition } from "@/lib/types";

export const metadata = { title: "Edições impressas" };

export default async function EditionsAdminPage({ searchParams }: PageProps<"/admin/edicoes">) {
  const sp = await searchParams;
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("editions").select("*").order("number", { ascending: false });
  const editions = (data ?? []) as Edition[];
  return (
    <>
      <PageHeader title="Edições impressas" description="PDFs do jornal impresso disponíveis no site" action={{ href: "/admin/edicoes/nova", label: "+ Nova edição" }} />
      {sp.salvo && <p className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">Edição salva.</p>}
      {!editions.length && <div className="card py-12 text-center text-muted">Nenhuma edição cadastrada.</div>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {editions.map((e) => (
          <Link key={e.id} href={`/admin/edicoes/${e.id}`} className="card p-3 hover:border-brand">
            <div className="aspect-[2/3] overflow-hidden rounded bg-paper-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {e.cover_url && <img src={e.cover_url} alt="" className="h-full w-full object-cover object-top" />}
            </div>
            <p className="mt-2 font-display font-bold">Nº {String(e.number).padStart(2, "0")}</p>
            <p className="text-xs text-muted">
              {formatShortDate(e.date + "T12:00:00")} {!e.published && "· oculta"}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
