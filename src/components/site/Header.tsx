import Image from "next/image";
import Link from "next/link";
import { SITE, editionYearRoman } from "@/lib/site";
import { getCategories, getCities } from "@/lib/queries";
import { todayLong } from "@/lib/format";
import { FacebookIcon, InstagramIcon, MenuIcon, SearchIcon } from "./icons";

export default async function Header() {
  const [categories, cities] = await Promise.all([getCategories(), getCities()]);
  const nav = categories.filter((c) => c.show_in_nav);

  return (
    <header className="bg-white">
      <div className="h-1.5 bg-brand" />
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-4 md:py-5">
          {/* Esquerda: região e data (desktop) / menu (mobile) */}
          <div className="hidden text-[13px] leading-snug text-muted md:block">
            <p className="font-display font-bold uppercase tracking-wide text-ink">{SITE.region}</p>
            <p className="first-letter:uppercase">{todayLong()}</p>
          </div>
          <details className="relative md:hidden">
            <summary className="flex size-10 cursor-pointer list-none items-center justify-center text-ink [&::-webkit-details-marker]:hidden" aria-label="Abrir menu">
              <MenuIcon />
            </summary>
            <nav className="absolute left-0 top-12 z-50 max-h-[80vh] w-72 overflow-y-auto border border-line bg-white p-4 shadow-xl">
              <form action="/busca" className="mb-4 flex border border-line">
                <input name="q" placeholder="Buscar notícias" className="w-full px-3 py-2 text-sm outline-none" />
                <button className="px-3 text-muted" aria-label="Buscar"><SearchIcon className="size-4" /></button>
              </form>
              <ul className="space-y-2 font-display text-sm font-bold uppercase">
                <li><Link href="/">Capa</Link></li>
                {nav.map((c) => (
                  <li key={c.id}><Link href={`/editoria/${c.slug}`}>{c.name}</Link></li>
                ))}
                <li><Link href="/edicoes">Edição impressa</Link></li>
              </ul>
              <p className="mt-4 border-t border-line pt-3 text-xs font-bold uppercase text-muted">Cidades</p>
              <ul className="mt-2 grid grid-cols-2 gap-1 text-sm">
                {cities.map((c) => (
                  <li key={c.id}><Link href={`/cidade/${c.slug}`}>{c.name}</Link></li>
                ))}
              </ul>
            </nav>
          </details>

          <Link href="/" className="justify-self-center" aria-label={`${SITE.name}: página inicial`}>
            <Image src="/brand/logo-jcv.png" alt={SITE.name} width={1527} height={627} priority className="h-14 w-auto sm:h-20 md:h-24" />
          </Link>

          <div className="flex items-center justify-end gap-3 text-[13px]">
            <div className="hidden text-right leading-snug md:block">
              <p className="font-display font-bold text-ink">Ano {editionYearRoman()}</p>
              <a href={SITE.instagram} target="_blank" rel="noopener" className="text-muted hover:text-ink">{SITE.instagramHandle}</a>
            </div>
            <a href={SITE.facebook} target="_blank" rel="noopener" aria-label="Facebook" className="text-[#1877f2]"><FacebookIcon className="size-6" /></a>
            <a href={SITE.instagram} target="_blank" rel="noopener" aria-label="Instagram" className="text-[#d62976]"><InstagramIcon className="size-6" /></a>
          </div>
        </div>
      </div>

      {/* Editorias */}
      <nav className="border-y-2 border-ink" aria-label="Editorias">
        <div className="mx-auto hidden max-w-[1200px] items-center px-4 md:flex">
          <ul className="flex flex-1 flex-wrap items-center gap-x-4 font-display text-[13px] font-bold uppercase tracking-wide">
            <li><Link href="/" className="block py-2.5 hover:text-brand">Capa</Link></li>
            {nav.map((c) => (
              <li key={c.id}><Link href={`/editoria/${c.slug}`} className="block py-2.5 hover:text-brand">{c.name}</Link></li>
            ))}
            <li className="group relative">
              <button type="button" className="block cursor-default py-2.5 font-bold uppercase group-hover:text-brand">Cidades ▾</button>
              <div className="absolute right-0 top-full z-50 hidden w-[440px] border border-line bg-white p-4 shadow-xl group-focus-within:block group-hover:block">
                <ul className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-[13px] font-semibold normal-case tracking-normal">
                  {cities.map((c) => (
                    <li key={c.id}><Link href={`/cidade/${c.slug}`} className="hover:text-brand">{c.name}</Link></li>
                  ))}
                </ul>
              </div>
            </li>
          </ul>
          <form action="/busca" className="flex items-center border-l border-line pl-3">
            <input name="q" placeholder="Buscar" aria-label="Buscar notícias" className="w-28 bg-transparent py-1 text-sm outline-none transition-all focus:w-44" />
            <button aria-label="Buscar" className="text-muted hover:text-ink"><SearchIcon className="size-4" /></button>
          </form>
        </div>
        <div className="flex gap-5 overflow-x-auto whitespace-nowrap px-4 font-display text-xs font-bold uppercase md:hidden">
          <Link href="/" className="py-2.5">Capa</Link>
          {nav.map((c) => (
            <Link key={c.id} href={`/editoria/${c.slug}`} className="py-2.5">{c.name}</Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
