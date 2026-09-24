import type { Metadata } from "next";
import { Archivo, Libre_Franklin } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

const head = Archivo({ variable: "--font-head", subsets: ["latin"], weight: ["500", "600", "700", "800", "900"] });
const body = Libre_Franklin({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Notícias do Vale do Ribeira`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: { type: "website", locale: "pt_BR", siteName: SITE.name },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${head.variable} ${body.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
