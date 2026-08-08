import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
