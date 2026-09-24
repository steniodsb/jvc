"use client";

import { useActionState } from "react";
import { FormError, SubmitButton } from "@/components/admin/ui";
import { ROLES } from "@/lib/types";
import { createUser } from "./actions";

export default function NewUserForm() {
  const [state, action] = useActionState(createUser, undefined);
  return (
    <form action={action} className="card space-y-4">
      <h2 className="font-display text-lg font-bold">Adicionar pessoa à equipe</h2>
      <FormError error={state?.error} />
      {state?.ok && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{state.ok}</p>}
      <div>
        <label className="label" htmlFor="u-name">Nome</label>
        <input id="u-name" name="name" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="u-email">E-mail</label>
        <input id="u-email" name="email" type="email" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="u-pass">Senha inicial</label>
        <input id="u-pass" name="password" type="text" minLength={8} required className="input" autoComplete="new-password" />
        <p className="hint">Mínimo 8 caracteres.</p>
      </div>
      <div>
        <label className="label" htmlFor="u-role">Papel</label>
        <select id="u-role" name="role" defaultValue="redator" className="input">
          {Object.entries(ROLES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <ul className="hint mt-2 space-y-0.5">
          <li><strong>Redator:</strong> cria e edita matérias, banners e edições.</li>
          <li><strong>Editor:</strong> também exclui matérias e gerencia editorias.</li>
          <li><strong>Administrador:</strong> tudo, inclusive usuários.</li>
        </ul>
      </div>
      <SubmitButton pendingText="Criando…">Criar usuário</SubmitButton>
    </form>
  );
}
