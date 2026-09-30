import assert from "node:assert/strict";
import { describe, it } from "node:test";
import verifiedPicks from "@/data/verified-picks.json";
import { verifiedPickRows } from "./books";
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
  it("adds 203 graded cards, 115 wins and 88 losses, with no duplicate key", () => {
    assert.equal(picks.length, 258);
    const pending = picks.filter((pick) => pick.result === "pending").length;
    const added = picks.length - 14 - pending;
    assert.equal(added, 203);
    assert.equal(picks.filter((pick) => pick.result === "win").length, 124);
    assert.equal(picks.filter((pick) => pick.result === "loss").length, 93);
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
    const rams = rows.find((row) => row.detail.includes("Los Angeles Rams @ Denver Broncos") && row.title.includes("Under"));
    assert.equal(rams?.result, "LOSS");
    assert.match(rams?.detail ?? "", /unit price -100/);
    assert.equal(rams?.fill, null);
  });
});

describe("open picks stay pending", () => {
  const open = picks.filter((pick) => pick.result === "pending");

  it("keeps games that are not final out of the win-loss record", () => {
    assert.equal(open.length, 41);
    assert.ok(open.every((pick) => pick.game_final === false && pick.final_score === "Not final"));
    const rows = verifiedPickRows().filter((row) => row.result === "PENDING");
    assert.equal(rows.length, 41);
    for (const row of rows) {
      assert.equal(row.sample, "Open");
      assert.equal(row.fill, null);
      assert.match(row.detail, /Not final/);
      assert.doesNotMatch(row.detail, /Final /);
      assert.notEqual(row.result, "LOSS");
    }
    const coastal = rows.find((row) => row.title.includes("Coastal Carolina"));
    assert.match(coastal?.detail ?? "", /price \+115/);
    assert.match(coastal?.title ?? "", /Joshua Nunn/);
  });
});
