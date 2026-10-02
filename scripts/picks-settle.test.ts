import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderVerifiedJson, type PickRow } from "./picks-ledger";
import {
  etWallTime,
  gamesFromScoreboard,
  linescoresAgree,
  scoreboardDates,
  settleRow,
  type EspnGame,
} from "./picks-settle";

const GRADED_AT = "2026-10-02T12:00:00-04:00";

function row(overrides: Partial<PickRow> = {}): PickRow {
  return {
    pick_id: "abc",
    batch: "verified",
    tipster: "Joe Osborne (Covers)",
    sport: "NFL",
    event: "Pittsburgh Steelers @ Cleveland Browns",
    market: "spread",
    side: "Pittsburgh Steelers",
    number: "-2.5",
    price: "",
    posted_at: "2026-09-30 06:00 ET",
    game_date: "2026-10-01",
    game_start_et: "",
    source_url: "https://www.covers.com/nfl/steelers-vs-browns-prediction-picks-oct-1-2026",
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
    export_index: "220",
    ...overrides,
  };
}

const steelers: EspnGame = {
  id: "401872964",
  awayName: "Pittsburgh Steelers",
  homeName: "Cleveland Browns",
  awayScore: 24,
  homeScore: 27,
  startIso: "2026-10-02T00:15Z",
  statusName: "STATUS_FINAL",
  detail: "Final",
  completed: true,
};

const tulsa: EspnGame = {
  id: "401862786",
  awayName: "North Texas Mean Green",
  homeName: "Tulsa Golden Hurricane",
  awayScore: 45,
  homeScore: 44,
  startIso: "2026-10-02T01:00Z",
  statusName: "STATUS_FINAL",
  detail: "Final/OT",
  completed: true,
};

describe("ESPN settle", () => {
  it("queries the ET game date and the UTC day on either side", () => {
    assert.deepEqual(scoreboardDates("2026-10-01"), ["2026-09-30", "2026-10-01", "2026-10-02"]);
    assert.deepEqual(etWallTime("2026-10-02T00:15Z"), { date: "2026-10-01", time: "20:15" });
    assert.deepEqual(etWallTime("2026-10-02T01:00Z"), { date: "2026-10-01", time: "21:00" });
  });

  it("reads a final scoreboard game", () => {
    const games = gamesFromScoreboard({
      events: [
        {
          id: "401872964",
          competitions: [
            {
              date: "2026-10-02T00:15Z",
              status: { type: { name: "STATUS_FINAL", completed: true, detail: "Final" } },
              competitors: [
                { homeAway: "home", score: "27", team: { displayName: "Cleveland Browns" } },
                { homeAway: "away", score: "24", team: { displayName: "Pittsburgh Steelers" } },
              ],
            },
          ],
        },
      ],
    });
    assert.equal(games.length, 1);
    assert.equal(games[0]?.awayScore, 24);
    assert.equal(games[0]?.homeScore, 27);
    assert.equal(
      linescoresAgree({
        score: "24",
        linescores: [{ displayValue: "7" }, { displayValue: "3" }, { displayValue: "0" }, { displayValue: "14" }],
      }),
      true,
    );
    assert.equal(linescoresAgree({ score: "45", linescores: [{ displayValue: "44" }] }), false);
  });

  it("grades the Oct 1 Steelers and North Texas finals as losses", () => {
    const spread = settleRow(row(), [steelers], "football/nfl", GRADED_AT);
    assert.equal(spread.action, "graded");
    assert.equal(spread.row.status, "LOSS");
    assert.equal(spread.row.final_score, "Pittsburgh Steelers 24, Cleveland Browns 27");
    assert.equal(spread.row.grade_method, "auto-espn");
    assert.equal(spread.row.graded_at, GRADED_AT);
    assert.equal(spread.row.game_start_et, "2026-10-01 20:15 ET");
    assert.equal(spread.row.espn_game_id, "401872964");
    assert.equal(spread.row.box_score_url, "https://www.espn.com/nfl/game/_/gameId/401872964");
    assert.equal(spread.row.flags, "price-unstated");

    const total = settleRow(
      row({
        tipster: "Jason Logan (Covers)",
        market: "total",
        side: "Under",
        number: "37.5",
        export_index: "222",
      }),
      [steelers],
      "football/nfl",
      GRADED_AT,
    );
    assert.equal(total.row.status, "LOSS");
    assert.equal(total.row.final_score, "Pittsburgh Steelers 24, Cleveland Browns 27");

    const meanGreen = settleRow(
      row({
        tipster: "Rob Paul (Covers)",
        sport: "CFB",
        event: "North Texas Mean Green @ Tulsa Golden Hurricane",
        market: "total",
        side: "Under",
        number: "57.5",
        export_index: "223",
      }),
      [tulsa],
      "football/college-football",
      GRADED_AT,
    );
    assert.equal(meanGreen.action, "graded");
    assert.equal(meanGreen.row.status, "LOSS");
    assert.equal(meanGreen.row.final_score, "North Texas Mean Green 45, Tulsa Golden Hurricane 44");
    assert.equal(meanGreen.row.notes, "Final/OT");
    assert.equal(meanGreen.row.game_start_et, "2026-10-01 21:00 ET");
  });

  it("flags partial-game markets, postponements, and ambiguous matches", () => {
    const partial = settleRow(row({ market: "total (1H)", side: "1H Over", number: "41.5" }), [steelers], "football/nfl", GRADED_AT);
    assert.equal(partial.action, "flagged");
    assert.equal(partial.row.status, "PENDING");
    assert.match(partial.row.notes, /not auto-graded/);

    const postponed = settleRow(
      row(),
      [{ ...steelers, completed: false, statusName: "STATUS_POSTPONED", detail: "Postponed" }],
      "football/nfl",
      GRADED_AT,
    );
    assert.equal(postponed.action, "flagged");
    assert.equal(postponed.row.status, "PENDING");
    assert.match(postponed.row.notes, /postponed/);

    const ambiguous = settleRow(row(), [steelers, { ...steelers, id: "2", startIso: "2026-10-02T00:20Z" }], "football/nfl", GRADED_AT);
    assert.equal(ambiguous.action, "flagged");
    assert.equal(ambiguous.row.status, "PENDING");
    assert.match(ambiguous.detail, /more than one/);
  });

  it("keeps bookkeeping columns out of the exported JSON", () => {
    const settled = settleRow(row(), [steelers], "football/nfl", GRADED_AT).row;
    const wiped: PickRow = { ...settled, notes: "Final/OT", graded_at: "", game_start_et: "", grade_method: "manual" };
    assert.equal(renderVerifiedJson([settled]), renderVerifiedJson([wiped]));
    const parsed = JSON.parse(renderVerifiedJson([settled])) as Array<Record<string, unknown>>;
    assert.equal(parsed[0]?.result, "loss");
    assert.equal("graded_at" in (parsed[0] ?? {}), false);
    assert.equal("notes" in (parsed[0] ?? {}), false);
    assert.equal("game_start_et" in (parsed[0] ?? {}), false);
    assert.equal("grade_method" in (parsed[0] ?? {}), false);
  });
});
