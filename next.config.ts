import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy-Report-Only",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/analysts", destination: "https://bank-troof.vercel.app", permanent: true },
      { source: "/fintwit", destination: "https://fintwittruth.vercel.app", permanent: true },
      { source: "/gcbot", destination: "https://charoofbot.vercel.app", permanent: true },
      { source: "/sign-in", destination: "/", permanent: true },
      { source: "/gc-scale", destination: "/method#gc-scale", permanent: true },
      { source: "/methodology", destination: "/method", permanent: true },
    ];
  },
};

export default nextConfig;
