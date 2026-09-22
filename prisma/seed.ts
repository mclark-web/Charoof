import { PrismaClient } from "@prisma/client";

import {
  DEMO_SEASONS,
  FINAL_NOTE,
  OPEN_NOTE,
  RESULT_SOURCE,
  SPORTS,
  VOID_NOTE,
  type DemoSeason,
  type Sport,
} from "../src/lib/constants";
import { sqliteUrl } from "../src/lib/database-url";
import { formatLine } from "../src/lib/format";
import {
  gradeMarket,
  propActualFor,
  spreadLine,
  totalLine,
  type Grade,
} from "../src/lib/grade";

const prisma = new PrismaClient({
  datasources: { db: { url: sqliteUrl() } },
});

type Market = "spread" | "total" | "moneyline" | "prop";

type Slice = {
  season: DemoSeason;
  sport: Sport;
  market: Market;
  wins: number;
  losses: number;
  pushes: number;
};

type CapperSeed = {
  handle: string;
  displayName: string;
  focus: string;
  bio: string;
  hue: number;
  units: number[];
  lateRate: number;
  leanRate: number;
  oddsAmerican: number;
  slices: Slice[];
};

type EventDraft = {
  id: string;
  sport: Sport;
  season: DemoSeason;
  weekLabel: string;
  name: string;
  startsAt: Date;
  status: "final" | "scheduled" | "cancelled";
  homeName: string;
  awayName: string;
  homeScore: number | null;
  awayScore: number | null;
  source: string;
  sourceNote: string;
};

type PickDraft = {
  id: string;
  capperId: string;
  eventId: string;
  market: Market;
  side: string;
  line: number | null;
  oddsAmerican: number;
  units: number;
  selection: string;
  propPlayer: string | null;
  propStat: string | null;
  propActual: number | null;
  publishedAt: Date;
  clarity: "explicit" | "lean";
  grade: Grade;
  note: string | null;
  isDemo: boolean;
};

const CLUBS: Record<Sport, string[]> = {
  NFL: [
    "Harbor Kings",
    "Redline Rams",
    "North Pier",
    "Glass City",
    "Cedar Hawks",
    "Iron Range",
    "Bay Circuit",
    "Lowland Foxes",
    "Metro Foundry",
    "Prairie Wire",
    "Capital Bell",
    "West Dock",
    "Summit Rail",
    "Delta Lanterns",
    "Quarry Park",
    "East Current",
  ],
  NBA: [
    "Atlas Five",
    "Lantern Row",
    "Civic Tempo",
    "North Glass",
    "Harbor Heat",
    "Orchard Club",
    "Signal Hill",
    "West Arcade",
    "Copper Court",
    "Kindling",
    "Marlowe BC",
    "River Index",
  ],
  MLB: [
    "Dockyard",
    "Paper Kites",
    "Red Cedar",
    "Union Nine",
    "South Wharf",
    "Amber Bats",
    "Field Note",
    "Clocktower",
    "Grain Belt",
    "Night Shift",
  ],
  NHL: [
    "Frost Ledger",
    "Black Ice",
    "Canal Vic",
    "North Lamp",
    "Pike Room",
    "Winter Office",
    "Slate Puck",
    "Harbor Siren",
  ],
  NCAAF: [
    "Easton State",
    "Westmere Poly",
    "St. Bramble",
    "Ridgeline",
    "Quarry U",
    "North Campus",
    "Lake and Rail",
    "Founders",
  ],
};

const POOL_SIZES: Record<Sport, number> = {
  NFL: 16,
  NBA: 16,
  NCAAF: 12,
  MLB: 12,
  NHL: 12,
};

const SCORE_RANGE: Record<Sport, [number, number]> = {
  NFL: [10, 35],
  NCAAF: [13, 41],
  NBA: [98, 127],
  MLB: [1, 9],
  NHL: [1, 6],
};

const PLAYERS = ["J. Harlow", "S. Quint", "R. Bemis", "L. Cho", "P. Voss", "N. Adler", "C. Ibarra", "T. Quill"];
const PROP_STATS = ["points", "rebounds", "assists"];

