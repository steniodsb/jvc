-- =====================================================================
-- Jornal Cidades do Vale — schema do banco (Supabase / Postgres)
-- Idempotente: pode ser executado mais de uma vez.
-- Rode no SQL Editor do Supabase ou com `npm run db:setup`.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Perfis da equipe (vinculados ao auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  email       text,
  role        text check (role in ('admin', 'editor', 'redator')),
  created_at  timestamptz not null default now()
);

-- Quem tem papel definido faz parte da equipe
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role is not null);
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Cria o perfil ao cadastrar usuário. O primeiro usuário vira admin.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    case
      when not exists (select 1 from public.profiles where role = 'admin') then 'admin'
      else nullif(new.raw_user_meta_data->>'role', '')
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Editorias e cidades
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  sort        int not null default 0,
  show_in_nav boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.cities (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Matérias
-- ---------------------------------------------------------------------
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  kicker          text,                         -- chapéu ("| PEDRO DE TOLEDO"); se vazio usa editoria/cidade
  subtitle        text,                         -- linha fina
  body            text not null default '',     -- HTML do editor
  type            text not null default 'noticia'
                  check (type in ('noticia', 'editorial', 'artigo', 'nota')),
  category_id     uuid references public.categories(id) on delete set null,
  city_id         uuid references public.cities(id) on delete set null,
  cover_url       text,
  cover_caption   text,
  author_name     text,
  author_role     text,
  status          text not null default 'draft' check (status in ('draft', 'published')),
  published_at    timestamptz,
  highlight       text check (highlight in ('manchete', 'destaque', 'secundaria')),
  views           int not null default 0,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists posts_published_idx on public.posts (status, published_at desc);
create index if not exists posts_category_idx on public.posts (category_id, published_at desc);
create index if not exists posts_city_idx on public.posts (city_id, published_at desc);
create index if not exists posts_highlight_idx on public.posts (highlight, published_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Banners publicitários
-- ---------------------------------------------------------------------
create table if not exists public.ads (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  advertiser        text,
  image_url         text not null,
  image_mobile_url  text,
  link_url          text,
  position          text not null
                    check (position in ('topo', 'lateral', 'meio', 'rodape', 'materia')),
  start_at          timestamptz,
  end_at            timestamptz,
  active            boolean not null default true,
  weight            int not null default 1,
  impressions       int not null default 0,
  clicks            int not null default 0,
  created_at        timestamptz not null default now()
);

create index if not exists ads_position_idx on public.ads (position, active);

-- ---------------------------------------------------------------------
-- Edições impressas (PDF)
-- ---------------------------------------------------------------------
create table if not exists public.editions (
  id          uuid primary key default gen_random_uuid(),
  number      int not null unique,
  date        date not null,
  title       text,
  cover_url   text,
  pdf_url     text not null,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Contadores (chamados pelo site público)
-- ---------------------------------------------------------------------
create or replace function public.increment_post_view(p_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.posts set views = views + 1
  where id = p_id and status = 'published';
$$;

create or replace function public.register_ad_click(a_id uuid)
returns text language sql security definer set search_path = public as $$
  update public.ads set clicks = clicks + 1 where id = a_id returning link_url;
$$;

create or replace function public.register_ad_impressions(ids uuid[])
returns void language sql security definer set search_path = public as $$
  update public.ads set impressions = impressions + 1 where id = any(ids);
$$;

revoke all on function public.increment_post_view(uuid) from public;
revoke all on function public.register_ad_click(uuid) from public;
revoke all on function public.register_ad_impressions(uuid[]) from public;
grant execute on function public.increment_post_view(uuid) to anon, authenticated;
grant execute on function public.register_ad_click(uuid) to anon, authenticated;
grant execute on function public.register_ad_impressions(uuid[]) to anon, authenticated;

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.cities     enable row level security;
alter table public.posts      enable row level security;
alter table public.ads        enable row level security;
alter table public.editions   enable row level security;

-- profiles
drop policy if exists "profiles: próprio ou equipe lê" on public.profiles;
create policy "profiles: próprio ou equipe lê" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_staff());
drop policy if exists "profiles: admin gerencia" on public.profiles;
create policy "profiles: admin gerencia" on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- categories / cities: leitura pública, escrita da equipe
drop policy if exists "categories: leitura pública" on public.categories;
create policy "categories: leitura pública" on public.categories for select using (true);
drop policy if exists "categories: equipe escreve" on public.categories;
create policy "categories: equipe escreve" on public.categories
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "cities: leitura pública" on public.cities;
create policy "cities: leitura pública" on public.cities for select using (true);
drop policy if exists "cities: equipe escreve" on public.cities;
create policy "cities: equipe escreve" on public.cities
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- posts: público vê só publicadas (inclui agendamento via published_at)
drop policy if exists "posts: leitura pública" on public.posts;
create policy "posts: leitura pública" on public.posts
  for select using (status = 'published' and published_at <= now());
drop policy if exists "posts: equipe lê tudo" on public.posts;
create policy "posts: equipe lê tudo" on public.posts
  for select to authenticated using (public.is_staff());
drop policy if exists "posts: equipe cria" on public.posts;
create policy "posts: equipe cria" on public.posts
  for insert to authenticated with check (public.is_staff());
drop policy if exists "posts: equipe edita" on public.posts;
create policy "posts: equipe edita" on public.posts
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "posts: editor remove" on public.posts;
create policy "posts: editor remove" on public.posts
  for delete to authenticated using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))
  );

