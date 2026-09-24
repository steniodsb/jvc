import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const sp = await searchParams;
  const noAccess = sp.erro === "sem-acesso";
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-2 px-4">
      <div className="w-full max-w-sm">
        <div className="border-t-4 border-brand bg-white p-8 shadow-sm">
          <Image src="/brand/logo-jcv.png" alt="Jornal Cidades do Vale" width={1527} height={627} className="mx-auto h-16 w-auto" priority />
          <h1 className="mt-6 text-center font-display text-lg font-bold">Painel da redação</h1>
          {noAccess && (
            <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">
              Sua conta ainda não tem acesso ao painel. Peça a um administrador para liberar.
            </p>
          )}
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-xs text-muted">
          <Link href="/" className="hover:underline">← Voltar para o site</Link>
        </p>
      </div>
    </div>
  );
}
