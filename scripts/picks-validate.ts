/**
 * Check the picks ledger with the same grade, blend, and record code the site uses.
 * data/friday-archive.json is read-only and is included in the public record line.
 */
import { readFileSync } from "node:fs";
import fridayArchive from "@/data/friday-archive.json";
import { postTimeUnconfirmed, publicCapperRows, publicLedgerLine, sportsOutcomes } from "@/lib/books";
import { GRADE_BANDS, gradeForFill } from "@/lib/grade";
import { hitFill, type Outcome } from "@/lib/outcome";
import { blendWinRate, gradedPickCount, MIN_GRADED_PICKS, postedDay, presentCapper, RECENCY_WINDOWS } from "@/lib/recency";
import {
  collectIssues,
  CSV_ONLY_COLUMNS,
  parsePickCsv,
  PICKS_CSV_PATH,
  readVerifiedJson,
  renderVerifiedJson,
  rowsFromVerified,
  serializePickCsv,
  VERIFIED_JSON_PATH,
  type PickRow,
} from "./picks-ledger";

/**
 * Public record for this ledger: timed verified rows plus the frozen Friday archive.
 * A later data change updates this line in the same commit.
 */
const PUBLIC_RECORD_LINE = "343 public picks \u00b7 174\u2013137\u20131 \u00b7 2 void \u00b7 29 pending";

const OUTCOMES: Outcome[] = ["win", "loss", "push", "void", "pending"];

function tally(outcomes: Outcome[]) {
  const counts = { win: 0, loss: 0, push: 0, void: 0, pending: 0 };
  for (const outcome of outcomes) counts[outcome] += 1;
  return counts;
}

function asOutcome(value: string, id: string): Outcome {
  if (OUTCOMES.includes(value as Outcome)) return value as Outcome;
  throw new Error(`Unknown grade ${value} on ${id}`);
}

function timedOutcomes(rows: PickRow[]): Outcome[] {
  return rows
    .filter((row) => !postTimeUnconfirmed(row.posted_at))
    .map((row) => asOutcome(row.status.toLowerCase(), row.pick_id));
}