const CAPPERS: CapperSeed[] = [
  {
    handle: "linelock",
    displayName: "Line Lock",
    focus: "NFL spreads",
    bio: "Flat-unit NFL spreads, posted before the listed start. Demo ledger only.",
    hue: 152,
    units: [1],
    lateRate: 0,
    leanRate: 0,
    oddsAmerican: -110,
    slices: [
      { season: "Sample 2024", sport: "NFL", market: "spread", wins: 10, losses: 6, pushes: 0 },
      { season: "Sample 2025", sport: "NFL", market: "spread", wins: 9, losses: 6, pushes: 1 },
    ],
  },
  {
    handle: "totalsdesk",
    displayName: "Totals Desk",
    focus: "NBA totals",
    bio: "NBA game totals only, and the same stake on every card in the demo.",
    hue: 168,
    units: [1],
    lateRate: 0,
    leanRate: 0,
    oddsAmerican: -110,
    slices: [
      { season: "Sample 2024", sport: "NBA", market: "total", wins: 8, losses: 6, pushes: 0 },
      { season: "Sample 2025", sport: "NBA", market: "total", wins: 8, losses: 5, pushes: 1 },
    ],
  },
  {
    handle: "saturdayslate",
    displayName: "Saturday Slate",
    focus: "NCAAF spreads",
    bio: "NCAAF spreads. The sample season runs hotter than the prior sample year, which is why the window toggle moves this ledger.",
    hue: 28,
    units: [1],
    lateRate: 0,
    leanRate: 0,
    oddsAmerican: -110,
    slices: [
      { season: "Sample 2024", sport: "NCAAF", market: "spread", wins: 5, losses: 7, pushes: 0 },
      { season: "Sample 2025", sport: "NCAAF", market: "spread", wins: 9, losses: 3, pushes: 0 },
    ],
  },
  {
    handle: "propclerk",
    displayName: "Prop Clerk",
    focus: "NBA props",
    bio: "NBA player props at a posted number. The stat in the grade is sample data, not a real box score.",
    hue: 198,
    units: [1],
    lateRate: 0,
    leanRate: 0,
    oddsAmerican: -110,
    slices: [
      { season: "Sample 2024", sport: "NBA", market: "prop", wins: 7, losses: 5, pushes: 0 },
      { season: "Sample 2025", sport: "NBA", market: "prop", wins: 7, losses: 4, pushes: 1 },
    ],
  },
  {
    handle: "boxscore",
    displayName: "Box Score",
    focus: "MLB moneylines",
    bio: "MLB moneylines at a juicier price. Winning the count is not the same thing as clearing 70.",
    hue: 210,
    units: [1],
    lateRate: 0,
    leanRate: 0,
    oddsAmerican: -125,
    slices: [
      { season: "Sample 2024", sport: "MLB", market: "moneyline", wins: 7, losses: 5, pushes: 0 },
      { season: "Sample 2025", sport: "MLB", market: "moneyline", wins: 7, losses: 5, pushes: 0 },
    ],
  },
  {
    handle: "evenkeel",
    displayName: "Even Keel",
    focus: "All sports, flat units",
    bio: "Every sport, one unit, posted on time. The record sits on the juice, which keeps the factor in Chud territory.",
    hue: 142,
    units: [1],
    lateRate: 0,
    leanRate: 0,
    oddsAmerican: -110,
    slices: [
      { season: "Sample 2024", sport: "NFL", market: "spread", wins: 4, losses: 4, pushes: 0 },
      { season: "Sample 2024", sport: "NBA", market: "spread", wins: 3, losses: 3, pushes: 0 },
      { season: "Sample 2024", sport: "NCAAF", market: "spread", wins: 3, losses: 3, pushes: 0 },
      { season: "Sample 2024", sport: "MLB", market: "spread", wins: 2, losses: 2, pushes: 0 },
      { season: "Sample 2024", sport: "NHL", market: "spread", wins: 2, losses: 2, pushes: 0 },
      { season: "Sample 2025", sport: "NFL", market: "spread", wins: 4, losses: 4, pushes: 0 },
      { season: "Sample 2025", sport: "NBA", market: "spread", wins: 3, losses: 3, pushes: 0 },
      { season: "Sample 2025", sport: "NCAAF", market: "spread", wins: 3, losses: 2, pushes: 1 },
      { season: "Sample 2025", sport: "MLB", market: "spread", wins: 2, losses: 2, pushes: 0 },
      { season: "Sample 2025", sport: "NHL", market: "spread", wins: 2, losses: 1, pushes: 1 },
    ],
  },
  {
    handle: "latelean",
    displayName: "Late Lean",
    focus: "NFL and NBA leans",
    bio: "A near coin-flip that leaks to the price, with too many leans and too many posts after the listed start.",
    hue: 12,
    units: [1],
    lateRate: 0.5,
    leanRate: 0.65,
    oddsAmerican: -110,
    slices: [
      { season: "Sample 2024", sport: "NFL", market: "spread", wins: 5, losses: 5, pushes: 0 },
      { season: "Sample 2025", sport: "NFL", market: "spread", wins: 5, losses: 5, pushes: 0 },
      { season: "Sample 2024", sport: "NBA", market: "spread", wins: 3, losses: 3, pushes: 0 },
      { season: "Sample 2025", sport: "NBA", market: "spread", wins: 3, losses: 2, pushes: 1 },
    ],
  },
  {
    handle: "unitstorm",
    displayName: "Unit Storm",
    focus: "Variable stakes",
    bio: "Stakes jump from one unit to five. On this ledger the larger numbers land on the losing side, and Discipline records that.",
    hue: 348,
    units: [1, 2, 3, 5],
    lateRate: 0.1,
    leanRate: 0,
    oddsAmerican: -110,
    slices: [
      { season: "Sample 2024", sport: "NFL", market: "spread", wins: 4, losses: 4, pushes: 0 },
      { season: "Sample 2025", sport: "NFL", market: "spread", wins: 3, losses: 5, pushes: 0 },
      { season: "Sample 2024", sport: "NCAAF", market: "spread", wins: 4, losses: 4, pushes: 0 },
      { season: "Sample 2025", sport: "NCAAF", market: "spread", wins: 3, losses: 5, pushes: 0 },
    ],
  },
  {
    handle: "pucksheet",
    displayName: "Puck Sheet",
    focus: "NHL moneylines",
    bio: "NHL moneylines with a full sample and no edge after the price.",
    hue: 188,
    units: [1],
    lateRate: 0,
    leanRate: 0,
    oddsAmerican: -120,
    slices: [
      { season: "Sample 2024", sport: "NHL", market: "moneyline", wins: 6, losses: 6, pushes: 0 },
      { season: "Sample 2025", sport: "NHL", market: "moneyline", wins: 5, losses: 7, pushes: 0 },
    ],
  },
  {
    handle: "sixpack",
    displayName: "Six Pack",
    focus: "Short NFL card",
    bio: "Six NFL spreads, all winners in the demo. The sample is too short to climb out of Chud territory.",
    hue: 42,
    units: [1],
    lateRate: 0,
    leanRate: 0,
    oddsAmerican: -110,
    slices: [{ season: "Sample 2025", sport: "NFL", market: "spread", wins: 6, losses: 0, pushes: 0 }],
  },
  {
    handle: "hotcard",
    displayName: "Hot Card",
    focus: "Short hot NFL card",
    bio: "Ten NFL spreads and a hot demo card. The factor clears 70, and the sample is still too short to earn Chad.",
    hue: 16,
    units: [1],
    lateRate: 0,
    leanRate: 0,
    oddsAmerican: -110,
    slices: [{ season: "Sample 2025", sport: "NFL", market: "spread", wins: 8, losses: 2, pushes: 0 }],
  },
];

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }
  return copy;
}

