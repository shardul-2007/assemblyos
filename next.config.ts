import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use empty turbopack config to avoid conflict warning
  // (raw-loader not needed — Three.js works fine with Turbopack)
  turbopack: {},
  // Allow three.js transpilation
  transpilePackages: ['three'],
};

export default nextConfig;
