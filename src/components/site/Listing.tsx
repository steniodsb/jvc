import Link from "next/link";
import Sidebar from "./Sidebar";
import { FeatureCard, ListItem } from "./cards";
import type { Post } from "@/lib/types";

export const PAGE_SIZE = 20;

/** Página de listagem (editoria, cidade, busca) */
export default function Listing({
  label,
  title,
  description,
  posts,
  page,
  basePath,
  query = "",
}: {
  label: string;
  title: string;
  description?: string;
  posts: Post[];
  page: number;
  basePath: string;
  query?: string;
}) {
  const hasNext = posts.length > PAGE_SIZE;
  const list = posts.slice(0, PAGE_SIZE);
  const [top, ...rest] = list;
  const link = (p: number) => `${basePath}?${query ? `q=${encodeURIComponent(query)}&` : ""}pagina=${p}`;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        <header className="mb-8 border-b-2 border-ink pb-4">
          <p className="kicker">{label}</p>
          <h1 className="font-display mt-1 text-4xl font-extrabold leading-tight sm:text-5xl">{title}</h1>
          {description && <p className="mt-2 text-muted">{description}</p>}
        </header>

        {!list.length && <p className="py-12 text-center text-muted">Nenhuma notícia encontrada.</p>}

        {page === 1 && top && (
          <div className="mb-8 border-b border-line pb-8">
            <FeatureCard post={top} size="lg" />
          </div>
        )}
        {(page === 1 ? rest : list).map((p) => (
          <ListItem key={p.id} post={p} />
        ))}

        {(page > 1 || hasNext) && (
          <nav className="mt-8 flex justify-between font-display text-sm font-bold uppercase">
            {page > 1 ? <Link href={link(page - 1)} className="hover:text-brand">← Anteriores</Link> : <span />}
            {hasNext && <Link href={link(page + 1)} className="hover:text-brand">Mais notícias →</Link>}
          </nav>
        )}
      </div>
      <aside className="lg:border-l lg:border-line lg:pl-8">
        <Sidebar />
      </aside>
    </div>
  );
}
