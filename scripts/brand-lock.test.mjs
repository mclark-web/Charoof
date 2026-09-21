import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const ROOT = new URL("..", import.meta.url).pathname;

const FORBIDDEN = [/banktruth/i, /fintwittruth/i, /bank[_-]troof/i, /mclark/i, /panavid/i];

function filesUnder(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".git") continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) filesUnder(path, acc);
    else if (/\.(tsx?|md|mjs|css|json)$/.test(entry)) acc.push(path);
  }
  return acc;
}

test("public copy uses Charoof Sports and omits retired names", () => {
  const files = filesUnder(ROOT).filter((path) => !path.endsWith("scripts/brand-lock.test.mjs"));
  const offenders = [];
  for (const path of files) {
    const text = readFileSync(path, "utf8");
    for (const pattern of FORBIDDEN) {
      if (pattern.test(text)) offenders.push(`${path} matches ${pattern}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test("brand lock strings are the public names", () => {
  const brand = readFileSync(join(ROOT, "src/lib/brand.ts"), "utf8");
  const readme = readFileSync(join(ROOT, "README.md"), "utf8");
  const home = readFileSync(join(ROOT, "src/app/page.tsx"), "utf8");
  const layout = readFileSync(join(ROOT, "src/app/layout.tsx"), "utf8");
  for (const text of [brand, readme]) {
    assert.match(text, /Charoof Sports/);
    assert.match(text, /Accuracy & Discipline/);
    assert.match(text, /Uncertainty & Doubt/);
  }
  assert.match(brand, /export const UMBRELLA = "Charoof"/);
  assert.match(brand, /export const PRODUCT = "Charoof Sports"/);
  assert.match(brand, /export const NAV_LABEL = "Sports"/);
  assert.match(brand, /label: "Analysts"/);
  assert.match(brand, /label: "FinTwit"/);
  assert.match(brand, /label: NAV_LABEL/);
  assert.match(brand, /Charoof Analysts/);
  assert.match(brand, /Charoof FinTwit/);
  assert.match(brand, /Grades are not for sale/);
  assert.match(readme, /Grades are not for sale/);
  assert.match(home, /No contest results are loaded/);
  assert.match(home, /PRODUCT/);
  assert.match(layout, /applicationName: PRODUCT/);
  assert.doesNotMatch(home, /\b(won|lost|beat)\b/i);
});
