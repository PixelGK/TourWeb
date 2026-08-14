import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
  typescript: {
    // Local sandbox builds cannot spawn Next's type-check worker. CI and Vercel
    // still type-check by default; this opt-out is used only after `pnpm typecheck`.
    ignoreBuildErrors: process.env.NEXT_SKIP_TYPECHECK === "1",
  },
  experimental: {
    workerThreads: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "imagedelivery.net" },
    ],
  },
};

export default nextConfig;
