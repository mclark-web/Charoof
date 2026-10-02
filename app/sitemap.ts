import type { MetadataRoute } from "next";

const origin = "https://charoof.vercel.app";

const routes = ["/", "/contact", "/disclaimer", "/method", "/sports", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: path === "/" ? origin : `${origin}${path}`,
  }));
}
