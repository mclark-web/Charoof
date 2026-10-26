import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ANALYSTS_URL,
  BOT_URL,
  DEFAULT_ANALYSTS_URL,
  DEFAULT_BOT_URL,
  DEFAULT_FINTWIT_URL,
  DEFAULT_HUB_URL,
  DEFAULT_SITE_URL,
  FINTWIT_URL,
  HUB_URL,
  SHARE_IMAGE_URL,
  SITE_URL,
  SPORTS_URL,
  pathnameOf,
  sameSite,
  sitePath,
} from "./site-urls";

describe("site urls", () => {
  it("defaults every public origin to gradedcalls.com", () => {
    assert.equal(DEFAULT_SITE_URL, "https://www.gradedcalls.com");
    assert.equal(DEFAULT_HUB_URL, "https://www.gradedcalls.com");
    assert.equal(DEFAULT_ANALYSTS_URL, "https://analysts.gradedcalls.com");
    assert.equal(DEFAULT_FINTWIT_URL, "https://fintwit.gradedcalls.com");
    assert.equal(DEFAULT_BOT_URL, "https://bot.gradedcalls.com");
    assert.equal(SITE_URL, DEFAULT_SITE_URL);
    assert.equal(HUB_URL, DEFAULT_HUB_URL);
    assert.equal(ANALYSTS_URL, DEFAULT_ANALYSTS_URL);
    assert.equal(FINTWIT_URL, DEFAULT_FINTWIT_URL);
    assert.equal(BOT_URL, DEFAULT_BOT_URL);
    assert.equal(SPORTS_URL, "https://www.gradedcalls.com/sports");
    assert.equal(SHARE_IMAGE_URL, "https://www.gradedcalls.com/opengraph-image.png");
    assert.equal(sitePath("/method#gc-scale"), "https://www.gradedcalls.com/method#gc-scale");
    assert.equal(sitePath("/#sectors"), "https://www.gradedcalls.com/#sectors");
    assert.equal(sameSite(SPORTS_URL), true);
    assert.equal(sameSite(ANALYSTS_URL), false);
    assert.equal(pathnameOf(HUB_URL), "/");
    assert.equal(pathnameOf(SPORTS_URL), "/sports");
    assert.equal(pathnameOf(`${SITE_URL}/method#sports-score`), "/method");
    assert.doesNotMatch(
      [SITE_URL, HUB_URL, ANALYSTS_URL, FINTWIT_URL, BOT_URL, SPORTS_URL].join(" "),
      /vercel\.app/i,
    );
  });
});
