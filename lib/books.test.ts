import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  fridayPickRows,
  hubStats,
  publicCapperRows,
  sectorBook,
  verifiedPickRows,
} from "./books";
import { fillForOutcome, hitFill } from "./outcome";

const BANNED = /chad|chud|charoof/i;

function visibleText(value: unknown): string {
  return JSON.stringify(value, (key, item) => (key === "href" || key === "liveHref" ? undefined : item));
}

describe("recovered sports ledger", () => {
  it("maps outcomes onto the hub tube without treating a loss as an empty glass", () => {
    assert.equal(fillForOutcome("win"), 100);
    assert.equal(fillForOutcome("loss"), 28);
    assert.equal(fillForOutcome("push"), 50);
    assert.equal(fillForOutcome("void"), 0);
    assert.equal(fillForOutcome("pending"), 0);
    assert.equal(hitFill(9, 5), 64);
    assert.equal(hitFill(0, 0), 0);
  });

  it("fills the verified lane with the 14 recovered public cards", () => {
    const rows = verifiedPickRows();
    assert.equal(rows.length, 14);
    assert.ok(rows.every((row) => row.lane === "Verified"));
    const titles = rows.map((row) => row.title).join("\n");
    for (const name of ["Jason Logan", "The Commish", "Chris Hatfield", "Todd Cordell", "Chris Bennett", "Rob Paul"]) {
      assert.match(titles, new RegExp(name));
    }
    const steelers = rows.find((row) => row.title.includes("Steelers"));
    assert.equal(steelers?.sample, "Loss");
    assert.equal(steelers?.fill, 28);
    const saints = rows.find((row) => row.detail.includes("Saints"));
    assert.equal(saints?.sample, "Win");
  });

  it("restores the Friday archive, including the void leans", () => {
    const rows = fridayPickRows();
    assert.equal(rows.length, 20);
    const over = rows.find((row) => row.id === "robpaul-cfb-2026-09-18-wake-miami-total");
    assert.equal(over?.sample, "Loss");
    assert.match(over?.detail ?? "", /Miami 33, Wake Forest 20/);
    assert.equal(rows.filter((row) => row.sample === "Void").length, 2);
  });

  it("keeps the joint Bennett / Paul card separate from Rob Paul's Friday card", () => {
    const rows = publicCapperRows();
    assert.ok(rows.some((row) => row.title.includes("Chris Bennett")));
    const rob = rows.find((row) => row.title === "Rob Paul");
    assert.ok(rob);
    assert.equal(rob?.sample, "n = 3");
    const commish = rows.find((row) => row.title === "The Commish");
    assert.ok((commish?.detail.match(/public picks/) ?? []).length >= 0);
    assert.match(commish?.detail ?? "", /public picks/);
  });
});

describe("sector books", () => {
  it("shows verified sports rows before the demo fixtures", () => {
    const book = sectorBook("sports");
    assert.equal(book.sections[0]?.id, "verified-cards");
    assert.equal(book.sections[0]?.rows.length, 14);
    assert.equal(book.sections.at(-1)?.id, "sports-demo");
    assert.ok(book.sections.at(-1)?.rows.every((row) => row.lane === "Demo"));
    assert.equal(book.hero.kind, "tube");
    assert.doesNotMatch(visibleText(book), BANNED);
  });

  it("previews the seeded sibling books and links to the live ledgers", () => {
    const analysts = sectorBook("analysts");
    assert.equal(analysts.sections[0]?.rows.length, 35);
    assert.equal(analysts.liveHref, "https://bank-troof.vercel.app");
    assert.match(analysts.liveLabel ?? "", /Analysts/);
    assert.doesNotMatch(visibleText(analysts), BANNED);

    const fintwit = sectorBook("fintwit");
    assert.equal(fintwit.sections[0]?.rows.length, 19);
    assert.equal(fintwit.liveHref, "https://fintwittruth.vercel.app");
    assert.match(fintwit.sections[0]?.rows[0]?.detail ?? "", /Sunday settle holds/);
    assert.doesNotMatch(visibleText(fintwit), BANNED);

    const bot = sectorBook("gcbot");
    assert.equal(bot.sections[0]?.rows.length, 12);
    assert.equal(bot.sections[0]?.rows[0]?.title, "AI capex supercycle");
    assert.equal(bot.liveLabel, "Open the live GCBot board");
    assert.doesNotMatch(visibleText(bot), BANNED);
    assert.match(bot.liveHref ?? "", /charoofbot\.vercel\.app/);
  });

  it("derives hub counts from the restored books", () => {
    const stats = hubStats();
    assert.equal(stats.sportsCards, 34);
    assert.equal(stats.sportsRecord, "20–12");
    assert.equal(stats.sportsVoids, 2);
    assert.equal(stats.analysts, 35);
    assert.equal(stats.banks, 14);
    assert.equal(stats.fintwitPosts, 95);
    assert.equal(stats.fintwitOpen, 19);
    assert.equal(stats.gcbotPosts, 69);
    assert.equal(stats.gcbotNarratives, 12);
    assert.notEqual(stats.sportsCards, 12480);
  });
});
