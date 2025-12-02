import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization for better performance and SEO
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "siviacademy.in",
      },
      {
        protocol: "https",
        hostname: "pub-63e69ca1de6e40e8ac9e052c56572c79.r2.dev",
      },
      {
        protocol: "https",
        hostname: "pub-82455a256b68c851b86573264e0f88cd.r2.dev",
      },
    ],
  },

  // Security and SEO headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Security headers
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Cache static assets for better performance
        source: "/(.*)\\.(ico|png|jpg|jpeg|svg|webp|avif|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