function checkGradeRules(errors: string[]) {
  if (GRADE_BANDS.strongAt !== 70 || GRADE_BANDS.weakAt !== 40) {
    errors.push(`grade bands must be 70 and 40, found ${GRADE_BANDS.strongAt} and ${GRADE_BANDS.weakAt}`);
  }
  if (MIN_GRADED_PICKS !== 10) errors.push(`sample floor must be 10 graded picks, found ${MIN_GRADED_PICKS}`);
  const weights = RECENCY_WINDOWS.map((window) => window.weight);
  const days = RECENCY_WINDOWS.map((window) => window.days);
  if (weights.join("/") !== "40/30/20/10" || days.join("/") !== "7/14/30/90") {
    errors.push(`recency windows must be 7/14/30/90 days at 40/30/20/10, found ${days.join("/")} at ${weights.join("/")}`);
  }

  const bands: Array<[number, string]> = [
    [70, "STRONG"],
    [100, "STRONG"],
    [69.5, "PROVISIONAL"],
    [69, "PROVISIONAL"],
    [40, "PROVISIONAL"],
    [39.5, "WEAK"],
    [1, "WEAK"],
    [0, "EXIT LIQUIDITY"],
  ];
  for (const [fill, name] of bands) {
    if (gradeForFill(fill).name !== name) errors.push(`gradeForFill(${fill}) must be ${name}`);
  }

  const asOf = postedDay("2026-09-24");
  const dated = (iso: string, outcome: Outcome) => ({ at: postedDay(iso), outcome });
  const renormalized = blendWinRate(
    [dated("2026-09-10", "win"), dated("2026-07-01", "loss")],
    asOf,
  );
  const active = [
    { weight: RECENCY_WINDOWS[1].weight, rate: 100 },
    { weight: RECENCY_WINDOWS[2].weight, rate: 100 },
    { weight: RECENCY_WINDOWS[3].weight, rate: 50 },
  ];
  const weight = active.reduce((sum, window) => sum + window.weight, 0);
  const expected = active.reduce((sum, window) => sum + window.rate * window.weight, 0) / weight;
  const emptyWeek = (renormalized.windows[0]?.wins ?? 0) + (renormalized.windows[0]?.losses ?? 0);
  if (emptyWeek !== 0 || renormalized.fill !== expected) {
    errors.push("empty recency windows must be dropped and the remaining 40/30/20/10 weights renormalized");
  }

  const cutoff = blendWinRate([dated("2026-09-17", "win")], asOf);
  const beforeCutoff = blendWinRate([dated("2026-09-16", "loss")], asOf);
  const week = cutoff.windows[0];
  const priorWeek = beforeCutoff.windows[0];
  const twoWeek = beforeCutoff.windows[1];
  if (week?.wins !== 1 || (priorWeek?.wins ?? 0) + (priorWeek?.losses ?? 0) !== 0 || twoWeek?.losses !== 1) {
    errors.push("recency windows must count back from the ET posted day, including the cutoff day");
  }

  const shortStrong = blendWinRate(Array.from({ length: 9 }, () => dated("2026-09-20", "win")), asOf);
  const shortWeak = blendWinRate(
    [dated("2026-09-20", "win"), ...Array.from({ length: 8 }, () => dated("2026-09-20", "loss"))],
    asOf,
  );
  const shortExit = blendWinRate(Array.from({ length: 9 }, () => dated("2026-09-20", "loss")), asOf);
  const fullExit = blendWinRate(Array.from({ length: 10 }, () => dated("2026-09-20", "loss")), asOf);
  if (gradedPickCount(shortStrong) !== 9 || presentCapper(shortStrong).grade.name !== "PROVISIONAL") {
    errors.push("fewer than 10 graded picks in 90 days must stay PROVISIONAL when the blend would be STRONG");
  }
  if (gradeForFill(shortWeak.fill ?? 0).name !== "WEAK" || presentCapper(shortWeak).grade.name !== "PROVISIONAL") {
    errors.push("fewer than 10 graded picks in 90 days must stay PROVISIONAL when the blend would be WEAK");
  }
  if (presentCapper(shortExit).grade.name !== "PROVISIONAL" || presentCapper(shortExit).fill !== 0) {
    errors.push("fewer than 10 graded picks in 90 days must stay PROVISIONAL when the blend is 0%");
  }
  if (presentCapper(fullExit).grade.name !== "EXIT LIQUIDITY" || gradeForFill(0).name !== "EXIT LIQUIDITY") {
    errors.push("a graded 0% with a full 90-day sample must be EXIT LIQUIDITY");
  }

  const empty = blendWinRate([dated("2026-09-20", "push"), dated("2026-07-01", "void")], asOf);
  if (empty.fill !== null || presentCapper(empty).grade.name !== "PROVISIONAL" || presentCapper(empty).fill !== null) {
    errors.push("when every recency window is empty the card must be PROVISIONAL with no score");
  }

  for (const row of publicCapperRows()) {
    if (row.fill == null && row.gradeName !== "PROVISIONAL") {
      errors.push(`${row.title}: an empty blend must be PROVISIONAL`);
    } else if (row.gradeName === "EXIT LIQUIDITY" && row.fill !== 0) {
      errors.push(`${row.title}: EXIT LIQUIDITY requires a graded 0%`);
    } else if (row.gradeName === "STRONG" && (row.fill == null || row.fill < GRADE_BANDS.strongAt)) {
      errors.push(`${row.title}: STRONG requires a fill of ${GRADE_BANDS.strongAt} or higher`);
    } else if (row.gradeName === "WEAK" && (row.fill == null || row.fill <= 0 || row.fill >= GRADE_BANDS.weakAt)) {
      errors.push(`${row.title}: WEAK requires a fill above 0 and below ${GRADE_BANDS.weakAt}`);
    }
  }
}

