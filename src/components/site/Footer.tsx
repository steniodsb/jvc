import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { getCategories } from "@/lib/queries";
import { FacebookIcon, InstagramIcon, WhatsappIcon } from "./icons";

export default async function Footer() {
  const categories = await getCategories();
  return (
    <footer className="mt-16 border-t-4 border-brand bg-paper-2">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Image src="/brand/logo-jcv.png" alt={SITE.name} width={1527} height={627} className="h-16 w-auto" />
          <p className="mt-4 max-w-sm text-sm italic leading-relaxed text-ink-soft">{SITE.about}</p>
          <div className="mt-5 flex gap-4">
            <a href={SITE.facebook} target="_blank" rel="noopener" aria-label="Facebook" className="text-ink hover:text-brand"><FacebookIcon /></a>
            <a href={SITE.instagram} target="_blank" rel="noopener" aria-label="Instagram" className="text-ink hover:text-brand"><InstagramIcon /></a>
            <a href={`https://wa.me/55${SITE.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener" aria-label="WhatsApp" className="text-ink hover:text-brand"><WhatsappIcon /></a>
          </div>
        </div>

        <div>
          <h2 className="kicker">Expediente</h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            {SITE.expediente.map(([role, name]) => (
              <div key={role}>
                <dt className="inline text-muted">{role}: </dt>
                <dd className="inline font-display font-semibold uppercase text-ink">{name}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="text-sm">
          <h2 className="kicker">Editorias</h2>
          <ul className="mt-3 grid grid-cols-2 gap-1.5">
            {categories.map((c) => (
              <li key={c.id}><Link href={`/editoria/${c.slug}`} className="hover:text-brand">{c.name}</Link></li>
            ))}
            <li><Link href="/edicoes" className="hover:text-brand">Edição impressa</Link></li>
          </ul>
          <h2 className="kicker mt-6">Contato</h2>
          <p className="mt-2 leading-relaxed text-ink-soft">
            {SITE.email}
            <br />
            {SITE.commercialEmail}
            <br />
            WhatsApp {SITE.whatsapp}
            <br />
            Representante comercial: {SITE.commercialRep}
          </p>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-[1200px] space-y-1 px-4 py-5 text-xs leading-relaxed text-muted">
          <p><strong className="text-ink-soft">Circulação impressa e digital:</strong> {SITE.circulation}</p>
          <p>{SITE.affiliations}</p>
          <p>© {new Date().getFullYear()} {SITE.name}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
