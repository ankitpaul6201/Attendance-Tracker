import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.BUILD_MODE === 'mobile' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
