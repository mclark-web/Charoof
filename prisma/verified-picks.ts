import { readFileSync } from "node:fs";
import path from "node:path";

import { PUBLIC_FINAL_NOTE, PUBLIC_RESULT_SOURCE, VERIFIED_SEASON } from "../src/lib/constants";
import { teamsAlign } from "../src/lib/espn";
import { formatLine } from "../src/lib/format";
import { gradeMarket, type Grade } from "../src/lib/grade";

/**
 * Live-board seed besides the Fri Sep 18 archive.
 * The rows are data/verified-picks.json. This file does not add picks.
 * Home, away, and kickoff are the ESPN scoreboard facts for those events.
 */

type SeedRow = {
  tipster: string;
  sport: string;
  event: string;
  market: string;
  side: string;
  number: number | null;
  price: string | null;
  posted_at: string;
  source_url: string;
  alt_source_url?: string;
  game_final: boolean;
  result: string;
  box_score_url: string;
  final_score: string;
};

type Fact = {
  jsonSport: string;
  sport: "NFL" | "MLB" | "NCAAF" | "Soccer";
  id: string;
  awayName: string;
  homeName: string;
  awayScore: number;
  homeScore: number;
  startsAt: string;
  espnId: string;
};

type Posted = { iso: string; detail: string };

const NUMBER_MARKETS = new Set(["spread", "run_line", "total", "total_goals", "team_total"]);

const TIPSTERS: Record<
  string,
  { handle: string; displayName: string; focus: string; hue: number; reuse?: boolean; bio: string }
> = {
  "Jason Logan (Covers)": {
    handle: "jasonlogan",
    displayName: "Jason Logan",
    focus: "Covers",
    hue: 42,
    bio: "Public card label for Jason Logan's free Covers writes. Not a connected account and not a tweet.",
  },
  "The Commish (ProCappers)": {
    handle: "thecommish",
    displayName: "The Commish",
    focus: "ProCappers",
    hue: 96,
    reuse: true,
    bio: "Already on the Fri Sep 18 archive.",
  },
  "Chris Hatfield (Covers)": {
    handle: "chrishatfield",
    displayName: "Chris Hatfield",
    focus: "Covers",
    hue: 214,
    bio: "Public card label for Chris Hatfield's free Covers writes. Not a connected account and not a tweet.",
  },
  "Todd Cordell (Covers)": {
    handle: "toddcordell",
    displayName: "Todd Cordell",
    focus: "Covers",
    hue: 286,
    bio: "Public card label for Todd Cordell's free Covers writes. Not a connected account and not a tweet.",
  },
  "Chris Bennett (RotoWire) / Rob Paul (Covers)": {
    handle: "bennettpaul",
    displayName: "Chris Bennett / Rob Paul",
    focus: "RotoWire / Covers",
    hue: 12,
    bio: "One joint card for Chris Bennett (RotoWire) and Rob Paul (Covers). Counted once, and not attached to the Friday Rob Paul profile.",
  },
};

