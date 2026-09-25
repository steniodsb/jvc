import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/types";
import { kickerOf, postUrl, timeAgo } from "@/lib/format";

export function Chip({ children, tone = "brand" }: { children: React.ReactNode; tone?: "brand" | "alert" | "light" }) {
  const cls =
    tone === "alert" ? "bg-alert text-white" : tone === "light" ? "bg-white/15 text-white backdrop-blur" : "bg-brand text-white";
  return (
    <span className={`inline-block rounded-sm px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-wider ${cls}`}>
      {children}
    </span>
  );
}

const toneOf = (p: Post) => (p.category?.slug?.startsWith("eleic") ? "alert" : "brand");

/** Card com título sobre a foto (degradê escuro) */
export function OverlayCard({ post, size = "lg", priority = false }: { post: Post; size?: "lg" | "md"; priority?: boolean }) {
  const k = kickerOf(post);
  return (
    <Link href={postUrl(post)} className={`group relative block h-full overflow-hidden rounded-lg bg-ink ${size === "lg" ? "min-h-[400px]" : "min-h-[240px]"}`}>
      {post.cover_url && (
        <Image
          src={post.cover_url}
          alt={post.cover_caption || post.title}
          fill
          priority={priority}
          sizes={size === "lg" ? "(max-width: 1024px) 100vw, 800px" : "(max-width: 1024px) 100vw, 400px"}
          className="object-cover object-[center_30%] transition duration-700 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className={`absolute inset-x-0 bottom-0 ${size === "lg" ? "p-5 sm:p-8" : "p-4 sm:p-5"}`}>
        {k && <Chip tone={toneOf(post)}>{k}</Chip>}
        <h2
          className={`font-display mt-3 font-extrabold text-white drop-shadow-sm group-hover:underline decoration-2 underline-offset-4 ${
            size === "lg" ? "text-2xl leading-[1.1] sm:text-4xl lg:text-[2.6rem]" : "text-lg leading-snug sm:text-xl"
          }`}
        >
          {post.title}
        </h2>
        {size === "lg" && post.subtitle && (
          <p className="mt-3 hidden max-w-2xl text-base leading-snug text-white/80 sm:block sm:text-lg">{post.subtitle}</p>
        )}
        <p className="mt-3 text-xs font-medium text-white/60">{timeAgo(post.published_at)}</p>
      </div>
    </Link>
  );
}

/** Card de grade: foto arredondada + chip + título */
export function GridCard({ post }: { post: Post }) {
  const k = kickerOf(post);
  return (
    <article className="group">
      <Link href={postUrl(post)} className="block">
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-paper-2">
          {post.cover_url && (
            <Image src={post.cover_url} alt={post.cover_caption || post.title} fill sizes="(max-width: 640px) 100vw, 300px" className="object-cover object-[center_30%] transition duration-500 group-hover:scale-105" />
          )}
        </div>
        {k && <p className="kicker mt-3">{k}</p>}
        <h3 className="font-display mt-1 text-[1.05rem] font-bold leading-snug text-ink group-hover:text-brand-dark">{post.title}</h3>
        <p className="mt-1.5 text-xs text-muted">{timeAgo(post.published_at)}</p>
      </Link>
    </article>
  );
}

/** Faixa "Últimas" com manchetes rolando */
export function Ticker({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  const items = [...posts, ...posts];
  return (
    <div className="mb-6 flex items-stretch overflow-hidden rounded-md border border-line bg-white">
      <span className="flex shrink-0 items-center gap-2 bg-brand px-3 font-display text-xs font-extrabold uppercase tracking-wider text-white">
        <span className="size-2 animate-pulse rounded-full bg-white" />
        Últimas
      </span>
      <div className="ticker-mask relative flex-1 overflow-hidden">
        <div className="ticker-track flex w-max gap-10 py-2.5 pl-6 hover:[animation-play-state:paused]">
          {items.map((p, i) => (
            <Link key={`${p.id}-${i}`} href={postUrl(p)} className="whitespace-nowrap text-sm font-medium text-ink hover:text-brand-dark" aria-hidden={i >= posts.length}>
              <span className="mr-2 text-brand">●</span>
              {p.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
