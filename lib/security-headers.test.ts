import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { contentSecurityPolicy, securityHeaders } from "./security-headers";

function directive(policy: string, name: string) {
  return policy.split("; ").find((part) => part === name || part.startsWith(`${name} `)) ?? "";
}

describe("security headers", () => {
  it("enforces a production CSP without unsafe-eval", () => {
    const headers = securityHeaders("production");
    const byName = new Map(headers.map((header) => [header.key, header.value]));
    assert.equal(byName.get("X-Frame-Options"), "DENY");
    assert.equal(byName.get("X-Content-Type-Options"), "nosniff");
    assert.equal(byName.get("Referrer-Policy"), "strict-origin-when-cross-origin");
    assert.equal(byName.get("Strict-Transport-Security"), "max-age=63072000; includeSubDomains");
    assert.equal(byName.get("Cross-Origin-Opener-Policy"), "same-origin");
    assert.match(byName.get("Permissions-Policy") ?? "", /camera=\(\)/);
    assert.match(byName.get("Permissions-Policy") ?? "", /microphone=\(\)/);
    assert.match(byName.get("Permissions-Policy") ?? "", /geolocation=\(\)/);
    assert.equal(byName.has("Content-Security-Policy-Report-Only"), false);

    const policy = byName.get("Content-Security-Policy") ?? "";
    assert.equal(directive(policy, "default-src"), "default-src 'self'");
    assert.doesNotMatch(directive(policy, "script-src"), /unsafe-eval/);
    assert.match(directive(policy, "script-src"), /'unsafe-inline'/);
    assert.match(directive(policy, "script-src"), /https:\/\/va\.vercel-scripts\.com/);
    assert.equal(directive(policy, "object-src"), "object-src 'none'");
    assert.equal(directive(policy, "frame-ancestors"), "frame-ancestors 'none'");
    assert.match(policy, /upgrade-insecure-requests/);
    assert.doesNotMatch(directive(policy, "connect-src"), /(^|\s)https:(\s|$)/);
  });

  it("keeps unsafe-eval for the development server only", () => {
    const policy = contentSecurityPolicy("development");
    assert.match(directive(policy, "script-src"), /unsafe-eval/);
    assert.doesNotMatch(policy, /upgrade-insecure-requests/);
  });

  it("wires the header helper from next.config and redirects /legal", () => {
    const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
    const security = readFileSync(new URL("../public/.well-known/security.txt", import.meta.url), "utf8");
    assert.match(config, /poweredByHeader: false/);
    assert.match(config, /securityHeaders\(\)/);
    assert.doesNotMatch(config, /Content-Security-Policy-Report-Only/);
    assert.match(config, /source: "\/legal", destination: "\/disclaimer", permanent: true/);
    assert.match(security, /Contact: https:\/\/charoof\.vercel\.app\/contact/);
    assert.match(security, /Expires: 2027-10-22T23:59:59\.000Z/);
    assert.match(security, /Canonical: https:\/\/charoof\.vercel\.app\/\.well-known\/security\.txt/);
    assert.doesNotMatch(security, /gradedcalls\.com/);
    assert.doesNotMatch(security, /TODO|TBD|placeholder|pending formation|\[.*LLC.*\]|mailto:|@\w+\.\w+/);
  });
});