-- ads: público vê só ativos e dentro do período
drop policy if exists "ads: leitura pública" on public.ads;
create policy "ads: leitura pública" on public.ads
  for select using (
    active and (start_at is null or start_at <= now()) and (end_at is null or end_at >= now())
  );
drop policy if exists "ads: equipe gerencia" on public.ads;
create policy "ads: equipe gerencia" on public.ads
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- editions
drop policy if exists "editions: leitura pública" on public.editions;
create policy "editions: leitura pública" on public.editions for select using (published);
drop policy if exists "editions: equipe gerencia" on public.editions;
create policy "editions: equipe gerencia" on public.editions
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------
-- Storage: bucket público "media" (fotos, banners e PDFs)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 52428800)
on conflict (id) do update set public = true, file_size_limit = 52428800;

drop policy if exists "media: equipe envia" on storage.objects;
create policy "media: equipe envia" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_staff());
drop policy if exists "media: equipe atualiza" on storage.objects;
create policy "media: equipe atualiza" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_staff());
drop policy if exists "media: equipe remove" on storage.objects;
create policy "media: equipe remove" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_staff());

-- ---------------------------------------------------------------------
-- Dados iniciais
-- ---------------------------------------------------------------------
insert into public.categories (name, slug, sort) values
  ('Política', 'politica', 1),
  ('Cidades', 'cidades', 2),
  ('Educação', 'educacao', 3),
  ('Estradas', 'estradas', 4),
  ('Meio Ambiente', 'meio-ambiente', 5),
  ('Turismo', 'turismo', 6),
  ('Economia', 'economia', 7),
  ('Eleições 2026', 'eleicoes-2026', 8),
  ('Opinião', 'opiniao', 9)
on conflict (slug) do nothing;

insert into public.cities (name, slug) values
  ('Apiaí', 'apiai'), ('Barra do Turvo', 'barra-do-turvo'), ('Cajati', 'cajati'),
  ('Cananéia', 'cananeia'), ('Eldorado', 'eldorado'), ('Iguape', 'iguape'),
  ('Ilha Comprida', 'ilha-comprida'), ('Iporanga', 'iporanga'), ('Itariri', 'itariri'),
  ('Jacupiranga', 'jacupiranga'), ('Juquiá', 'juquia'), ('Miracatu', 'miracatu'),
  ('Pariquera-Açu', 'pariquera-acu'), ('Pedro de Toledo', 'pedro-de-toledo'),
  ('Registro', 'registro'), ('Sete Barras', 'sete-barras'), ('Tapiraí', 'tapirai'),
  ('Vale do Ribeira', 'vale-do-ribeira')
on conflict (slug) do nothing;
