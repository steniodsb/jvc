import Image from "next/image";
import Link from "next/link";
import AdSlot from "./AdSlot";
import { MostRead, OpinionItem, SectionHeader } from "./cards";
import { getEditions, getLatest, getMostRead } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export default async function Sidebar({ showOpinion = true }: { showOpinion?: boolean }) {
  const [mostRead, editorials, articles, editions] = await Promise.all([
    getMostRead(5),
    showOpinion ? getLatest(1, { type: "editorial" }) : Promise.resolve([]),
    showOpinion ? getLatest(3, { type: "artigo" }) : Promise.resolve([]),
    getEditions(),
  ]);
  const opinion = [...editorials, ...articles];
  const edition = editions[0];

  return (
    <div className="space-y-10">
      <AdSlot position="lateral" />
      <MostRead posts={mostRead} />
      {opinion.length > 0 && (
        <section>
          <SectionHeader title="Opinião" href="/editoria/opiniao" />
          {opinion.map((p) => (
            <OpinionItem key={p.id} post={p} />
          ))}
        </section>
      )}
      {edition && (
        <section>
          <SectionHeader title="Edição impressa" href="/edicoes" />
          <a href={edition.pdf_url} target="_blank" rel="noopener" className="group block">
            {edition.cover_url && (
              <Image src={edition.cover_url} alt={`Capa da edição nº ${edition.number}`} width={600} height={900} sizes="340px" className="h-auto w-full border border-line shadow-md transition group-hover:shadow-xl" />
            )}
            <p className="mt-2 font-display font-bold">Edição nº {String(edition.number).padStart(2, "0")}</p>
            <p className="text-sm text-muted">{formatDate(edition.date + "T12:00:00")}</p>
          </a>
          <Link href="/edicoes" className="mt-2 inline-block text-sm font-semibold text-brand-dark hover:underline">
            Todas as edições →
          </Link>
        </section>
      )}
      <AdSlot position="lateral" slot={1} />
    </div>
  );
}
