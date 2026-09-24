import type { Metadata } from "next";
import Listing from "@/components/site/Listing";
import { searchPosts } from "@/lib/queries";

export const metadata: Metadata = { title: "Busca", robots: { index: false } };

export default async function SearchPage({ searchParams }: PageProps<"/busca">) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  const posts = q ? await searchPosts(q, 40) : [];
  return (
    <>
      <form action="/busca" className="mb-8 flex max-w-xl border-2 border-ink">
        <input name="q" defaultValue={q} placeholder="O que você procura?" className="w-full px-4 py-3 outline-none" autoFocus={!q} />
        <button className="bg-ink px-5 font-display text-sm font-bold uppercase text-white">Buscar</button>
      </form>
      <Listing
        label="Busca"
        title={q ? `“${q}”` : "Buscar notícias"}
        description={q ? `${posts.length} resultado(s)` : undefined}
        posts={posts}
        page={1}
        basePath="/busca"
        query={q}
      />
    </>
  );
}
