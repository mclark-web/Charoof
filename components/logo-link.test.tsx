import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LogoLink } from "./logo-link";

describe("logo link", () => {
  it("points the header mark at the hub", () => {
    const html = renderToStaticMarkup(<LogoLink />);
    const anchor = html.match(/<a class="brand"[^>]*>/)?.[0] ?? "";
    assert.match(anchor, /href="\/"/);
    assert.doesNotMatch(anchor, /href="\/[^"]/);
    assert.match(html, /aria-label="GradedCalls"/);
    assert.match(html, /alt="GradedCalls"/);
    assert.match(html, /src="\/gradedcalls-mark\.png"/);
    assert.match(html, /width="44"/);
    assert.match(html, /height="44"/);
    assert.doesNotMatch(html, /background(?:-color)?:\s*#272a/i);
    assert.doesNotMatch(html, /charoof|chad|chud/i);
  });

  it("serves a small transparent mark, not the 1024px tile", () => {
    const png = readFileSync(new URL("../public/gradedcalls-mark.png", import.meta.url));
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    const colorType = png[25];
    assert.equal(width, height);
    assert.ok(width >= 96 && width <= 132);
    assert.equal(colorType, 6);
    assert.ok(png.length < 20_000);
  });
});
