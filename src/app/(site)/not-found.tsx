import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-24 text-center">
      <p className="kicker">Erro 404</p>
      <h1 className="font-display mt-2 text-4xl font-extrabold">Página não encontrada</h1>
      <p className="mt-4 text-muted">A notícia pode ter sido removida ou o endereço está incorreto.</p>
      <Link href="/" className="mt-6 inline-block bg-brand px-5 py-2.5 font-display text-sm font-bold uppercase text-white hover:bg-brand-dark">
        Voltar para a capa
      </Link>
    </div>
  );
}
