import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  // Disable SW di development — Turbopack tidak support Serwist webpack plugin
  disable: process.env.NODE_ENV !== "production",
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  // Use standalone output only on self-hosted platforms (Railway, Render, VPS)
  // Vercel and Netlify handle bundling themselves
  output: (process.env.VERCEL || process.env.NETLIFY) ? undefined : "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  // Empty turbopack config to suppress webpack/turbopack conflict warning
  // Serwist uses webpack plugin — hanya aktif saat production build
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ik.imagekit.io' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default withSerwist(nextConfig);
