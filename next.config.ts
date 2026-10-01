import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/analysts", destination: "https://bank-troof.vercel.app", permanent: true },
      { source: "/fintwit", destination: "https://fintwittruth.vercel.app", permanent: true },
      { source: "/gcbot", destination: "https://charoofbot.vercel.app", permanent: true },
      { source: "/sign-in", destination: "/", permanent: true },
      { source: "/gc-scale", destination: "/method#gc-scale", permanent: true },
      { source: "/methodology", destination: "/method", permanent: true },
      { source: "/sports", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
