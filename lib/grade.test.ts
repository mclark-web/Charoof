import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GRADE_BANDS, clampFill, displayFill, displayFillTenths, formatFillTenths, gradeForFill } from "./grade";

describe("gradeForFill", () => {
  it("treats 0% as empty glass and EXIT LIQUIDITY", () => {
    assert.deepEqual(gradeForFill(0), { key: "exit", name: "EXIT LIQUIDITY" });
    assert.equal(gradeForFill(-4).key, "exit");
  });

  it("uses the same uppercase labels at 70 and 40", () => {
    assert.equal(GRADE_BANDS.strongAt, 70);
    assert.equal(GRADE_BANDS.weakAt, 40);
    assert.equal(gradeForFill(1).name, "WEAK");
    assert.equal(gradeForFill(39).name, "WEAK");
    assert.equal(gradeForFill(40).name, "PROVISIONAL");
    assert.equal(gradeForFill(69).name, "PROVISIONAL");
    assert.equal(gradeForFill(69.5).name, "PROVISIONAL");
    assert.equal(gradeForFill(70).name, "STRONG");
    assert.equal(gradeForFill(100).name, "STRONG");
  });

  it("clamps without rounding, and rounds only for display", () => {
    assert.equal(clampFill(Number.NaN), 0);
    assert.equal(clampFill(140.2), 100);
    assert.equal(clampFill(69.5), 69.5);
    assert.equal(clampFill(39.5), 39.5);
    assert.equal(gradeForFill(140).key, "strong");
    assert.equal(gradeForFill(69.5).name, "PROVISIONAL");
    assert.equal(gradeForFill(39.5).name, "WEAK");
    assert.equal(displayFill(69.5), 70);
    assert.equal(displayFill(39.5), 40);
  });

  it("floors capper labels to one decimal without crossing a cutoff", () => {
    assert.equal(displayFillTenths(64.16666666666667), 64.1);
    assert.equal(displayFillTenths(63.75), 63.7);
    assert.equal(formatFillTenths(64.17), "64.1");
    assert.equal(formatFillTenths(63.75), "63.7");
    assert.equal(displayFillTenths(69.95), 69.9);
    assert.equal(displayFillTenths(39.95), 39.9);
    assert.equal(formatFillTenths(69.95), "69.9");
    assert.equal(formatFillTenths(39.95), "39.9");
    assert.equal(gradeForFill(69.95).name, "PROVISIONAL");
    assert.equal(gradeForFill(39.95).name, "WEAK");
    assert.equal(formatFillTenths(70.00000000000001), "70.0");
    assert.equal(formatFillTenths(100), "100.0");
    assert.equal(gradeForFill(70.00000000000001).name, "STRONG");
  });
});
