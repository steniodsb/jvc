# Jornal Cidades do Vale — site + painel

Portal de notícias do **Jornal Cidades do Vale (JCV)**, com a identidade da edição impressa, e painel administrativo para a redação publicar matérias, fotos, banners publicitários e as edições em PDF.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage) · Tiptap (editor).

## O que tem

**Site público**
- Capa com manchete, destaques, faixa de secundárias, "O Vale em Foco" (notas), últimas notícias, blocos por editoria, mais lidas, opinião e a edição impressa mais recente
- Página da matéria com chapéu, linha fina, autor, foto com legenda, banner no meio do texto, compartilhamento (WhatsApp, Facebook, X, copiar link), relacionadas e contador de visitas
- Páginas por editoria (`/editoria/politica`) e por cidade (`/cidade/registro`), busca (`/busca?q=`) e acervo de edições (`/edicoes`)
- SEO: metadados, Open Graph (prévia com foto no WhatsApp), JSON-LD `NewsArticle`, `sitemap.xml` e `robots.txt`
- Páginas em cache (ISR, 60 s) e revalidação imediata quando algo é publicado no painel

**Painel (`/admin`)**
- Login com e-mail e senha (Supabase Auth); papéis **admin**, **editor** e **redator**
- Matérias: editor visual (intertítulos, citações, listas, links, imagens no texto), foto de capa com compressão automática para WebP, chapéu, linha fina, editoria, cidade, posição na capa, rascunho, publicação agendada e despublicação
- Banners: 5 posições (topo, meio da capa, lateral, dentro das matérias, rodapé), versão para celular, período de veiculação, peso no rodízio, pausar/ativar e relatório de exibições, cliques e CTR
- Edições impressas: upload do PDF e da capa
- Editorias e cidades: criar, renomear, ordenar o menu
- Usuários (só admin): criar, mudar papel, trocar senha, remover
- Painel inicial com números, mais lidas e desempenho dos banners

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com as chaves do Supabase
npm run db:setup             # cria tabelas, políticas e bucket (precisa de DATABASE_URL)
npm run create-admin -- voce@email.com "SenhaForte123" "Seu Nome"
npm run seed                 # opcional: conteúdo de exemplo da Edição nº 01
npm run dev
```

Site em http://localhost:3000 e painel em http://localhost:3000/admin.

> Sem `DATABASE_URL`? Cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) no **SQL Editor** do Supabase. O arquivo é idempotente e pode ser rodado mais de uma vez.

### Variáveis de ambiente

| Variável | Onde achar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | idem (chave `anon`) |
| `SUPABASE_SERVICE_ROLE_KEY` | idem (chave `service_role`). **Nunca exponha no navegador.** Só é usada para gerenciar usuários. |
| `NEXT_PUBLIC_SITE_URL` | domínio final, ex.: `https://www.cidadesdovale.com.br` |
| `DATABASE_URL` | opcional, só para `npm run db:setup` |

## Deploy

**Vercel:** importe o repositório, cadastre as variáveis acima e publique. Nada mais é necessário.

**VPS (Dokploy/PM2):** `npm ci && npm run build && npm start` (porta 3000) atrás do Nginx/Traefik com HTTPS.

## Estrutura

```
src/app/(site)/        site público (capa, notícia, editoria, cidade, busca, edições)
src/app/admin/         painel (login + área protegida em (panel)/)
src/app/api/ads/[id]/  contador de cliques dos banners
src/components/site/   cabeçalho, rodapé, cards, banners
src/components/admin/  editor, upload de imagens, navegação
src/lib/               consultas, tipos, clientes Supabase, formatação
supabase/schema.sql    banco: tabelas, RLS, funções, bucket e dados iniciais
scripts/               setup do banco, criação de admin e conteúdo de exemplo
```

## Segurança

- Todas as tabelas usam **Row Level Security**: o público só lê matérias publicadas (com data já alcançada), banners ativos no período e edições visíveis
- Escrita apenas para quem tem papel na equipe; excluir matérias e mexer em editorias exige editor/admin; usuários só admin
- O HTML das matérias é sanitizado no servidor ao salvar e ao exibir
- O primeiro usuário cadastrado vira admin automaticamente; os seguintes entram sem acesso até um admin liberar
