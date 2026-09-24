import PageHeader from "@/components/admin/PageHeader";
import { ConfirmSubmit, SubmitButton } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import type { Category, City } from "@/lib/types";
import { deleteCategory, deleteCity, saveCategory, saveCity } from "./actions";

export const metadata = { title: "Editorias e cidades" };

export default async function TaxonomyPage() {
  const { supabase, profile } = await requireStaff();
  const canEdit = profile.role !== "redator";
  const [{ data: cats }, { data: cits }] = await Promise.all([
    supabase.from("categories").select("*").order("sort").order("name"),
    supabase.from("cities").select("*").order("name"),
  ]);
  const categories = (cats ?? []) as Category[];
  const cities = (cits ?? []) as City[];

  return (
    <>
      <PageHeader title="Editorias e cidades" description="Organize as matérias e o menu do site" />
      {!canEdit && <p className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">Somente editores e administradores podem alterar esta lista.</p>}

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="card">
          <h2 className="font-display text-lg font-bold">Editorias</h2>
          <p className="mb-4 text-sm text-muted">A ordem define a posição no menu. Desmarque “menu” para esconder do cabeçalho.</p>
          <div className="mb-2 hidden grid-cols-[1fr_1fr_60px_56px_auto] gap-2 px-1 text-xs font-semibold uppercase text-muted sm:grid">
            <span>Nome</span><span>Endereço</span><span>Ordem</span><span>Menu</span><span />
          </div>
          <div className="space-y-2">
            {categories.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-2 sm:grid sm:grid-cols-[1fr_1fr_60px_56px_auto]">
                <form id={`cat-${c.id}`} action={saveCategory} className="contents">
                  <input type="hidden" name="id" value={c.id} />
                  <input name="name" defaultValue={c.name} className="input" disabled={!canEdit} />
                  <input name="slug" defaultValue={c.slug} className="input text-muted" disabled={!canEdit} />
                  <input name="sort" type="number" defaultValue={c.sort} className="input" disabled={!canEdit} />
                  <label className="flex justify-center"><input type="checkbox" name="show_in_nav" defaultChecked={c.show_in_nav} className="size-4" disabled={!canEdit} /></label>
                </form>
                {canEdit && (
                  <div className="flex gap-1">
                    <button form={`cat-${c.id}`} className="btn px-3">Salvar</button>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={c.id} />
                      <ConfirmSubmit message={`Excluir a editoria "${c.name}"? As matérias ficam sem editoria.`} className="btn-danger px-3">×</ConfirmSubmit>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
          {canEdit && (
            <form action={saveCategory} className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5">
              <input name="name" placeholder="Nova editoria" required className="input flex-1" />
              <input name="sort" type="number" placeholder="Ordem" defaultValue={categories.length + 1} className="input w-24" />
              <input type="hidden" name="show_in_nav" value="on" />
              <SubmitButton pendingText="…">Adicionar</SubmitButton>
            </form>
          )}
        </section>

        <section className="card">
          <h2 className="font-display text-lg font-bold">Cidades</h2>
          <p className="mb-4 text-sm text-muted">Cada cidade ganha uma página própria no site.</p>
          <div className="space-y-2">
            {cities.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <form action={saveCity} className="flex flex-1 gap-2">
                  <input type="hidden" name="id" value={c.id} />
                  <input name="name" defaultValue={c.name} className="input" disabled={!canEdit} />
                  {canEdit && <button className="btn px-3">Salvar</button>}
                </form>
                {canEdit && (
                  <form action={deleteCity}>
                    <input type="hidden" name="id" value={c.id} />
                    <ConfirmSubmit message={`Excluir a cidade "${c.name}"?`} className="btn-danger px-3">×</ConfirmSubmit>
                  </form>
                )}
              </div>
            ))}
          </div>
          {canEdit && (
            <form action={saveCity} className="mt-5 flex gap-2 border-t border-line pt-5">
              <input name="name" placeholder="Nova cidade" required className="input flex-1" />
              <SubmitButton pendingText="…">Adicionar</SubmitButton>
            </form>
          )}
        </section>
      </div>
    </>
  );
}
