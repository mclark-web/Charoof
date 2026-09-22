import {
  ARCHIVE_SEASON,
  FINAL_NOTE,
  MIN_GRADED,
  OPEN_NOTE,
  PUBLIC_FINAL_NOTE,
  PUBLIC_RESULT_SOURCE,
  RESULT_SOURCE,
  VOID_NOTE,
} from "../src/lib/constants";
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
      const archive = pick.event.season === ARCHIVE_SEASON;
      if (archive) {
        check(pick.event.source === PUBLIC_RESULT_SOURCE, `${pick.event.id} archive source is ${pick.event.source}`);
        check(pick.event.sourceNote.startsWith(PUBLIC_FINAL_NOTE), `${pick.event.id} archive note drifted`);
        check(pick.event.sport !== "NFL", `${pick.event.id} is an NFL row on a Friday with no NFL card`);
        check(!/status\/\d{5,}/.test(pick.note ?? ""), `${pick.id} has a tweet-style id`);
      } else {
        check(pick.event.source === RESULT_SOURCE, `${pick.event.id} source is ${pick.event.source}`);
      }
      const recomputed = gradeMarket({
        market: pick.market,
        side: pick.side,
        line: pick.line,
        homeScore: pick.event.homeScore,
        awayScore: pick.event.awayScore,
        propActual: pick.propActual,
        status: pick.event.status,
        scoreScope: pick.scoreScope,
        participant: pick.participant,
        homeFirstQuarter: pick.event.homeFirstQuarter,
        awayFirstQuarter: pick.event.awayFirstQuarter,
        homeFirstHalf: pick.event.homeFirstHalf,
        awayFirstHalf: pick.event.awayFirstHalf,
      });
      check(recomputed === pick.grade, `${pick.id} stored ${pick.grade} but grades ${recomputed}`);
      if (pick.event.status === "final") {
        check(pick.event.homeScore != null && pick.event.awayScore != null, `${pick.event.id} final missing score`);
        if (!archive) check(pick.event.sourceNote === FINAL_NOTE, `${pick.event.id} final note drifted`);
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

  const archiveRows = ledger.flatMap((capper) => capper.picks.filter((pick) => pick.event.season === ARCHIVE_SEASON));
  check(archiveRows.length >= 8 && archiveRows.length <= 20, `archive has ${archiveRows.length} picks`);
  const gradeOf = (id: string) => archiveRows.find((pick) => pick.id === id)?.grade;
  check(gradeOf("robpaul-cfb-2026-09-18-wake-miami-total") === "loss", "Miami/Wake 53 did not clear 56.5");
  check(gradeOf("robpaul-cfb-2026-09-18-tech-houston-spread") === "loss", "Texas Tech 28-26 did not cover -7.5");
  check(gradeOf("robpaul-cfb-2026-09-18-oregon-psu-spread") === "win", "Oregon 84-0 covered -57.5");
  check(gradeOf("ryanminion-cfb-2026-09-18-wake-miami-1q") === "loss", "Miami 1Q 7-7 did not cover -6.5");
  check(gradeOf("ryanminion-cfb-2026-09-18-wake-miami-toney") === "win", "Toney 114 cleared 95.5");
  check(gradeOf("roadtocfb-cfb-2026-09-18-tech-houston-1h") === "win", "Texas Tech 1H 14 stayed under 15.5");
  check(gradeOf("joshuanunn-cfb-2026-09-18-oregon-psu-tt") === "win", "Oregon 84 cleared a 64.5 team total");
  check(gradeOf("joshinglis-mlb-2026-09-18-reds-cubs-ml") === "loss", "Cubs lost 4-6");
  check(gradeOf("jonmetler-mlb-2026-09-18-rays-redsox-ml") === "win", "Red Sox won 4-2");
  check(gradeOf("joeosborne-mlb-2026-09-18-rangers-jays-rl") === "loss", "Blue Jays lost 1-7 and did not cover -1.5");
  check(gradeOf("dustinsaracini-mlb-2026-09-18-whitesox-tigers-total") === "win", "Tigers/White Sox 19 cleared 8.5");
  check(gradeOf("quinnallen-mlb-2026-09-18-astros-braves-ml") === "win", "Braves won 6-2");
  check(gradeOf("quinnallen-mlb-2026-09-18-astros-braves-total") === "loss", "Braves/Astros 8 did not clear 8.5");
  check(gradeOf("quinnallen-mlb-2026-09-18-astros-braves-olson") === "win", "Olson homered");
  check(gradeOf("thecommish-mlb-2026-09-18-dodgers-giants-ml") === "win", "Dodgers won 8-2");
  check(gradeOf("thecommish-mlb-2026-09-18-dbacks-yankees-ml") === "win", "Yankees won 9-2");
  check(gradeOf("thecommish-cfb-2026-09-18-wake-miami-ats") === "void", "Miami ATS had no posted number");
  check(gradeOf("thecommish-cfb-2026-09-18-tech-houston-lean") === "void", "Texas Tech lean had no posted number");
  check(gradeOf("thecommish-soc-2026-09-18-bayern-union-ml") === "win", "Bayern won 7-0");
  check(gradeOf("thecommish-soc-2026-09-18-brentford-chelsea-dnb") === "loss", "Chelsea lost 0-3 on draw no bet");
  const wake = archiveRows.find((pick) => pick.event.id === "cfb-2026-09-18-wake-miami")?.event;
  check(wake?.awayScore === 33 && wake.homeScore === 20, "Wake Forest final drifted");

  const demo = getResultsAdapter();
  const finalId = ledger
    .flatMap((capper) => capper.picks)
    .find((pick) => pick.event.status === "final" && pick.event.source === RESULT_SOURCE)?.event.id;
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
