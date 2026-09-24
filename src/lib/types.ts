export type Role = "admin" | "editor" | "redator";
export type PostType = "noticia" | "editorial" | "artigo" | "nota";
export type Highlight = "manchete" | "destaque" | "secundaria";
export type AdPosition = "topo" | "lateral" | "meio" | "rodape" | "materia";

export interface Category { id: string; name: string; slug: string; sort: number; show_in_nav: boolean }
export interface City { id: string; name: string; slug: string }

export interface Post {
  id: string;
  title: string;
  slug: string;
  kicker: string | null;
  subtitle: string | null;
  body: string;
  type: PostType;
  category_id: string | null;
  city_id: string | null;
  cover_url: string | null;
  cover_caption: string | null;
  author_name: string | null;
  author_role: string | null;
  status: "draft" | "published";
  published_at: string | null;
  highlight: Highlight | null;
  views: number;
  created_at: string;
  updated_at: string;
  category?: Pick<Category, "name" | "slug"> | null;
  city?: Pick<City, "name" | "slug"> | null;
}

export interface Ad {
  id: string;
  title: string;
  advertiser: string | null;
  image_url: string;
  image_mobile_url: string | null;
  link_url: string | null;
  position: AdPosition;
  start_at: string | null;
  end_at: string | null;
  active: boolean;
  weight: number;
  impressions: number;
  clicks: number;
  created_at: string;
}

export interface Edition {
  id: string;
  number: number;
  date: string;
  title: string | null;
  cover_url: string | null;
  pdf_url: string;
  published: boolean;
}

export interface Profile { id: string; name: string; email: string | null; role: Role | null; created_at: string }

export const POST_TYPES: Record<PostType, string> = {
  noticia: "Notícia",
  editorial: "Editorial",
  artigo: "Artigo",
  nota: "Nota (O Vale em Foco)",
};

export const HIGHLIGHTS: Record<Highlight, string> = {
  manchete: "Manchete (topo da capa)",
  destaque: "Destaque",
  secundaria: "Secundária",
};

export const AD_POSITIONS: Record<AdPosition, { label: string; size: string }> = {
  topo: { label: "Topo (abaixo do cabeçalho)", size: "1200 × 150 px" },
  meio: { label: "Meio da capa (faixa larga)", size: "1200 × 250 px" },
  lateral: { label: "Lateral (coluna direita)", size: "300 × 250 ou 300 × 600 px" },
  materia: { label: "Dentro das matérias", size: "728 × 90 ou 800 × 200 px" },
  rodape: { label: "Rodapé (antes do expediente)", size: "1200 × 250 px" },
};

export const ROLES: Record<Role, string> = {
  admin: "Administrador",
  editor: "Editor",
  redator: "Redator",
};
