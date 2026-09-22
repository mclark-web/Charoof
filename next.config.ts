import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  async redirects() {
    return [
      { source: "/leaderboard", destination: "/sports/leaderboard", permanent: true },
      { source: "/methodology", destination: "/sports/methodology", permanent: true },
      { source: "/disclaimer", destination: "/sports/disclaimer", permanent: true },
      { source: "/terms", destination: "/sports/terms", permanent: true },
      { source: "/donate", destination: "/sports/donate", permanent: true },
      { source: "/cappers/:handle", destination: "/sports/cappers/:handle", permanent: true },
      { source: "/picks/:id", destination: "/sports/picks/:id", permanent: true },
    ];
  },
};

export default nextConfig;
