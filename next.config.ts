import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Security Headers ────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
        ],
      },
    ];
  },

  // ── Image Optimisation ──────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.pollinations.ai" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // ── Performance & Deployment ────────────────────────────────
  compress: true,
  poweredByHeader: false, // Don't reveal Next.js version
  devIndicators: false,   // Disable floating dev tools that block UI buttons
  output: 'standalone',   // Optimal for Google Cloud Run deployment

  // ── TypeScript strictness in CI ────────────────────────────
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
