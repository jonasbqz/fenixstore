import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
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
