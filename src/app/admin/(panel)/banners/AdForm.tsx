"use client";

import { useActionState, useState } from "react";
import ImageField from "@/components/admin/ImageField";
import { FormError, SubmitButton } from "@/components/admin/ui";
import { isoToLocalInput } from "@/lib/datetime";
import { AD_POSITIONS, type Ad, type AdPosition } from "@/lib/types";
import { saveAd } from "./actions";

export default function AdForm({ ad }: { ad?: Ad }) {
  const [state, action] = useActionState(saveAd, undefined);
  const [position, setPosition] = useState<AdPosition>(ad?.position ?? "topo");

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {ad && <input type="hidden" name="id" value={ad.id} />}
      <div className="space-y-5">
        <FormError error={state?.error} />
        <div className="card space-y-4">
          <div>
            <label className="label" htmlFor="title">Nome do banner <span className="text-red-600">*</span></label>
            <input id="title" name="title" required defaultValue={ad?.title ?? ""} className="input" placeholder="Ex.: Campanha GRAACC setembro" />
          </div>
          <div>
            <label className="label" htmlFor="advertiser">Anunciante</label>
            <input id="advertiser" name="advertiser" defaultValue={ad?.advertiser ?? ""} className="input" placeholder="Ex.: Sebrae-SP" />
          </div>
          <div>
            <label className="label" htmlFor="link_url">Link de destino</label>
            <input id="link_url" name="link_url" defaultValue={ad?.link_url ?? ""} className="input" placeholder="https://site-do-anunciante.com.br" />
            <p className="hint">Os cliques são contados antes de redirecionar.</p>
          </div>
        </div>
        <div className="card grid gap-5 md:grid-cols-2">
          <ImageField
            name="image_url"
            label="Imagem (computador)"
            folder="banners"
            defaultValue={ad?.image_url}
            keepFormat
            required
            hint={`Tamanho recomendado: ${AD_POSITIONS[position].size}. GIF animado é aceito.`}
          />
          <ImageField name="image_mobile_url" label="Imagem para celular (opcional)" folder="banners" defaultValue={ad?.image_mobile_url} keepFormat hint="Versão mais alta/quadrada para telas pequenas." />
        </div>
      </div>

      <div className="space-y-5">
        <div className="card space-y-4">
          <div>
            <label className="label" htmlFor="position">Posição no site</label>
            <select id="position" name="position" value={position} onChange={(e) => setPosition(e.target.value as AdPosition)} className="input">
              {Object.entries(AD_POSITIONS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="start_at">Início da veiculação</label>
            <input id="start_at" name="start_at" type="datetime-local" defaultValue={isoToLocalInput(ad?.start_at)} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="end_at">Fim da veiculação</label>
            <input id="end_at" name="end_at" type="datetime-local" defaultValue={isoToLocalInput(ad?.end_at)} className="input" />
            <p className="hint">Vazio = sem data de término.</p>
          </div>
          <div>
            <label className="label" htmlFor="weight">Peso no rodízio (1 a 10)</label>
            <input id="weight" name="weight" type="number" min={1} max={10} defaultValue={ad?.weight ?? 1} className="input" />
            <p className="hint">Com vários banners na mesma posição, peso maior aparece mais vezes.</p>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="active" defaultChecked={ad?.active ?? true} className="size-4 accent-[var(--color-brand)]" />
            Banner ativo
          </label>
          <SubmitButton>{ad ? "Salvar banner" : "Criar banner"}</SubmitButton>
        </div>
      </div>
    </form>
  );
}
