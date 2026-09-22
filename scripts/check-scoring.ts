import { FINAL_NOTE, MIN_GRADED, OPEN_NOTE, RESULT_SOURCE, VOID_NOTE } from "../src/lib/constants";
import { gradeMarket, propActualFor, spreadLine, totalLine, unitProfit } from "../src/lib/grade";
import { loadLedger, buildBoard } from "../src/lib/ledger";
import { getResultsAdapter } from "../src/lib/feeds";
import { chadWindowSize, orderAndMark, scorePicks } from "../src/lib/scoring";

const errors: string[] = [];

function check(condition: unknown, message: string) {
  if (!condition) errors.push(message);
}

function roundTripSpread() {
  for (const side of ["home", "away"] as const) {
    for (const grade of ["win", "loss", "push"] as const) {
      const line = spreadLine(side, 27, 20, grade);
      const actual = gradeMarket({
        market: "spread",
        side,
        line,
        homeScore: 27,
        awayScore: 20,
        propActual: null,
        status: "final",
      });
      check(actual === grade, `spread ${side} ${grade} graded ${actual} at ${line}`);
    }
  }
}

function roundTripTotal() {
  for (const side of ["over", "under"] as const) {
    for (const grade of ["win", "loss", "push"] as const) {
      const line = totalLine(side, 24, 21, grade);
      const actual = gradeMarket({
        market: "total",
        side,
        line,
        homeScore: 24,
        awayScore: 21,
        propActual: null,
        status: "final",
      });
      check(actual === grade, `total ${side} ${grade} graded ${actual}`);
    }
  }
}

function roundTripProp() {
  for (const side of ["over", "under"] as const) {
    for (const grade of ["win", "loss", "push"] as const) {
      const line = 18.5;
      const actualStat = propActualFor(side, line, grade);
      const actual = gradeMarket({
        market: "prop",
        side,
        line,
        homeScore: 110,
        awayScore: 104,
        propActual: actualStat,
        status: "final",
      });
      check(actual === grade, `prop ${side} ${grade} graded ${actual}`);
    }
  }
}

roundTripSpread();
roundTripTotal();
roundTripProp();

check(
  gradeMarket({
    market: "spread",
    side: "home",
    line: -3.5,
    homeScore: null,
    awayScore: null,
    propActual: null,
    status: "scheduled",
  }) === "pending",
  "open fixture must stay pending",
);
check(
  gradeMarket({
    market: "moneyline",
    side: "home",
    line: null,
    homeScore: null,
    awayScore: null,
    propActual: null,
    status: "cancelled",
  }) === "void",
  "cancelled fixture must be void",
);
check(Math.abs(unitProfit("win", 1, -110) - 100 / 110) < 1e-9, "−110 win profit");
check(unitProfit("loss", 2, -110) === -2, "loss stakes the units");
check(unitProfit("push", 1, -110) === 0, "push is a zero");

check(chadWindowSize(9) === 3, "9 peers → 3 Chad seats");
check(chadWindowSize(4) === 2, "4 peers → 2 Chad seats");
check(chadWindowSize(3) === 1, "3 peers → 1 Chad seat");
check(chadWindowSize(2) === 0, "2 peers withhold Chad");

const marked = orderAndMark([
  { id: "a", handle: "a", graded: 20, ch: 90, netUnits: 1 },
  { id: "b", handle: "b", graded: 20, ch: 80, netUnits: 1 },
  { id: "c", handle: "c", graded: 20, ch: 76, netUnits: 1 },
  { id: "d", handle: "d", graded: 20, ch: 76, netUnits: 0 },
  { id: "e", handle: "e", graded: 20, ch: 75, netUnits: 5 },
  { id: "f", handle: "f", graded: 20, ch: 60, netUnits: 0 },
  { id: "g", handle: "g", graded: 10, ch: 88, netUnits: 4 },
]);
const badgeOf = (id: string) => marked.find((row) => row.id === id)?.badge;
check(badgeOf("a") === "chad" && badgeOf("b") === "chad", "top of a 6-peer set are Chad");
check(badgeOf("c") === "listed" && badgeOf("d") === "listed" && badgeOf("e") === "listed", "outside the window stays Listed");
check(badgeOf("f") === "chud", "under 70 is Chud");
check(badgeOf("g") === "provisional", "short sample at 88 is Provisional");

const tied = orderAndMark(
  Array.from({ length: 9 }, (_, index) => ({
    id: String(index),
    handle: String(index),
    graded: 20,
    ch: [90, 80, 76, 76, 70, 69, 60, 55, 40][index],
    netUnits: 0,
  })),
);
check(tied.filter((row) => row.badge === "chad").map((row) => row.id).join(",") === "0,1,2,3", "tie at the cutoff stays inside Chad");
check(tied.find((row) => row.id === "4")?.badge === "listed", "70 outside the window is Listed");
check(tied.find((row) => row.id === "5")?.badge === "chud", "69 is Chud");

const short = scorePicks(
  Array.from({ length: 6 }, () => ({
    grade: "win" as const,
    units: 1,
    oddsAmerican: -110,
    locked: true,
    explicit: true,
  })),
);
check(short.ch != null && short.ch < 70, `six wins should stay under 70, got ${short.ch}`);

