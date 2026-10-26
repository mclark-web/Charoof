import type { MetadataRoute } from "next";
import { sitePath } from "@/lib/site-urls";

const routes = ["/", "/contact", "/disclaimer", "/method", "/sports", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: sitePath(path),
  }));
}