function sameCounts(left: ReturnType<typeof tally>, right: ReturnType<typeof tally>): boolean {
  return OUTCOMES.every((outcome) => left[outcome] === right[outcome]);
}

function main() {
  const errors: string[] = [];
  const csvText = readFileSync(PICKS_CSV_PATH, "utf8");
  const jsonText = readFileSync(VERIFIED_JSON_PATH, "utf8");
  const rows = parsePickCsv(csvText);
  const issues = collectIssues(rows);
  errors.push(...issues.errors);

  const rendered = renderVerifiedJson(rows);
  const renderedAgain = renderVerifiedJson(parsePickCsv(serializePickCsv(rows)));
  if (rendered !== renderedAgain) errors.push("exporting the CSV twice was not byte-identical");
  if (rendered !== jsonText) errors.push("data/verified-picks.json is not the export of picks.csv");

  const wiped = rows.map((row) => ({
    ...row,
    notes: "",
    graded_at: "",
    game_start_et: "",
    grade_method: row.status === "PENDING" ? "" : "manual",
  }));
  if (renderVerifiedJson(wiped) !== rendered) {
    errors.push("bookkeeping columns notes, graded_at, game_start_et, or grade_method changed the exported JSON");
  }

  const fromDisk = rowsFromVerified(readVerifiedJson());
  if (renderVerifiedJson(fromDisk) !== jsonText) errors.push("verified JSON fields did not round-trip");

  const parsed = JSON.parse(rendered) as Array<Record<string, unknown>>;
  for (const pick of parsed) {
    for (const column of CSV_ONLY_COLUMNS) {
      if (column in pick) errors.push(`exported JSON includes CSV-only column ${column}`);
    }
  }

  checkGradeRules(errors);

  const fridayOutcomes = fridayArchive.picks.map((pick) => asOutcome(pick.grade, pick.id));
  const csvCounts = tally([...timedOutcomes(rows), ...fridayOutcomes]);
  const siteCounts = tally(sportsOutcomes());
  const csvLine = publicLedgerLine(csvCounts);
  const siteLine = publicLedgerLine(siteCounts);
  if (!sameCounts(csvCounts, siteCounts) || csvLine !== siteLine) {
    errors.push(`record math drifted: csv ${csvLine} / site ${siteLine}`);
  }
  if (siteLine !== PUBLIC_RECORD_LINE) errors.push(`public record must be ${PUBLIC_RECORD_LINE}`);

  const decisive = siteCounts.win + siteCounts.loss;
  const rate = hitFill(siteCounts.win, siteCounts.loss);
  const unrounded = decisive === 0 ? 0 : (100 * siteCounts.win) / decisive;
  if (rate !== unrounded) errors.push("hit rate must be the unrounded wins/(wins+losses)");

  const excluded = rows.filter((row) => postTimeUnconfirmed(row.posted_at)).length;
  console.log(`rows: ${rows.length}`);
  console.log(`date-only posted_at excluded from the record: ${excluded}`);
  console.log(`friday archive rows: ${fridayArchive.picks.length}`);
  console.log(`record (csv + frozen Friday archive): ${csvLine}`);
  console.log(`record (site publicLedgerLine): ${siteLine}`);
  console.log(`hit rate unrounded: ${rate}`);
  console.log(`json derived from csv: ${rendered === jsonText ? "byte-identical" : "MISMATCH"}`);
  console.log(`bookkeeping stays csv-only: ${renderVerifiedJson(wiped) === rendered ? "yes" : "MISMATCH"}`);
  console.log(`idempotent export: ${rendered === renderedAgain ? "byte-identical" : "MISMATCH"}`);
  for (const warning of issues.warnings) console.log(`WARN ${warning}`);
  if (errors.length > 0) {
    for (const error of errors) console.error(`ERROR ${error}`);
    process.exit(1);
  }
  console.log("OK");
}

main();
