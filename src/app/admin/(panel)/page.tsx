import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { daysAgoIso } from "@/lib/datetime";
import { formatShortDate } from "@/lib/format";
import type { Ad, Post } from "@/lib/types";

export const metadata = { title: "Painel" };

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const sp = await searchParams;
  const { supabase, profile } = await requireStaff();
  const now = new Date().toISOString();

  const count = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);
  const [published, drafts, scheduled, activeAds, recent, top, ads] = await Promise.all([
    count(supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "published").lte("published_at", now)),
    count(supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "draft")),
    count(supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "published").gt("published_at", now)),
    count(supabase.from("ads").select("id", { count: "exact", head: true }).eq("active", true)),
    supabase.from("posts").select("id,title,status,published_at,updated_at").order("updated_at", { ascending: false }).limit(8),
    supabase
      .from("posts")
      .select("id,title,slug,views")
      .eq("status", "published")
      .gte("published_at", daysAgoIso(30))
      .order("views", { ascending: false })
      .limit(8),
    supabase.from("ads").select("id,title,advertiser,impressions,clicks,active").order("clicks", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Publicadas", value: published, href: "/admin/materias?status=published" },
    { label: "Rascunhos", value: drafts, href: "/admin/materias?status=draft" },
    { label: "Agendadas", value: scheduled, href: "/admin/materias?status=published" },
    { label: "Banners ativos", value: activeAds, href: "/admin/banners" },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Olá, {profile.name?.split(" ")[0] || "equipe"}!</h1>
        <p className="text-sm text-muted">Resumo da redação do Jornal Cidades do Vale.</p>
      </div>
      {sp.erro === "permissao" && (
        <p className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">Você não tem permissão para acessar aquela área.</p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card hover:border-brand">
            <p className="font-display text-3xl font-extrabold tabular-nums">{s.value}</p>
            <p className="text-sm text-muted">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display font-bold">Editadas recentemente</h2>
            <Link href="/admin/materias" className="text-sm text-brand-dark hover:underline">Ver todas</Link>
          </div>
          <ul className="divide-y divide-line text-sm">
            {((recent.data ?? []) as Post[]).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link href={`/admin/materias/${p.id}`} className="truncate hover:text-brand-dark">{p.title}</Link>
                <span className={`shrink-0 text-xs ${p.status === "draft" ? "text-muted" : "text-green-700"}`}>
                  {p.status === "draft" ? "rascunho" : formatShortDate(p.published_at)}
                </span>
              </li>
            ))}
            {!recent.data?.length && <li className="py-6 text-center text-muted">Nenhuma matéria ainda.</li>}
          </ul>
        </section>

        <section className="card">
          <h2 className="mb-3 font-display font-bold">Mais lidas (30 dias)</h2>
          <ol className="divide-y divide-line text-sm">
            {((top.data ?? []) as Post[]).map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 py-2.5">
                <span className="w-5 font-display font-bold text-brand">{i + 1}</span>
                <a href={`/noticia/${p.slug}`} target="_blank" className="flex-1 truncate hover:text-brand-dark">{p.title}</a>
                <span className="tabular-nums text-muted">{p.views.toLocaleString("pt-BR")}</span>
              </li>
            ))}
            {!top.data?.length && <li className="py-6 text-center text-muted">Sem dados ainda.</li>}
          </ol>
        </section>

        <section className="card lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display font-bold">Desempenho dos banners</h2>
            <Link href="/admin/banners" className="text-sm text-brand-dark hover:underline">Gerenciar</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted">
              <tr><th className="py-2">Banner</th><th className="py-2 text-right">Exibições</th><th className="py-2 text-right">Cliques</th><th className="py-2 text-right">CTR</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {((ads.data ?? []) as Ad[]).map((a) => (
                <tr key={a.id}>
                  <td className="py-2.5">
                    <Link href={`/admin/banners/${a.id}`} className="hover:text-brand-dark">{a.title}</Link>
                    {a.advertiser && <span className="text-muted"> · {a.advertiser}</span>}
                  </td>
                  <td className="py-2.5 text-right tabular-nums">{a.impressions.toLocaleString("pt-BR")}</td>
                  <td className="py-2.5 text-right tabular-nums">{a.clicks.toLocaleString("pt-BR")}</td>
                  <td className="py-2.5 text-right tabular-nums">{a.impressions ? ((a.clicks / a.impressions) * 100).toFixed(2) : "0.00"}%</td>
                </tr>
              ))}
              {!ads.data?.length && <tr><td colSpan={4} className="py-6 text-center text-muted">Nenhum banner cadastrado.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
