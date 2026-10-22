export type SecurityHeader = { key: string; value: string };

const ANALYTICS_SCRIPT = "https://va.vercel-scripts.com";
const ANALYTICS_CONNECT = "https://vitals.vercel-insights.com";
const TOOLBAR = "https://vercel.live";

/**
 * Static pages cannot take a per-request nonce without turning off ISR.
 * Next.js still emits inline bootstrap scripts, so production keeps
 * 'unsafe-inline' and leaves 'unsafe-eval' for development only.
 */
export function contentSecurityPolicy(nodeEnv: string | undefined = process.env.NODE_ENV): string {
  const isDev = nodeEnv === "development";
  const scriptSrc = ["'self'", "'unsafe-inline'", ANALYTICS_SCRIPT, TOOLBAR];
  if (isDev) scriptSrc.push("'unsafe-eval'");

  const connectSrc = [
    "'self'",
    ANALYTICS_SCRIPT,
    ANALYTICS_CONNECT,
    TOOLBAR,
    "https://*.pusher.com",
    "wss://*.pusher.com",
  ];

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://vercel.com ${TOOLBAR}`,
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    `frame-src 'self' ${TOOLBAR}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ];
  if (!isDev) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

export function securityHeaders(nodeEnv: string | undefined = process.env.NODE_ENV): SecurityHeader[] {
  return [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Content-Security-Policy", value: contentSecurityPolicy(nodeEnv) },
  ];
}
