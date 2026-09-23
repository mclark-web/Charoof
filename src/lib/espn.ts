export type BoardGame = {
  homeName: string;
  awayName: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "final" | "scheduled" | "in_progress";
  sourceUrl: string;
};

const ESPN_ROOT = "https://site.web.api.espn.com/apis/site/v2/sports";

export function espnPaths(sport: string): string[] {
  switch (sport) {
    case "NFL":
      return ["football/nfl"];
    case "NCAAF":
      return ["football/college-football"];
    case "MLB":
      return ["baseball/mlb"];
    case "NBA":
      return ["basketball/nba"];
    case "NHL":
      return ["hockey/nhl"];
    case "Soccer":
      return [
        "soccer/eng.1",
        "soccer/ger.1",
        "soccer/esp.1",
        "soccer/ita.1",
        "soccer/fra.1",
        "soccer/usa.1",
        "soccer/uefa.champions",
      ];
    default:
      return [];
  }
}

export function espnDate(startsAt: Date): string {
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(startsAt);
  return formatted.replaceAll("-", "");
}

export function normalizeTeam(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Contiguous phrase match. "Georgia" matches "Georgia Bulldogs" and "Georgia Tech"; callers reject ambiguous pairs. */
export function teamsAlign(ledgerName: string, espnName: string): boolean {
  const left = normalizeTeam(ledgerName);
  const right = normalizeTeam(espnName);
  if (!left || !right) return false;
  if (left === right) return true;
  const phrase = (value: string) => ` ${value} `;
  return phrase(right).includes(phrase(left)) || phrase(left).includes(phrase(right));
}

export function findGame(
  games: BoardGame[],
  homeName: string,
  awayName: string,
): BoardGame | "ambiguous" | null {
  const hits = games.filter((game) => teamsAlign(homeName, game.homeName) && teamsAlign(awayName, game.awayName));
  if (hits.length === 1) return hits[0];
  if (hits.length === 0) return null;
  return "ambiguous";
}

function mapStatus(type: { name?: string; state?: string } | undefined): BoardGame["status"] {
  const name = type?.name ?? "";
  const state = type?.state ?? "";
  if (state === "post" || name === "STATUS_FINAL" || name === "STATUS_FULL_TIME") return "final";
  if (state === "in") return "in_progress";
  return "scheduled";
}

function asScore(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

type EspnPayload = {
  events?: Array<{
    competitions?: Array<{
      status?: { type?: { name?: string; state?: string } };
      competitors?: Array<{
        homeAway?: string;
        score?: string | number;
        team?: { displayName?: string };
      }>;
    }>;
  }>;
};

export function parseEspnScoreboard(payload: EspnPayload, sourceUrl: string): BoardGame[] {
  const games: BoardGame[] = [];
  for (const event of payload.events ?? []) {
    const competition = event.competitions?.[0];
    if (!competition) continue;
    let homeName = "";
    let awayName = "";
    let homeScore: number | null = null;
    let awayScore: number | null = null;
    for (const competitor of competition.competitors ?? []) {
      const name = competitor.team?.displayName ?? "";
      const score = asScore(competitor.score);
      if (competitor.homeAway === "home") {
        homeName = name;
        homeScore = score;
      } else if (competitor.homeAway === "away") {
        awayName = name;
        awayScore = score;
      }
    }
    if (!homeName || !awayName) continue;
    games.push({
      homeName,
      awayName,
      homeScore,
      awayScore,
      status: mapStatus(competition.status?.type),
      sourceUrl,
    });
  }
  return games;
}

export function scoreboardUrl(path: string, date: string): string {
  const extra = path === "football/college-football" ? "&groups=80&limit=400" : "&limit=100";
  return `${ESPN_ROOT}/${path}/scoreboard?dates=${date}${extra}`;
}

const cache = new Map<string, BoardGame[]>();

export async function fetchEspnGames(sport: string, date: string): Promise<BoardGame[]> {
  const key = `${sport}:${date}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const games: BoardGame[] = [];
  for (const path of espnPaths(sport)) {
    const url = scoreboardUrl(path, date);
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "Mozilla/5.0 (compatible; CharoofLedger/1.0)",
      },
    });
    if (!response.ok) {
      throw new Error(`ESPN scoreboard ${response.status} for ${sport} ${date} (${path})`);
    }
    const payload = (await response.json()) as EspnPayload;
    games.push(...parseEspnScoreboard(payload, url));
  }
  cache.set(key, games);
  return games;
}