function seasonYear(season: DemoSeason): string {
  return season.endsWith("2024") ? "2024" : "2025";
}

function kickoff(season: DemoSeason, week: number, slot: number): Date {
  const open =
    season === "Sample 2024"
      ? Date.UTC(2024, 8, 8, 17, 0, 0)
      : Date.UTC(2025, 8, 7, 17, 0, 0);
  return new Date(open + ((week - 1) * 7 + slot) * 86_400_000 + slot * 3 * 3_600_000);
}

function makeScore(sport: Sport, rng: () => number): [number, number] {
  const [min, max] = SCORE_RANGE[sport];
  let home = randInt(rng, min, max);
  let away = randInt(rng, min, max);
  if (home === away) {
    if (home < max) home += 1;
    else away -= 1;
  }
  return [home, away];
}

function buildPools(rng: () => number): Map<string, EventDraft[]> {
  const pools = new Map<string, EventDraft[]>();
  for (const season of DEMO_SEASONS) {
    for (const sport of SPORTS) {
      const clubs = CLUBS[sport];
      const events: EventDraft[] = [];
      const count = POOL_SIZES[sport];
      for (let index = 0; index < count; index += 1) {
        const week = Math.floor(index / 2) + 1;
        const slot = index % 2;
        let homeIndex = (index * 2) % clubs.length;
        let awayIndex = (homeIndex + 1 + Math.floor(index / clubs.length)) % clubs.length;
        if (awayIndex === homeIndex) awayIndex = (awayIndex + 1) % clubs.length;
        if (index >= count / 2) {
          const swap = homeIndex;
          homeIndex = awayIndex;
          awayIndex = swap;
        }
        const homeName = clubs[homeIndex];
        const awayName = clubs[awayIndex];
        const [homeScore, awayScore] = makeScore(sport, rng);
        const id = `${sport.toLowerCase()}-${seasonYear(season)}-${String(index + 1).padStart(2, "0")}`;
        events.push({
          id,
          sport,
          season,
          weekLabel: `Demo Week ${week}`,
          name: `${awayName} at ${homeName}`,
          startsAt: kickoff(season, week, slot),
          status: "final",
          homeName,
          awayName,
          homeScore,
          awayScore,
          source: RESULT_SOURCE,
          sourceNote: FINAL_NOTE,
        });
      }
      pools.set(`${sport}-${season}`, events);
    }
  }
  return pools;
}

