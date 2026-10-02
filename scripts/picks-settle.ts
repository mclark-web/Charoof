/**
 * Settle pending rows in data/picks/picks.csv from ESPN scoreboards.
 * Each game date is queried with the UTC day on either side. A row is graded only when
 * one FINAL regulation game matches its teams and the box score agrees.
 * A blank game_start_et does not choose between same-day games: a doubleheader stays
 * pending unless game_start_et or espn_game_id selects one game.
 * Partial-game markets and sides, props, postponements, shortened games, and ambiguous
 * matches are flagged, not graded.
 * The default is a dry run. The CSV is written only with --write. data/friday-archive.json is not touched.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { gradeFullGame } from "@/lib/sports-grade";
import {
  expectedFlags,
  isAutoGradeMarket,
  parseNumber,
  parsePickCsv,
  PICKS_CSV_PATH,
  serializePickCsv,
  type PickRow,
} from "./picks-ledger";

export type EspnGame = {
  id: string;
  awayName: string;
  homeName: string;
  awayScore: number;
  homeScore: number;
  startIso: string;
  statusName: string;
  detail: string;
  completed: boolean;
  /** Linescore length. MLB uses this as the inning count when ESPN sends one. */
  awayPeriods?: number;
  homePeriods?: number;
};

export type SettleAction = "graded" | "flagged" | "pending";

export type SettleResult = {
  row: PickRow;
  action: SettleAction;
  detail: string;
};

export type SettleWriteMode = "dry-run" | "write";

const SPORT_PATH: Record<string, string> = {
  NFL: "football/nfl",
  CFB: "football/college-football",
  NCAAF: "football/college-football",
  MLB: "baseball/mlb",
};

const SITE_SLUG: Record<string, string> = {
  "football/nfl": "nfl",
  "football/college-football": "college-football",
  "baseball/mlb": "mlb",
};

type Competitor = {
  homeAway?: string;
  score?: string;
  team?: { displayName?: string };
  linescores?: Array<{ displayValue?: string }>;
};

export function espnSportPath(sport: string): string | null {
  return SPORT_PATH[sport] ?? null;
}

export function shiftIsoDate(ymd: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!match) throw new Error(`Bad game date ${ymd}`);
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + days));
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

/** ESPN's dates filter is a UTC day, so a late ET kickoff can fall on the next date. */
export function scoreboardDates(gameDate: string): string[] {
  return [shiftIsoDate(gameDate, -1), gameDate, shiftIsoDate(gameDate, 1)];
}

export function etWallTime(iso: string): { date: string; time: string } {
  const instant = new Date(iso);
  if (!Number.isFinite(instant.getTime())) throw new Error(`Bad ESPN time ${iso}`);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return { date: `${value("year")}-${value("month")}-${value("day")}`, time: `${value("hour")}:${value("minute")}` };
}

export function gameStartEt(iso: string): string {
  const wall = etWallTime(iso);
  return `${wall.date} ${wall.time} ET`;
}

export function gradedAtEt(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const wall = Date.parse(`${value("year")}-${value("month")}-${value("day")}T${value("hour")}:${value("minute")}:${value("second")}Z`);
  const offsetMin = Math.round((wall - now.getTime()) / 60000);
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const hours = String(Math.floor(abs / 60)).padStart(2, "0");
  const minutes = String(abs % 60).padStart(2, "0");
  return `${value("year")}-${value("month")}-${value("day")}T${value("hour")}:${value("minute")}:${value("second")}${sign}${hours}:${minutes}`;
}

