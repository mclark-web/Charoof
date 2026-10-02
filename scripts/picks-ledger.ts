/**
 * Verified picks ledger. data/picks/picks.csv is the source of truth.
 * The exporter writes data/verified-picks.json in the shape the site reads.
 * Bookkeeping columns stay in the CSV. data/friday-archive.json is never written.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { postTimeUnconfirmed } from "@/lib/books";
import { formatNewYorkDate, postedDay } from "@/lib/recency";
import { gradeFullGame, type LineGrade } from "@/lib/sports-grade";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const PICKS_CSV_PATH = join(ROOT, "data/picks/picks.csv");
export const VERIFIED_JSON_PATH = join(ROOT, "data/verified-picks.json");

export const CSV_COLUMNS = [
  "pick_id",
  "batch",
  "tipster",
  "sport",
  "event",
  "market",
  "side",
  "number",
  "price",
  "posted_at",
  "game_date",
  "game_start_et",
  "source_url",
  "alt_source_url",
  "espn_game_id",
  "status",
  "game_final",
  "final_score",
  "box_score_url",
  "graded_at",
  "grade_method",
  "flags",
  "notes",
  "export_index",
] as const;

/** Dropped on export. `export_index` keeps the JSON array order the page uses for row ids. */
export const CSV_ONLY_COLUMNS = [
  "pick_id",
  "batch",
  "game_start_et",
  "espn_game_id",
  "graded_at",
  "grade_method",
  "flags",
  "notes",
  "export_index",
] as const;

export const STATUSES = ["PENDING", "WIN", "LOSS", "PUSH", "VOID"] as const;

export const KNOWN_FLAGS = [
  "post-time-unconfirmed",
  "price-unstated",
  "partial-game",
  "manual-grade",
  "lean-no-number",
] as const;

export type CsvColumn = (typeof CSV_COLUMNS)[number];
export type PickRow = Record<CsvColumn, string>;

export type VerifiedJsonPick = {
  tipster: string;
  sport: string;
  event: string;
  market: string;
  side: string;
  number: number | null;
  price: string | null;
  posted_at: string;
  game_date?: string;
  source_url: string;
  alt_source_url?: string;
  game_final: boolean;
  result: string;
  box_score_url: string;
  final_score: string;
};

export type LedgerIssues = {
  errors: string[];
  warnings: string[];
};

const PARTIAL_MARKET = /\((?:1H|1Q|F5)\)|\b(?:nrfi|yrfi|dnb)\b|\bprop\b/i;

/** sha256 hex of tipster|event|market|side|number|posted_at. An empty number stays blank. */
export function pickIdFor(tipster: string, event: string, market: string, side: string, number: string, postedAt: string): string {
  const key = [tipster, event, market, side, number, postedAt].join("|");
  return createHash("sha256").update(key, "utf8").digest("hex");
}

export function espnGameId(url: string): string {
  return /gameId[=/](\d+)/.exec(url)?.[1] ?? "";
}

export function parseNumber(value: string): number | null {
  if (value === "") return null;
  if (!/^-?\d+(\.\d+)?$/.test(value)) return null;
  return Number(value);
}

function formatNumber(value: number): string {
  return JSON.stringify(value);
}

function isPartialMarket(market: string): boolean {
  return PARTIAL_MARKET.test(market);
}

const FULL_GAME_MARKETS = new Set(["spread", "run_line", "total", "moneyline", "team_total"]);

/** Full-game lines `gradeFullGame` can settle. Partials, props, and other markets stay manual. */
export function isAutoGradeMarket(market: string): boolean {
  return FULL_GAME_MARKETS.has(market) && !isPartialMarket(market);
}

function leanWithoutNumber(row: PickRow): boolean {
  if (row.number !== "") return false;
  if (row.market === "moneyline" || row.market.startsWith("moneyline")) return false;
  if (row.market === "nrfi" || row.market === "yrfi") return false;
  return true;
}

export function regrade(row: PickRow): LineGrade | null {
  if (row.status === "PENDING" || row.game_final !== "true") return null;
  const number = parseNumber(row.number);
  if (row.number !== "" && number == null) return null;
  return gradeFullGame({
    market: row.market,
    side: row.side,
    number,
    finalScore: row.final_score,
  });
}

