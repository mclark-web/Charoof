/**
 * Public GradedCalls origins.
 *
 * SITE_URL is this deployment (the Hub and /sports).
 * HUB_URL is the hub home opened by the logo and the Hub nav.
 * The other three are the sibling boards.
 * Apex gradedcalls.com 308-redirects to HUB_URL in next.config.ts.
 * Each value reads its NEXT_PUBLIC_* env var and otherwise uses the gradedcalls.com host.
 */
function publicUrl(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  const chosen = trimmed ? trimmed : fallback;
  return chosen.replace(/\/+$/, "");
}

export const DEFAULT_SITE_URL = "https://www.gradedcalls.com";
export const DEFAULT_HUB_URL = "https://www.gradedcalls.com";
export const DEFAULT_ANALYSTS_URL = "https://analysts.gradedcalls.com";
export const DEFAULT_FINTWIT_URL = "https://fintwit.gradedcalls.com";
export const DEFAULT_BOT_URL = "https://bot.gradedcalls.com";

export const SITE_URL = publicUrl(process.env.NEXT_PUBLIC_SITE_URL, DEFAULT_SITE_URL);
export const HUB_URL = publicUrl(process.env.NEXT_PUBLIC_HUB_URL, DEFAULT_HUB_URL);
export const ANALYSTS_URL = publicUrl(process.env.NEXT_PUBLIC_ANALYSTS_URL, DEFAULT_ANALYSTS_URL);
export const FINTWIT_URL = publicUrl(process.env.NEXT_PUBLIC_FINTWIT_URL, DEFAULT_FINTWIT_URL);
export const BOT_URL = publicUrl(process.env.NEXT_PUBLIC_BOT_URL, DEFAULT_BOT_URL);

/** Absolute URL on this deployment. `sitePath("/")` is SITE_URL. */
export function sitePath(path = "/"): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const suffix = path.startsWith("/") || path.startsWith("#") ? path : `/${path}`;
  if (suffix === "/" || suffix === "") return SITE_URL;
  if (suffix.startsWith("#")) return `${SITE_URL}/${suffix}`;
  return `${SITE_URL}${suffix}`;
}

export const SPORTS_URL = sitePath("/sports");

export function sameSite(href: string, origin = SITE_URL): boolean {
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    return new URL(href).origin === new URL(origin).origin;
  } catch {
    return false;
  }
}

/** Pathname for nav active-state. Hash and query are ignored. */
export function pathnameOf(href: string): string {
  if (href.startsWith("#")) return "/";
  if (href.startsWith("/") && !href.startsWith("//")) return href.split(/[?#]/)[0] || "/";
  try {
    return new URL(href).pathname || "/";
  } catch {
    return href;
  }
}
