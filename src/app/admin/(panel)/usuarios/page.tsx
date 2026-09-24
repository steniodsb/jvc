import PageHeader from "@/components/admin/PageHeader";
import { ConfirmSubmit, SubmitButton } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { formatShortDate } from "@/lib/format";
import { ROLES, type Profile } from "@/lib/types";
import NewUserForm from "./NewUserForm";
import { removeUser, resetPassword, updateRole } from "./actions";

export const metadata = { title: "Usuários" };

export default async function UsersPage() {
  const { supabase, user } = await requireStaff(["admin"]);
  const { data } = await supabase.from("profiles").select("*").order("created_at");
  const profiles = (data ?? []) as Profile[];

  return (
    <>
      <PageHeader title="Usuários" description="Quem pode entrar no painel" />
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {profiles.map((p) => {
            const me = p.id === user.id;
            return (
              <div key={p.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {p.name || "—"} {me && <span className="badge ml-1 bg-brand/10 text-brand-dark">você</span>}
                    </p>
                    <p className="text-sm text-muted">{p.email} · desde {formatShortDate(p.created_at)}</p>
                  </div>
                  {me ? (
                    <span className="badge bg-ink text-white">{p.role ? ROLES[p.role] : "Sem acesso"}</span>
                  ) : (
                    <form action={updateRole} className="flex gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <select name="role" defaultValue={p.role ?? ""} className="input w-auto py-1.5">
                        <option value="">Sem acesso</option>
                        {Object.entries(ROLES).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                      <SubmitButton className="btn py-1.5" pendingText="…">Salvar</SubmitButton>
                    </form>
                  )}
                </div>
                {!me && (
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer text-muted hover:text-ink">Mais opções</summary>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <form action={resetPassword} className="flex gap-2">
                        <input type="hidden" name="id" value={p.id} />
                        <input name="password" minLength={8} required placeholder="Nova senha" className="input w-44 py-1.5" />
                        <SubmitButton className="btn py-1.5" pendingText="…">Trocar senha</SubmitButton>
                      </form>
                      <form action={removeUser}>
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmSubmit message={`Remover ${p.email} definitivamente?`} className="btn-danger py-1.5">Remover usuário</ConfirmSubmit>
                      </form>
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
        <NewUserForm />
      </div>
    </>
  );
}