/** ESPN scoreboard home/away and start for each event string in the seed. */
const FACTS: Record<string, Fact> = {
  "Pittsburgh Steelers @ New England Patriots": {
    jsonSport: "NFL",
    sport: "NFL",
    id: "nfl-2026-09-20-patriots-steelers",
    awayName: "Pittsburgh Steelers",
    homeName: "New England Patriots",
    awayScore: 3,
    homeScore: 20,
    startsAt: "2026-09-20T17:00:00.000Z",
    espnId: "401872946",
  },
  "Washington Commanders @ Dallas Cowboys": {
    jsonSport: "NFL",
    sport: "NFL",
    id: "nfl-2026-09-20-cowboys-commanders",
    awayName: "Washington Commanders",
    homeName: "Dallas Cowboys",
    awayScore: 20,
    homeScore: 37,
    startsAt: "2026-09-20T20:25:00.000Z",
    espnId: "401872944",
  },
  "New Orleans Saints @ Baltimore Ravens": {
    jsonSport: "NFL",
    sport: "NFL",
    id: "nfl-2026-09-20-ravens-saints",
    awayName: "New Orleans Saints",
    homeName: "Baltimore Ravens",
    awayScore: 24,
    homeScore: 17,
    startsAt: "2026-09-20T17:00:00.000Z",
    espnId: "401872938",
  },
  "Minnesota Vikings @ Chicago Bears": {
    jsonSport: "NFL",
    sport: "NFL",
    id: "nfl-2026-09-20-bears-vikings",
    awayName: "Minnesota Vikings",
    homeName: "Chicago Bears",
    awayScore: 9,
    homeScore: 3,
    startsAt: "2026-09-20T17:00:00.000Z",
    espnId: "401872937",
  },
  "Green Bay Packers @ New York Jets": {
    jsonSport: "NFL",
    sport: "NFL",
    id: "nfl-2026-09-20-jets-packers",
    awayName: "Green Bay Packers",
    homeName: "New York Jets",
    awayScore: 20,
    homeScore: 17,
    startsAt: "2026-09-20T17:00:00.000Z",
    espnId: "401872936",
  },
  "Milwaukee Brewers @ Baltimore Orioles": {
    jsonSport: "MLB",
    sport: "MLB",
    id: "mlb-2026-09-20-orioles-brewers",
    awayName: "Milwaukee Brewers",
    homeName: "Baltimore Orioles",
    awayScore: 3,
    homeScore: 0,
    startsAt: "2026-09-20T23:20:00.000Z",
    espnId: "401817016",
  },
  "Miami Marlins @ San Diego Padres": {
    jsonSport: "MLB",
    sport: "MLB",
    id: "mlb-2026-09-20-padres-marlins",
    awayName: "Miami Marlins",
    homeName: "San Diego Padres",
    awayScore: 3,
    homeScore: 7,
    startsAt: "2026-09-20T20:10:00.000Z",
    espnId: "401817023",
  },
  "Atlético Madrid vs Real Madrid": {
    jsonSport: "Soccer",
    sport: "Soccer",
    id: "soccer-2026-09-20-atletico-real",
    awayName: "Real Madrid",
    homeName: "Atlético Madrid",
    awayScore: 1,
    homeScore: 2,
    startsAt: "2026-09-20T14:15:00.000Z",
    espnId: "401882865",
  },
  "Georgia @ Arkansas": {
    jsonSport: "CFB",
    sport: "NCAAF",
    id: "ncaaf-2026-09-19-arkansas-georgia",
    awayName: "Georgia Bulldogs",
    homeName: "Arkansas Razorbacks",
    awayScore: 45,
    homeScore: 17,
    startsAt: "2026-09-19T16:00:00.000Z",
    espnId: "401856686",
  },
};

const POSTED: Record<string, Posted> = {
  "2026-09-16 ~ updated 2026-09-20 07:29 ET": {
    iso: "2026-09-20T11:29:00.000Z",
    detail: "Timestamp is the printed update, 7:29 a.m. ET on Sep 20, 2026. The Sep 16 origin had no separate clock.",
  },
  "2026-09-14 12:53 ET": {
    iso: "2026-09-14T16:53:00.000Z",
    detail: "Timestamp is the printed clock, 12:53 p.m. ET.",
  },
  "2026-09-20 13:21 ET": {
    iso: "2026-09-20T17:21:00.000Z",
    detail: "Timestamp is the printed clock, 1:21 p.m. ET.",
  },
  "2026-09-20 09:23 ET": {
    iso: "2026-09-20T13:23:00.000Z",
    detail: "Timestamp is the printed clock, 9:23 a.m. ET.",
  },
  "2026-09-20": {
    iso: "2026-09-20T04:00:00.000Z",
    detail: "The card printed a date and no clock. Timestamp is midnight ET on that date.",
  },
  "2026-09-17 / Covers updated 2026-09-19": {
    iso: "2026-09-17T04:00:00.000Z",
    detail: "Timestamp is the RotoWire date, midnight ET on Sep 17, 2026. The Covers update printed Sep 19 and no clock.",
  },
};