function draw(pool: EventDraft[], count: number, rng: () => number): EventDraft[] {
  if (pool.length < count) {
    throw new Error(`Need ${count} events in pool, found ${pool.length}`);
  }
  return shuffle(pool, rng).slice(0, count);
}

function assignGrades(
  units: number[],
  wins: number,
  losses: number,
  pushes: number,
  rng: () => number,
): Grade[] {
  if (wins + losses + pushes !== units.length) {
    throw new Error(`Grade counts ${wins}-${losses}-${pushes} do not add up to ${units.length}`);
  }
  const flat = new Set(units).size === 1;
  if (flat) {
    const bag: Grade[] = [
      ...Array.from({ length: wins }, () => "win" as const),
      ...Array.from({ length: losses }, () => "loss" as const),
      ...Array.from({ length: pushes }, () => "push" as const),
    ];
    return shuffle(bag, rng);
  }

  const grades: Grade[] = Array.from({ length: units.length }, () => "win");
  const order = units
    .map((unit, index) => ({ unit, index }))
    .sort((a, b) => b.unit - a.unit || a.index - b.index);
  order.forEach((slot, position) => {
    if (position < losses) grades[slot.index] = "loss";
    else if (position < losses + pushes) grades[slot.index] = "push";
    else grades[slot.index] = "win";
  });
  const winCount = grades.filter((grade) => grade === "win").length;
  if (winCount !== wins) throw new Error(`Expected ${wins} wins, assigned ${winCount}`);
  return grades;
}

function teamName(event: EventDraft, side: string): string {
  return side === "home" ? event.homeName : event.awayName;
}

function buildGradedPick(
  capper: CapperSeed,
  event: EventDraft,
  market: Market,
  grade: Grade,
  units: number,
  index: number,
  rng: () => number,
): PickDraft {
  if (grade !== "win" && grade !== "loss" && grade !== "push") {
    throw new Error(`Settled pick cannot be ${grade}`);
  }
  if (event.homeScore == null || event.awayScore == null) {
    throw new Error(`Final ${event.id} is missing a score`);
  }

  let side: string;
  let line: number | null = null;
  let propPlayer: string | null = null;
  let propStat: string | null = null;
  let propActual: number | null = null;

  if (market === "moneyline") {
    const homeWins = event.homeScore > event.awayScore;
    if (grade === "push") {
      throw new Error(`Moneyline push requested on a non-tie ${event.id}`);
    }
    side = grade === "win" ? (homeWins ? "home" : "away") : homeWins ? "away" : "home";
  } else if (market === "spread") {
    side = rng() < 0.5 ? "home" : "away";
    line = spreadLine(side, event.homeScore, event.awayScore, grade);
  } else if (market === "total") {
    side = rng() < 0.5 ? "over" : "under";
    line = totalLine(side, event.homeScore, event.awayScore, grade);
  } else {
    side = rng() < 0.5 ? "over" : "under";
    line = 16.5 + (index % 4) * 2;
    propPlayer = PLAYERS[index % PLAYERS.length];
    propStat = PROP_STATS[index % PROP_STATS.length];
    propActual = propActualFor(side, line, grade);
  }

  const selection =
    market === "spread"
      ? `${teamName(event, side)} ${formatLine(line, true)}`
      : market === "total"
        ? `${side === "over" ? "Over" : "Under"} ${formatLine(line)}`
        : market === "moneyline"
          ? teamName(event, side)
          : `${propPlayer} ${side} ${formatLine(line)} ${propStat}`;

  const actual = gradeMarket({
    market,
    side,
    line,
    homeScore: event.homeScore,
    awayScore: event.awayScore,
    propActual,
    status: event.status,
  });
  if (actual !== grade) {
    throw new Error(
      `${capper.handle} ${event.id} ${market} expected ${grade} but graded ${actual} (line ${line}, side ${side})`,
    );
  }

  return {
    id: `${capper.handle}-${event.id}`,
    capperId: capper.handle,
    eventId: event.id,
    market,
    side,
    line,
    oddsAmerican: capper.oddsAmerican,
    units,
    selection,
    propPlayer,
    propStat,
    propActual,
    publishedAt: event.startsAt,
    clarity: "explicit",
    grade,
    note:
      market === "prop"
        ? "Sample prop stat on a demo final. Not a real box score."
        : index % 9 === 0
          ? "Graded at the demo final against the posted number."
          : null,
    isDemo: true,
  };
}

