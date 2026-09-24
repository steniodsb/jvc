import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdSlot from "@/components/site/AdSlot";
import Sidebar from "@/components/site/Sidebar";
import { FeatureCard, SectionHeader } from "@/components/site/cards";
import ShareButtons from "@/components/site/ShareButtons";
import ViewCounter from "@/components/site/ViewCounter";
import { getByCategory, getPostBySlug } from "@/lib/queries";
import { excerpt, formatDate, kickerOf, readingMinutes } from "@/lib/format";
import { cleanHtml } from "@/lib/sanitize";
import { SITE } from "@/lib/site";

export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/noticia/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Notícia não encontrada" };
  const description = post.subtitle || excerpt(post.body, 160);
  return {
    title: post.title,
    description,
    alternates: { canonical: `/noticia/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `/noticia/${post.slug}`,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      section: post.category?.name,
      images: post.cover_url ? [{ url: post.cover_url }] : [{ url: "/brand/logo-jcv.png" }],
    },
    twitter: { card: "summary_large_image", title: post.title, description },
  };
}

/** Divide o HTML depois do N-ésimo parágrafo para inserir publicidade no meio do texto */
function splitBody(html: string, after = 3): [string, string] {
  const parts = html.split(/(?<=<\/p>)/);
  if (parts.length <= after + 1) return [html, ""];
  return [parts.slice(0, after).join(""), parts.slice(after).join("")];
}

export default async function PostPage({ params }: PageProps<"/noticia/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [first, second] = splitBody(cleanHtml(post.body));
  const related = post.category_id
    ? (await getByCategory(post.category_id, 5)).filter((p) => p.id !== post.id).slice(0, 4)
    : [];
  const isOpinion = post.type === "editorial" || post.type === "artigo";
  const kicker = post.type === "editorial" ? "Editorial" : post.type === "artigo" ? "Artigo" : kickerOf(post);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isOpinion ? "OpinionNewsArticle" : "NewsArticle",
    headline: post.title,
    description: post.subtitle ?? undefined,
    image: post.cover_url ? [post.cover_url] : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: post.author_name ? [{ "@type": "Person", name: post.author_name }] : [{ "@type": "Organization", name: SITE.name }],
    publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.url}/brand/logo-jcv.png` } },
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
      <article className="min-w-0">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <ViewCounter id={post.id} />

        <header className="max-w-[760px]">
          {kicker && (
            <p className="kicker">
              {post.city ? <Link href={`/cidade/${post.city.slug}`}>{kicker}</Link> : post.category ? <Link href={`/editoria/${post.category.slug}`}>{kicker}</Link> : kicker}
            </p>
          )}
          <h1 className={`font-display mt-2 text-[2rem] font-extrabold leading-[1.08] text-ink sm:text-[2.7rem] ${post.type === "editorial" ? "italic" : ""}`}>
            {post.title}
          </h1>
          {post.subtitle && <p className="mt-4 text-xl leading-snug text-muted">{post.subtitle}</p>}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-line py-3">
            <div className="text-sm leading-snug">
              {post.author_name ? (
                <p>
                  Por <strong className="font-display">{post.author_name}</strong>
                  {post.author_role && <span className="text-muted"> | {post.author_role}</span>}
                </p>
              ) : (
                <p>Da redação</p>
              )}
              <p className="text-muted">
                {formatDate(post.published_at, true)} · {readingMinutes(post.body)} min de leitura
              </p>
            </div>
            <ShareButtons title={post.title} path={`/noticia/${post.slug}`} />
          </div>
        </header>

        {post.cover_url && (
          <figure className="mt-6 max-w-[760px]">
            <Image src={post.cover_url} alt={post.cover_caption || post.title} width={1200} height={800} sizes="(max-width: 800px) 100vw, 760px" priority className="max-h-[75vh] w-full bg-paper-2 object-contain" />
            {post.cover_caption && <figcaption className="mt-2 text-sm italic text-muted">{post.cover_caption}</figcaption>}
          </figure>
        )}

        <div className="mt-8 max-w-[760px]">
          <div className="article-body" dangerouslySetInnerHTML={{ __html: first }} />
          {second && (
            <>
              <AdSlot position="materia" className="my-8" />
              <div className="article-body" dangerouslySetInnerHTML={{ __html: second }} />
            </>
          )}
          {!second && <AdSlot position="materia" className="my-8" />}

          <div className="mt-10 flex items-center justify-between border-t-2 border-ink pt-4">
            <span className="font-display text-sm font-bold uppercase">Compartilhe</span>
            <ShareButtons title={post.title} path={`/noticia/${post.slug}`} />
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <SectionHeader title={`Mais de ${post.category?.name ?? "notícias"}`} href={post.category ? `/editoria/${post.category.slug}` : undefined} />
            <div className="grid gap-8 sm:grid-cols-2">
              {related.map((p) => (
                <FeatureCard key={p.id} post={p} size="sm" showSubtitle={false} />
              ))}
            </div>
          </section>
        )}
      </article>
      <aside className="lg:border-l lg:border-line lg:pl-8">
        <Sidebar />
      </aside>
    </div>
  );
}