async function checkLedger() {
  const ledger = await loadLedger();
  check(ledger.length >= 10, "demo roster is thin");

  for (const capper of ledger) {
    check(capper.isDemo, `${capper.handle} is not flagged demo`);
    for (const pick of capper.picks) {
      check(pick.isDemo, `${pick.id} is not flagged demo`);
      check(pick.event.source === RESULT_SOURCE, `${pick.event.id} source is ${pick.event.source}`);
      const recomputed = gradeMarket({
        market: pick.market,
        side: pick.side,
        line: pick.line,
        homeScore: pick.event.homeScore,
        awayScore: pick.event.awayScore,
        propActual: pick.propActual,
        status: pick.event.status,
      });
      check(recomputed === pick.grade, `${pick.id} stored ${pick.grade} but grades ${recomputed}`);
      if (pick.event.status === "final") {
        check(pick.event.homeScore != null && pick.event.awayScore != null, `${pick.event.id} final missing score`);
        check(pick.event.sourceNote === FINAL_NOTE, `${pick.event.id} final note drifted`);
      }
      if (pick.event.status === "scheduled") {
        check(pick.event.homeScore == null && pick.event.awayScore == null, `${pick.event.id} invented a score`);
        check(pick.event.sourceNote === OPEN_NOTE, `${pick.event.id} open note drifted`);
      }
      if (pick.event.status === "cancelled") {
        check(pick.event.sourceNote === VOID_NOTE, `${pick.event.id} void note drifted`);
      }
    }
  }

  const overall = buildBoard(ledger, "all", null);
  const season = buildBoard(ledger, "season", null);
  const nfl = buildBoard(ledger, "all", "NFL");
  const ncaaf = buildBoard(ledger, "all", "NCAAF");

  const print = (title: string, rows: typeof overall.rows) => {
    console.log(`\n${title}`);
    for (const row of rows) {
      console.log(
        `${String(row.rank ?? "–").padStart(2)}  ${row.badge.padEnd(12)} ${row.handle.padEnd(14)} ${String(row.ch).padStart(3)}/100  n=${String(row.graded).padStart(2)}  ${row.wins}-${row.losses}-${row.pushes}  ${row.netUnits.toFixed(2)}u`,
      );
    }
  };
  print("Full ledger", overall.rows);
  print("Sample 2025", season.rows);

  const find = (board: typeof overall, handle: string) => board.rows.find((row) => row.handle === handle);

  const expect = (
    board: typeof overall,
    handle: string,
    badge: string,
    extra?: (row: NonNullable<ReturnType<typeof find>>) => boolean,
  ) => {
    const row = find(board, handle);
    check(row?.badge === badge, `${handle} on ${board.sport ?? "all"}/${board.window} is ${row?.badge} (${row?.ch}), expected ${badge}`);
    if (row && extra) check(extra(row), `${handle} failed extra check (ch ${row.ch}, n ${row.graded})`);
  };

  expect(overall, "linelock", "chad");
  expect(overall, "propclerk", "chad");
  expect(overall, "totalsdesk", "chad");
  expect(overall, "saturdayslate", "listed", (row) => row.ch >= 70);
  expect(overall, "hotcard", "provisional", (row) => row.ch >= 70 && row.graded < MIN_GRADED);
  expect(overall, "sixpack", "chud", (row) => row.ch < 70 && row.graded < MIN_GRADED);
  expect(overall, "boxscore", "chud", (row) => row.ch < 70 && row.ch >= 60);
  expect(overall, "evenkeel", "chud");
  expect(overall, "latelean", "chud");
  expect(overall, "unitstorm", "chud");
  expect(overall, "pucksheet", "chud");

  expect(season, "saturdayslate", "chad");
  expect(season, "linelock", "listed", (row) => row.ch >= 70);
  expect(nfl, "linelock", "chad");
  expect(ncaaf, "saturdayslate", "chad");

  for (const board of [overall, season, nfl, ncaaf]) {
    for (const row of board.rows) {
      if (row.badge === "chad") {
        check(row.ch != null && row.ch >= 70, `${row.handle} Chad under 70`);
        check(row.graded >= MIN_GRADED, `${row.handle} Chad with a short sample`);
      }
      if (row.badge === "chud") check(row.ch != null && row.ch < 70, `${row.handle} Chud at ${row.ch}`);
      if (row.badge === "listed" || row.badge === "provisional") {
        check(row.ch != null && row.ch >= 70, `${row.handle} ${row.badge} under 70`);
      }
    }
  }

  const demo = getResultsAdapter();
  const finalId = ledger.flatMap((capper) => capper.picks).find((pick) => pick.event.status === "final")?.event.id;
  check(demo.mode === "demo", "default adapter should be the demo seed");
  if (finalId) {
    const verified = await demo.fetchFinals([finalId]);
    check(verified.length === 1 && verified[0].source === RESULT_SOURCE, "demo adapter did not return the seeded final");
    const openId = ledger.flatMap((capper) => capper.picks).find((pick) => pick.event.status === "scheduled")?.event.id;
    if (openId) {
      const open = await demo.fetchFinals([openId]);
      check(open.length === 0, "demo adapter returned a final for an open fixture");
    }
  }
  process.env.RESULTS_FEED = "live";
  const forced = getResultsAdapter();
  const invented = await forced.fetchFinals(
    ledger.flatMap((capper) => capper.picks.map((pick) => pick.event.id)),
  );
  check(forced.mode === "live", "live mode did not select the live adapter");
  check(invented.length === 0, "live adapter invented finals");
}

checkLedger()
  .catch((error: unknown) => {
    errors.push(error instanceof Error ? error.message : String(error));
  })
  .finally(() => {
    if (errors.length > 0) {
      console.error(`\n${errors.length} scoring check${errors.length === 1 ? "" : "s"} failed:`);
      for (const error of errors) console.error(`- ${error}`);
      process.exit(1);
    }
    console.log("\nScoring checks passed.");
  });
