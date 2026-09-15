import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Keep Turbopack inside this monorepo even when a parent directory contains
  // another lockfile. This avoids incorrect workspace-root detection locally.
  turbopack: {
    root: path.resolve(process.cwd(), '../..'),
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: 'cdn.simpleicons.org',
      },
    ],
  },
};

export default nextConfig;
