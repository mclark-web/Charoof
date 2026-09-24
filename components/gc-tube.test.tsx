import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { GcTube, tubeIsUngraded } from "./gc-tube";
import { fintwitCohortRows } from "@/lib/books";
import { sectorByKey } from "@/lib/sectors";

describe("ungraded tubes", () => {
  it("renders 0 graded as Not graded yet, never 0% or EXIT LIQUIDITY", () => {
    const html = renderToStaticMarkup(<GcTube fill={0} ungraded label="GC Scale" />);
    assert.match(html, /Not graded yet/);
    assert.match(html, /aria-label="GC Scale, not graded yet"/);
    assert.match(html, /is-empty/);
    assert.doesNotMatch(html, /EXIT/);
    assert.doesNotMatch(html, /gc-pct/);
    assert.doesNotMatch(html, />0%</);
  });

  it("keeps a graded 0% as empty glass and EXIT LIQUIDITY", () => {
    const html = renderToStaticMarkup(<GcTube fill={0} label="GC Scale" />);
    assert.match(html, /EXIT LIQUIDITY/);
    assert.match(html, /0%/);
    assert.match(html, /empty glass/);
    assert.doesNotMatch(html, /Not graded yet/);
  });

  it("keys the guard on graded === 0, not the sample wording", () => {
    assert.equal(tubeIsUngraded({ graded: 0 }), true);
    assert.equal(tubeIsUngraded({ fill: 0, graded: 4, sample: "Open window" }), false);
    assert.equal(tubeIsUngraded({ fill: 0, sample: "Open window" }), false);
    assert.equal(tubeIsUngraded({ fill: 0, sample: "n = 0" }), false);
  });

  it("treats a seeded weekend with no graded calls as ungraded", () => {
    const doom = fintwitCohortRows().find((row) => row.title === "Weekend doom");
    assert.ok(doom);
    assert.equal(doom.graded, 0);
    assert.equal(doom.fill, 0);
    assert.equal(tubeIsUngraded(doom), true);
    assert.match(doom.detail, /no Monday open/);
    assert.match(doom.detail, /Friday, September 4 close/);
    assert.doesNotMatch(doom.detail, /noon|12:00|4:00|Wednesday/);
  });

  it("keeps a demo of four graded misses on EXIT LIQUIDITY", () => {
    const row = sectorByKey("fintwit").fixtures.find((fixture) => fixture.id === "ft-flat");
    assert.ok(row);
    assert.equal(row.title, "Demo · 4 graded, 0 hit");
    assert.equal(row.fill, 0);
    assert.equal(row.sample, "n = 4");
    assert.equal(tubeIsUngraded({ ...row, graded: 4 }), false);
  });
});
