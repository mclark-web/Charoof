import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  fridayPickRows,
  fintwitCallRows,
  hubStats,
  publicCapperRows,
  sectorBook,
  unconfirmedPickRows,
  verifiedPickRows,
} from "./books";
import { gradeForFill } from "./grade";
import { formatNewYorkDate, newYorkToday } from "./recency";
import { fillForOutcome, hitFill } from "./outcome";

const BANNED = /chad|chud|charoof/i;

function visibleText(value: unknown): string {
  return JSON.stringify(value, (key, item) => (key === "href" || key === "liveHref" ? undefined : item));
}

describe("recovered sports ledger", () => {
  it("does not grade a single pick from the old outcome fill", () => {
    assert.equal(fillForOutcome("win"), 100);
    assert.equal(fillForOutcome("loss"), 28);
    assert.equal(fillForOutcome("push"), 50);
    assert.equal(fillForOutcome("void"), 0);
    assert.equal(fillForOutcome("pending"), 0);
    assert.equal(hitFill(9, 5), (100 * 9) / 14);
    assert.equal(hitFill(0, 0), 0);

    const picks = [...verifiedPickRows(), ...fridayPickRows(), ...fintwitCallRows("2026-09-21")];
    assert.ok(picks.length > 0);
    for (const row of picks) {
      assert.equal(row.fill, null);
      assert.ok(row.result);
      assert.notEqual(row.fill, fillForOutcome("loss"));
    }
  });

  it("fills the verified lane with the timed public cards", () => {
    const rows = verifiedPickRows();
    assert.equal(rows.length, 220);
    assert.ok(rows.every((row) => row.lane === "Verified"));
    const titles = rows.map((row) => row.title).join("\n");
    for (const name of ["Jason Logan", "Chris Hatfield", "Todd Cordell", "Chris Bennett", "Rob Paul", "Quinn Allen"]) {
      assert.match(titles, new RegExp(name));
    }
    assert.doesNotMatch(titles, /The Commish/);
    assert.doesNotMatch(titles, /Real Madrid/);
    const steelers = rows.find((row) => row.detail.includes("Pittsburgh Steelers @ New England Patriots"));
    assert.match(steelers?.detail ?? "", /game September 20, 2026/);
    assert.equal(steelers?.sample, "Loss");
    assert.equal(steelers?.result, "LOSS");
    assert.equal(steelers?.fill, null);
    const chiefs = rows.findIndex(
      (row) => row.title.includes("Kansas City Chiefs −6.5") && row.detail.includes("2026-09-16 09:36 ET"),
    );
    const updatedSteelers = rows.findIndex((row) =>
      row.detail.includes("Pittsburgh Steelers @ New England Patriots"),
    );
    assert.ok(updatedSteelers >= 0 && chiefs > updatedSteelers);
    const saints = rows.find((row) => row.detail.includes("Saints @ Baltimore"));
    assert.equal(saints?.sample, "Win");
    assert.equal(saints?.result, "WIN");
    const bennett = rows.find((row) => row.title.includes("Chris Bennett"));
    assert.equal(bennett?.lane, "Verified");
    assert.match(bennett?.detail ?? "", /2026-09-17/);
  });

  it("holds the four undated Commish cards out of Verified", () => {
    const rows = unconfirmedPickRows();
    assert.equal(rows.length, 4);
    assert.ok(rows.every((row) => row.lane === "Unverified"));
    assert.ok(rows.every((row) => row.sampleNote === "Post time unconfirmed"));
    assert.ok(rows.every((row) => row.fill == null && row.result));
    const titles = rows.map((row) => row.title).join("\n");
    assert.match(titles, /Packers −3\.5/);
    assert.match(titles, /Vikings \+4\.5/);
    assert.match(titles, /Real Madrid moneyline/);
    assert.match(titles, /Over 2\.5/);
    for (const row of rows) {
      assert.match(row.detail, /Published Sunday, September 20, 2026/);
      assert.match(row.detail, /post-before-start is unproven/);
      assert.doesNotMatch(row.detail, /\d{1,2}:\d{2}/);
    }
    assert.deepEqual(
      rows.map((row) => row.result),
      ["LOSS", "WIN", "LOSS", "WIN"],
    );
  });

  it("restores the Friday archive, including the void leans", () => {
    const rows = fridayPickRows();
    assert.equal(rows.length, 20);
    const over = rows.find((row) => row.id === "robpaul-cfb-2026-09-18-wake-miami-total");
    assert.equal(over?.sample, "Loss");
    assert.match(over?.detail ?? "", /Miami 33, Wake Forest 20/);
    assert.equal(rows.filter((row) => row.sample === "Void").length, 2);
    assert.ok(rows.filter((row) => row.sample === "Void").every((row) => row.result === "VOID" && row.fill == null));
  });

  it("keeps the joint Bennett / Paul card separate from Rob Paul's Friday card", () => {
    const rows = publicCapperRows("2026-09-24");
    assert.ok(rows.some((row) => row.title.includes("Chris Bennett")));
    const joint = rows.find((row) => row.title.includes("Chris Bennett"));
    assert.equal(joint?.sample, "n = 1");
    assert.notEqual(joint?.title, "Rob Paul");
    const rob = rows.find((row) => row.title === "Rob Paul");
    assert.ok(rob);
    assert.equal(rob?.sample, "n = 24");
    assert.equal(rob?.windows, "1W 8–4 · 2W 8–4 · 1M 8–4 · 3M 8–4");
    assert.equal(rob?.fill, 200 / 3);
    assert.equal(gradeForFill(rob?.fill ?? 0).name, "PROVISIONAL");
    assert.equal(rob?.gradeName, "PROVISIONAL");
    assert.equal(rob?.sampleNote, undefined);
    const logan = rows.find((row) => row.title === "Jason Logan");
    assert.equal(logan?.detail, "37 public picks · 12–14");
    assert.equal(logan?.windows, "1W 6–4 · 2W 11–10 · 1M 11–10 · 3M 11–10");
    assert.equal(logan?.sample, "n = 26");
    assert.equal(logan?.fill, 55.42857142857143);
    assert.equal(logan?.gradeName, "PROVISIONAL");
    assert.equal(logan?.sampleNote, undefined);
    const cordell = rows.find((row) => row.title === "Todd Cordell");
    assert.equal(cordell?.sample, "n = 35");
    assert.equal(cordell?.gradeName, "STRONG");
    assert.equal(cordell?.sampleNote, undefined);
    const inglis = publicCapperRows("2026-09-30").find((row) => row.title === "Josh Inglis");
    assert.equal(inglis?.sample, "n = 6");
    assert.ok((inglis?.fill ?? 0) >= 70);
    assert.equal(inglis?.gradeName, "PROVISIONAL");
    assert.equal(inglis?.sampleNote, undefined);
    const commish = rows.find((row) => row.title === "The Commish");
    assert.equal(commish?.detail, "6 public picks · 3–1 · 2 void");
    assert.equal(commish?.windows, "1W 3–1 · 2W 3–1 · 1M 3–1 · 3M 3–1");
    assert.equal(commish?.fill, 75);
    assert.equal(commish?.gradeName, "PROVISIONAL");
    assert.equal(commish?.sample, "n = 4");
    for (const row of rows) {
      assert.match(row.windows ?? "", /^1W \d+–\d+ · 2W \d+–\d+ · 1M \d+–\d+ · 3M \d+–\d+$/);
      assert.equal(row.result, undefined);
    }
  });
});