/** Flags in canonical order. `manual-grade` is required when a final card cannot be regraded. */
export function expectedFlags(row: PickRow): string {
  const flags: string[] = [];
  if (postTimeUnconfirmed(row.posted_at)) flags.push("post-time-unconfirmed");
  if (row.price === "") flags.push("price-unstated");
  if (isPartialMarket(row.market)) flags.push("partial-game");
  if (row.status !== "PENDING" && regrade(row) == null) flags.push("manual-grade");
  if (leanWithoutNumber(row)) flags.push("lean-no-number");
  return flags.join(";");
}

export function readVerifiedJson(): VerifiedJsonPick[] {
  return JSON.parse(readFileSync(VERIFIED_JSON_PATH, "utf8")) as VerifiedJsonPick[];
}

export function rowFromVerified(pick: VerifiedJsonPick, index: number): PickRow {
  const status = pick.result.toUpperCase();
  const row: PickRow = {
    pick_id: "",
    batch: "verified",
    tipster: pick.tipster,
    sport: pick.sport,
    event: pick.event,
    market: pick.market,
    side: pick.side,
    number: pick.number == null ? "" : formatNumber(pick.number),
    price: pick.price ?? "",
    posted_at: pick.posted_at,
    game_date: pick.game_date ?? "",
    game_start_et: "",
    source_url: pick.source_url,
    alt_source_url: pick.alt_source_url ?? "",
    espn_game_id: espnGameId(pick.box_score_url),
    status,
    game_final: pick.game_final ? "true" : "false",
    final_score: pick.final_score,
    box_score_url: pick.box_score_url,
    graded_at: "",
    grade_method: status === "PENDING" ? "" : "manual",
    flags: "",
    notes: "",
    export_index: String(index),
  };
  row.pick_id = pickIdFor(row.tipster, row.event, row.market, row.side, row.number, row.posted_at);
  row.flags = expectedFlags(row);
  return row;
}

export function rowsFromVerified(picks: VerifiedJsonPick[]): PickRow[] {
  return picks
    .map((pick, index) => rowFromVerified(pick, index))
    .sort((a, b) => (a.pick_id < b.pick_id ? -1 : a.pick_id > b.pick_id ? 1 : 0));
}

export function toVerifiedPick(row: PickRow): VerifiedJsonPick {
  const pick: Record<string, unknown> = {
    tipster: row.tipster,
    sport: row.sport,
    event: row.event,
    market: row.market,
    side: row.side,
    number: parseNumber(row.number),
    price: row.price === "" ? null : row.price,
    posted_at: row.posted_at,
    game_date: row.game_date,
    source_url: row.source_url,
  };
  if (row.alt_source_url !== "") pick.alt_source_url = row.alt_source_url;
  pick.game_final = row.game_final === "true";
  pick.result = row.status.toLowerCase();
  pick.box_score_url = row.box_score_url;
  pick.final_score = row.final_score;
  return pick as VerifiedJsonPick;
}

export function renderVerifiedJson(rows: PickRow[]): string {
  const ordered = rows.slice().sort((a, b) => Number(a.export_index) - Number(b.export_index));
  return `${JSON.stringify(ordered.map(toVerifiedPick), null, 2)}\n`;
}

