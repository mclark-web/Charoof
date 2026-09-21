import { cache } from "react";

import {
  CHAD_FRACTION,
  CHUD_LINE,
  DEMO_SEASON,
  MIN_GRADED,
  MIN_PEER_SET,
  SPORTS,
  type Sport,
} from "@/lib/constants";
import { prisma } from "@/lib/db";
import type { Grade } from "@/lib/grade";
import type { LedgerWindow } from "@/lib/links";
import {
  badgeHint,
  chadWindowSize,
  orderAndMark,
  scorePicks,
  type Badge,
  type ScoreParts,
} from "@/lib/scoring";

export type LedgerPick = {
  id: string;
  market: string;
  side: string;
  line: number | null;
  oddsAmerican: number;
  units: number;
  selection: string;
  propPlayer: string | null;
  propStat: string | null;
  propActual: number | null;
  publishedAt: Date;
  clarity: string;
  grade: Grade;
  note: string | null;
  isDemo: boolean;
  event: {
    id: string;
    sport: string;
    season: string;
    weekLabel: string;
    name: string;
    startsAt: Date;
    status: string;
    homeName: string;
    awayName: string;
    homeScore: number | null;
    awayScore: number | null;
    source: string;
    sourceNote: string;
  };
};

export type LedgerCapper = {
  id: string;
  handle: string;
  displayName: string;
  focus: string;
  bio: string;
  hue: number;
  isDemo: boolean;
  picks: LedgerPick[];
};

export type Standing = ScoreParts & {
  id: string;
  handle: string;
  displayName: string;
  focus: string;
  bio: string;
  hue: number;
  badge: Badge;
  rank: number | null;
};

export type Board = {
  window: LedgerWindow;
  sport: Sport | null;
  rows: Standing[];
  eligibleCount: number;
  chadWindow: number;
  settledPicks: number;
  note: string;
};

const GRADES = new Set<Grade>(["win", "loss", "push", "void", "pending"]);

function asGrade(value: string): Grade {
  if (GRADES.has(value as Grade)) return value as Grade;
  return "void";
}

export const loadLedger = cache(async (): Promise<LedgerCapper[]> => {
  const cappers = await prisma.capper.findMany({
    include: {
      picks: {
        include: { event: true },
      },
    },
    orderBy: { handle: "asc" },
  });

  return cappers.map((capper) => ({
    id: capper.id,
    handle: capper.handle,
    displayName: capper.displayName,
    focus: capper.focus,
    bio: capper.bio,
    hue: capper.hue,
    isDemo: capper.isDemo,
    picks: capper.picks.map((pick) => ({
      id: pick.id,
      market: pick.market,
      side: pick.side,
      line: pick.line,
      oddsAmerican: pick.oddsAmerican,
      units: pick.units,
      selection: pick.selection,
      propPlayer: pick.propPlayer,
      propStat: pick.propStat,
      propActual: pick.propActual,
      publishedAt: pick.publishedAt,
      clarity: pick.clarity,
      grade: asGrade(pick.grade),
      note: pick.note,
      isDemo: pick.isDemo,
      event: {
        id: pick.event.id,
        sport: pick.event.sport,
        season: pick.event.season,
        weekLabel: pick.event.weekLabel,
        name: pick.event.name,
        startsAt: pick.event.startsAt,
        status: pick.event.status,
        homeName: pick.event.homeName,
        awayName: pick.event.awayName,
        homeScore: pick.event.homeScore,
        awayScore: pick.event.awayScore,
        source: pick.event.source,
        sourceNote: pick.event.sourceNote,
      },
    })),
  }));
});

export function picksInScope(
  picks: LedgerPick[],
  window: LedgerWindow,
  sport: Sport | null,
): LedgerPick[] {
  return picks.filter((pick) => {
    if (sport && pick.event.sport !== sport) return false;
    if (window === "season" && pick.event.season !== DEMO_SEASON) return false;
    return true;
  });
}

function toScored(pick: LedgerPick) {
  return {
    grade: pick.grade,
    units: pick.units,
    oddsAmerican: pick.oddsAmerican,
    locked: pick.publishedAt.getTime() < pick.event.startsAt.getTime(),
    explicit: pick.clarity === "explicit",
  };
}

export function buildBoard(
  ledger: LedgerCapper[],
  window: LedgerWindow,
  sport: Sport | null,
): Board {
  const unmarked = ledger.flatMap((capper) => {
    const picks = picksInScope(capper.picks, window, sport);
    if (picks.length === 0) return [];
    const score = scorePicks(picks.map(toScored));
    return [
      {
        ...score,
        id: capper.id,
        handle: capper.handle,
        displayName: capper.displayName,
        focus: capper.focus,
        bio: capper.bio,
        hue: capper.hue,
      },
    ];
  });

  const rows: Standing[] = orderAndMark(unmarked);
  const eligibleCount = rows.filter((row) => row.graded >= MIN_GRADED).length;
  const chadWindow = chadWindowSize(eligibleCount);
  const settledPicks = rows.reduce((sum, row) => sum + row.graded, 0);
  const note =
    eligibleCount < MIN_PEER_SET
      ? `Chad is withheld in this scope. ${eligibleCount} ${eligibleCount === 1 ? "capper has" : "cappers have"} at least ${MIN_GRADED} settled picks, and the window opens at ${MIN_PEER_SET} peers. Under ${CHUD_LINE}/100 is still Chud territory.`
      : `Chad window: top ${Math.round(CHAD_FRACTION * 100)}% of ${eligibleCount} eligible peers (${chadWindow} ${chadWindow === 1 ? "seat" : "seats"}), and only at ${CHUD_LINE}/100 or better. Eligible means ${MIN_GRADED}+ settled picks here. A score under ${CHUD_LINE} stays Chud even inside the window. ${badgeHint("listed")}`;

  return {
    window,
    sport,
    rows,
    eligibleCount,
    chadWindow,
    settledPicks,
    note,
  };
}

export async function getBoard(window: LedgerWindow, sport: Sport | null): Promise<Board> {
  const ledger = await loadLedger();
  return buildBoard(ledger, window, sport);
}

export function scopeBoards(ledger: LedgerCapper[], window: LedgerWindow, handle: string) {
  const scopes: Array<{ sport: Sport | null; label: string; standing: Standing | null }> = [
    { sport: null, label: "All sports", standing: null },
    ...SPORTS.map((sport) => ({ sport, label: sport, standing: null as Standing | null })),
  ];

  return scopes.flatMap((scope) => {
    const board = buildBoard(ledger, window, scope.sport);
    const standing = board.rows.find((row) => row.handle === handle) ?? null;
    if (!standing) return [];
    return [{ ...scope, standing, note: board.note }];
  });
}

export async function getPickById(id: string): Promise<{ pick: LedgerPick; capper: LedgerCapper } | null> {
  const ledger = await loadLedger();
  for (const capper of ledger) {
    const pick = capper.picks.find((item) => item.id === id);
    if (pick) return { pick, capper };
  }
  return null;
}

export function sortPicks(picks: LedgerPick[]): LedgerPick[] {
  return [...picks].sort((a, b) => {
    if (a.grade === "pending" && b.grade !== "pending") return -1;
    if (b.grade === "pending" && a.grade !== "pending") return 1;
    return b.event.startsAt.getTime() - a.event.startsAt.getTime();
  });
}
