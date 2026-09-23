import {
  ACCURACY_ANCHOR,
  ACCURACY_ROI_SCALE,
  ACCURACY_WEIGHT,
  CHAD_FRACTION,
  CHUD_LINE,
  CLARITY_WEIGHT,
  DISCIPLINE_WEIGHT,
  LOCK_WEIGHT,
  MIN_GRADED,
  MIN_PEER_SET,
  PRIOR_SCORE,
  SAMPLE_PRIOR,
  STAKE_CV_PENALTY,
  STAKE_WEIGHT,
} from "@/lib/constants";
import { risksStake, unitProfit, type Grade } from "@/lib/grade";

export type Badge = "chad" | "chud" | "listed" | "provisional" | "unrated";

export type ScoredPick = {
  grade: Grade;
  units: number;
  oddsAmerican: number | null;
  locked: boolean;
  explicit: boolean;
};

export type ScoreParts = {
  graded: number;
  wins: number;
  losses: number;
  pushes: number;
  pending: number;
  voids: number;
  netUnits: number;
  unitsRisked: number;
  roi: number | null;
  accuracy: number | null;
  stakeScore: number | null;
  lockScore: number | null;
  clarityScore: number | null;
  discipline: number | null;
  shrink: number | null;
  raw: number | null;
  chExact: number | null;
  ch: number | null;
};

export type Marked<T> = T & {
  badge: Badge;
  rank: number | null;
};

type Markable = {
  id: string;
  handle: string;
  graded: number;
  ch: number | null;
  netUnits: number;
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function chadWindowSize(eligibleCount: number): number {
  if (eligibleCount < MIN_PEER_SET) return 0;
  return Math.ceil(eligibleCount * CHAD_FRACTION);
}

export function emptyScore(): ScoreParts {
  return {
    graded: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    pending: 0,
    voids: 0,
    netUnits: 0,
    unitsRisked: 0,
    roi: null,
    accuracy: null,
    stakeScore: null,
    lockScore: null,
    clarityScore: null,
    discipline: null,
    shrink: null,
    raw: null,
    chExact: null,
    ch: null,
  };
}

export function scorePicks(picks: ScoredPick[]): ScoreParts {
  const parts = emptyScore();
  if (picks.length === 0) return parts;

  for (const pick of picks) {
    if (pick.grade === "void") {
      parts.voids += 1;
      continue;
    }
    if (pick.grade === "pending") {
      parts.pending += 1;
      continue;
    }
    parts.graded += 1;
    if (pick.grade === "win") parts.wins += 1;
    if (pick.grade === "loss") parts.losses += 1;
    if (pick.grade === "push") parts.pushes += 1;
    if (risksStake(pick.grade)) {
      parts.unitsRisked += pick.units;
      parts.netUnits += unitProfit(pick.grade, pick.units, pick.oddsAmerican);
    }
  }

  const behavior = picks.filter((pick) => pick.grade !== "void");
  if (behavior.length > 0) {
    const units = behavior.map((pick) => pick.units);
    const mean = units.reduce((sum, unit) => sum + unit, 0) / units.length;
    const variance =
      units.reduce((sum, unit) => sum + (unit - mean) ** 2, 0) / units.length;
    const cv = mean === 0 ? 1 : Math.sqrt(variance) / mean;
    parts.stakeScore = clamp(100 - STAKE_CV_PENALTY * cv, 0, 100);
    parts.lockScore = (100 * behavior.filter((pick) => pick.locked).length) / behavior.length;
    parts.clarityScore =
      (100 * behavior.filter((pick) => pick.explicit).length) / behavior.length;
    parts.discipline =
      STAKE_WEIGHT * parts.stakeScore +
      LOCK_WEIGHT * parts.lockScore +
      CLARITY_WEIGHT * parts.clarityScore;
  }

  if (parts.graded === 0 || parts.unitsRisked === 0 || parts.discipline == null) {
    return parts;
  }

  parts.roi = parts.netUnits / parts.unitsRisked;
  parts.accuracy = clamp(ACCURACY_ANCHOR + parts.roi * ACCURACY_ROI_SCALE, 0, 100);
  const discipline = parts.discipline ?? 0;
  parts.raw = ACCURACY_WEIGHT * parts.accuracy + DISCIPLINE_WEIGHT * discipline;
  parts.shrink = parts.graded / (parts.graded + SAMPLE_PRIOR);
  parts.chExact = clamp(
    parts.shrink * parts.raw + (1 - parts.shrink) * PRIOR_SCORE,
    0,
    100,
  );
  parts.ch = Math.round(parts.chExact);
  return parts;
}

export function orderAndMark<T extends Markable>(rows: T[]): Array<Marked<T>> {
  const sorted = [...rows].sort((a, b) => {
    if (a.ch == null && b.ch == null) return a.handle.localeCompare(b.handle);
    if (a.ch == null) return 1;
    if (b.ch == null) return -1;
    if (b.ch !== a.ch) return b.ch - a.ch;
    if (b.netUnits !== a.netUnits) return b.netUnits - a.netUnits;
    return a.handle.localeCompare(b.handle);
  });

  const eligible = sorted.filter(
    (row): row is T & { ch: number } => row.graded >= MIN_GRADED && row.ch != null,
  );
  const window = chadWindowSize(eligible.length);
  const cutoff = window > 0 ? eligible[window - 1].ch : null;
  const inWindow = new Set(eligible.slice(0, window).map((row) => row.id));
  if (cutoff != null) {
    for (const row of eligible) {
      if (row.ch === cutoff) inWindow.add(row.id);
    }
  }

  let lastCh: number | null = null;
  let lastRank = 0;

  return sorted.map((row, index) => {
    let rank: number | null = null;
    if (row.ch != null) {
      if (lastCh === null || row.ch !== lastCh) {
        lastRank = index + 1;
        lastCh = row.ch;
      }
      rank = lastRank;
    }

    let badge: Badge = "unrated";
    if (row.ch == null || row.graded === 0) {
      badge = "unrated";
    } else if (row.ch < CHUD_LINE) {
      badge = "chud";
    } else if (row.graded < MIN_GRADED) {
      badge = "provisional";
    } else if (inWindow.has(row.id)) {
      badge = "chad";
    } else {
      badge = "listed";
    }

    return { ...row, badge, rank };
  });
}

export function badgeLabel(badge: Badge): string {
  switch (badge) {
    case "chad":
      return "Chad";
    case "chud":
      return "Chud";
    case "listed":
      return "Listed";
    case "provisional":
      return "Provisional";
    case "unrated":
      return "Unrated";
  }
}

export function badgeHint(badge: Badge): string {
  switch (badge) {
    case "chad":
      return "Accuracy & Discipline. Top 30% of eligible peers, and at least 70/100.";
    case "chud":
      return "Uncertainty & Doubt. Under 70/100 is Chud territory.";
    case "listed":
      return "Clears 70/100, outside the top 30% of eligible peers.";
    case "provisional":
      return "At least 70/100, but the sample is too short to earn Chad.";
    case "unrated":
      return "No settled picks in this scope.";
  }
}