function escapeField(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function serializePickCsv(rows: PickRow[]): string {
  const lines = [CSV_COLUMNS.join(",")];
  for (const row of rows) lines.push(CSV_COLUMNS.map((column) => escapeField(row[column])).join(","));
  return `${lines.join("\n")}\n`;
}

/** RFC 4180 records. A trailing newline does not create an extra row. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let i = text.charCodeAt(0) === 0xfeff ? 1 : 0;
  while (i < text.length) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        quoted = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }
    if (char === '"') {
      quoted = true;
      i += 1;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    field += char;
    i += 1;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  if (rows.length > 0 && rows[rows.length - 1].every((cell) => cell === "")) rows.pop();
  return rows;
}

export function parsePickCsv(text: string): PickRow[] {
  const table = parseCsv(text);
  if (table.length === 0) throw new Error("picks.csv is empty");
  const header = table[0].join(",");
  const expected = CSV_COLUMNS.join(",");
  if (header !== expected) throw new Error(`picks.csv header must be ${expected}`);
  return table.slice(1).map((cells, index) => {
    if (cells.length !== CSV_COLUMNS.length) {
      throw new Error(`picks.csv row ${index + 2} has ${cells.length} columns, expected ${CSV_COLUMNS.length}`);
    }
    const row = {} as PickRow;
    CSV_COLUMNS.forEach((column, columnIndex) => {
      row[column] = cells[columnIndex] ?? "";
    });
    return row;
  });
}

function validCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function rowLabel(row: PickRow, index: number): string {
  return row.pick_id || `row ${index + 2}`;
}

export function collectIssues(rows: PickRow[]): LedgerIssues {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();
  const indexes = new Set<number>();

  const sorted = rows.map((row) => row.pick_id);
  const ordered = sorted.slice().sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  if (sorted.some((id, index) => id !== ordered[index])) errors.push("picks.csv must be sorted by pick_id");

  rows.forEach((row, index) => {
    const label = rowLabel(row, index);
    if (row.batch !== "verified") errors.push(`${label}: batch must be verified so the Friday archive stays frozen`);
    if (!STATUSES.includes(row.status as (typeof STATUSES)[number])) {
      errors.push(`${label}: status must be ${STATUSES.join(", ")}`);
    }
    try {
      postedDay(row.posted_at);
    } catch (error) {
      errors.push(`${label}: posted_at is not parseable (${error instanceof Error ? error.message : "bad stamp"})`);
    }
    if (!validCalendarDate(row.game_date)) errors.push(`${label}: game_date must be an ET calendar date YYYY-MM-DD`);
    else {
      try {
        formatNewYorkDate(row.game_date);
      } catch (error) {
        errors.push(`${label}: game_date was rejected (${error instanceof Error ? error.message : "bad date"})`);
      }
    }
    if (row.number !== "" && parseNumber(row.number) == null) errors.push(`${label}: number is not a decimal`);
    if (row.game_final !== "true" && row.game_final !== "false") errors.push(`${label}: game_final must be true or false`);
    if (row.graded_at !== "" && !/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(row.graded_at)) {
      errors.push(`${label}: graded_at must be an ISO timestamp when set`);
    }
    if (row.game_start_et !== "" && !/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(row.game_start_et)) {
      errors.push(`${label}: game_start_et must include a date and time when set`);
    }
    if (row.status === "PENDING") {
      if (row.grade_method !== "") errors.push(`${label}: a pending row has no grade_method`);
    } else if (row.grade_method !== "manual" && row.grade_method !== "auto-espn") {
      errors.push(`${label}: grade_method must be manual or auto-espn`);
    }
    const exportIndex = Number(row.export_index);
    if (!/^(0|[1-9]\d*)$/.test(row.export_index) || indexes.has(exportIndex)) {
      errors.push(`${label}: export_index must be a unique integer`);
    } else {
      indexes.add(exportIndex);
    }

    const id = pickIdFor(row.tipster, row.event, row.market, row.side, row.number, row.posted_at);
    if (row.pick_id !== id) errors.push(`${label}: pick_id does not match tipster|event|market|side|number|posted_at`);
    if (seenIds.has(row.pick_id)) errors.push(`${label}: duplicate pick_id`);
    else seenIds.add(row.pick_id);

    if (row.espn_game_id !== espnGameId(row.box_score_url)) {
      errors.push(`${label}: espn_game_id does not match box_score_url`);
    }
    const flags = expectedFlags(row);
    if (row.flags !== flags) errors.push(`${label}: flags must be ${flags || "(none)"}`);

    const again = regrade(row);
    if (again != null && again !== row.status.toLowerCase()) {
      errors.push(`${label}: regrade is ${again}, stored status is ${row.status}`);
    }

    if (row.status === "PENDING") {
      if (row.game_final !== "false" || row.final_score !== "Not final") {
        errors.push(`${label}: a pending row needs game_final false and final_score "Not final"`);
      }
    } else if (row.game_final !== "true") {
      errors.push(`${label}: a graded row must mark the game final`);
    }
    if (row.game_final === "true") {
      if (row.status === "PENDING" || row.final_score === "" || row.final_score === "Not final" || row.box_score_url === "") {
        errors.push(`${label}: a finished game is missing a result, final_score, or box_score_url`);
      }
    }
  });

  for (let index = 0; index < rows.length; index += 1) {
    if (!indexes.has(index)) errors.push(`export_index is missing ${index}`);
  }

  const groups = new Map<string, PickRow[]>();
  for (const row of rows) {
    const key = [row.tipster, row.event, row.market, row.side].join("|");
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }
  for (const group of groups.values()) {
    const ids = new Set(group.map((row) => row.pick_id));
    if (ids.size < 2) continue;
    const detail = group
      .map((row) => `${row.number || "(no number)"} posted ${row.posted_at}`)
      .join("; ");
    warnings.push(`near-duplicate ${group[0].tipster} · ${group[0].event} · ${group[0].market} · ${group[0].side}: ${detail}`);
  }
  warnings.sort();

  return { errors, warnings };
}
