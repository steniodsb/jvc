// Cria tabelas, políticas e bucket no Supabase a partir de supabase/schema.sql.
// Uso: defina DATABASE_URL no .env.local e rode `npm run db:setup`.
import { readFileSync } from "node:fs";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "Defina DATABASE_URL no .env.local (Supabase → Project Settings → Database → Connection string → URI).\n" +
      "Alternativa: cole o conteúdo de supabase/schema.sql no SQL Editor do Supabase.",
  );
  process.exit(1);
}

const sql = postgres(url, { ssl: "require", max: 1 });
try {
  await sql.unsafe(readFileSync("supabase/schema.sql", "utf8"));
  console.log("✔ Schema aplicado com sucesso.");
} catch (e) {
  console.error("✖ Erro ao aplicar schema:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