describe("sector books", () => {
  it("shows verified sports rows before the demo fixtures", () => {
    const book = sectorBook("sports");
    assert.equal(book.sections[0]?.id, "open-picks");
    assert.equal(book.sections[0]?.rows.length, 26);
    assert.equal(book.sections[0]?.rows[0]?.result, "PENDING");
    assert.match(book.sections[0]?.rows[0]?.title ?? "", /Atlanta Falcons \+2\.5/);
    assert.match(book.sections[0]?.rows[0]?.detail ?? "", /game October 5, 2026/);
    assert.ok(book.sections[0]?.rows.every((row) => row.result === "PENDING" && row.fill == null));
    assert.equal(book.sections[1]?.id, "verified-cards");
    assert.equal(book.sections[1]?.rows.length, 220);
    assert.ok(book.sections[1]?.rows.every((row) => row.result !== "PENDING"));
    assert.equal(book.sections[2]?.id, "post-time-unconfirmed");
    assert.equal(book.sections[2]?.rows.length, 4);
    assert.match(book.sections[2]?.label ?? "", /Post time unconfirmed/);
    const cappers = book.sections.find((section) => section.id === "public-cappers");
    assert.match(cappers?.note ?? "", new RegExp(`as of ${formatNewYorkDate(newYorkToday())}`));
    assert.match(cappers?.note ?? "", /PROVISIONAL until 10 graded picks in 90 days\./);
    assert.doesNotMatch(cappers?.note ?? "", /Cappers show PROVISIONAL until they have 10 graded picks/);
    assert.doesNotMatch(cappers?.note ?? "", /40\/30\/20\/10|40 \/ 30 \/ 20 \/ 10/);
    const provisionalFootnotes = (cappers?.note ?? "").split("PROVISIONAL until 10 graded picks in 90 days.").length - 1;
    assert.equal(provisionalFootnotes, 1);
    assert.doesNotMatch(cappers?.note ?? "", /newest public card/);
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
    assert.match(
      css,
      /\.board-table tbody tr \{\s*content-visibility: auto;\s*contain-intrinsic-size: auto 88px;\s*\}\s*\.game-date \{ white-space: nowrap; \}\s*@media \(max-width: 800px\) \{\s*\.board-table tbody tr \{\s*content-visibility: visible;\s*contain-intrinsic-size: auto 300px;\s*\}\s*\}/,
    );
    assert.match(book.hero.hint, /WIN, LOSS, PUSH, VOID, or Pending/);
    assert.match(book.sections[0]?.note ?? "", /Pending is a status, not a grade; open picks stay out of the win rate\./);
    assert.equal(book.sections.at(-1)?.note, "Demo rows are fiction, labeled Demo.");
    assert.ok(book.sector.trust.includes("Demo rows are fiction, labeled Demo."));
    const verified = book.sections.find((section) => section.id === "verified-cards");
    assert.match(verified?.note ?? "", /WIN, LOSS, PUSH, or VOID/);
    assert.equal(book.sections.at(-1)?.id, "sports-demo");
    assert.ok(book.sections.at(-1)?.rows.every((row) => row.lane === "Demo"));
    assert.equal(book.hero.kind, "tube");
    if (book.hero.kind === "tube") {
      assert.equal(book.hero.card, "266 public picks · 133–105 · 2 void · 26 pending");
      assert.doesNotMatch(book.hero.hint, /133–101/);
      assert.doesNotMatch(book.hero.hint, /\d+ void/);
      assert.doesNotMatch(book.hero.hint, /\d+ pending/);
    }
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
    assert.equal(fintwit.hero.kind, "tube");
    if (fintwit.hero.kind === "tube") {
      assert.doesNotMatch(fintwit.hero.hint, /peer-rank/);
    }
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
    assert.equal(stats.sportsCards, 266);
    assert.equal(stats.sportsRecord, "133–105");
    assert.equal(stats.sportsVoids, 2);
    assert.equal(stats.sportsPending, 26);
    assert.equal(
      stats.sportsCards,
      133 + 105 + stats.sportsVoids + stats.sportsPending,
    );
    assert.equal(stats.analysts, 35);
    assert.equal(stats.banks, 14);
    assert.equal(stats.fintwitPosts, 95);
    assert.equal(stats.fintwitOpen, 19);
    assert.equal(stats.gcbotPosts, 69);
    assert.equal(stats.gcbotNarratives, 12);
    assert.notEqual(stats.sportsCards, 12480);
  });
});
