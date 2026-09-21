import type { MetadataRoute } from "next";

const PATHS = ["", "/methodology", "/family", "/disclaimer", "/terms", "/donate"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return PATHS.map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.6,
  }));
}
