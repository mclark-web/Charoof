import assert from "node:assert/strict";
import test from "node:test";
import { badgeFromScore, chadFlags, isChud, markOpen, markPeers } from "../src/lib/scoring.ts";

test("badge runs from 1 through 10", () => {
  assert.equal(badgeFromScore(0), 1);
  assert.equal(badgeFromScore(9), 1);
  assert.equal(badgeFromScore(10), 2);
  assert.equal(badgeFromScore(69), 7);
  assert.equal(badgeFromScore(70), 8);
  assert.equal(badgeFromScore(89), 9);
  assert.equal(badgeFromScore(90), 10);
  assert.equal(badgeFromScore(100), 10);
});

test("Chud is any score under 70", () => {
  assert.equal(isChud(69.99), true);
  assert.equal(isChud(70), false);
});

test("Chad is the top 30 percent, ties included", () => {
  assert.deepEqual(chadFlags([90, 80, 80, 80, 10]), [true, true, true, true, false]);
  assert.deepEqual(chadFlags([]), []);
});

test("Chad and Chud can both show, and the score stays", () => {
  const [top] = markPeers([69, 10, 10]);
  assert.equal(top.chad, true);
  assert.equal(top.chud, true);
  assert.equal(top.score, 69);
  assert.equal(top.badge, 7);
});

test("a missing result stays open", () => {
  const open = markOpen();
  assert.equal(open.status, "open");
  assert.equal(open.score, null);
  assert.equal(open.badge, null);
  assert.equal(open.chad, false);
  assert.equal(open.chud, false);
});
