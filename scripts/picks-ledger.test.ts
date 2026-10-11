import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { collectIssues, parsePickCsv, pickIdFor, PICKS_CSV_PATH, type PickRow } from "./picks-ledger";

function card(fields: Pick<PickRow, "number" | "posted_at" | "game_date">): PickRow {
  const row: PickRow = {
    pick_id: "",
    batch: "verified",
    tipster: "Jason Logan (Covers)",
    sport: "NFL",
    event: "Tampa Bay Buccaneers @ Dallas Cowboys",
    market: "total",
    side: "Over",
    number: fields.number,
    price: "",
    posted_at: fields.posted_at,
    game_date: fields.game_date,
    game_start_et: "",
    source_url: "https://www.covers.com/nfl/buccaneers-vs-cowboys-prediction-picks-odds-early-leans-week-5-2026",
    alt_source_url: "",
    espn_game_id: "",
    status: "PENDING",
    game_final: "false",
    final_score: "Not final",
    box_score_url: "",
    graded_at: "",
    grade_method: "",
    flags: "price-unstated",
    notes: "",
    export_index: "0",
  };
  row.pick_id = pickIdFor(row.tipster, row.event, row.market, row.side, row.number, row.posted_at);
  return row;
}

function ready(rows: PickRow[]): PickRow[] {
  const ordered = rows.slice().sort((a, b) => (a.pick_id < b.pick_id ? -1 : 1));
  ordered.forEach((row, index) => {
    row.export_index = String(index);
  });
  return ordered;
}

describe("same-game near-duplicates", () => {
  it("errors on a second card for the same capper, game, market, and side", () => {
    const issues = collectIssues(
      ready([
        card({ number: "47", posted_at: "2026-10-06 07:20 ET", game_date: "2026-10-08" }),
        card({ number: "47.5", posted_at: "2026-10-06 07:49 ET", game_date: "2026-10-08" }),
      ]),
    );
    const duplicates = issues.errors.filter((error) => error.startsWith("near-duplicate"));
    assert.equal(duplicates.length, 1);
    assert.match(duplicates[0] ?? "", /2026-10-08/);
    assert.match(duplicates[0] ?? "", /47 posted 2026-10-06 07:20 ET/);
    assert.match(duplicates[0] ?? "", /47\.5 posted 2026-10-06 07:49 ET/);
    assert.equal(issues.warnings.filter((warning) => warning.startsWith("near-duplicate")).length, 0);
  });

  it("warns when the same matchup is a different game date", () => {
    const issues = collectIssues(
      ready([
        card({ number: "7.5", posted_at: "2026-09-22 09:52 ET", game_date: "2026-09-22" }),
        card({ number: "7.5", posted_at: "2026-10-07 17:09 ET", game_date: "2026-10-07" }),
      ]),
    );
    assert.equal(issues.errors.filter((error) => error.startsWith("near-duplicate")).length, 0);
    assert.equal(issues.warnings.filter((warning) => warning.startsWith("near-duplicate")).length, 1);
  });

  it("keeps the committed ledger free of same-game near-duplicates", () => {
    const issues = collectIssues(parsePickCsv(readFileSync(PICKS_CSV_PATH, "utf8")));
    assert.deepEqual(
      issues.errors.filter((error) => error.startsWith("near-duplicate")),
      [],
    );
  });
});
