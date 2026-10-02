import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { renderVerifiedJson, type PickRow } from "./picks-ledger";
import { parsePickCsv, PICKS_CSV_PATH } from "./picks-ledger";
import {
  commitSettledCsv,
  etWallTime,
  gameStartEt,
  gamesFromScoreboard,
  hasPartialMarker,
  hasPlayerStat,
  linescoresAgree,
  manualSettleReason,
  namesMatch,
  scoreboardDates,
  settleRow,
  settleWriteMode,
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

  it("does not grade a doubleheader from the only final game when the start is blank", () => {
    const early = "2026-10-01T17:05Z";
    const late = "2026-10-01T23:10Z";
    const game1: EspnGame = {
      id: "dh1",
      awayName: "New York Yankees",
      homeName: "Boston Red Sox",
      awayScore: 3,
      homeScore: 1,
      startIso: early,
      statusName: "STATUS_FINAL",
      detail: "Final",
      completed: true,
      awayPeriods: 9,
      homePeriods: 9,
    };
    const game2: EspnGame = {
      ...game1,
      id: "dh2",
      awayScore: 9,
      homeScore: 0,
      startIso: late,
      statusName: "STATUS_SCHEDULED",
      detail: "Scheduled",
      completed: false,
      awayPeriods: undefined,
      homePeriods: undefined,
    };
    const pick = row({
      sport: "MLB",
      event: "New York Yankees @ Boston Red Sox",
      market: "total",
      side: "Under",
      number: "8.5",
      game_date: "2026-10-01",
      game_start_et: "",
      espn_game_id: "",
    });
    const blank = settleRow(pick, [game1, game2], "baseball/mlb", GRADED_AT);
    assert.equal(blank.action, "flagged");
    assert.equal(blank.row.status, "PENDING");
    assert.equal(blank.row.final_score, "Not final");
    assert.match(blank.detail, /more than one/);
    assert.match(blank.row.notes, /ambiguous/);

    const byLateStart = settleRow(row({ ...pick, game_start_et: gameStartEt(late) }), [game1, game2], "baseball/mlb", GRADED_AT);
    assert.equal(byLateStart.action, "pending");
    assert.equal(byLateStart.row.status, "PENDING");
    assert.equal(byLateStart.row.final_score, "Not final");

    const byLateId = settleRow(row({ ...pick, espn_game_id: "dh2" }), [game1, game2], "baseball/mlb", GRADED_AT);
    assert.equal(byLateId.action, "pending");
    assert.equal(byLateId.row.final_score, "Not final");

    const byEarlyId = settleRow(row({ ...pick, espn_game_id: "dh1" }), [game1, game2], "baseball/mlb", GRADED_AT);
    assert.equal(byEarlyId.action, "graded");
    assert.equal(byEarlyId.row.status, "WIN");
    assert.equal(byEarlyId.row.final_score, "New York Yankees 3, Boston Red Sox 1");
    assert.equal(byEarlyId.row.espn_game_id, "dh1");
  });

  it("does not match Michigan to Michigan State", () => {
    assert.equal(namesMatch("Michigan", "Michigan State"), false);
    assert.equal(namesMatch("Michigan", "Michigan State Spartans"), false);
    assert.equal(namesMatch("Michigan", "Michigan Wolverines"), true);
    assert.equal(namesMatch("Michigan State", "Michigan State Spartans"), true);
    assert.equal(namesMatch("North Carolina", "North Carolina State Wolfpack"), false);
    assert.equal(namesMatch("North Carolina", "North Carolina Tar Heels"), true);
    assert.equal(namesMatch("Braves", "Atlanta Braves"), true);
    assert.equal(namesMatch("FIU", "Florida International Panthers"), true);

    const spartans: EspnGame = {
      id: "msu",
      awayName: "Michigan State Spartans",
      homeName: "Ohio State Buckeyes",
      awayScore: 21,
      homeScore: 24,
      startIso: "2026-10-02T00:15Z",
      statusName: "STATUS_FINAL",
      detail: "Final",
      completed: true,
    };
    const wrong = settleRow(
      row({
        sport: "CFB",
        event: "Michigan State Spartans @ Ohio State Buckeyes",
        market: "spread",
        side: "Michigan",
        number: "-3.5",
        game_date: "2026-10-01",
      }),
      [spartans],
      "football/college-football",
      GRADED_AT,
    );
    assert.equal(wrong.action, "flagged");
    assert.equal(wrong.row.status, "PENDING");
    assert.equal(wrong.row.final_score, "Not final");
    assert.match(wrong.detail, /side/);

    const right = settleRow(
      row({
        sport: "CFB",
        event: "Michigan State Spartans @ Ohio State Buckeyes",
        market: "spread",
        side: "Michigan State",
        number: "-3.5",
        game_date: "2026-10-01",
      }),
      [spartans],
      "football/college-football",
      GRADED_AT,
    );
    assert.equal(right.action, "graded");
    assert.equal(right.row.status, "LOSS");
    assert.equal(right.row.final_score, "Michigan State Spartans 21, Ohio State Buckeyes 24");

    const both: EspnGame = {
      id: "subway",
      awayName: "New York Yankees",
      homeName: "New York Mets",
      awayScore: 5,
      homeScore: 2,
      startIso: "2026-10-02T00:15Z",
      statusName: "STATUS_FINAL",
      detail: "Final",
      completed: true,
    };
    const ambiguous = settleRow(
      row({
        sport: "MLB",
        event: "New York Yankees @ New York Mets",
        market: "moneyline",
        side: "New York",
        number: "",
        game_date: "2026-10-01",
      }),
      [both],
      "baseball/mlb",
      GRADED_AT,
    );
    assert.equal(ambiguous.action, "flagged");
    assert.equal(ambiguous.row.status, "PENDING");
    assert.equal(ambiguous.row.final_score, "Not final");
    assert.match(ambiguous.detail, /ambiguous side/);
  });

  it("flags partial-game markers in the side field", () => {
    for (const side of ["1H Over", "F5", "first half", "Q1"]) {
      const partial = settleRow(row({ market: "total", side, number: "41.5" }), [steelers], "football/nfl", GRADED_AT);
      assert.equal(partial.action, "flagged", side);
      assert.equal(partial.row.status, "PENDING", side);
      assert.equal(partial.row.final_score, "Not final", side);
      assert.match(partial.row.notes, /not auto-graded/);
    }
  });

  it("does not grade a rain-shortened MLB game as a full game", () => {
    const shortened: EspnGame = {
      id: "rain",
      awayName: "Atlanta Braves",
      homeName: "New York Mets",
      awayScore: 2,
      homeScore: 1,
      startIso: "2026-10-01T23:10Z",
      statusName: "STATUS_FINAL",
      detail: "Final",
      completed: true,
      awayPeriods: 7,
      homePeriods: 6,
    };
    const pick = row({
      sport: "MLB",
      event: "Atlanta Braves @ New York Mets",
      market: "total",
      side: "Under",
      number: "7.5",
      game_date: "2026-10-01",
    });
    const short = settleRow(pick, [shortened], "baseball/mlb", GRADED_AT);
    assert.equal(short.action, "flagged");
    assert.equal(short.row.status, "PENDING");
    assert.equal(short.row.final_score, "Not final");
    assert.match(short.detail, /regulation/);
    assert.match(short.row.notes, /regulation/);

    const marked = settleRow(
      pick,
      [{ ...shortened, id: "marked", awayPeriods: undefined, homePeriods: undefined, detail: "Final/7" }],
      "baseball/mlb",
      GRADED_AT,
    );
    assert.equal(marked.action, "flagged");
    assert.equal(marked.row.status, "PENDING");

    const suspended = settleRow(
      pick,
      [{ ...shortened, id: "sus", completed: true, statusName: "STATUS_SUSPENDED", detail: "Suspended", awayPeriods: 5, homePeriods: 5 }],
      "baseball/mlb",
      GRADED_AT,
    );
    assert.equal(suspended.action, "flagged");
    assert.equal(suspended.row.status, "PENDING");
    assert.equal(suspended.row.final_score, "Not final");

    const regulation = settleRow(
      pick,
      [{ ...shortened, id: "reg", awayScore: 4, homeScore: 2, awayPeriods: 9, homePeriods: 8, detail: "Final" }],
      "baseball/mlb",
      GRADED_AT,
    );
    assert.equal(regulation.action, "graded");
    assert.equal(regulation.row.status, "WIN");
    assert.equal(regulation.row.final_score, "Atlanta Braves 4, New York Mets 2");
  });

  it("flags partial wording on total and spread sides and markets", () => {
    const patterns = [
      "1st quarter",
      "First Quarter",
      "3rd quarter",
      "4th quarter",
      "2H",
      "2nd half",
      "second half",
      "H1",
      "1st-half",
      "1sthalf",
      "1st inning",
      "first inning",
      "fifth inning",
      "five innings",
      "1st period",
      "P1",
      "1P",
      "alt line",
      "alternate spread",
    ];
    for (const pattern of patterns) {
      assert.equal(hasPartialMarker(pattern), true, pattern);
      assert.equal(hasPartialMarker(`listed ${pattern} market`), true, `market ${pattern}`);
      const market = pattern === "alt line" || pattern === "alternate spread" ? "spread" : "total";
      const partial = settleRow(row({ market, side: pattern, number: "41.5" }), [steelers], "football/nfl", GRADED_AT);
      assert.equal(partial.action, "flagged", pattern);
      assert.equal(partial.row.status, "PENDING", pattern);
      assert.equal(partial.row.final_score, "Not final", pattern);
      assert.match(partial.row.notes, /not auto-graded/);
    }

    const teamTotal = settleRow(
      row({ market: "total", side: "Houston Astros team total Over", number: "3.5" }),
      [steelers],
      "football/nfl",
      GRADED_AT,
    );
    assert.equal(teamTotal.action, "flagged");
    assert.equal(teamTotal.row.status, "PENDING");
    assert.equal(teamTotal.row.final_score, "Not final");
    assert.match(teamTotal.detail, /partial-game|team total/);

    const statSides = [
      "Travis Kelce Over 60.5 receiving yards",
      "Over 8.5 rebounds",
      "Over 6.5 strikeouts",
      "Over 1.5 hits",
      "Over 0.5 TD",
      "Over 4.5 receptions",
      "Over 6.5 assists",
    ];
    for (const side of statSides) {
      for (const market of ["total", "spread"] as const) {
        const prop = settleRow(row({ market, side, number: "60.5" }), [steelers], "football/nfl", GRADED_AT);
        assert.equal(prop.action, "flagged", `${market} ${side}`);
        assert.equal(prop.row.status, "PENDING", side);
        assert.equal(prop.row.final_score, "Not final", side);
        assert.match(prop.detail, /player stat/);
      }
    }
  });

  it("does not flag ordinary totals, team names, or lookalike tokens", () => {
    for (const side of ["Over 6.5", "Q1ford", "BF5", "first down", "firstborn", "Pittsburgh Steelers"]) {
      assert.equal(hasPartialMarker(side), false, side);
      assert.equal(hasPartialMarker(`spread ${side}`), false, side);
    }
    assert.equal(hasPartialMarker("Houston Astros"), false);

    const over = settleRow(row({ market: "total", side: "Over 6.5", number: "6.5" }), [steelers], "football/nfl", GRADED_AT);
    assert.equal(over.action, "graded");
    assert.equal(over.row.status, "WIN");

    const steelersSide = settleRow(row({ market: "spread", side: "Pittsburgh Steelers", number: "-2.5" }), [steelers], "football/nfl", GRADED_AT);
    assert.equal(steelersSide.action, "graded");
    assert.equal(steelersSide.row.status, "LOSS");

    const astros: EspnGame = {
      id: "hou",
      awayName: "Houston Astros",
      homeName: "Atlanta Braves",
      awayScore: 2,
      homeScore: 5,
      startIso: "2026-10-01T23:10Z",
      statusName: "STATUS_FINAL",
      detail: "Final",
      completed: true,
      awayPeriods: 9,
      homePeriods: 9,
    };
    const houston = settleRow(
      row({
        sport: "MLB",
        event: "Houston Astros @ Atlanta Braves",
        market: "spread",
        side: "Houston Astros",
        number: "-1.5",
        game_date: "2026-10-01",
      }),
      [astros],
      "baseball/mlb",
      GRADED_AT,
    );
    assert.equal(houston.action, "graded");
    assert.equal(houston.row.status, "LOSS");
    assert.equal(houston.row.final_score, "Houston Astros 2, Atlanta Braves 5");

    for (const side of ["Q1ford", "BF5", "first down", "firstborn"]) {
      assert.equal(hasPartialMarker(side), false, side);
      assert.equal(hasPlayerStat(side), false, side);
      const unknownTotal = settleRow(row({ market: "total", side, number: "41.5" }), [steelers], "football/nfl", GRADED_AT);
      assert.equal(unknownTotal.action, "flagged", side);
      assert.equal(unknownTotal.row.status, "PENDING", side);
      assert.doesNotMatch(unknownTotal.detail, /partial-game/);
      assert.doesNotMatch(unknownTotal.detail, /player stat/);
    }
  });

  it("fails closed on unknown total, spread, and moneyline wording", () => {
    const wording = [
      "2Q",
      "3Q",
      "4Q",
      "H2",
      "2ndhalf",
      "half time",
      "halftime",
      "innings 1-3",
      "period 1",
      "alternate total",
      "alt spread",
      "alt total",
      "TT over",
      "to score first",
      "first basket",
      "Judge Over 1.5 total bases",
      "double double",
      "first scorer",
      "team total",
      "Chiefs team total over 24.5",
      "home team total",
      "away team total",
      "Travis Kelce Over 60.5 receiving yards",
      "Mahomes passing yards",
      "rebounds",
      "strikeouts",
      "Ohtani to hit a HR",
      "anytime TD",
      "first touchdown",
      "team points",
      "first-half",
      "1st-quarter",
      "first-inning",
      "1st-period",
      "alt-line",
      "second-half",
      "1st_half",
      "1stquarter",
      "alternate-spread",
      "1 H",
      "1 Q",
      "1 P",
    ];
    for (const side of wording) {
      for (const market of ["total", "spread", "moneyline"] as const) {
        const result = settleRow(row({ market, side, number: "24.5" }), [steelers], "football/nfl", GRADED_AT);
        assert.equal(result.action, "flagged", `${market} ${side}`);
        assert.equal(result.row.status, "PENDING", `${market} ${side}`);
        assert.equal(result.row.final_score, "Not final", `${market} ${side}`);
      }
    }

    const parenthetical = settleRow(
      row({ market: "total (1H)", side: "Over", number: "24.5" }),
      [steelers],
      "football/nfl",
      GRADED_AT,
    );
    assert.equal(parenthetical.action, "flagged");
    assert.equal(parenthetical.row.status, "PENDING");
    assert.equal(parenthetical.row.final_score, "Not final");
  });

  it("still grades full-game totals and team sides, including lookalikes", () => {
    const totals = [
      ["Over 6.5", "6.5", "WIN"],
      ["Over 37.5", "37.5", "WIN"],
      ["Under 57.5", "57.5", "WIN"],
      ["Over 37.5 total points", "37.5", "WIN"],
      ["Over 5.5 goals", "5.5", "WIN"],
      ["Over\u00a06.5", "6.5", "WIN"],
      ["Over\u22126.5", "6.5", "WIN"],
    ] as const;
    for (const [side, number, status] of totals) {
      const graded = settleRow(row({ market: "total", side, number }), [steelers], "football/nfl", GRADED_AT);
      assert.equal(graded.action, "graded", side);
      assert.equal(graded.row.status, status, side);
    }

    const withNumber = settleRow(
      row({ market: "spread", side: "Pittsburgh Steelers -2.5", number: "-2.5" }),
      [steelers],
      "football/nfl",
      GRADED_AT,
    );
    assert.equal(withNumber.action, "graded");
    assert.equal(withNumber.row.status, "LOSS");
    assert.equal(withNumber.row.final_score, "Pittsburgh Steelers 24, Cleveland Browns 27");

    const points = settleRow(
      row({ market: "spread", side: "Pittsburgh Steelers +2.5 points", number: "2.5" }),
      [steelers],
      "football/nfl",
      GRADED_AT,
    );
    assert.equal(points.action, "graded");
    assert.equal(points.row.status, "LOSS");

    const legalTeamSides = [
      ["spread", "Pittsburgh Steelers -2.5", "-2.5"],
      ["spread", "Pittsburgh Steelers +2.5 points", "2.5"],
      ["spread", "Pittsburgh -2.5", "-2.5"],
      ["moneyline", "Pittsburgh Steelers ML", ""],
      ["spread", "Pittsburgh Steelers -110", "-2.5"],
      ["run_line", "Pittsburgh Steelers -2.5", "-2.5"],
      ["moneyline", "Steelers", ""],
      ["team_total", "Pittsburgh Steelers team total Over", "20.5"],
    ] as const;
    for (const [market, side, number] of legalTeamSides) {
      const graded = settleRow(row({ market, side, number }), [steelers], "football/nfl", GRADED_AT);
      assert.equal(graded.action, "graded", `${market} ${side}`);
      assert.notEqual(graded.row.status, "PENDING", `${market} ${side}`);
    }

    const lookalikes = [
      "Houston Astros",
      "Q1ford",
      "BF5",
      "first down",
      "firstborn",
      "Sacramento",
      "Sacramento State",
      "Whitehaven",
      "Brunswick",
      "Pointe",
      "Point University",
      "High Point",
    ];
    for (const name of lookalikes) {
      assert.equal(hasPartialMarker(name), false, name);
      assert.equal(hasPlayerStat(name), false, name);
      const game: EspnGame = {
        id: `look-${name}`,
        awayName: name,
        homeName: "Cleveland Browns",
        awayScore: 10,
        homeScore: 7,
        startIso: "2026-10-02T00:15Z",
        statusName: "STATUS_FINAL",
        detail: "Final",
        completed: true,
      };
      const graded = settleRow(
        row({
          event: `${name} @ Cleveland Browns`,
          market: "moneyline",
          side: name,
          number: "",
        }),
        [game],
        "football/nfl",
        GRADED_AT,
      );
      assert.equal(graded.action, "graded", name);
      assert.equal(graded.row.status, "WIN", name);
      assert.equal(graded.row.final_score, `${name} 10, Cleveland Browns 7`);
    }
  });

  it("flags extra words after a full team name on spread, moneyline, run line, and team total", () => {
    const tails = [
      "live",
      "alt",
      "player",
      "OT",
      "overtime",
      "overtime only",
      "bonus",
      "spread",
      "🔥",
      "✅",
      "reg only",
      "regulation",
      "player props",
      "Over 22.5 points LeBron",
      "first drive",
      "3rd drive",
      "to win",
      "lean",
      "best bet",
      "parlay",
      "teaser",
      "Over 37.5",
      "Under",
      "+ Under 37.5",
      "and Cleveland Browns",
      "vs Cleveland Browns",
      "wins by 3 or more",
      "-2.5 or -3.5",
    ];
    const teamTotalTails = ["live", "alt", "OT", "player", "🔥", "20.5", "lean"];
    const sides = [
      ...tails.map((tail) => `Pittsburgh Steelers -2.5 ${tail}`),
      "Cleveland Browns +2.5 live",
      "Cleveland Browns Over",
      ...teamTotalTails.map((tail) => `Pittsburgh Steelers team total Over ${tail}`),
      "Pittsburgh Steelers alt team total Over",
      "Pittsburgh Steelers first drive team total Over",
      "Pittsburgh Steelers 1 st quarter",
      "Pittsburgh Steelers 2 nd half",
      "Pittsburgh Steelers 2 Q",
      "Pittsburgh Steelers 2 H",
      "Pittsburgh Steelers 2 P",
      "Pittsburgh Steelers Chiefs_team_total_over_24.5",
      "Pittsburgh Steelers TT_over",
      "Pittsburgh Steelers Kelce_receiving_yards",
      "Pittsburgh Steelers Ohtani_to_hit_a_HR",
    ];
    for (const pattern of ["1 st quarter", "2 nd half", "2 Q", "2 H", "2 P", "Chiefs_team_total_over_24.5", "TT_over"]) {
      assert.equal(hasPartialMarker(pattern), true, pattern);
    }
    assert.equal(hasPlayerStat("Kelce_receiving_yards"), true);
    assert.equal(hasPlayerStat("Ohtani_to_hit_a_HR"), true);
    assert.equal(hasPlayerStat("Whitehaven"), false);
    assert.equal(hasPartialMarker("Whitehaven"), false);

    for (const side of sides) {
      for (const market of ["spread", "moneyline", "run_line", "team_total"] as const) {
        const reason = manualSettleReason(row({ market, side, number: "-2.5" }));
        assert.notEqual(reason, null, `${market} ${side}`);
        const result = settleRow(row({ market, side, number: "-2.5" }), [steelers], "football/nfl", GRADED_AT);
        assert.equal(result.action, "flagged", `${market} ${side}`);
        assert.equal(result.row.status, "PENDING", `${market} ${side}`);
        assert.equal(result.row.final_score, "Not final", `${market} ${side}`);
      }
    }
  });

  it("keeps the whitelist and the second-layer checks from being widened", () => {
    const live = row({ market: "spread", side: "Pittsburgh Steelers -2.5 live", number: "-2.5" });
    assert.equal(manualSettleReason(live), "side is not a full-game team side");
    const gradedIfWhitelistOff = settleRow(live, [steelers], "football/nfl", GRADED_AT);
    assert.equal(gradedIfWhitelistOff.action, "flagged");
    assert.equal(gradedIfWhitelistOff.row.final_score, "Not final");

    for (const market of ["moneyline", "run_line"] as const) {
      const stat = row({ market, side: "Mahomes passing yards", number: "" });
      assert.equal(manualSettleReason(stat), "player stat side");
      const kelce = row({ market, side: "Travis Kelce Over 60.5 receiving yards", number: "60.5" });
      assert.equal(manualSettleReason(kelce), "player stat side");
    }

    const openTail = row({ market: "total", side: "Over 6.5 live", number: "6.5" });
    assert.equal(manualSettleReason(openTail), "side is not a full-game total");
    const openGraded = settleRow(openTail, [steelers], "football/nfl", GRADED_AT);
    assert.equal(openGraded.action, "flagged");
    assert.equal(openGraded.row.status, "PENDING");

    const pointsTail = row({ market: "total", side: "Over 37.5 total points tonight", number: "37.5" });
    assert.equal(manualSettleReason(pointsTail), "side is not a full-game total");

    const paren = row({ market: "total (live)", side: "Over 6.5", number: "6.5" });
    assert.equal(manualSettleReason(paren), "partial-game side");
    const parenSettled = settleRow(paren, [steelers], "football/nfl", GRADED_AT);
    assert.equal(parenSettled.action, "flagged");
    assert.equal(parenSettled.row.status, "PENDING");

    const marketPartial = row({ market: "2nd half", side: "Over 6.5", number: "6.5" });
    assert.equal(manualSettleReason(marketPartial), "partial-game side");

    const altTeamTotal = row({
      market: "team_total",
      side: "Pittsburgh Steelers alt team total Over",
      number: "20.5",
    });
    assert.equal(manualSettleReason(altTeamTotal), "side is not a full-game team total");
    const altSettled = settleRow(altTeamTotal, [steelers], "football/nfl", GRADED_AT);
    assert.equal(altSettled.action, "flagged");
    assert.equal(altSettled.row.status, "PENDING");
    assert.equal(altSettled.row.final_score, "Not final");
  });

  it("grades league display names, prefixes, suffixes, and aliases", () => {
    const samples: Array<[string, string, string]> = [
      ["Pittsburgh Steelers", "Pittsburgh Steelers", "Cleveland Browns"],
      ["49ers", "San Francisco 49ers", "Dallas Cowboys"],
      ["St. Louis Cardinals", "St. Louis Cardinals", "Chicago Cubs"],
      ["Red Sox", "Boston Red Sox", "New York Yankees"],
      ["Boston Celtics", "Boston Celtics", "Los Angeles Lakers"],
      ["Maple Leafs", "Toronto Maple Leafs", "Montreal Canadiens"],
      ["Notre Dame", "Notre Dame Fighting Irish", "Purdue Boilermakers"],
      ["Ohio State", "Ohio State Buckeyes", "Michigan Wolverines"],
      ["Texas A&M", "Texas A&M Aggies", "LSU Tigers"],
      ["Sacramento State", "Sacramento State Hornets", "Idaho Vandals"],
      ["Braves", "Atlanta Braves", "New York Mets"],
      ["FIU", "Florida International Panthers", "Florida Atlantic Owls"],
    ];
    for (const [side, away, home] of samples) {
      const game: EspnGame = {
        id: `name-${away}`,
        awayName: away,
        homeName: home,
        awayScore: 10,
        homeScore: 7,
        startIso: "2026-10-02T00:15Z",
        statusName: "STATUS_FINAL",
        detail: "Final",
        completed: true,
      };
      const graded = settleRow(
        row({ event: `${away} @ ${home}`, market: "moneyline", side, number: "" }),
        [game],
        "football/nfl",
        GRADED_AT,
      );
      assert.equal(graded.action, "graded", side);
      assert.equal(graded.row.status, "WIN", side);
    }

    const ohio: EspnGame = {
      id: "ohio",
      awayName: "Ohio State Buckeyes",
      homeName: "Michigan Wolverines",
      awayScore: 10,
      homeScore: 7,
      startIso: "2026-10-02T00:15Z",
      statusName: "STATUS_FINAL",
      detail: "Final",
      completed: true,
    };
    const ohioShort = settleRow(
      row({
        event: "Ohio State Buckeyes @ Michigan Wolverines",
        market: "spread",
        side: "Ohio -3.5",
        number: "-3.5",
      }),
      [ohio],
      "football/college-football",
      GRADED_AT,
    );
    assert.equal(ohioShort.action, "flagged");
    assert.equal(ohioShort.row.status, "PENDING");
  });

  it("does not newly flag any of the 250 committed full-game rows", () => {
    const rows = parsePickCsv(readFileSync(PICKS_CSV_PATH, "utf8"));
    assert.equal(rows.length, 250);
    const fullGame = new Set(["total", "spread", "moneyline", "run_line", "team_total"]);
    const flagged = rows.filter((pick) => fullGame.has(pick.market) && manualSettleReason(pick) != null);
    assert.deepEqual(
      flagged.map((pick) => `${pick.market} | ${pick.side} | ${pick.event}`),
      [],
    );
  });

  it("does not match Texas to Texas A&M", () => {
    assert.equal(namesMatch("Texas", "Texas A&M Aggies"), false);
    assert.equal(namesMatch("Texas A&M", "Texas A&M Aggies"), true);
    const aggies: EspnGame = {
      id: "tamu",
      awayName: "Texas A&M Aggies",
      homeName: "Ohio State Buckeyes",
      awayScore: 17,
      homeScore: 21,
      startIso: "2026-10-02T00:15Z",
      statusName: "STATUS_FINAL",
      detail: "Final",
      completed: true,
    };
    const texas = settleRow(
      row({
        sport: "CFB",
        event: "Texas A&M Aggies @ Ohio State Buckeyes",
        market: "spread",
        side: "Texas",
        number: "-3.5",
        game_date: "2026-10-01",
      }),
      [aggies],
      "football/college-football",
      GRADED_AT,
    );
    assert.equal(texas.action, "flagged");
    assert.equal(texas.row.status, "PENDING");
    assert.equal(texas.row.final_score, "Not final");
  });

  it("dry-run writes nothing", () => {
    assert.equal(settleWriteMode(["node", "scripts/picks-settle.ts"]), "dry-run");
    assert.equal(settleWriteMode(["node", "scripts/picks-settle.ts", "--dry-run"]), "dry-run");
    assert.equal(settleWriteMode(["node", "scripts/picks-settle.ts", "--write"]), "write");
    assert.throws(() => settleWriteMode(["--write", "--dry-run"]), /only one/);

    const dir = mkdtempSync(join(tmpdir(), "settle-"));
    const path = join(dir, "picks.csv");
    writeFileSync(path, "before\n");
    assert.equal(commitSettledCsv(path, "before\n", "after\n", "dry-run"), false);
    assert.equal(readFileSync(path, "utf8"), "before\n");
    assert.equal(commitSettledCsv(path, "before\n", "before\n", "write"), false);
    assert.equal(readFileSync(path, "utf8"), "before\n");
    assert.equal(commitSettledCsv(path, "before\n", "after\n", "write"), true);
    assert.equal(readFileSync(path, "utf8"), "after\n");
  });

  it("rejects a mistyped flag with exit 1 and prints usage for --help", { timeout: 20000 }, () => {
    assert.throws(() => settleWriteMode(["node", "scripts/picks-settle.ts", "--writ"]), /Unknown flag --writ/);
    assert.throws(() => settleWriteMode(["--dryrun"]), /Unknown flag --dryrun/);
    let usage = "";
    try {
      settleWriteMode(["--writ"]);
    } catch (error) {
      usage = error instanceof Error ? error.message : String(error);
    }
    assert.match(usage, /--write/);
    assert.match(usage, /dry-run/);

    const csvPath = new URL("../data/picks/picks.csv", import.meta.url);
    const jsonPath = new URL("../data/verified-picks.json", import.meta.url);
    const csvBefore = readFileSync(csvPath);
    const jsonBefore = readFileSync(jsonPath);
    const mistyped = spawnSync(process.execPath, ["--import", "tsx", "scripts/picks-settle.ts", "--writ"], {
      encoding: "utf8",
      cwd: new URL("..", import.meta.url).pathname,
    });
    assert.equal(mistyped.status, 1);
    assert.match(mistyped.stderr, /Unknown flag --writ/);
    assert.match(mistyped.stderr, /--dry-run/);
    const help = spawnSync(process.execPath, ["--import", "tsx", "scripts/picks-settle.ts", "--help"], {
      encoding: "utf8",
      cwd: new URL("..", import.meta.url).pathname,
    });
    assert.equal(help.status, 0);
    assert.match(help.stdout, /--write/);
    assert.match(help.stdout, /--dry-run/);
    assert.match(help.stdout, /Dry-run is the default/);
    assert.equal(readFileSync(csvPath).equals(csvBefore), true);
    assert.equal(readFileSync(jsonPath).equals(jsonBefore), true);
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
