import type { Metadata } from "next";
import Image from "next/image";
import { getEditions } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export const revalidate = 300;
export const metadata: Metadata = { title: "Edição impressa", description: "Leia as edições impressas do Jornal Cidades do Vale em PDF." };

export default async function EditionsPage() {
  const editions = await getEditions();
  return (
    <>
      <header className="mb-8 border-b-2 border-ink pb-4">
        <p className="kicker">Acervo</p>
        <h1 className="font-display mt-1 text-4xl font-extrabold sm:text-5xl">Edição impressa</h1>
        <p className="mt-2 text-muted">Todas as edições do jornal para ler online ou baixar em PDF.</p>
      </header>
      {!editions.length && <p className="py-12 text-center text-muted">Nenhuma edição publicada ainda.</p>}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {editions.map((e) => (
          <a key={e.id} href={e.pdf_url} target="_blank" rel="noopener" className="group">
            <div className="relative aspect-[2/3] overflow-hidden border border-line bg-paper-2 shadow-sm transition group-hover:shadow-xl">
              {e.cover_url ? (
                <Image src={e.cover_url} alt={`Capa da edição nº ${e.number}`} fill sizes="(max-width: 640px) 50vw, 240px" className="object-cover object-top" />
              ) : (
                <div className="flex h-full items-center justify-center font-display text-5xl font-black text-line">{e.number}</div>
              )}
            </div>
            <p className="mt-2 font-display font-bold">Edição nº {String(e.number).padStart(2, "0")}</p>
            <p className="text-sm text-muted">{formatDate(e.date + "T12:00:00")}</p>
            {e.title && <p className="text-sm text-ink-soft">{e.title}</p>}
          </a>
        ))}
      </div>
    </>
  );
}
