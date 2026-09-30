import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LogoLink } from "./logo-link";

describe("logo link", () => {
  it("points the header mark at the hub", () => {
    const html = renderToStaticMarkup(<LogoLink />);
    assert.match(html, /href="\/"/);
    assert.doesNotMatch(html, /href="\/[^"]/);
    assert.match(html, /aria-label="GradedCalls"/);
    assert.match(html, /alt="GradedCalls"/);
    assert.match(html, /gradedcalls-mark\.png/);
    assert.doesNotMatch(html, /charoof|chad|chud/i);
  });
});
