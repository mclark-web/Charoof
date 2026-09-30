import assert from "node:assert/strict";
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
});
