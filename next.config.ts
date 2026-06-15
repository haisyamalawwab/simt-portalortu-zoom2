import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable standalone output on Vercel or Netlify deployments
  output: (process.env.VERCEL || process.env.NETLIFY) ? undefined : "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ik.imagekit.io' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default nextConfig;
