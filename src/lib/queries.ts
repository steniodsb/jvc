import { cache } from "react";
import { publicClient } from "./supabase/public";
import type { Ad, AdPosition, Category, City, Edition, Post } from "./types";

// Consultas públicas. Falhas (ex.: banco ainda sem schema) retornam vazio
// para o site nunca quebrar.

export const POST_LIST_FIELDS =
  "id,title,slug,kicker,subtitle,type,cover_url,cover_caption,author_name,author_role,published_at,highlight,views,category_id,city_id,category:categories(name,slug),city:cities(name,slug)";

type Q = { data: unknown; error: unknown };
async function safe<T>(p: PromiseLike<Q>, fallback: T): Promise<T> {
  try {
    const { data, error } = await p;
    if (error) {
      console.error("[supabase]", error);
      return fallback;
    }
    return (data as T) ?? fallback;
  } catch (e) {
    console.error("[supabase]", e);
    return fallback;
  }
}

const nowIso = () => new Date().toISOString();

function published() {
  return publicClient()
    .from("posts")
    .select(POST_LIST_FIELDS)
    .eq("status", "published")
    .lte("published_at", nowIso())
    .order("published_at", { ascending: false });
}

export const getCategories = cache(() =>
  safe<Category[]>(publicClient().from("categories").select("*").order("sort").order("name"), []),
);

export const getCities = cache(() =>
  safe<City[]>(publicClient().from("cities").select("id,name,slug").order("name"), []),
);

export function getLatest(limit = 20, opts: { type?: Post["type"]; excludeTypes?: Post["type"][] } = {}) {
  let q = published();
  if (opts.type) q = q.eq("type", opts.type);
  if (opts.excludeTypes?.length) q = q.not("type", "in", `(${opts.excludeTypes.join(",")})`);
  return safe<Post[]>(q.limit(limit), []);
}

export function getByHighlight(h: Post["highlight"], limit: number) {
  return safe<Post[]>(published().eq("highlight", h!).limit(limit), []);
}

export function getByCategory(categoryId: string, limit = 30, offset = 0) {
  return safe<Post[]>(published().eq("category_id", categoryId).range(offset, offset + limit - 1), []);
}

export function getByCity(cityId: string, limit = 30, offset = 0) {
  return safe<Post[]>(published().eq("city_id", cityId).range(offset, offset + limit - 1), []);
}

export function getMostRead(limit = 5) {
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  return safe<Post[]>(
    publicClient()
      .from("posts")
      .select(POST_LIST_FIELDS)
      .eq("status", "published")
      .lte("published_at", nowIso())
      .gte("published_at", since)
      .neq("type", "nota")
      .order("views", { ascending: false })
      .limit(limit),
    [],
  );
}

export const getPostBySlug = cache((slug: string) =>
  safe<Post | null>(
    publicClient()
      .from("posts")
      .select("*,category:categories(name,slug),city:cities(name,slug)")
      .eq("slug", slug)
      .eq("status", "published")
      .lte("published_at", nowIso())
      .maybeSingle(),
    null,
  ),
);

export function searchPosts(term: string, limit = 40) {
  const t = term.replace(/[%,()]/g, " ").trim();
  if (!t) return Promise.resolve([] as Post[]);
  return safe<Post[]>(published().or(`title.ilike.%${t}%,subtitle.ilike.%${t}%,body.ilike.%${t}%`).limit(limit), []);
}

export async function getAds(position: AdPosition) {
  return safe<Ad[]>(
    publicClient()
      .from("ads")
      .select("id,title,advertiser,image_url,image_mobile_url,link_url,position,weight")
      .eq("position", position),
    [],
  );
}

/** Sorteio ponderado pelo peso do banner */
export function pickAd(ads: Ad[]): Ad | null {
  if (!ads.length) return null;
  const total = ads.reduce((s, a) => s + Math.max(1, a.weight), 0);
  let r = Math.random() * total;
  for (const a of ads) {
    r -= Math.max(1, a.weight);
    if (r <= 0) return a;
  }
  return ads[0];
}

export const getEditions = cache(() =>
  safe<Edition[]>(publicClient().from("editions").select("*").order("number", { ascending: false }), []),
);

export async function getSitemapPosts() {
  return safe<{ slug: string; updated_at: string }[]>(
    publicClient()
      .from("posts")
      .select("slug,updated_at")
      .eq("status", "published")
      .lte("published_at", nowIso())
      .order("published_at", { ascending: false })
      .limit(5000),
    [],
  );
}
