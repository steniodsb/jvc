// Popula o site com o conteúdo da Edição nº 01 (matérias, banners e edição impressa).
// Uso: npm run seed            (opcional: SEED_EDITION_PDF=caminho/do/jornal.pdf)
// Não duplica: matérias existentes (mesmo slug) são ignoradas.
import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { ads, posts } from "./seed-data.mjs";

config({ path: ".env.local" });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const ASSETS = "scripts/seed-assets";
const TYPES = { ".jpg": "image/jpeg", ".png": "image/png", ".pdf": "application/pdf", ".webp": "image/webp" };

const slugify = (t) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);

const uploaded = new Map();
async function upload(file, folder, fullPath) {
  if (uploaded.has(file)) return uploaded.get(file);
  const key = `seed/${folder}/${file}`;
  const body = readFileSync(fullPath ?? join(ASSETS, file));
  const { error } = await sb.storage.from("media").upload(key, body, {
    contentType: TYPES[extname(file).toLowerCase()] ?? "application/octet-stream",
    upsert: true,
    cacheControl: "31536000",
  });
  if (error) throw new Error(`${file}: ${error.message}`);
  const url = sb.storage.from("media").getPublicUrl(key).data.publicUrl;
  uploaded.set(file, url);
  return url;
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");

async function toHtml(paragraphs) {
  const out = [];
  for (const p of paragraphs) {
    if (p.startsWith("## ")) out.push(`<h2>${inline(p.slice(3))}</h2>`);
    else if (p.startsWith("> ")) out.push(`<blockquote><p>${inline(p.slice(2))}</p></blockquote>`);
    else if (p.startsWith("[img:")) out.push(`<img src="${await upload(p.slice(5, -1), "materias")}" alt="">`);
    else out.push(`<p>${inline(p)}</p>`);
  }
  return out.join("");
}

const { data: cats, error: catErr } = await sb.from("categories").select("id,slug");
if (catErr) {
  console.error("✖ Banco sem schema. Rode `npm run db:setup` (ou o SQL do supabase/schema.sql) antes.", catErr.message);
  process.exit(1);
}
const { data: cities } = await sb.from("cities").select("id,slug");
const catId = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
const cityId = Object.fromEntries(cities.map((c) => [c.slug, c.id]));

let created = 0;
for (const p of posts) {
  const slug = slugify(p.title);
  const { data: exists } = await sb.from("posts").select("id").eq("slug", slug).maybeSingle();
  if (exists) continue;
  const { error } = await sb.from("posts").insert({
    title: p.title,
    slug,
    kicker: p.kicker ?? null,
    subtitle: p.subtitle ?? null,
    body: await toHtml(p.body),
    type: p.type ?? "noticia",
    category_id: catId[p.category] ?? null,
    city_id: cityId[p.city] ?? null,
    cover_url: p.cover ? await upload(p.cover, "materias") : null,
    cover_caption: p.caption ?? null,
    author_name: p.author ?? null,
    author_role: p.authorRole ?? null,
    highlight: p.highlight ?? null,
    status: "published",
    published_at: new Date(p.date).toISOString(),
    views: Math.floor(Math.random() * 400) + 20,
  });
  if (error) console.error("✖", p.title, error.message);
  else created++;
}
console.log(`✔ ${created} matérias criadas`);

const { count: adCount } = await sb.from("ads").select("id", { count: "exact", head: true });
if (!adCount) {
  for (const a of ads) {
    const { error } = await sb.from("ads").insert({
      title: a.title,
      advertiser: a.advertiser,
      image_url: await upload(a.image, "banners"),
      link_url: a.link,
      position: a.position,
      active: true,
    });
    if (error) console.error("✖ banner", a.title, error.message);
  }
  console.log(`✔ ${ads.length} banners criados`);
}

const pdf = process.env.SEED_EDITION_PDF;
const { count: edCount } = await sb.from("editions").select("id", { count: "exact", head: true });
if (!edCount && pdf && existsSync(pdf)) {
  const { error } = await sb.from("editions").insert({
    number: 1,
    date: "2026-09-10",
    title: "Edição de lançamento",
    cover_url: await upload("edicao-01-capa.jpg", "edicoes"),
    pdf_url: await upload("jcv-edicao-01.pdf", "edicoes", pdf),
    published: true,
  });
  console.log(error ? `✖ edição: ${error.message}` : "✔ Edição nº 01 publicada");
}
