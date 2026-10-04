import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rankedEdge, splitCapperPacks, type Rankable } from "./capper-pack";

function row(title: string, fill: number | null, graded90: number): Rankable {
  return { title, fill, graded90 };
}

function rankedRows(count: number): Rankable[] {
  return Array.from({ length: count }, (_, index) => row(`Capper ${String(index).padStart(2, "0")}`, 100 - index, 10 + index));
}

function sizes(count: number) {
  const packs = splitCapperPacks(rankedRows(count));
  return { best: packs.best.length, worst: packs.worst.length, middle: packs.middle.length };
}

describe("splitCapperPacks", () => {
  it("ceilings the 30% bands", () => {
    const expected: Array<[number, { best: number; worst: number; middle: number }]> = [
      [0, { best: 0, worst: 0, middle: 0 }],
      [1, { best: 1, worst: 0, middle: 0 }],
      [2, { best: 1, worst: 1, middle: 0 }],
      [3, { best: 1, worst: 1, middle: 1 }],
      [4, { best: 2, worst: 2, middle: 0 }],
      [5, { best: 2, worst: 2, middle: 1 }],
      [6, { best: 2, worst: 2, middle: 2 }],
      [7, { best: 3, worst: 3, middle: 1 }],
      [10, { best: 3, worst: 3, middle: 4 }],
      [13, { best: 4, worst: 4, middle: 5 }],
      [14, { best: 5, worst: 5, middle: 4 }],
      [15, { best: 5, worst: 5, middle: 5 }],
      [20, { best: 6, worst: 6, middle: 8 }],
      [100, { best: 30, worst: 30, middle: 40 }],
    ];
    for (const [count, pack] of expected) {
      assert.equal(rankedEdge(count), pack.best, `edge ${count}`);
      assert.deepEqual(sizes(count), pack, `sizes ${count}`);
    }
  });

  it("covers an empty book and the one- and two-capper lists", () => {
    assert.deepEqual(sizes(0), { best: 0, worst: 0, middle: 0 });
    const packs0 = splitCapperPacks([]);
    assert.deepEqual(packs0, { best: [], middle: [], worst: [], building: [] });

    const only = splitCapperPacks([row("Only", 55, 12)]);
    assert.deepEqual(only.best.map((item) => item.title), ["Only"]);
    assert.deepEqual(only.middle, []);
    assert.deepEqual(only.worst, []);

    const pair = splitCapperPacks([row("Low", 20, 11), row("High", 80, 11)]);
    assert.deepEqual(pair.best.map((item) => item.title), ["High"]);
    assert.deepEqual(pair.worst.map((item) => item.title), ["Low"]);
    assert.deepEqual(pair.middle, []);
  });

  it("breaks score ties by the larger graded sample, then by name", () => {
    const packs = splitCapperPacks([
      row("Ann", 80, 10),
      row("Cam", 80, 12),
      row("Bea", 80, 12),
      row("Dee", 10, 40),
    ]);
    assert.deepEqual(packs.best.map((item) => item.title), ["Bea", "Cam"]);
    assert.deepEqual(packs.middle.map((item) => item.title), []);
    assert.deepEqual(packs.worst.map((item) => item.title), ["Ann", "Dee"]);
    assert.equal(rankedEdge(4), 2);
  });

  it("keeps a short sample out of best and worst even when the score is extreme", () => {
    const ranked = rankedRows(14);
    const packs = splitCapperPacks([
      ...ranked,
      row("Hot sample", 99, 9),
      row("Cold sample", 0, 9),
      row("No score", null, 40),
    ]);
    assert.deepEqual(sizes(14), { best: 5, worst: 5, middle: 4 });
    assert.equal(packs.best.length, 5);
    assert.equal(packs.worst.length, 5);
    assert.equal(packs.middle.length, 4);
    assert.deepEqual(
      packs.building.map((item) => item.title).sort(),
      ["Cold sample", "Hot sample", "No score"],
    );
    const placed = new Set([...packs.best, ...packs.middle, ...packs.worst].map((item) => item.title));
    assert.equal(placed.has("Hot sample"), false);
    assert.equal(placed.has("Cold sample"), false);
    assert.equal(placed.has("No score"), false);
    assert.equal(packs.best.some((item) => item.graded90 < 10), false);
    assert.equal(packs.worst.some((item) => item.graded90 < 10), false);
  });
});
