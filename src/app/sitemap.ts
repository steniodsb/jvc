import type { MetadataRoute } from "next";
import { getCategories, getCities, getSitemapPosts } from "@/lib/queries";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, cats, cities] = await Promise.all([getSitemapPosts(), getCategories(), getCities()]);
  return [
    { url: SITE.url, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE.url}/edicoes`, changeFrequency: "weekly" },
    ...cats.map((c) => ({ url: `${SITE.url}/editoria/${c.slug}`, changeFrequency: "daily" as const })),
    ...cities.map((c) => ({ url: `${SITE.url}/cidade/${c.slug}`, changeFrequency: "daily" as const })),
    ...posts.map((p) => ({ url: `${SITE.url}/noticia/${p.slug}`, lastModified: p.updated_at })),
  ];
}
