import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['images.unsplash.com'],
    unoptimized: true, // Required for static export
  },
  output: 'export', // Enable static site generation
};

export default nextConfig;
