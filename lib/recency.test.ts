import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { gradeForFill } from "./grade";
import {
  blendWinRate,
  formatNewYorkDate,
  gradeForBlendedFill,
  gradedPickCount,
  newYorkToday,
  postedDay,
  presentCapper,
  type DatedOutcome,
} from "./recency";

const AS_OF = postedDay("2026-09-24");

function day(iso: string): number {
  return postedDay(iso);
}

function picks(rows: Array<[string, DatedOutcome["outcome"]]>): DatedOutcome[] {
  return rows.map(([iso, outcome]) => ({ at: day(iso), outcome }));
}

describe("blendWinRate", () => {
  it("weights 7, 14, 30, and 90 days at 40/30/20/10", () => {
    const blended = blendWinRate(
      picks([
        ["2026-09-20", "win"],
        ["2026-09-20", "win"],
        ["2026-09-20", "win"],
        ["2026-09-20", "loss"],
        ["2026-09-12", "loss"],
        ["2026-09-12", "loss"],
        ["2026-07-01", "loss"],
        ["2026-07-01", "loss"],
        ["2026-07-01", "loss"],
        ["2026-07-01", "loss"],
        ["2026-07-01", "loss"],
        ["2026-07-01", "loss"],
      ]),
      AS_OF,
    );
    assert.deepEqual(
      blended.windows.map((window) => [window.key, window.weight, window.wins, window.losses]),
      [
        ["1W", 40, 3, 1],
        ["2W", 30, 3, 3],
        ["1M", 20, 3, 3],
        ["3M", 10, 3, 9],
      ],
    );
    assert.equal(blended.label, "1W 3–1 · 2W 3–3 · 1M 3–3 · 3M 3–9");
    assert.equal(blended.fill, 57.5);
    assert.equal(gradeForFill(blended.fill ?? 0).name, "PROVISIONAL");
  });

  it("drops empty windows and renormalizes the remaining weights", () => {
    const blended = blendWinRate(
      picks([
        ["2026-09-10", "win"],
        ["2026-09-10", "win"],
        ["2026-09-10", "loss"],
      ]),
      AS_OF,
    );
    assert.equal(blended.windows[0]?.wins + (blended.windows[0]?.losses ?? 0), 0);
    assert.ok(blended.fill != null && Math.abs(blended.fill - 200 / 3) < 1e-9);
    assert.equal(gradeForFill(blended.fill ?? 0).name, "PROVISIONAL");
    assert.notEqual(blended.fill, 40);
    assert.equal(blended.label, "1W 0–0 · 2W 2–1 · 1M 2–1 · 3M 2–1");
  });

  it("keeps only the 90-day window when the nearer windows are empty", () => {
    const blended = blendWinRate(
      picks([
        ["2026-07-01", "win"],
        ["2026-07-01", "win"],
        ["2026-07-01", "win"],
        ["2026-07-01", "win"],
        ["2026-07-01", "loss"],
      ]),
      AS_OF,
    );
    assert.equal(blended.fill, 80);
    assert.equal(gradeForFill(blended.fill ?? 0).name, "STRONG");
    assert.equal(blended.label, "1W 0–0 · 2W 0–0 · 1M 0–0 · 3M 4–1");
  });

  it("returns no score when every window has zero decided picks", () => {
    const blended = blendWinRate(
      picks([
        ["2026-09-20", "push"],
        ["2026-09-12", "push"],
        ["2026-08-01", "void"],
        ["2026-07-01", "pending"],
      ]),
      AS_OF,
    );
    assert.equal(blended.fill, null);
    assert.equal(gradeForBlendedFill(blended.fill).name, "PROVISIONAL");
    assert.equal(blended.label, "1W 0–0 · 2W 0–0 · 1M 0–0 · 3M 0–0");
  });

  it("leaves pushes out of the win percentage", () => {
    const blended = blendWinRate(
      picks([
        ["2026-09-20", "win"],
        ["2026-09-20", "push"],
        ["2026-09-20", "push"],
      ]),
      AS_OF,
    );
    assert.equal(blended.fill, 100);
    assert.equal(blended.windows[0]?.wins, 1);
    assert.equal(blended.windows[0]?.losses, 0);
  });

  it("includes the cutoff day and excludes the day before it", () => {
    const blended = blendWinRate(
      picks([
        ["2026-09-17", "win"],
        ["2026-09-16", "loss"],
      ]),
      AS_OF,
    );
    assert.equal(AS_OF - day("2026-09-17"), 7);
    assert.equal(blended.label, "1W 1–0 · 2W 1–1 · 1M 1–1 · 3M 1–1");
    assert.equal(blended.fill, 70);
    assert.equal(gradeForFill(blended.fill ?? 0).name, "STRONG");
  });

  it("grades a computed 0% as EXIT LIQUIDITY and a missing score as PROVISIONAL", () => {
    const swept = blendWinRate(picks([["2026-07-01", "loss"]]), AS_OF);
    assert.equal(swept.fill, 0);
    assert.equal(gradeForBlendedFill(swept.fill).name, "EXIT LIQUIDITY");
    assert.equal(gradeForBlendedFill(null).name, "PROVISIONAL");
    assert.equal(gradeForFill(0).name, "EXIT LIQUIDITY");
  });

  it("reads the first posted day and ignores a later update stamp", () => {
    assert.equal(postedDay("2026-09-16 ~ updated 2026-09-20 07:29 ET"), day("2026-09-16"));
    assert.equal(postedDay("2026-09-17 / Covers updated 2026-09-19"), day("2026-09-17"));
    assert.equal(postedDay("2026-09-18T10:00:00.000Z"), day("2026-09-18"));
  });

  it("uses America/New_York calendar days, including around midnight", () => {
    assert.equal(postedDay("2026-09-18T03:30:00.000Z"), day("2026-09-17"));
    assert.equal(postedDay("2026-09-18T04:30:00.000Z"), day("2026-09-18"));
    assert.equal(newYorkToday(new Date("2026-09-24T03:30:00.000Z")), "2026-09-23");
    assert.equal(newYorkToday(new Date("2026-09-24T04:30:00.000Z")), "2026-09-24");
    assert.equal(formatNewYorkDate("2026-09-24"), "September 24, 2026");
  });
});

