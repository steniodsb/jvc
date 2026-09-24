"use client";

import { useActionState, useState } from "react";
import ImageField from "@/components/admin/ImageField";
import RichEditor from "@/components/admin/RichEditor";
import { FormError, SubmitButton } from "@/components/admin/ui";
import { isoToLocalInput } from "@/lib/datetime";
import { slugify } from "@/lib/format";
import { HIGHLIGHTS, POST_TYPES, type Category, type City, type Post } from "@/lib/types";
import { savePost } from "./actions";

export default function PostForm({ post, categories, cities }: { post?: Post; categories: Category[]; cities: City[] }) {
  const [state, action] = useActionState(savePost, undefined);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [type, setType] = useState(post?.type ?? "noticia");
  const isPublished = post?.status === "published";

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="current_status" value={post?.status ?? "draft"} />

      <div className="min-w-0 space-y-5">
        <FormError error={state?.error} />
        <div className="card space-y-4">
          <div>
            <label className="label" htmlFor="kicker">Chapéu</label>
            <input id="kicker" name="kicker" defaultValue={post?.kicker ?? ""} className="input" placeholder="Ex.: PEDRO DE TOLEDO (se vazio, usa a cidade ou a editoria)" />
          </div>
          <div>
            <label className="label" htmlFor="title">Título <span className="text-red-600">*</span></label>
            <textarea
              id="title"
              name="title"
              required
              rows={2}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className="input font-display text-2xl font-extrabold leading-tight"
              placeholder="Manchete da matéria"
            />
            <p className="hint">{title.length} caracteres · ideal até 90 para o Google e WhatsApp</p>
          </div>
          <div>
            <label className="label" htmlFor="subtitle">Linha fina</label>
            <textarea id="subtitle" name="subtitle" rows={2} defaultValue={post?.subtitle ?? ""} className="input text-muted" placeholder="Resumo que aparece abaixo do título" />
          </div>
          <div>
            <label className="label" htmlFor="slug">Endereço (URL)</label>
            <div className="flex items-center rounded-md border border-line bg-paper-2 pl-3 text-sm text-muted focus-within:border-brand">
              /noticia/
              <input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                className="w-full bg-white px-2 py-2 text-ink outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <span className="label">Texto</span>
          <RichEditor name="body" defaultValue={post?.body ?? ""} />
        </div>
      </div>

      <div className="space-y-5">
        <div className="card space-y-3">
          <p className="text-sm">
            Situação:{" "}
            {isPublished ? (
              post && post.published_at && new Date(post.published_at) > new Date() ? (
                <span className="badge bg-amber-100 text-amber-800">Agendada</span>
              ) : (
                <span className="badge bg-green-100 text-green-800">Publicada</span>
              )
            ) : (
              <span className="badge bg-gray-100 text-gray-700">Rascunho</span>
            )}
          </p>
          <div>
            <label className="label" htmlFor="published_at">Data de publicação</label>
            <input id="published_at" name="published_at" type="datetime-local" defaultValue={isoToLocalInput(post?.published_at)} className="input" />
            <p className="hint">Vazio = agora. Data futura = publicação agendada.</p>
          </div>
          <div className="flex flex-col gap-2 pt-1">
            <SubmitButton name="intent" value="publish" pendingText="Publicando…">
              {isPublished ? "Atualizar publicação" : "Publicar"}
            </SubmitButton>
            {!isPublished && (
              <SubmitButton name="intent" value="draft" className="btn">
                Salvar rascunho
              </SubmitButton>
            )}
            {isPublished && (
              <SubmitButton name="intent" value="unpublish" className="btn" pendingText="Aguarde…">
                Despublicar (voltar a rascunho)
              </SubmitButton>
            )}
          </div>
        </div>

        <div className="card space-y-4">
          <div>
            <label className="label" htmlFor="type">Tipo</label>
            <select id="type" name="type" value={type} onChange={(e) => setType(e.target.value as Post["type"])} className="input">
              {Object.entries(POST_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="category_id">Editoria</label>
            <select id="category_id" name="category_id" defaultValue={post?.category_id ?? ""} className="input">
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="city_id">Cidade</label>
            <select id="city_id" name="city_id" defaultValue={post?.city_id ?? ""} className="input">
              <option value="">—</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="highlight">Posição na capa</label>
            <select id="highlight" name="highlight" defaultValue={post?.highlight ?? ""} className="input">
              <option value="">Normal (lista de últimas)</option>
              {Object.entries(HIGHLIGHTS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <p className="hint">A manchete mais recente ocupa o topo da capa.</p>
          </div>
        </div>

        <div className="card space-y-4">
          <ImageField name="cover_url" label="Foto de capa" folder="materias" defaultValue={post?.cover_url} hint="JPG ou PNG. É comprimida automaticamente." />
          <div>
            <label className="label" htmlFor="cover_caption">Legenda / crédito</label>
            <input id="cover_caption" name="cover_caption" defaultValue={post?.cover_caption ?? ""} className="input" placeholder="Ex.: Prefeito em visita às obras. Foto: Divulgação" />
          </div>
        </div>

        <div className="card space-y-4">
          <div>
            <label className="label" htmlFor="author_name">{type === "artigo" || type === "editorial" ? "Autor" : "Assinatura (opcional)"}</label>
            <input id="author_name" name="author_name" defaultValue={post?.author_name ?? ""} className="input" placeholder="Ex.: Wilber Rossini" />
          </div>
          <div>
            <label className="label" htmlFor="author_role">Cargo / descrição</label>
            <input id="author_role" name="author_role" defaultValue={post?.author_role ?? ""} className="input" placeholder="Ex.: Advogado" />
          </div>
        </div>
      </div>
    </form>
  );
}