function applyTiming(picks: PickDraft[], lateRate: number, leanRate: number, rng: () => number) {
  const graded = picks
    .map((pick, index) => ({ pick, index }))
    .filter((item) => item.pick.grade !== "pending" && item.pick.grade !== "void");
  const lateCount = Math.round(graded.length * lateRate);
  const leanCount = Math.round(graded.length * leanRate);
  const lateSet = new Set(shuffle(graded, rng).slice(0, lateCount).map((item) => item.index));
  const leanSet = new Set(
    shuffle(
      graded.map((item) => item.index),
      rng,
    )
      .slice(0, leanCount),
  );

  picks.forEach((pick, index) => {
    const eventTime = pick.publishedAt.getTime();
    if (lateSet.has(index)) {
      pick.publishedAt = new Date(eventTime + (40 + (index % 3) * 15) * 60_000);
    } else {
      pick.publishedAt = new Date(eventTime - (8 + (index % 5)) * 3_600_000);
    }
    pick.clarity = leanSet.has(index) ? "lean" : "explicit";
    if (pick.clarity === "lean" && pick.note == null) {
      pick.note = "Posted as a lean. The demo still records a number so the final can grade it.";
    }
  });
}

async function main() {
  const rng = mulberry32(20250921);
  const pools = buildPools(rng);
  const events = new Map<string, EventDraft>();
  for (const pool of pools.values()) {
    for (const event of pool) events.set(event.id, event);
  }

  const picks: PickDraft[] = [];

  for (const capper of CAPPERS) {
    const drafted: PickDraft[] = [];
    let cursor = 0;
    for (const slice of capper.slices) {
      const pool = pools.get(`${slice.sport}-${slice.season}`);
      if (!pool) throw new Error(`Missing pool ${slice.sport} ${slice.season}`);
      const count = slice.wins + slice.losses + slice.pushes;
      const chosen = draw(pool, count, rng);
      const units = chosen.map((_, index) => capper.units[index % capper.units.length]);
      const grades = assignGrades(units, slice.wins, slice.losses, slice.pushes, rng);
      chosen.forEach((event, index) => {
        drafted.push(
          buildGradedPick(capper, event, slice.market, grades[index], units[index], cursor, rng),
        );
        cursor += 1;
      });
    }
    applyTiming(drafted, capper.lateRate, capper.leanRate, rng);
    picks.push(...drafted);
  }

  const openNfl: EventDraft = {
    id: "nfl-2025-open-1",
    sport: "NFL",
    season: "Sample 2025",
    weekLabel: "Demo Week 9",
    name: "East Current at Harbor Kings",
    startsAt: kickoff("Sample 2025", 9, 0),
    status: "scheduled",
    homeName: "Harbor Kings",
    awayName: "East Current",
    homeScore: null,
    awayScore: null,
    source: RESULT_SOURCE,
    sourceNote: OPEN_NOTE,
  };
  const openNba: EventDraft = {
    id: "nba-2025-open-1",
    sport: "NBA",
    season: "Sample 2025",
    weekLabel: "Demo Week 9",
    name: "River Index at Atlas Five",
    startsAt: kickoff("Sample 2025", 9, 1),
    status: "scheduled",
    homeName: "Atlas Five",
    awayName: "River Index",
    homeScore: null,
    awayScore: null,
    source: RESULT_SOURCE,
    sourceNote: OPEN_NOTE,
  };
  const voidNhl: EventDraft = {
    id: "nhl-2025-void-1",
    sport: "NHL",
    season: "Sample 2025",
    weekLabel: "Demo Week 4",
    name: "Harbor Siren at Frost Ledger",
    startsAt: kickoff("Sample 2025", 4, 0),
    status: "cancelled",
    homeName: "Frost Ledger",
    awayName: "Harbor Siren",
    homeScore: null,
    awayScore: null,
    source: RESULT_SOURCE,
    sourceNote: VOID_NOTE,
  };
  events.set(openNfl.id, openNfl);
  events.set(openNba.id, openNba);
  events.set(voidNhl.id, voidNhl);

  const pendingLine = -3.5;
  const pendingGrade = gradeMarket({
    market: "spread",
    side: "home",
    line: pendingLine,
    homeScore: null,
    awayScore: null,
    propActual: null,
    status: "scheduled",
  });
  if (pendingGrade !== "pending") throw new Error("Open fixture graded unexpectedly");

  picks.push({
    id: "linelock-nfl-2025-open-1",
    capperId: "linelock",
    eventId: openNfl.id,
    market: "spread",
    side: "home",
    line: pendingLine,
    oddsAmerican: -110,
    units: 1,
    selection: `Harbor Kings ${formatLine(pendingLine, true)}`,
    propPlayer: null,
    propStat: null,
    propActual: null,
    publishedAt: new Date(openNfl.startsAt.getTime() - 10 * 3_600_000),
    clarity: "explicit",
    grade: "pending",
    note: "Still open. No final is recorded.",
    isDemo: true,
  });
  picks.push({
    id: "evenkeel-nba-2025-open-1",
    capperId: "evenkeel",
    eventId: openNba.id,
    market: "spread",
    side: "away",
    line: 4.5,
    oddsAmerican: -110,
    units: 1,
    selection: `River Index ${formatLine(4.5, true)}`,
    propPlayer: null,
    propStat: null,
    propActual: null,
    publishedAt: new Date(openNba.startsAt.getTime() - 6 * 3_600_000),
    clarity: "explicit",
    grade: "pending",
    note: "Still open. No final is recorded.",
    isDemo: true,
  });

  const voidGrade = gradeMarket({
    market: "moneyline",
    side: "home",
    line: null,
    homeScore: null,
    awayScore: null,
    propActual: null,
    status: "cancelled",
  });
  if (voidGrade !== "void") throw new Error("Void fixture was not void");

  picks.push({
    id: "pucksheet-nhl-2025-void-1",
    capperId: "pucksheet",
    eventId: voidNhl.id,
    market: "moneyline",
    side: "home",
    line: null,
    oddsAmerican: -120,
    units: 1,
    selection: "Frost Ledger",
    propPlayer: null,
    propStat: null,
    propActual: null,
    publishedAt: new Date(voidNhl.startsAt.getTime() - 9 * 3_600_000),
    clarity: "explicit",
    grade: "void",
    note: "Fixture voided in the demo. Excluded from the factor.",
    isDemo: true,
  });

  await prisma.pick.deleteMany();
  await prisma.event.deleteMany();
  await prisma.capper.deleteMany();

  await prisma.capper.createMany({
    data: CAPPERS.map((capper) => ({
      id: capper.handle,
      handle: capper.handle,
      displayName: capper.displayName,
      focus: capper.focus,
      bio: capper.bio,
      hue: capper.hue,
      isDemo: true,
    })),
  });

  const eventRows = [...events.values()];
  for (let offset = 0; offset < eventRows.length; offset += 40) {
    await prisma.event.createMany({ data: eventRows.slice(offset, offset + 40) });
  }
  for (let offset = 0; offset < picks.length; offset += 40) {
    await prisma.pick.createMany({ data: picks.slice(offset, offset + 40) });
  }

  const graded = picks.filter((pick) => pick.grade === "win" || pick.grade === "loss" || pick.grade === "push");
  console.log(
    `Charoof demo seed: ${CAPPERS.length} cappers, ${events.size} fixtures, ${picks.length} picks (${graded.length} settled).`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
