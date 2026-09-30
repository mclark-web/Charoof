import assert from "node:assert/strict";
import { describe, it } from "node:test";
import verifiedPicks from "@/data/verified-picks.json";
import { openPickRows, verifiedPickRows } from "./books";
import { boardPrice, gradeFullGame } from "./sports-grade";

type StoredPick = {
  tipster: string;
  event: string;
  market: string;
  side: string;
  number: number | null;
  price: string | null;
  result: string;
  game_final: boolean;
  final_score: string;
  posted_at: string;
  source_url: string;
};

const picks = verifiedPicks as StoredPick[];

describe("board price rule", () => {
  it("uses even money when the page states no American price", () => {
    assert.equal(boardPrice(null), "-100");
    assert.equal(boardPrice("  "), "-100");
    assert.equal(boardPrice("+315"), "+315");
    assert.equal(boardPrice("-111"), "-111");
    assert.equal(boardPrice("+115"), "+115");
  });
});

describe("Sep 19–30 verified finals", () => {
  it("keeps 198 graded cards, 111 wins and 87 losses, after the one-hour cutoff", () => {
    assert.equal(picks.length, 252);
    const pending = picks.filter((pick) => pick.result === "pending").length;
    const added = picks.length - 14 - pending;
    assert.equal(pending, 40);
    assert.equal(added, 198);
    assert.equal(picks.filter((pick) => pick.result === "win").length, 120);
    assert.equal(picks.filter((pick) => pick.result === "loss").length, 92);
    const titles = picks.map((pick) => `${pick.event} ${pick.side} ${pick.number ?? ""} ${pick.market}`);
    assert.equal(titles.some((title) => title.includes("South Dakota") && title.includes("58.5")), false);
    assert.equal(titles.some((title) => title.includes("Baylor") && title.includes("55.5")), false);
    assert.equal(titles.some((title) => title.includes("Liberty") && title.includes("52.5")), false);
    assert.equal(titles.some((title) => title.includes("Louisville") && title.includes("moneyline")), false);
    assert.equal(titles.some((title) => title.includes("Texas A&M") && title.includes("-16.5")), false);
    assert.equal(picks.some((pick) => pick.market === "yrfi"), false);
    const keys = picks.map((pick) =>
      [pick.tipster, pick.event, pick.market, pick.side, pick.number ?? "", pick.posted_at].join("|"),
    );
    assert.equal(new Set(keys).size, keys.length);
  });

  it("regrades full-game lines against the stored final", () => {
    let checked = 0;
    for (const pick of picks) {
      if (!pick.game_final) continue;
      const again = gradeFullGame({
        market: pick.market,
        side: pick.side,
        number: pick.number,
        finalScore: pick.final_score,
      });
      if (again == null) continue;
      checked += 1;
      assert.equal(again, pick.result, `${pick.tipster} ${pick.side} ${pick.final_score}`);
    }
    assert.ok(checked >= 180);
  });

  it("shows a stated price and the even-money unit price on the card", () => {
    const rows = verifiedPickRows();
    const rice = rows.find((row) => row.title.includes("Rice Owls moneyline"));
    assert.match(rice?.detail ?? "", /price \+315/);
    const unlv = rows.find((row) => row.detail.includes("UNLV Rebels @ Akron Zips"));
    assert.match(unlv?.detail ?? "", /price -146/);
    const ncState = rows.find((row) => row.title.includes("NC State −14"));
    assert.match(ncState?.detail ?? "", /price -108/);
    const tennessee = rows.find((row) => row.title.includes("Tennessee −34.5"));
    assert.match(tennessee?.detail ?? "", /price -112/);
    const rams = rows.find((row) => row.detail.includes("Los Angeles Rams @ Denver Broncos") && row.title.includes("Under"));
    assert.equal(rams?.result, "LOSS");
    assert.match(rams?.detail ?? "", /unit price -100/);
    assert.equal(rams?.fill, null);
  });
});

describe("open picks stay pending", () => {
  const open = picks.filter((pick) => pick.result === "pending");

  it("keeps games that are not final out of the win-loss record", () => {
    assert.equal(open.length, 40);
    assert.ok(open.every((pick) => pick.game_final === false && pick.final_score === "Not final"));
    const rows = openPickRows();
    assert.equal(rows.length, 40);
    assert.equal(verifiedPickRows().some((row) => row.result === "PENDING"), false);
    for (const row of rows) {
      assert.equal(row.sample, "Open");
      assert.equal(row.fill, null);
      assert.match(row.detail, /Not final/);
      assert.doesNotMatch(row.detail, /Final /);
      assert.notEqual(row.result, "LOSS");
    }
    const hatfield = open.find((pick) => pick.source_url.includes("red-sox-vs-yankees"));
    assert.equal(hatfield?.posted_at, "2026-09-30 14:23 ET");
    assert.equal(hatfield?.number, 6.5);
    const cordell = open.find((pick) => pick.source_url.includes("white-sox-vs-astros"));
    assert.equal(cordell?.posted_at, "2026-09-30 14:48 ET");
    assert.equal(cordell?.side, "Houston Astros");
    const logan = open.filter(
      (pick) => pick.tipster.startsWith("Jason Logan") && pick.source_url.includes("picks-and-predictions-week-4"),
    );
    assert.equal(logan.length, 3);
    assert.ok(logan.every((pick) => pick.posted_at === "2026-09-30 13:55 ET"));
    const lions = open.filter((pick) => pick.source_url.includes("lions-vs-panthers"));
    assert.ok(lions.every((pick) => pick.posted_at === "2026-09-28 12:51 ET"));
    const bears = open.filter((pick) => pick.source_url.includes("jets-vs-bears"));
    assert.ok(bears.every((pick) => pick.posted_at === "2026-09-29 12:39 ET"));
    const coastal = rows.find((row) => row.title.includes("Coastal Carolina"));
    assert.match(coastal?.detail ?? "", /price \+115/);
    assert.match(coastal?.title ?? "", /Joshua Nunn/);
  });
});
