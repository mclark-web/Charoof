import { readFileSync } from "node:fs";
import path from "node:path";

import { findGame, teamsAlign, type BoardGame } from "../src/lib/espn";
import { gradeMarket } from "../src/lib/grade";
import { parseIngest } from "../src/lib/ingest-parse";
import { settleAgainstPublic } from "../src/lib/settle";

const errors: string[] = [];

function check(condition: unknown, message: string) {
  if (!condition) errors.push(message);
}

const wrongWouldWin = gradeMarket({
  market: "moneyline",
  side: "home",
  line: null,
  homeScore: 20,
  awayScore: 3,
  propActual: null,
  status: "final",
});
check(wrongWouldWin === "win", "setup: a 20-3 home moneyline is a win");

const conflict = settleAgainstPublic(
  { market: "moneyline", side: "home", line: null, propActual: null },
  { status: "final", homeScore: 20, awayScore: 3 },
  { status: "final", homeScore: 3, awayScore: 20 },
);
check(conflict.mismatch, "conflicting final was not flagged");
check(conflict.grade !== "win", "a wrong final silently marked a win");
check(conflict.grade === "loss", `public final should grade a loss, got ${conflict.grade}`);

const unconfirmed = settleAgainstPublic(
  { market: "moneyline", side: "home", line: null, propActual: null },
  { status: "final", homeScore: 20, awayScore: 3 },
  null,
);
check(unconfirmed.grade === "pending", "a final with no public source must stay pending");
check(unconfirmed.usedPublicFinal === false, "unconfirmed final was treated as public");

const openGame = settleAgainstPublic(
  { market: "total", side: "under", line: 42.5, propActual: null },
  null,
  { status: "scheduled", homeScore: null, awayScore: null },
);
check(openGame.grade === "pending", "an open fixture must stay pending");

const confirmed = settleAgainstPublic(
  { market: "total", side: "under", line: 42.5, propActual: null },
  { status: "final", homeScore: 20, awayScore: 3 },
  { status: "final", homeScore: 20, awayScore: 3 },
);
check(confirmed.grade === "win" && confirmed.mismatch === false, "matching public final should grade the under");

const slate: BoardGame[] = [
  {
    homeName: "Arkansas Razorbacks",
    awayName: "Georgia Bulldogs",
    homeScore: 17,
    awayScore: 45,
    status: "final",
    sourceUrl: "https://example.test/arkansas",
  },
  {
    homeName: "Georgia Tech Yellow Jackets",
    awayName: "Mercer Bears",
    homeScore: 44,
    awayScore: 11,
    status: "final",
    sourceUrl: "https://example.test/tech",
  },
  {
    homeName: "TCU Horned Frogs",
    awayName: "Arkansas State Red Wolves",
    homeScore: 31,
    awayScore: 7,
    status: "final",
    sourceUrl: "https://example.test/tcu",
  },
];
const arkansas = findGame(slate, "Arkansas Razorbacks", "Georgia Bulldogs");
check(arkansas !== "ambiguous" && arkansas?.homeScore === 17 && arkansas.awayScore === 45, "Georgia at Arkansas matched the wrong game");
const shortNames = findGame(slate, "Arkansas", "Georgia");
check(shortNames !== "ambiguous" && shortNames?.awayScore === 45, "short names collided with Georgia Tech or Arkansas State");
check(teamsAlign("Wake Forest", "Wake Forest Demon Deacons"), "Wake Forest should match the ESPN name");
check(findGame(slate, "Georgia", "Georgia") === "ambiguous" || findGame(slate, "Georgia Tech", "Mercer Bears") !== null, "tech game still findable");

const labeled = parseIngest(readFileSync(path.join(process.cwd(), "fixtures/ingest/labeled-eagles.txt"), "utf8"));
check(labeled.ok, "labeled Eagles paste should parse");
if (labeled.ok) {
  check(labeled.pick.side === "away", `Eagles should be the away side, got ${labeled.pick.side}`);
  check(labeled.pick.line === -7.5, "Eagles line drifted");
  check(labeled.pick.sourceUrl.startsWith("https://www.covers.com/"), "source URL dropped");
  check(labeled.pick.publishedAt === "2026-09-20T18:10:00.000Z", `timestamp parsed as ${labeled.pick.publishedAt}`);
}

const missingSide = parseIngest(readFileSync(path.join(process.cwd(), "fixtures/ingest/missing-side.txt"), "utf8"));
check(!missingSide.ok && !missingSide.ok && missingSide.missing.includes("side"), "missing side was accepted");

const bareUrl = parseIngest("https://www.covers.com/nfl/eagles-vs-titans-prediction-picks-best-bets-today-sept-20-2026");
check(!bareUrl.ok, "bare URL was accepted");
if (!bareUrl.ok) {
  for (const field of ["timestamp", "event", "side"]) {
    check(bareUrl.missing.includes(field), `bare URL did not refuse ${field}`);
  }
}

const noSource = parseIngest("timestamp: 2026-09-20T14:10:00-04:00\nwho: Neil Parker\nevent: Philadelphia Eagles at Tennessee Titans\nside: away\n");
check(!noSource.ok && !noSource.ok && noSource.missing.includes("source"), "missing source was accepted");

if (errors.length > 0) {
  console.error(`${errors.length} settle/ingest check${errors.length === 1 ? "" : "s"} failed:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Settle and ingest checks passed.");