function assertScore(row: SeedRow, fact: Fact) {
  const numbers = [...row.final_score.matchAll(/\d+/g)].map((match) => Number(match[0]));
  if (numbers.length < 2) throw new Error(`${row.event} final_score has no pair: ${row.final_score}`);
  const posted = [numbers[0], numbers[1]].sort((a, b) => a - b);
  const expected = [fact.homeScore, fact.awayScore].sort((a, b) => a - b);
  if (posted[0] !== expected[0] || posted[1] !== expected[1]) {
    throw new Error(`${row.event} final_score ${row.final_score} does not match ${fact.awayScore}-${fact.homeScore}`);
  }
  const combined = row.final_score.match(/\((\d+)/);
  if (combined && Number(combined[1]) !== fact.homeScore + fact.awayScore) {
    throw new Error(`${row.event} combined total in "${row.final_score}" does not match the score pair`);
  }
}

function sideOf(row: SeedRow, fact: Fact): "home" | "away" | "over" | "under" {
  if (row.market === "total" || row.market === "total_goals") {
    const side = row.side.toLowerCase();
    if (side === "over" || side === "under") return side;
    throw new Error(`${row.event} ${row.market} side is ${row.side}`);
  }
  const home = teamsAlign(row.side, fact.homeName);
  const away = teamsAlign(row.side, fact.awayName);
  if (home && away) throw new Error(`${row.side} matches both clubs in ${row.event}`);
  if (home) return "home";
  if (away) return "away";
  throw new Error(`${row.side} matches neither club in ${row.event}`);
}

function priceOf(price: string | null): { oddsAmerican: number | null; note: string } {
  if (price == null || price.trim() === "") {
    return {
      oddsAmerican: null,
      note: "No American price was posted. A win or loss uses even money. That price is not from the article.",
    };
  }
  const parsed = Number(price.replace("~", "").replace("−", "-").trim());
  if (!Number.isInteger(parsed)) throw new Error(`Price ${price} is not an American integer`);
  const tilde = price.includes("~") ? ` The card wrote it as ${price}.` : "";
  return {
    oddsAmerican: parsed,
    note: `American price stored as ${parsed}.${tilde} Not an odds-API lookup.`,
  };
}

function selection(market: string, side: "home" | "away" | "over" | "under", line: number | null, fact: Fact): string {
  if (market === "total" || market === "total_goals") {
    const word = side === "over" ? "Over" : "Under";
    return line == null ? word : `${word} ${formatLine(line)}`;
  }
  const team = side === "home" ? fact.homeName : fact.awayName;
  if (market === "spread" || market === "run_line") {
    return line == null ? team : `${team} ${formatLine(line, true)}`;
  }
  return team;
}

export function verifiedPublic(): {
  cappers: Array<{ handle: string; displayName: string; focus: string; bio: string; hue: number }>;
  events: Array<{
    id: string;
    sport: Fact["sport"];
    season: string;
    weekLabel: string;
    name: string;
    startsAt: Date;
    status: "final";
    homeName: string;
    awayName: string;
    homeScore: number;
    awayScore: number;
    homeFirstQuarter: null;
    awayFirstQuarter: null;
    homeFirstHalf: null;
    awayFirstHalf: null;
    source: string;
    sourceNote: string;
  }>;
  picks: Array<{
    id: string;
    capperId: string;
    eventId: string;
    market: "spread" | "total" | "moneyline" | "run_line" | "total_goals";
    side: string;
    line: number | null;
    oddsAmerican: number | null;
    units: number;
    selection: string;
    scoreScope: "final";
    participant: null;
    propPlayer: null;
    propStat: null;
    propActual: null;
    publishedAt: Date;
    clarity: "explicit";
    grade: Grade;
    note: string;
    sourceUrl: string;
    isDemo: false;
  }>;
} {
  const file = path.join(process.cwd(), "data", "verified-picks.json");
  const rows = JSON.parse(readFileSync(file, "utf8")) as SeedRow[];
  if (!Array.isArray(rows) || rows.length !== 14) {
    throw new Error(`data/verified-picks.json has ${Array.isArray(rows) ? rows.length : "non-array"} rows; expected 14`);
  }

  const events = new Map<string, ReturnType<typeof verifiedPublic>["events"][number]>();
  const picks: ReturnType<typeof verifiedPublic>["picks"] = [];
  const seenTipsters = new Set<string>();

  for (const row of rows) {
    if (!row.source_url?.startsWith("https://")) throw new Error(`${row.event} is missing a source URL`);
    if (!row.box_score_url?.startsWith("http")) throw new Error(`${row.event} is missing a box score URL`);
    if (row.game_final !== true) throw new Error(`${row.event} is not final. This seed has no pending row.`);
    const tipster = TIPSTERS[row.tipster];
    if (!tipster) throw new Error(`Unknown tipster ${row.tipster}`);
    const fact = FACTS[row.event];
    if (!fact) throw new Error(`No ESPN fact for ${row.event}`);
    if (row.sport !== fact.jsonSport) throw new Error(`${row.event} sport ${row.sport} does not match ${fact.jsonSport}`);
    if (!row.box_score_url.includes(fact.espnId)) {
      throw new Error(`${row.event} box score does not cite ESPN game ${fact.espnId}`);
    }
    assertScore(row, fact);
    const posted = POSTED[row.posted_at];
    if (!posted) throw new Error(`No timestamp reading for "${row.posted_at}"`);
    const publishedAt = new Date(posted.iso);
    const startsAt = new Date(fact.startsAt);
    if (!(publishedAt < startsAt)) {
      throw new Error(`${row.event} timestamp ${posted.iso} is not before kickoff ${fact.startsAt}`);
    }
    if (NUMBER_MARKETS.has(row.market) && row.number == null && (row.result === "win" || row.result === "loss")) {
      throw new Error(`${row.event} ${row.market} has no number and cannot be ${row.result}`);
    }
    const side = sideOf(row, fact);
    const line = row.number;
    const price = priceOf(row.price);
    const grade = gradeMarket({
      market: row.market,
      side,
      line,
      homeScore: fact.homeScore,
      awayScore: fact.awayScore,
      propActual: null,
      status: "final",
    });
    if (grade !== row.result) {
      throw new Error(`${row.tipster} ${row.event} ${row.market} graded ${grade}, seed says ${row.result}`);
    }
    seenTipsters.add(row.tipster);
    const eventId = fact.id;
    events.set(eventId, {
      id: eventId,
      sport: fact.sport,
      season: VERIFIED_SEASON,
      weekLabel: "Verified public card",
      name: `${fact.awayName} at ${fact.homeName}`,
      startsAt,
      status: "final",
      homeName: fact.homeName,
      awayName: fact.awayName,
      homeScore: fact.homeScore,
      awayScore: fact.awayScore,
      homeFirstQuarter: null,
      awayFirstQuarter: null,
      homeFirstHalf: null,
      awayFirstHalf: null,
      source: PUBLIC_RESULT_SOURCE,
      sourceNote: `${PUBLIC_FINAL_NOTE} ${row.box_score_url}`,
    });
    const id = `${tipster.handle}-${eventId}-${row.market}`;
    if (picks.some((pick) => pick.id === id)) throw new Error(`Duplicate pick ${id}`);
    if (tipster.handle === "robpaul") throw new Error("Joint card must not attach to robpaul");
    const alt = row.alt_source_url ? ` Second source: ${row.alt_source_url}.` : "";
    picks.push({
      id,
      capperId: tipster.handle,
      eventId,
      market: row.market as "spread" | "total" | "moneyline" | "run_line" | "total_goals",
      side,
      line,
      oddsAmerican: price.oddsAmerican,
      units: 1,
      selection: selection(row.market, side, line, fact),
      scoreScope: "final",
      participant: null,
      propPlayer: null,
      propStat: null,
      propActual: null,
      publishedAt,
      clarity: "explicit",
      grade,
      note: `Posted as written: ${row.posted_at}. ${posted.detail} ${price.note} Stake was not posted. Recorded as 1.00u. Seed final: ${row.final_score}.${alt} Listed start is the ESPN scoreboard clock for game ${fact.espnId}.`,
      sourceUrl: row.source_url,
      isDemo: false,
    });
  }

  if (picks.length !== 14 || picks.some((pick) => pick.grade === "pending" || pick.grade === "void")) {
    throw new Error("Verified seed must be 14 settled picks and no pending row");
  }
  if (seenTipsters.size !== Object.keys(TIPSTERS).length) {
    throw new Error("A listed tipster has no row in the seed");
  }

  const cappers = Object.values(TIPSTERS)
    .filter((tipster) => !tipster.reuse)
    .map((tipster) => ({
      handle: tipster.handle,
      displayName: tipster.displayName,
      focus: tipster.focus,
      bio: tipster.bio,
      hue: tipster.hue,
    }));

  return { cappers, events: [...events.values()], picks };
}
