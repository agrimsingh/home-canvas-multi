import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizeCss: true,
  },
  // Enable SWC minification for better performance
  swcMinify: true,
};

export default nextConfig;