describe("presentCapper", () => {
  it("keeps a short 90-day sample PROVISIONAL and still shows the percentage", () => {
    const blended = blendWinRate(
      picks([
        ["2026-09-20", "win"],
        ["2026-09-20", "win"],
        ["2026-09-20", "win"],
        ["2026-09-20", "win"],
        ["2026-09-20", "win"],
        ["2026-09-20", "win"],
        ["2026-09-20", "win"],
        ["2026-09-20", "win"],
        ["2026-09-20", "win"],
        ["2026-09-20", "push"],
      ]),
      AS_OF,
    );
    assert.equal(gradedPickCount(blended), 9);
    assert.equal(blended.fill, 100);
    assert.equal(gradeForFill(blended.fill ?? 0).name, "STRONG");
    const presented = presentCapper(blended);
    assert.equal(presented.fill, 100);
    assert.equal(presented.grade.name, "PROVISIONAL");
    assert.equal(
      presented.note,
      "Cappers show PROVISIONAL until they have 10 graded picks in the last 90 days; this overrides every band: STRONG, WEAK, and EXIT LIQUIDITY.",
    );
  });

  it("applies the 70/40 cutoffs once 10 decided picks are in the 90-day window", () => {
    const rows: Array<[string, DatedOutcome["outcome"]]> = [
      ...Array.from({ length: 8 }, () => ["2026-09-20", "win"] as [string, DatedOutcome["outcome"]]),
      ...Array.from({ length: 2 }, () => ["2026-09-20", "loss"] as [string, DatedOutcome["outcome"]]),
    ];
    const blended = blendWinRate(picks(rows), AS_OF);
    assert.equal(gradedPickCount(blended), 10);
    const presented = presentCapper(blended);
    assert.equal(presented.fill, 80);
    assert.equal(presented.grade.name, "STRONG");
    assert.equal(presented.note, null);
  });

  it("lets a full sample of losses stay empty glass and EXIT LIQUIDITY", () => {
    const blended = blendWinRate(
      picks(Array.from({ length: 10 }, () => ["2026-09-20", "loss"] as [string, DatedOutcome["outcome"]])),
      AS_OF,
    );
    const presented = presentCapper(blended);
    assert.equal(presented.fill, 0);
    assert.equal(presented.grade.name, "EXIT LIQUIDITY");
    assert.equal(presented.note, null);
  });

  it("shows no score when the 90-day window has no decided picks", () => {
    const blended = blendWinRate(picks([["2026-09-20", "push"]]), AS_OF);
    const presented = presentCapper(blended);
    assert.equal(presented.fill, null);
    assert.equal(presented.grade.name, "PROVISIONAL");
    assert.equal(presented.note, null);
  });
});
