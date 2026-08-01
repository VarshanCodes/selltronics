import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Keep Turbopack inside this monorepo even when a parent directory contains
  // another lockfile. This avoids incorrect workspace-root detection locally.
  turbopack: {
    root: path.resolve(process.cwd(), '../..'),
  },
};

export default nextConfig;
