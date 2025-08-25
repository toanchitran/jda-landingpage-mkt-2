import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize resource loading
  experimental: {
    optimizePackageImports: ['react-icons']
  },
  // Reduce unnecessary preloads
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  }
};

export default nextConfig;
