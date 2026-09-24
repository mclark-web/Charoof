import { gradeForFill, type Grade } from "@/lib/grade";
import type { Outcome } from "@/lib/outcome";

/** Recency windows for a capper GC score. Weights are 40 / 30 / 20 / 10. */
export const RECENCY_WINDOWS = [
  { key: "1W", days: 7, weight: 40 },
  { key: "2W", days: 14, weight: 30 },
  { key: "1M", days: 30, weight: 20 },
  { key: "3M", days: 90, weight: 10 },
] as const;

const DAY = 24 * 60 * 60 * 1000;

export type DatedOutcome = {
  at: number;
  outcome: Outcome;
};

export type WindowRecord = {
  key: (typeof RECENCY_WINDOWS)[number]["key"];
  days: number;
  weight: number;
  wins: number;
  losses: number;
};

export type BlendedWinRate = {
  /** Null when every window has zero decided picks. */
  fill: number | null;
  windows: WindowRecord[];
  /** 1W 3–1 · 2W 5–3 · 1M 11–8 · 3M 30–24 */
  label: string;
};

/** First calendar day in a posted stamp. Later “updated” dates stay out of the window. */
export function postedDay(value: string): number {
  const match = /(\d{4}-\d{2}-\d{2})/.exec(value);
  if (!match) throw new Error(`No posted day in ${value}`);
  return Date.parse(`${match[1]}T00:00:00.000Z`);
}

/**
 * Win percentage over the last 7, 14, 30, and 90 days, weighted 40/30/20/10.
 * Pushes, voids, and pending picks are not decided. An empty window is dropped
 * and the remaining weights are renormalized. Every window empty returns no score.
 */
export function blendWinRate(picks: DatedOutcome[], asOf: number): BlendedWinRate {
  const windows: WindowRecord[] = RECENCY_WINDOWS.map((window) => {
    const cutoff = asOf - window.days * DAY;
    let wins = 0;
    let losses = 0;
    for (const pick of picks) {
      if (pick.at > asOf || pick.at < cutoff) continue;
      if (pick.outcome === "win") wins += 1;
      else if (pick.outcome === "loss") losses += 1;
    }
    return { key: window.key, days: window.days, weight: window.weight, wins, losses };
  });

  const label = windows.map((window) => `${window.key} ${window.wins}–${window.losses}`).join(" · ");
  const active = windows.filter((window) => window.wins + window.losses > 0);
  if (active.length === 0) return { fill: null, windows, label };

  const weight = active.reduce((sum, window) => sum + window.weight, 0);
  const score =
    active.reduce((sum, window) => {
      const rate = (100 * window.wins) / (window.wins + window.losses);
      return sum + rate * window.weight;
    }, 0) / weight;

  return { fill: Math.round(score), windows, label };
}

/** A missing blend is PROVISIONAL with no score. A computed 0% stays EXIT LIQUIDITY. */
export function gradeForBlendedFill(fill: number | null): Grade {
  if (fill == null) return { key: "provisional", name: "PROVISIONAL" };
  return gradeForFill(fill);
}
