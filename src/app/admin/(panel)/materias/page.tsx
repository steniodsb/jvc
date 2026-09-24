import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import { requireStaff } from "@/lib/auth";
import { formatShortDate } from "@/lib/format";
import { POST_TYPES, type Category, type Post } from "@/lib/types";

export const metadata = { title: "Matérias" };
const PER_PAGE = 25;

function StatusBadge({ p }: { p: Post }) {
  if (p.status === "draft") return <span className="badge bg-gray-100 text-gray-700">Rascunho</span>;
  if (p.published_at && new Date(p.published_at) > new Date()) return <span className="badge bg-amber-100 text-amber-800">Agendada</span>;
  return <span className="badge bg-green-100 text-green-800">Publicada</span>;
}

export default async function PostsPage({ searchParams }: PageProps<"/admin/materias">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const cat = typeof sp.editoria === "string" ? sp.editoria : "";
  const page = Math.max(1, Number(sp.pagina) || 1);

  const { supabase } = await requireStaff();
  let query = supabase
    .from("posts")
    .select("id,title,slug,type,status,published_at,highlight,views,updated_at,category:categories(name)", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
  if (q) query = query.ilike("title", `%${q.replace(/[%,()]/g, " ")}%`);
  if (status === "draft" || status === "published") query = query.eq("status", status);
  if (cat) query = query.eq("category_id", cat);

  const [{ data, count }, { data: categories }] = await Promise.all([
    query,
    supabase.from("categories").select("id,name").order("sort"),
  ]);
  const posts = (data ?? []) as unknown as Post[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PER_PAGE));
  const qs = (p: number) => `?${new URLSearchParams({ ...(q && { q }), ...(status && { status }), ...(cat && { editoria: cat }), pagina: String(p) })}`;

  return (
    <>
      <PageHeader title="Matérias" description={`${count ?? 0} no total`} action={{ href: "/admin/materias/nova", label: "+ Nova matéria" }} />
      {sp.removida && <p className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">Matéria excluída.</p>}

      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Buscar pelo título" className="input max-w-xs" />
        <select name="status" defaultValue={status} className="input w-auto">
          <option value="">Todas</option>
          <option value="published">Publicadas</option>
          <option value="draft">Rascunhos</option>
        </select>
        <select name="editoria" defaultValue={cat} className="input w-auto">
          <option value="">Todas as editorias</option>
          {((categories ?? []) as Category[]).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button className="btn">Filtrar</button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-paper-2 text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="hidden px-4 py-3 md:table-cell">Editoria</th>
              <th className="px-4 py-3">Situação</th>
              <th className="hidden px-4 py-3 sm:table-cell">Data</th>
              <th className="hidden px-4 py-3 text-right md:table-cell">Visitas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-paper-2/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/materias/${p.id}`} className="font-semibold text-ink hover:text-brand-dark">{p.title}</Link>
                  <p className="text-xs text-muted">
                    {POST_TYPES[p.type]}
                    {p.highlight && <span className="ml-2 font-semibold text-brand-dark">★ {p.highlight}</span>}
                  </p>
                </td>
                <td className="hidden px-4 py-3 text-muted md:table-cell">{(p.category as { name: string } | null)?.name ?? "—"}</td>
                <td className="px-4 py-3"><StatusBadge p={p} /></td>
                <td className="hidden px-4 py-3 text-muted sm:table-cell">{formatShortDate(p.published_at ?? p.updated_at)}</td>
                <td className="hidden px-4 py-3 text-right tabular-nums md:table-cell">{p.views}</td>
              </tr>
            ))}
            {!posts.length && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">Nenhuma matéria encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? <Link href={qs(page - 1)} className="btn">← Anterior</Link> : <span />}
          <span className="text-muted">Página {page} de {pages}</span>
          {page < pages ? <Link href={qs(page + 1)} className="btn">Próxima →</Link> : <span />}
        </div>
      )}
    </>
  );
}
