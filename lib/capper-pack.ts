import { MIN_GRADED_PICKS } from "@/lib/recency";

/** A capper row the pack split can order without reading the grade bands. */
export type Rankable = {
  title: string;
  fill: number | null;
  /** Decided picks in the last 90 days. */
  graded90: number;
};

export type CapperPacks<T> = {
  best: T[];
  middle: T[];
  worst: T[];
  /** Fewer than 10 graded picks in 90 days, or no score. Not in best, middle, or worst. */
  building: T[];
};

/**
 * GC score descending. Ties break toward the larger 90-day graded sample, then the name.
 */
export function compareCappers(a: Rankable, b: Rankable): number {
  const score = (b.fill ?? -1) - (a.fill ?? -1);
  if (score !== 0) return score;
  const sample = b.graded90 - a.graded90;
  if (sample !== 0) return sample;
  return a.title.localeCompare(b.title);
}

/**
 * How many ranked cappers sit in Best, and how many sit in Worst.
 * Thirty percent of the ranked list, rounded up: 14 → 5 and 10 → 3.
 * The caller caps the two edges so they do not share a person
 * (1 → Best only, 2 → one Best and one Worst).
 */
export function rankedEdge(count: number): number {
  if (count <= 0) return 0;
  return Math.ceil((count * 30) / 100);
}

export function splitCapperPacks<T extends Rankable>(rows: readonly T[]): CapperPacks<T> {
  const building: T[] = [];
  const ranked: T[] = [];
  for (const row of rows) {
    if (row.fill == null || row.graded90 < MIN_GRADED_PICKS) building.push(row);
    else ranked.push(row);
  }
  ranked.sort(compareCappers);
  building.sort(compareCappers);

  const count = ranked.length;
  const edge = rankedEdge(count);
  const bestCount = Math.min(edge, count);
  const worstCount = Math.min(edge, count - bestCount);
  return {
    best: ranked.slice(0, bestCount),
    middle: ranked.slice(bestCount, count - worstCount),
    worst: worstCount === 0 ? [] : ranked.slice(count - worstCount),
    building,
  };
}
