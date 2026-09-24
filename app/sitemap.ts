import type { MetadataRoute } from "next";

const origin = "https://charoof.vercel.app";

const routes = [
  "/",
  "/analysts",
  "/contact",
  "/disclaimer",
  "/fintwit",
  "/gc-scale",
  "/gcbot",
  "/method",
  "/sports",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: path === "/" ? origin : `${origin}${path}`,
  }));
}
