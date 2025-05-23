import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['*'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
