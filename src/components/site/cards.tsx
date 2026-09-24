import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/types";
import { formatDate, kickerOf, postUrl } from "@/lib/format";

export function Kicker({ post, className = "" }: { post: Post; className?: string }) {
  const k = kickerOf(post);
  if (!k) return null;
  return <p className={`kicker ${className}`}>{k}</p>;
}

/** Cabeçalho de seção com fio, como nas páginas do impresso */
export function SectionHeader({ title, href, tone = "brand" }: { title: string; href?: string; tone?: "brand" | "alert" | "ink" }) {
  const color = tone === "alert" ? "bg-alert" : tone === "ink" ? "bg-ink" : "bg-brand";
  const label = (
    <span className={`${color} inline-block px-3 py-1 font-display text-sm font-extrabold uppercase tracking-wide text-white`}>{title}</span>
  );
  return (
    <div className="mb-5 flex items-center gap-3">
      {href ? <Link href={href} className="hover:opacity-90">{label}</Link> : label}
      <span className="h-px flex-1 bg-ink" />
      {href && (
        <Link href={href} className="font-display text-xs font-bold uppercase text-muted hover:text-brand">
          Ver mais
        </Link>
      )}
    </div>
  );
}

function Cover({ post, sizes, className = "", ratio = "aspect-[3/2]", priority = false }: { post: Post; sizes: string; className?: string; ratio?: string; priority?: boolean }) {
  if (!post.cover_url) return null;
  return (
    <div className={`relative overflow-hidden bg-paper-2 ${ratio} ${className}`}>
      <Image src={post.cover_url} alt={post.cover_caption || post.title} fill sizes={sizes} priority={priority} className="object-cover object-[center_25%] transition duration-500 group-hover:scale-[1.03]" />
    </div>
  );
}

/** Manchete: título enorme à esquerda, foto à direita (como a capa do impresso) */
export function LeadStory({ post }: { post: Post }) {
  return (
    <article className="group grid gap-5 md:grid-cols-[1.25fr_1fr] md:gap-7">
      <div className="flex flex-col justify-center">
        <Kicker post={post} />
        <h2 className="font-display mt-2 text-[2rem] font-extrabold leading-[1.05] text-ink sm:text-[2.6rem] lg:text-[3.1rem]">
          <Link href={postUrl(post)} className="hover:text-brand-dark">{post.title}</Link>
        </h2>
        {post.subtitle && (
          <p className="mt-4 border-t border-line pt-3 text-lg leading-snug text-muted">{post.subtitle}</p>
        )}
      </div>
      <Link href={postUrl(post)} className="block" tabIndex={-1} aria-hidden>
        <Cover post={post} sizes="(max-width: 768px) 100vw, 520px" ratio="aspect-[4/3] md:aspect-[4/5]" priority />
        {post.cover_caption && <p className="mt-1.5 text-xs italic text-muted">{post.cover_caption}</p>}
      </Link>
    </article>
  );
}

/** Card com foto em cima */
export function FeatureCard({ post, size = "md", showSubtitle = true }: { post: Post; size?: "sm" | "md" | "lg"; showSubtitle?: boolean }) {
  const titleCls =
    size === "lg" ? "text-2xl sm:text-[1.9rem] leading-[1.1]" : size === "sm" ? "text-[1.05rem] leading-snug" : "text-xl leading-tight";
  return (
    <article className="group">
      {post.cover_url && (
        <Link href={postUrl(post)} tabIndex={-1} aria-hidden className="mb-3 block">
          <Cover post={post} sizes={size === "lg" ? "(max-width: 768px) 100vw, 700px" : "(max-width: 768px) 100vw, 380px"} />
        </Link>
      )}
      <Kicker post={post} />
      <h3 className={`font-display mt-1 font-bold text-ink ${titleCls}`}>
        <Link href={postUrl(post)} className="hover:text-brand-dark">{post.title}</Link>
      </h3>
      {showSubtitle && post.subtitle && <p className="mt-2 text-[15px] leading-snug text-muted">{post.subtitle}</p>}
    </article>
  );
}

/** Linha de lista: foto pequena à esquerda */
export function ListItem({ post, showDate = true }: { post: Post; showDate?: boolean }) {
  return (
    <article className="group grid grid-cols-[1fr_120px] gap-4 border-b border-line py-5 first:pt-0 sm:grid-cols-[220px_1fr]">
      {post.cover_url ? (
        <Link href={postUrl(post)} tabIndex={-1} aria-hidden className="order-2 sm:order-1">
          <Cover post={post} sizes="(max-width: 640px) 120px, 220px" />
        </Link>
      ) : (
        <div className="order-2 hidden sm:order-1 sm:block" />
      )}
      <div className="order-1 sm:order-2">
        <Kicker post={post} />
        <h3 className="font-display mt-1 text-lg font-bold leading-snug text-ink sm:text-xl">
          <Link href={postUrl(post)} className="hover:text-brand-dark">{post.title}</Link>
        </h3>
        {post.subtitle && <p className="mt-1.5 hidden text-[15px] leading-snug text-muted sm:block">{post.subtitle}</p>}
        {showDate && <p className="mt-2 text-xs text-muted">{formatDate(post.published_at)}</p>}
      </div>
    </article>
  );
}

/** Nota curta estilo "O Vale em Foco" */
export function NoteItem({ post }: { post: Post }) {
  return (
    <article className="group border-t-2 border-ink pt-2">
      <h3 className="font-display text-[13px] font-extrabold uppercase tracking-wide text-ink">
        <Link href={postUrl(post)} className="hover:text-brand-dark">{post.title}</Link>
      </h3>
      {post.subtitle && <p className="mt-1.5 text-[15px] leading-snug text-ink-soft">{post.subtitle}</p>}
    </article>
  );
}

/** Opinião: editorial/artigo com autor */
export function OpinionItem({ post }: { post: Post }) {
  return (
    <article className="group border-b border-line py-4 first:pt-0 last:border-0">
      <p className="kicker">{post.type === "editorial" ? "Editorial" : "Artigo"}</p>
      <h3 className={`font-display mt-1 text-lg font-bold leading-snug text-ink ${post.type === "editorial" ? "italic" : ""}`}>
        <Link href={postUrl(post)} className="hover:text-brand-dark">{post.title}</Link>
      </h3>
      {post.author_name && (
        <p className="mt-1 text-xs text-muted">
          <strong className="text-ink-soft">{post.author_name}</strong>
          {post.author_role ? ` | ${post.author_role}` : ""}
        </p>
      )}
    </article>
  );
}

export function MostRead({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <section>
      <SectionHeader title="Mais lidas" tone="ink" />
      <ol className="space-y-4">
        {posts.map((p, i) => (
          <li key={p.id} className="grid grid-cols-[2rem_1fr] gap-2">
            <span className="font-display text-3xl font-black leading-none text-brand">{i + 1}</span>
            <Link href={postUrl(p)} className="font-display font-bold leading-snug hover:text-brand-dark">{p.title}</Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
