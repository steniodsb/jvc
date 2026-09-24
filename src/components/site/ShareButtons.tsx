"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";
import { FacebookIcon, WhatsappIcon } from "./icons";

export default function ShareButtons({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE.url}${path}`;
  const enc = encodeURIComponent;
  const btn = "flex size-9 items-center justify-center rounded-full border border-line text-ink transition hover:border-ink hover:bg-ink hover:text-white";

  return (
    <div className="flex items-center gap-2">
      <a className={btn} href={`https://wa.me/?text=${enc(`${title} ${url}`)}`} target="_blank" rel="noopener" aria-label="Compartilhar no WhatsApp">
        <WhatsappIcon className="size-4" />
      </a>
      <a className={btn} href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener" aria-label="Compartilhar no Facebook">
        <FacebookIcon className="size-4" />
      </a>
      <a className={btn} href={`https://x.com/intent/post?text=${enc(title)}&url=${enc(url)}`} target="_blank" rel="noopener" aria-label="Compartilhar no X">
        <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden="true">
          <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
        </svg>
      </a>
      <button
        type="button"
        className={`${btn} w-auto px-3 text-xs font-semibold`}
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? "Copiado!" : "Copiar link"}
      </button>
    </div>
  );
}
