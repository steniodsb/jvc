export const SITE = {
  name: "Jornal Cidades do Vale",
  short: "JCV",
  region: "Vale do Ribeira",
  description:
    "Notícias de Registro, Pariquera-Açu, Pedro de Toledo, Iguape e de todas as cidades do Vale do Ribeira e Litoral Sul de São Paulo.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  instagram: "https://www.instagram.com/jornalcidadesdovale",
  instagramHandle: "@jornalcidadesdovale",
  facebook: "https://www.facebook.com/jornalcidadesdovale",
  email: "contato@cidadesdovale.com.br",
  commercialEmail: "jornalcidadesdovale@gmail.com",
  whatsapp: "13 99117-7371",
  // Ano I = 2026 (primeira edição impressa: 10/09/2026)
  foundedYear: 2026,
  domain: "www.cidadesdovale.com.br",
  about:
    "O Jornal Cidades do Vale (JCV) é um veículo de comunicação comprometido em fornecer notícias atualizadas e de qualidade sobre a região administrativa do Vale do Ribeira e demais assuntos de interesse público.",
  expediente: [
    ["Diretor-presidente", "André Caldas"],
    ["Diretor de mídias", "Eduardo Guimarães"],
    ["Chefe de reportagem", "Marcos Rogério Soares"],
    ["Redatora", "Mariana Martins"],
    ["Textos", "Flávia Souza"],
    ["Departamento Comercial", "Daniela Maria"],
    ["Produção editorial", "Ronaldo Martins"],
  ] as [string, string][],
  commercialRep: "W/News Comunicação Integrada",
  affiliations:
    "Filiado à Associação Paulista de Jornais (APJ), Adjori-SP, Associação Nacional dos Jornais do Interior do Brasil (ANJIB) e Associação Brasileira de Jornalismo Digital.",
  circulation:
    "Apiaí, Barra do Turvo, Cajati, Cananéia, Eldorado, Iguape, Ilha Comprida, Itariri, Jacupiranga, Juquiá, Miracatu, Pariquera-Açu, Pedro de Toledo, Registro e Sete Barras.",
};

/** "Ano I", "Ano II"… contado a partir do ano de fundação */
export function editionYearRoman(date = new Date()) {
  const n = Math.max(1, date.getFullYear() - SITE.foundedYear + 1);
  const map: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  let r = n;
  for (const [v, s] of map) while (r >= v) { out += s; r -= v; }
  return out;
}