export function boxScoreUrl(sportPath: string, gameId: string): string {
  const slug = SITE_SLUG[sportPath];
  if (!slug) throw new Error(`No box score site for ${sportPath}`);
  return `https://www.espn.com/${slug}/game/_/gameId/${gameId}`;
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Exact short names that are not a token prefix of the ESPN display name.
 * Lookup is the whole normalized string, so "michigan" cannot resolve to "michigan state".
 */
const TEAM_ALIASES: Readonly<Record<string, string>> = {
  michigan: "michigan wolverines",
  "michigan state": "michigan state spartans",
  fiu: "florida international panthers",
  braves: "atlanta braves",
};

/** Extra tokens that make a longer school a different team, not a mascot. */
const SCHOOL_QUALIFIERS = new Set(["state", "tech", "college", "oh"]);

const PARTIAL_MARKER =
  /\((?:1H|1Q|F5)\)|\b(?:1H|1Q|F5|Q[1-4])\b|\b(?:first|1st)\s+half\b|\b(?:first|1st)\s+(?:5|five)(?:\s+innings)?\b|\b(?:nrfi|yrfi|dnb)\b|\bprop\b/i;

function canonicalize(value: string): string {
  const normal = normalizeName(value);
  return TEAM_ALIASES[normal] ?? normal;
}

function hasSchoolQualifier(tokens: string[]): boolean {
  if (tokens.some((token) => SCHOOL_QUALIFIERS.has(token))) return true;
  for (let i = 0; i < tokens.length - 1; i++) {
    if (tokens[i] === "a" && tokens[i + 1] === "m") return true;
  }
  return false;
}

/** 1H, F5, Q1, first half, and the other partial-game markers, in the market or the side. */
export function hasPartialMarker(value: string): boolean {
  return PARTIAL_MARKER.test(value);
}

export function eventTeams(event: string): { away: string; home: string } | null {
  const core = event.replace(/\s*\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  const at = core.split(/\s+@\s+/);
  if (at.length === 2 && at[0] && at[1]) return { away: at[0], home: at[1] };
  const versus = core.split(/\s+vs\.?\s+/i);
  if (versus.length === 2 && versus[0] && versus[1]) return { away: versus[0], home: versus[1] };
  return null;
}

/**
 * Exact normalized names, an alias, or a token-boundary prefix.
 * A shorter name matches a longer one only when the extra tokens are a mascot.
 * "Michigan" matches "Michigan Wolverines" and does not match "Michigan State".
 */
export function namesMatch(left: string, right: string): boolean {
  const a = canonicalize(left);
  const b = canonicalize(right);
  if (!a || !b) return false;
  if (a === b) return true;
  const ta = a.split(" ");
  const tb = b.split(" ");
  const [shorter, longer] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  for (let i = 0; i < shorter.length; i++) {
    if (shorter[i] !== longer[i]) return false;
  }
  return !hasSchoolQualifier(longer.slice(shorter.length));
}

export function gamesFromScoreboard(payload: unknown): EspnGame[] {
  if (!payload || typeof payload !== "object" || !Array.isArray((payload as { events?: unknown }).events)) return [];
  const games: EspnGame[] = [];
  for (const event of (payload as { events: unknown[] }).events) {
    if (!event || typeof event !== "object") continue;
    const record = event as {
      id?: string;
      date?: string;
      competitions?: Array<{
        date?: string;
        status?: { type?: { name?: string; completed?: boolean; detail?: string } };
        competitors?: Competitor[];
      }>;
    };
    const competition = record.competitions?.[0];
    const competitors = competition?.competitors ?? [];
    const away = competitors.find((item) => item.homeAway === "away");
    const home = competitors.find((item) => item.homeAway === "home");
    if (!record.id || !away?.team?.displayName || !home?.team?.displayName) continue;
    games.push({
      id: String(record.id),
      awayName: away.team.displayName,
      homeName: home.team.displayName,
      awayScore: Number(away.score),
      homeScore: Number(home.score),
      startIso: competition?.date || record.date || "",
      statusName: competition?.status?.type?.name ?? "",
      detail: competition?.status?.type?.detail ?? "",
      completed: competition?.status?.type?.completed === true,
      awayPeriods: away.linescores?.length,
      homePeriods: home.linescores?.length,
    });
  }
  return games;
}

export function linescoresAgree(competitor: Competitor): boolean {
  const lines = competitor.linescores;
  if (!lines?.length) return true;
  const sum = lines.reduce((total, line) => total + Number(line.displayValue), 0);
  return sum === Number(competitor.score);
}

function isFinalStatus(game: EspnGame): boolean {
  return game.completed && /FINAL/i.test(game.statusName);
}

function isPostponedStatus(game: EspnGame): boolean {
  return /POSTPON|CANCEL|SUSPEND/i.test(`${game.statusName} ${game.detail}`);
}

function startMatches(row: PickRow, game: EspnGame): boolean {
  if (!row.game_start_et || !game.startIso) return false;
  const wall = etWallTime(game.startIso);
  return row.game_start_et.includes(wall.date) && row.game_start_et.includes(wall.time);
}

function onGameDate(row: PickRow, game: EspnGame): boolean {
  if (!game.startIso) return false;
  return etWallTime(game.startIso).date === row.game_date;
}

/** A finished MLB game is regulation length only after the visitor has batted nine innings. */
export function isUnderRegulation(sportPath: string | null, game: EspnGame): boolean {
  if (sportPath !== "baseball/mlb") return false;
  const status = `${game.statusName} ${game.detail}`;
  if (/SUSPEND|RAIN|SHORTENED|CALLED/i.test(status)) return true;
  const marked = /(?:final|suspended|called)\s*(?:\/|\()\s*(\d+)/i.exec(game.detail);
  if (marked && Number(marked[1]) < 9) return true;
  if (game.awayPeriods == null && game.homePeriods == null) return false;
  return (game.awayPeriods ?? 0) < 9;
}

function withNote(row: PickRow, note: string): PickRow {
  if (!note || row.notes.includes(note)) return row;
  return { ...row, notes: row.notes ? `${row.notes}; ${note}` : note };
}

type TeamSlot = "away" | "home" | "both" | "none";

function teamSlot(name: string, game: EspnGame): TeamSlot {
  const away = namesMatch(name, game.awayName);
  const home = namesMatch(name, game.homeName);
  if (away && home) return "both";
  if (away) return "away";
  if (home) return "home";
  return "none";
}

function teamCandidates(row: PickRow, games: EspnGame[]): EspnGame[] {
  const teams = eventTeams(row.event);
  if (!teams) return [];
  return games.filter((game) => {
    const away = teamSlot(teams.away, game);
    const home = teamSlot(teams.home, game);
    if (away === "both" || home === "both" || away === "none" || home === "none") return false;
    return away !== home;
  });
}

function resolveMatched(row: PickRow, games: EspnGame[]): { matched: EspnGame[]; ambiguous: string | null } {
  const dated = teamCandidates(row, games).filter((game) => onGameDate(row, game));
  if (row.espn_game_id) {
    const byId = teamCandidates(row, games).filter((game) => game.id === row.espn_game_id);
    if (byId.length === 1) return { matched: byId, ambiguous: null };
    return {
      matched: [],
      ambiguous: byId.length > 1 ? "more than one game for espn_game_id" : "espn_game_id did not match",
    };
  }
  if (row.game_start_et) {
    const byStart = dated.filter((game) => startMatches(row, game));
    if (byStart.length > 1) return { matched: [], ambiguous: "more than one game at that start" };
    return { matched: byStart, ambiguous: null };
  }
  if (dated.length > 1) return { matched: [], ambiguous: "more than one same-day game" };
  return { matched: dated, ambiguous: null };
}

function scoreFor(side: string, game: EspnGame): { name: string; score: number } | "ambiguous" | null {
  const slot = teamSlot(side, game);
  if (slot === "both") return "ambiguous";
  if (slot === "away") return { name: game.awayName, score: game.awayScore };
  if (slot === "home") return { name: game.homeName, score: game.homeScore };
  return null;
}

/** Full ESPN name for the picked side, so grading cannot substring-match the other team. */
function canonicalSide(row: PickRow, game: EspnGame): string | null | "ambiguous" {
  if (row.market === "total") return row.side;
  const teamTotal = /^(.*)\s+team total\s+(over|under)$/i.exec(row.side.trim());
  const raw = (teamTotal ? teamTotal[1] : row.side).trim();
  const slot = teamSlot(raw, game);
  if (slot === "both") return "ambiguous";
  if (slot === "none") return null;
  const name = slot === "away" ? game.awayName : game.homeName;
  if (!teamTotal) return name;
  return `${name} team total ${teamTotal[2]}`;
}

function flagged(row: PickRow, detail: string, note = "ambiguous ESPN match"): SettleResult {
  return { row: withNote(row, note), action: "flagged", detail };
}

export function settleRow(row: PickRow, games: EspnGame[], sportPath: string | null, gradedAt: string): SettleResult {
  if (row.status !== "PENDING") return { row, action: "pending", detail: "already settled" };
  if (!sportPath) return { row, action: "flagged", detail: `no ESPN path for ${row.sport}` };
  if (!eventTeams(row.event)) return { row, action: "flagged", detail: "event is not Away @ Home" };

  const { matched, ambiguous } = resolveMatched(row, games);
  if (ambiguous) return flagged(row, ambiguous);

  const finals = matched.filter(isFinalStatus);
  const postponed = matched.filter(isPostponedStatus);
  const auto = isAutoGradeMarket(row.market) && !hasPartialMarker(row.side) && !hasPartialMarker(row.market);

  if (!auto) {
    if (finals.length > 1) return flagged(row, "more than one final game");
    if (finals.length === 1) {
      const why = hasPartialMarker(row.side) && isAutoGradeMarket(row.market) ? "partial-game side" : `ambiguous market ${row.market}`;
      return flagged(row, why, "ESPN final; not auto-graded");
    }
    if (postponed.length > 0) return flagged(row, "postponed", "ESPN postponed");
    return { row, action: "pending", detail: matched[0]?.statusName || "no ESPN game" };
  }

  if (finals.length > 1) return flagged(row, "more than one final game");
  if (finals.length === 0) {
    if (postponed.length > 0) return flagged(row, "postponed", "ESPN postponed");
    return { row, action: "pending", detail: matched[0]?.statusName || "no ESPN game" };
  }

  const game = finals[0];
  if (!game) return flagged(row, "missing score");
  if (isUnderRegulation(sportPath, game)) return flagged(row, "under regulation length", "under regulation length; not auto-graded");

  const teams = eventTeams(row.event);
  const away = teams ? scoreFor(teams.away, game) : null;
  const home = teams ? scoreFor(teams.home, game) : null;
  if (!away || !home || away === "ambiguous" || home === "ambiguous" || !Number.isFinite(away.score) || !Number.isFinite(home.score)) {
    return flagged(row, "missing score");
  }
  const side = canonicalSide(row, game);
  if (side === "ambiguous") return flagged(row, "ambiguous side");
  if (!side) return flagged(row, "side did not match a team");
  const finalScore = `${away.name} ${away.score}, ${home.name} ${home.score}`;
  const grade = gradeFullGame({
    market: row.market,
    side,
    number: parseNumber(row.number),
    finalScore,
  });
  if (!grade) return flagged(row, "gradeFullGame returned null");

  const next: PickRow = {
    ...row,
    status: grade.toUpperCase(),
    game_final: "true",
    final_score: finalScore,
    box_score_url: boxScoreUrl(sportPath, game.id),
    espn_game_id: game.id,
    graded_at: gradedAt,
    grade_method: "auto-espn",
    game_start_et: row.game_start_et || gameStartEt(game.startIso),
    notes: /OT/i.test(game.detail) ? (row.notes.includes("Final/OT") ? row.notes : withNote(row, "Final/OT").notes) : row.notes,
    flags: "",
  };
  next.flags = expectedFlags(next);
  return { row: next, action: "graded", detail: `${next.status} ${finalScore}` };
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`ESPN ${response.status} for ${url}`);
  return response.json();
}

async function fetchGames(sportPath: string, gameDate: string): Promise<EspnGame[]> {
  const seen = new Set<string>();
  const games: EspnGame[] = [];
  for (const date of scoreboardDates(gameDate)) {
    const compact = date.replaceAll("-", "");
    const payload = await fetchJson(`https://site.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard?dates=${compact}`);
    for (const game of gamesFromScoreboard(payload)) {
      if (seen.has(game.id)) continue;
      seen.add(game.id);
      games.push(game);
    }
  }
  return games;
}

async function boxScoreProblem(sportPath: string, game: EspnGame): Promise<string | null> {
  const payload = await fetchJson(`https://site.api.espn.com/apis/site/v2/sports/${sportPath}/summary?event=${game.id}`);
  const competition = (payload as { header?: { competitions?: Array<{ status?: { type?: { name?: string } }; competitors?: Competitor[] }> } })
    .header?.competitions?.[0];
  const competitors = competition?.competitors ?? [];
  const away = competitors.find((item) => item.homeAway === "away");
  const home = competitors.find((item) => item.homeAway === "home");
  if (!away || !home) return "box score missing teams";
  if (Number(away.score) !== game.awayScore || Number(home.score) !== game.homeScore) return "box score disagrees with the scoreboard";
  if (!linescoresAgree(away) || !linescoresAgree(home)) return "linescores do not add up to the final";
  const status = competition?.status?.type?.name ?? "";
  if (!/FINAL/i.test(status)) return `box score status ${status || "missing"}`;
  return null;
}

/** Dry-run unless --write is present. --dry-run is explicit and cannot be combined with --write. */
export function settleWriteMode(argv: readonly string[]): SettleWriteMode {
  const write = argv.includes("--write");
  const dry = argv.includes("--dry-run");
  if (write && dry) throw new Error("Pass only one of --write or --dry-run");
  return write ? "write" : "dry-run";
}

/** Persists a changed CSV only in write mode. Dry-run leaves the file untouched. */
export function commitSettledCsv(path: string, before: string, after: string, mode: SettleWriteMode): boolean {
  if (mode !== "write" || before === after) return false;
  writeFileSync(path, after);
  return true;
}

function isDirectRun(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(entry).href;
}

async function main() {
  const mode = settleWriteMode(process.argv);
  const rows = parsePickCsv(readFileSync(PICKS_CSV_PATH, "utf8"));
  const gradedAt = gradedAtEt();
  const cache = new Map<string, EspnGame[]>();
  const next: PickRow[] = [];
  const lines: string[] = [];
  let graded = 0;
  let flagged = 0;
  let pending = 0;

  for (const row of rows) {
    if (row.status !== "PENDING") {
      next.push(row);
      continue;
    }
    const sportPath = espnSportPath(row.sport);
    const cacheKey = `${sportPath ?? row.sport}|${row.game_date}`;
    let games = cache.get(cacheKey);
    if (!games && sportPath) {
      games = await fetchGames(sportPath, row.game_date);
      cache.set(cacheKey, games);
    }
    let result = settleRow(row, games ?? [], sportPath, gradedAt);
    if (result.action === "graded" && sportPath) {
      const game = (games ?? []).find((item) => item.id === result.row.espn_game_id);
      const problem = game ? await boxScoreProblem(sportPath, game) : "matched game disappeared";
      if (problem) {
        const note = "ambiguous ESPN match";
        result = {
          row: row.notes.includes(note) ? row : { ...row, notes: row.notes ? `${row.notes}; ${note}` : note },
          action: "flagged",
          detail: problem,
        };
      }
    }
    next.push(result.row);
    const label = `${row.tipster} · ${row.side} ${row.number} · ${row.event}`;
    if (result.action === "graded") {
      graded += 1;
      lines.push(`graded ${result.detail} · ${label}`);
    } else if (result.action === "flagged") {
      flagged += 1;
      lines.push(`FLAG ${label} · ${row.market}: ${result.detail}`);
    } else {
      pending += 1;
      if (result.detail && !/no ESPN game|SCHEDULED|already settled/i.test(result.detail)) {
        lines.push(`pending ${label}: ${result.detail}`);
      }
    }
  }

  const before = serializePickCsv(rows);
  const after = serializePickCsv(next);
  const wrote = commitSettledCsv(PICKS_CSV_PATH, before, after, mode);
  if (!wrote && before !== after) console.log("dry-run: CSV not written");
  for (const line of lines) console.log(line);
  console.log(`${graded} graded, ${flagged} flagged, ${pending} still pending${mode === "write" ? "" : " (dry-run)"}`);
}

if (isDirectRun()) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
