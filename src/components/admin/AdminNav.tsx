"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ITEMS = [
  { href: "/admin", label: "Painel", icon: "▦", exact: true },
  { href: "/admin/materias", label: "Matérias", icon: "✎" },
  { href: "/admin/banners", label: "Banners", icon: "▭" },
  { href: "/admin/edicoes", label: "Edições impressas", icon: "▤" },
  { href: "/admin/editorias", label: "Editorias e cidades", icon: "☰" },
];

export default function AdminNav({ isAdmin, name, role, signOut }: { isAdmin: boolean; name: string; role: string; signOut: () => Promise<void> }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const items = isAdmin ? [...ITEMS, { href: "/admin/usuarios", label: "Usuários", icon: "☺" }] : ITEMS;
  const active = (href: string, exact?: boolean) => (exact ? path === href : path.startsWith(href));

  return (
    <>
      <div className="flex items-center justify-between border-b border-white/10 bg-ink px-4 py-3 text-white lg:hidden">
        <span className="font-display font-extrabold">JCV · Painel</span>
        <button onClick={() => setOpen(!open)} className="text-2xl" aria-label="Menu">☰</button>
      </div>
      <aside className={`${open ? "block" : "hidden"} bg-ink text-white lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-60`}>
        <div className="hidden border-b border-white/10 px-5 py-5 lg:block">
          <Link href="/admin" className="font-display text-xl font-extrabold">
            JCV <span className="font-medium text-brand-light">Painel</span>
          </Link>
          <p className="mt-0.5 text-xs text-white/50">Jornal Cidades do Vale</p>
        </div>
        <nav className="space-y-0.5 p-3">
          <Link href="/admin/materias/nova" onClick={() => setOpen(false)} className="mb-3 flex items-center justify-center rounded-md bg-brand px-3 py-2 text-sm font-bold hover:bg-brand-dark">
            + Nova matéria
          </Link>
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                active(i.href, i.exact) ? "bg-white/15 font-semibold" : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="w-4 text-center opacity-70">{i.icon}</span>
              {i.label}
            </Link>
          ))}
          <a href="/" target="_blank" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white">
            <span className="w-4 text-center opacity-70">↗</span>Ver o site
          </a>
        </nav>
        <div className="border-t border-white/10 p-4 text-sm lg:absolute lg:inset-x-0 lg:bottom-0">
          <p className="truncate font-semibold">{name}</p>
          <p className="text-xs text-white/50">{role}</p>
          <form action={signOut}>
            <button className="mt-2 text-xs text-white/70 underline hover:text-white">Sair</button>
          </form>
        </div>
      </aside>
    </>
  );
}
