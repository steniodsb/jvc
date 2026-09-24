"use client";

import { useActionState } from "react";
import ImageField from "@/components/admin/ImageField";
import { FormError, SubmitButton } from "@/components/admin/ui";
import type { Edition } from "@/lib/types";
import { saveEdition } from "./actions";

export default function EditionForm({ edition, nextNumber }: { edition?: Edition; nextNumber?: number }) {
  const [state, action] = useActionState(saveEdition, undefined);
  return (
    <form action={action} className="grid max-w-4xl gap-6 md:grid-cols-2">
      {edition && <input type="hidden" name="id" value={edition.id} />}
      <div className="space-y-4 md:col-span-2">
        <FormError error={state?.error} />
      </div>
      <div className="card space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="number">Número <span className="text-red-600">*</span></label>
            <input id="number" name="number" type="number" min={1} required defaultValue={edition?.number ?? nextNumber} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="date">Data <span className="text-red-600">*</span></label>
            <input id="date" name="date" type="date" required defaultValue={edition?.date ?? new Date().toISOString().slice(0, 10)} className="input" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="title">Título / destaque (opcional)</label>
          <input id="title" name="title" defaultValue={edition?.title ?? ""} className="input" placeholder="Ex.: Especial Eleições 2026" />
        </div>
        <ImageField name="pdf_url" label="Arquivo PDF" folder="edicoes" kind="file" accept="application/pdf" defaultValue={edition?.pdf_url} required hint="Até 50 MB." />
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="published" defaultChecked={edition?.published ?? true} className="size-4" />
          Visível no site
        </label>
        <SubmitButton>{edition ? "Salvar edição" : "Publicar edição"}</SubmitButton>
      </div>
      <div className="card">
        <ImageField name="cover_url" label="Capa (imagem da primeira página)" folder="edicoes" defaultValue={edition?.cover_url} hint="Tire um print ou exporte a página 1 do PDF como JPG." />
      </div>
    </form>
  );
}
