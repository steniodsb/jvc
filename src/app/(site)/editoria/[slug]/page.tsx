import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Listing, { PAGE_SIZE } from "@/components/site/Listing";
import { getByCategory, getCategories } from "@/lib/queries";

export async function generateMetadata({ params }: PageProps<"/editoria/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cat = (await getCategories()).find((c) => c.slug === slug);
  return cat ? { title: cat.name, description: `Notícias de ${cat.name} no Vale do Ribeira.` } : {};
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/editoria/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.pagina) || 1);
  const cat = (await getCategories()).find((c) => c.slug === slug);
  if (!cat) notFound();
  const posts = await getByCategory(cat.id, PAGE_SIZE + 1, (page - 1) * PAGE_SIZE);
  return <Listing label="Editoria" title={cat.name} posts={posts} page={page} basePath={`/editoria/${slug}`} />;
}
