import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import { SubmitButton } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { formatShortDate } from "@/lib/format";
import { AD_POSITIONS, type Ad } from "@/lib/types";
import { toggleAd } from "./actions";

export const metadata = { title: "Banners" };

function adStatus(a: Ad) {
  const now = new Date();
  if (!a.active) return <span className="badge bg-gray-100 text-gray-700">Pausado</span>;
  if (a.start_at && new Date(a.start_at) > now) return <span className="badge bg-amber-100 text-amber-800">Agendado</span>;
  if (a.end_at && new Date(a.end_at) < now) return <span className="badge bg-red-100 text-red-700">Expirado</span>;
  return <span className="badge bg-green-100 text-green-800">No ar</span>;
}

export default async function AdsPage({ searchParams }: PageProps<"/admin/banners">) {
  const sp = await searchParams;
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("ads").select("*").order("created_at", { ascending: false });
  const ads = (data ?? []) as Ad[];

  return (
    <>
      <PageHeader title="Banners publicitários" description="Gerencie os anúncios exibidos no site" action={{ href: "/admin/banners/novo", label: "+ Novo banner" }} />
      {sp.salvo && <p className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">Banner salvo. O site é atualizado em instantes.</p>}

      {!ads.length && (
        <div className="card py-12 text-center text-muted">
          Nenhum banner cadastrado. <Link href="/admin/banners/novo" className="text-brand-dark underline">Cadastrar o primeiro</Link>
        </div>
      )}

      <div className="space-y-3">
        {ads.map((a) => {
          const ctr = a.impressions ? ((a.clicks / a.impressions) * 100).toFixed(2) : "0.00";
          return (
            <div key={a.id} className="card flex flex-col gap-4 p-4 md:flex-row md:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.image_url} alt="" className="h-20 w-full rounded border border-line bg-paper-2 object-contain md:w-64" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/banners/${a.id}`} className="font-semibold hover:text-brand-dark">{a.title}</Link>
                  {adStatus(a)}
                </div>
                <p className="text-sm text-muted">
                  {a.advertiser && `${a.advertiser} · `}
                  {AD_POSITIONS[a.position].label}
                </p>
                <p className="text-xs text-muted">
                  {a.start_at || a.end_at
                    ? `${a.start_at ? formatShortDate(a.start_at) : "já"} até ${a.end_at ? formatShortDate(a.end_at) : "sem data de término"}`
                    : "Sem período definido"}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-sm md:w-64">
                <div><p className="font-display text-lg font-bold tabular-nums">{a.impressions.toLocaleString("pt-BR")}</p><p className="text-xs text-muted">exibições</p></div>
                <div><p className="font-display text-lg font-bold tabular-nums">{a.clicks.toLocaleString("pt-BR")}</p><p className="text-xs text-muted">cliques</p></div>
                <div><p className="font-display text-lg font-bold tabular-nums">{ctr}%</p><p className="text-xs text-muted">CTR</p></div>
              </div>
              <div className="flex gap-2">
                <form action={toggleAd}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="active" value={String(!a.active)} />
                  <SubmitButton className="btn" pendingText="…">{a.active ? "Pausar" : "Ativar"}</SubmitButton>
                </form>
                <Link href={`/admin/banners/${a.id}`} className="btn">Editar</Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card mt-8 text-sm">
        <h2 className="font-display font-bold">Posições e tamanhos recomendados</h2>
        <ul className="mt-2 grid gap-1 text-muted sm:grid-cols-2">
          {Object.values(AD_POSITIONS).map((p) => (
            <li key={p.label}><strong className="text-ink">{p.label}:</strong> {p.size}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
