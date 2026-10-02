/**
 * Regenerate data/verified-picks.json from data/picks/picks.csv.
 * Does not write data/friday-archive.json.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { collectIssues, parsePickCsv, PICKS_CSV_PATH, renderVerifiedJson, VERIFIED_JSON_PATH } from "./picks-ledger";

const csv = readFileSync(PICKS_CSV_PATH, "utf8");
const rows = parsePickCsv(csv);
const issues = collectIssues(rows);
for (const warning of issues.warnings) console.warn(`WARN ${warning}`);
if (issues.errors.length > 0) {
  for (const error of issues.errors) console.error(`ERROR ${error}`);
  console.error(`Refusing to write ${VERIFIED_JSON_PATH}`);
  process.exit(1);
}

const json = renderVerifiedJson(rows);
writeFileSync(VERIFIED_JSON_PATH, json);
console.log(`Wrote ${rows.length} verified picks to data/verified-picks.json`);
