import Image from "next/image";
import { getAds, pickAd } from "@/lib/queries";
import type { AdPosition } from "@/lib/types";
import AdImpression from "./AdImpression";

const SIZES: Record<AdPosition, string> = {
  topo: "(max-width: 1200px) 100vw, 1200px",
  meio: "(max-width: 1200px) 100vw, 1200px",
  rodape: "(max-width: 1200px) 100vw, 1200px",
  lateral: "340px",
  materia: "(max-width: 800px) 100vw, 800px",
};

/** Espaço publicitário: sorteia (por peso) um banner ativo da posição a cada revalidação da página. */
export default async function AdSlot({ position, className = "", slot = 0 }: { position: AdPosition; className?: string; slot?: 0 | 1 }) {
  // Dois espaços da mesma posição na página (slot 0 e 1) nunca mostram o mesmo banner
  const all = await getAds(position);
  const pool = all.length > 1 ? all.filter((_, i) => i % 2 === slot) : slot === 0 ? all : [];
  const ad = pickAd(pool);
  if (!ad) return null;

  const img = (src: string, cls = "") => (
    <Image src={src} alt={ad.advertiser ? `${ad.title} — ${ad.advertiser}` : ad.title} width={1200} height={300} sizes={SIZES[position]} className={`h-auto w-full ${cls}`} />
  );

  const content = ad.image_mobile_url ? (
    <>
      {img(ad.image_mobile_url, "md:hidden")}
      {img(ad.image_url, "hidden md:block")}
    </>
  ) : (
    img(ad.image_url)
  );

  return (
    <aside className={className} aria-label="Publicidade">
      <AdImpression id={ad.id} />
      <p className="mb-1 text-center text-[10px] uppercase tracking-[0.2em] text-muted">Publicidade</p>
      {ad.link_url ? (
        <a href={`/api/ads/${ad.id}`} target="_blank" rel="noopener sponsored" className="block">
          {content}
        </a>
      ) : (
        content
      )}
    </aside>
  );
}
