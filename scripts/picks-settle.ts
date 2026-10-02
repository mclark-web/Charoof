/**
 * Settle pending rows in data/picks/picks.csv from ESPN scoreboards.
 * Each game date is queried with the UTC day on either side. A row is graded only when
 * one FINAL game matches its teams and start time and the box score agrees.
 * Partial-game markets, props, postponements, and ambiguous matches are flagged, not graded.
 * This writes the CSV only. data/friday-archive.json is not touched.
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
};

export type SettleAction = "graded" | "flagged" | "pending";

export type SettleResult = {
  row: PickRow;
  action: SettleAction;
  detail: string;
};

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

export function eventTeams(event: string): { away: string; home: string } | null {
  const core = event.replace(/\s*\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  const at = core.split(/\s+@\s+/);
  if (at.length === 2 && at[0] && at[1]) return { away: at[0], home: at[1] };
  const versus = core.split(/\s+vs\.?\s+/i);
  if (versus.length === 2 && versus[0] && versus[1]) return { away: versus[0], home: versus[1] };
  return null;
}

export function namesMatch(left: string, right: string): boolean {
  const a = normalizeName(left);
  const b = normalizeName(right);
  if (!a || !b) return false;
  if (a === b) return true;
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  if (shorter.split(" ").length < 2) return false;
  return longer.includes(shorter);
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
  if (!game.startIso) return false;
  const wall = etWallTime(game.startIso);
  if (!row.game_start_et) return wall.date === row.game_date;
  return row.game_start_et.includes(wall.date) && row.game_start_et.includes(wall.time);
}

function withNote(row: PickRow, note: string): PickRow {
  if (!note || row.notes.includes(note)) return row;
  return { ...row, notes: row.notes ? `${row.notes}; ${note}` : note };
}

function teamCandidates(row: PickRow, games: EspnGame[]): EspnGame[] {
  const teams = eventTeams(row.event);
  if (!teams) return [];
  return games.filter((game) => {
    const names = [game.awayName, game.homeName];
    return names.some((name) => namesMatch(teams.away, name)) && names.some((name) => namesMatch(teams.home, name));
  });
}

function scoreFor(side: string, game: EspnGame): { name: string; score: number } | null {
  if (namesMatch(side, game.awayName)) return { name: game.awayName, score: game.awayScore };
  if (namesMatch(side, game.homeName)) return { name: game.homeName, score: game.homeScore };
  return null;
}

export function settleRow(row: PickRow, games: EspnGame[], sportPath: string | null, gradedAt: string): SettleResult {
  if (row.status !== "PENDING") return { row, action: "pending", detail: "already settled" };
  if (!sportPath) return { row, action: "flagged", detail: `no ESPN path for ${row.sport}` };
  if (!eventTeams(row.event)) return { row, action: "flagged", detail: "event is not Away @ Home" };

  const matched = teamCandidates(row, games).filter((game) => startMatches(row, game));
  const finals = matched.filter(isFinalStatus);
  const postponed = matched.filter(isPostponedStatus);

  if (!isAutoGradeMarket(row.market)) {
    if (finals.length > 1) return { row: withNote(row, "ambiguous ESPN match"), action: "flagged", detail: "more than one final game" };
    if (finals.length === 1) {
      return { row: withNote(row, "ESPN final; not auto-graded"), action: "flagged", detail: `ambiguous market ${row.market}` };
    }
    if (postponed.length > 0) return { row: withNote(row, "ESPN postponed"), action: "flagged", detail: "postponed" };
    return { row, action: "pending", detail: matched[0]?.statusName || "no ESPN game" };
  }

  if (finals.length > 1) {
    return { row: withNote(row, "ambiguous ESPN match"), action: "flagged", detail: "more than one final game" };
  }
  if (finals.length === 0) {
    if (postponed.length > 0) return { row: withNote(row, "ESPN postponed"), action: "flagged", detail: "postponed" };
    return { row, action: "pending", detail: matched[0]?.statusName || "no ESPN game" };
  }

  const game = finals[0];
  const teams = eventTeams(row.event);
  const away = teams ? scoreFor(teams.away, game) : null;
  const home = teams ? scoreFor(teams.home, game) : null;
  if (!game || !away || !home || !Number.isFinite(away.score) || !Number.isFinite(home.score)) {
    return { row: withNote(row, "ambiguous ESPN match"), action: "flagged", detail: "missing score" };
  }
  const finalScore = `${away.name} ${away.score}, ${home.name} ${home.score}`;
  const grade = gradeFullGame({
    market: row.market,
    side: row.side,
    number: parseNumber(row.number),
    finalScore,
  });
  if (!grade) return { row: withNote(row, "ambiguous ESPN match"), action: "flagged", detail: "gradeFullGame returned null" };

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

function isDirectRun(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(entry).href;
}

async function main() {
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
  if (before !== after) writeFileSync(PICKS_CSV_PATH, after);
  for (const line of lines) console.log(line);
  console.log(`${graded} graded, ${flagged} flagged, ${pending} still pending`);
}

if (isDirectRun()) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
