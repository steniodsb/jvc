import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sem o otimizador da Vercel (cota paga). As fotos já são comprimidas em WebP no upload do painel.
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
