import type { NextConfig } from "next";
import { securityHeaders } from "./lib/security-headers";
import { ANALYSTS_URL, BOT_URL, FINTWIT_URL, HUB_URL } from "./lib/site-urls";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders(),
      },
    ];
  },
  async redirects() {
    return [
      // Board paths are matched before the apex host rule, so gradedcalls.com/fintwit
      // goes straight to FinTwit. The apex host 308-redirects to the www hub.
      { source: "/analysts", destination: ANALYSTS_URL, permanent: true },
      { source: "/fintwit", destination: FINTWIT_URL, permanent: true },
      { source: "/gcbot", destination: BOT_URL, permanent: true },
      {
        source: "/:path*",
        has: [{ type: "host", value: "gradedcalls.com" }],
        destination: `${HUB_URL}/:path*`,
        permanent: true,
      },
      { source: "/sign-in", destination: "/", permanent: true },
      { source: "/gc-scale", destination: "/method#gc-scale", permanent: true },
      { source: "/methodology", destination: "/method", permanent: true },
      { source: "/legal", destination: "/disclaimer", permanent: true },
    ];
  },
};

export default nextConfig;
