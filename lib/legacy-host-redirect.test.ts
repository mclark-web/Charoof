import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { IncomingMessage } from "node:http";
import { describe, it } from "node:test";
import type { Redirect } from "next/dist/lib/load-custom-routes";
import { getRedirectStatus, modifyRouteRegex } from "next/dist/lib/redirect-status";
import type { BaseNextRequest } from "next/dist/server/base-http";
import type { Params } from "next/dist/server/request/params";
import { stringifyQuery } from "next/dist/server/server-route-utils";
import { normalizeRepeatedSlashes } from "next/dist/shared/lib/utils";
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match";
import { matchHas, prepareDestination } from "next/dist/shared/lib/router/utils/prepare-destination";
import nextConfig from "../next.config";
import { HUB_URL } from "./site-urls";

const suffix = ["vercel", "app"].join(".");
const legacyHost = ["charoof", suffix].join(".");

/** Same host and path match Next uses for config redirects, then the absolute location. */
function locationFor(
  rule: Redirect,
  host: string,
  pathname: string,
  query: Record<string, string>,
): string | null {
  const match = getPathMatch(rule.source, {
    strict: true,
    removeUnnamedParams: true,
    regexModifier: (regex) => modifyRouteRegex(regex, ["/_next"]),
  });
  const matched = match(pathname);
  if (!matched) return null;
  let params: Params = matched;
  if (rule.has || rule.missing) {
    const hasParams = matchHas({ headers: { host } } as IncomingMessage, query, rule.has, rule.missing);
    if (!hasParams) return null;
    params = { ...params, ...hasParams };
  }
  const { parsedDestination } = prepareDestination({
    appendParamsToQuery: false,
    destination: rule.destination,
    params,
    query,
  });
  const search = stringifyQuery({} as BaseNextRequest, parsedDestination.query);
  const path = normalizeRepeatedSlashes(parsedDestination.pathname);
  return `${parsedDestination.origin ?? ""}${path}${search ? `?${search}` : ""}`;
}

describe("retired production host redirect", () => {
  it("308s that host to the hub with path and query, and ignores preview hosts", async () => {
    const redirects = await nextConfig.redirects!();
    const rules = redirects.filter((rule) =>
      rule.has?.some((item) => item.type === "host" && item.value === legacyHost),
    );
    assert.equal(rules.length, 1);
    const rule = rules[0];
    assert.equal(rule.source, "/:path*");
    assert.equal(rule.destination, `${HUB_URL}/:path*`);
    assert.equal(rule.permanent, true);
    assert.equal(getRedirectStatus(rule), 308);
    assert.notEqual(new URL(HUB_URL).host, legacyHost);

    const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8").split("\n");
    const hasAt = config.findIndex((line) => line.trim() === `has: [{ type: "host", value: "${legacyHost}" }],`);
    assert.equal(config[hasAt - 1]?.trim(), 'source: "/:path*",');
    assert.equal(config[hasAt + 1]?.trim(), "destination: `${HUB_URL}/:path*`,");
    assert.equal(config[hasAt + 2]?.trim(), "permanent: true,");

    const query = { week: "1", ref: "board" };
    const sports = locationFor(rule, legacyHost, "/sports", query);
    assert.equal(sports, `${HUB_URL}/sports?week=1&ref=board`);
    assert.equal(locationFor(rule, legacyHost, "/sports/nfl", { week: "1" }), `${HUB_URL}/sports/nfl?week=1`);
    assert.equal(locationFor(rule, legacyHost, "/", { week: "1" }), `${HUB_URL}?week=1`);

    const landed = new URL(sports ?? "");
    assert.equal(landed.origin, HUB_URL);
    assert.equal(locationFor(rule, landed.host, landed.pathname, query), null);
    assert.equal(
      redirects.some((item) => locationFor(item, landed.host, landed.pathname, query) !== null),
      false,
    );

    const previewHosts = [`charoof-git-some-branch-hoonu.${suffix}`, `charoof-abc123def-hoonu.${suffix}`];
    const newDomainHosts = [new URL(HUB_URL).host, new URL(HUB_URL).host.replace(/^www\./, "")];
    for (const host of [...previewHosts, ...newDomainHosts]) {
      assert.equal(locationFor(rule, host, "/sports", query), null, host);
    }
    for (const host of previewHosts) {
      assert.equal(
        redirects.some((item) => locationFor(item, host, "/sports", query) !== null),
        false,
        host,
      );
    }
  });
});
