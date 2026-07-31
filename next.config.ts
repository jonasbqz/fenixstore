import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generar un ID de compilación único basado en timestamp para romper el caché estático en CDNs y navegadores
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  // Inyectar cabeceras estrictas de no-cache en todas las rutas y activos estáticos de Next.js
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Cloudflare-CDN-Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
