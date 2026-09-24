import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Listing, { PAGE_SIZE } from "@/components/site/Listing";
import { getByCity, getCities } from "@/lib/queries";

export async function generateMetadata({ params }: PageProps<"/cidade/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const city = (await getCities()).find((c) => c.slug === slug);
  return city ? { title: city.name, description: `Últimas notícias de ${city.name}.` } : {};
}

export default async function CityPage({ params, searchParams }: PageProps<"/cidade/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.pagina) || 1);
  const city = (await getCities()).find((c) => c.slug === slug);
  if (!city) notFound();
  const posts = await getByCity(city.id, PAGE_SIZE + 1, (page - 1) * PAGE_SIZE);
  return <Listing label="Cidade" title={city.name} posts={posts} page={page} basePath={`/cidade/${slug}`} />;
}
