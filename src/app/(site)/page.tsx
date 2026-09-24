import Link from "next/link";
import AdSlot from "@/components/site/AdSlot";
import Sidebar from "@/components/site/Sidebar";
import { FeatureCard, LeadStory, ListItem, NoteItem, SectionHeader } from "@/components/site/cards";
import { getByCategory, getByHighlight, getCategories, getLatest } from "@/lib/queries";
import type { Post } from "@/lib/types";

export const revalidate = 60;

export default async function Home() {
  const [manchetes, destaques, secundarias, latest, notes, categories] = await Promise.all([
    getByHighlight("manchete", 1),
    getByHighlight("destaque", 4),
    getByHighlight("secundaria", 6),
    getLatest(30, { excludeTypes: ["nota", "editorial", "artigo"] }),
    getLatest(6, { type: "nota" }),
    getCategories(),
  ]);

  const shown = new Set<string>();
  const take = (list: Post[], n: number) => {
    const out: Post[] = [];
    for (const p of list) {
      if (out.length >= n) break;
      if (shown.has(p.id)) continue;
      shown.add(p.id);
      out.push(p);
    }
    return out;
  };

  const lead = take(manchetes.length ? manchetes : latest, 1)[0];
  const features = take([...destaques, ...latest], 3);
  const seconds = take([...secundarias, ...latest], 4);
  const sectionCats = categories.filter((c) => c.show_in_nav && c.slug !== "opiniao");
  const sections = (
    await Promise.all(sectionCats.map(async (c) => ({ cat: c, posts: await getByCategory(c.id, 8) })))
  )
    .map((s) => ({ ...s, posts: s.posts.filter((p) => !shown.has(p.id) && p.type === "noticia").slice(0, 4) }))
    .filter((s) => s.posts.length >= 2);
  sections.forEach((s) => s.posts.forEach((p) => shown.add(p.id)));
  const rest = take(latest, 10);

  if (!lead) return <EmptyState />;

  return (
    <>
      {/* Manchete + destaques */}
      <section className="grid gap-8 border-b-2 border-ink pb-8 lg:grid-cols-[1fr_340px]">
        <LeadStory post={lead} />
        <div className="space-y-6 lg:border-l lg:border-line lg:pl-8">
          {features.slice(0, 1).map((p) => (
            <FeatureCard key={p.id} post={p} />
          ))}
          {features.slice(1).map((p) => (
            <FeatureCard key={p.id} post={{ ...p, cover_url: null }} size="sm" />
          ))}
        </div>
      </section>

      {/* Faixa de secundárias */}
      {seconds.length > 0 && (
        <section className="grid gap-8 border-b border-line py-8 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-line [&>*]:lg:px-5 [&>*:first-child]:lg:pl-0 [&>*:last-child]:lg:pr-0">
          {seconds.map((p) => (
            <FeatureCard key={p.id} post={p} size="sm" showSubtitle={false} />
          ))}
        </section>
      )}

      <AdSlot position="meio" className="my-8" />

      {/* O Vale em Foco */}
      {notes.length > 0 && (
        <section className="my-10 bg-paper-2 px-5 py-7 sm:px-8">
          <div className="mb-6 text-center">
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-brand-dark sm:text-4xl">O Vale em Foco</h2>
            <p className="mt-1 text-sm italic text-muted">As notícias de bastidores do Vale do Ribeira</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((p) => (
              <NoteItem key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      {/* Últimas + lateral */}
      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          {rest.length > 0 && (
            <section>
              <SectionHeader title="Últimas notícias" />
              {rest.map((p) => (
                <ListItem key={p.id} post={p} />
              ))}
            </section>
          )}

          {sections.map(({ cat, posts }) => (
            <section key={cat.id} className="mt-12">
              <SectionHeader title={cat.name} href={`/editoria/${cat.slug}`} tone={cat.slug.startsWith("eleic") ? "alert" : "brand"} />
              <div className="grid gap-8 sm:grid-cols-2">
                {posts.map((p) => (
                  <FeatureCard key={p.id} post={p} size="sm" />
                ))}
              </div>
            </section>
          ))}
        </div>
        <aside className="lg:border-l lg:border-line lg:pl-8">
          <Sidebar />
        </aside>
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-xl py-24 text-center">
      <p className="kicker">Em breve</p>
      <h1 className="font-display mt-2 text-4xl font-extrabold">Nenhuma notícia publicada ainda</h1>
      <p className="mt-4 text-muted">
        Acesse o <Link href="/admin" className="text-brand-dark underline">painel administrativo</Link> para publicar a primeira matéria.
      </p>
    </div>
  );
}
