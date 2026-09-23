import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clampFill, gradeForFill } from "./grade";

describe("gradeForFill", () => {
  it("treats 0% as empty glass and EXIT LIQUIDITY", () => {
    assert.deepEqual(gradeForFill(0), { key: "exit", name: "EXIT LIQUIDITY" });
    assert.equal(gradeForFill(-4).key, "exit");
  });

  it("keeps the same uppercase labels at the band edges", () => {
    assert.equal(gradeForFill(1).name, "WEAK");
    assert.equal(gradeForFill(40).name, "WEAK");
    assert.equal(gradeForFill(41).name, "PROVISIONAL");
    assert.equal(gradeForFill(64).name, "PROVISIONAL");
    assert.equal(gradeForFill(65).name, "STRONG");
    assert.equal(gradeForFill(100).name, "STRONG");
  });

  it("clamps non-finite and out-of-range fills", () => {
    assert.equal(clampFill(Number.NaN), 0);
    assert.equal(clampFill(140.2), 100);
    assert.equal(gradeForFill(140).key, "strong");
  });
});
