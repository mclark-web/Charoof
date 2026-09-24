import { gradeForFill, type Grade } from "@/lib/grade";
import type { Outcome } from "@/lib/outcome";

/** Recency windows for a capper GC score. Weights are 40 / 30 / 20 / 10. */
export const RECENCY_WINDOWS = [
  { key: "1W", days: 7, weight: 40 },
  { key: "2W", days: 14, weight: 30 },
  { key: "1M", days: 30, weight: 20 },
  { key: "3M", days: 90, weight: 10 },
] as const;

const NY = "America/New_York";

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

/** Today's calendar date in America/New_York, as YYYY-MM-DD. */
export function newYorkToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: NY,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** "September 24, 2026" from a YYYY-MM-DD calendar date. */
export function formatNewYorkDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) throw new Error(`Bad New York date ${isoDate}`);
  const utc = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(utc);
}

function calendarOrdinal(ymd: string): number {
  const [year, month, day] = ymd.split("-").map(Number);
  return Math.round(Date.UTC(year, month - 1, day) / 86_400_000);
}

/**
 * America/New_York calendar day of a post, as a day ordinal.
 * An ISO instant is converted into that timezone. A date-only stamp, or a wall
 * time already written in ET, keeps the first YYYY-MM-DD in the string.
 * Later “updated” dates stay out of the window.
 */
export function postedDay(value: string): number {
  const trimmed = value.trim();
  let ymd: string;
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    const instant = Date.parse(trimmed);
    if (!Number.isFinite(instant)) throw new Error(`No posted day in ${value}`);
    ymd = newYorkToday(new Date(instant));
  } else {
    const match = /(\d{4}-\d{2}-\d{2})/.exec(trimmed);
    if (!match) throw new Error(`No posted day in ${value}`);
    ymd = match[1];
  }
  return calendarOrdinal(ymd);
}

/**
 * Win percentage over the last 7, 14, 30, and 90 days, weighted 40/30/20/10.
 * Pushes, voids, and pending picks are not decided. An empty window is dropped
 * and the remaining weights are renormalized. Every window empty returns no score.
 */
export function blendWinRate(picks: DatedOutcome[], asOf: number): BlendedWinRate {
  const windows: WindowRecord[] = RECENCY_WINDOWS.map((window) => {
    const cutoff = asOf - window.days;
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

  return { fill: score, windows, label };
}

/** A missing blend is PROVISIONAL with no score. A computed 0% stays EXIT LIQUIDITY. */
export function gradeForBlendedFill(fill: number | null): Grade {
  if (fill == null) return { key: "provisional", name: "PROVISIONAL" };
  return gradeForFill(fill);
}

/** Decided picks inside the 90-day window. Pushes, voids, and pending picks stay out. */
export const MIN_GRADED_PICKS = 10;

export const PROVISIONAL_SAMPLE_NOTE =
  "Cappers show PROVISIONAL until they have 10 graded picks in the last 90 days; this overrides every band: STRONG, WEAK, and EXIT LIQUIDITY.";

export function gradedPickCount(blended: BlendedWinRate): number {
  const window = blended.windows.find((item) => item.key === "3M");
  return (window?.wins ?? 0) + (window?.losses ?? 0);
}

export type CapperPresentation = {
  fill: number | null;
  grade: Grade;
  /** Shown when a score exists but the 90-day sample is still under 10. */
  note: string | null;
};

/**
 * Under 10 decided picks in 90 days, the card stays PROVISIONAL and still shows
 * the blended percentage. A full sample uses the 70/40 cutoffs, including 0% EXIT LIQUIDITY.
 */
export function presentCapper(blended: BlendedWinRate): CapperPresentation {
  if (blended.fill == null) {
    return { fill: null, grade: gradeForBlendedFill(null), note: null };
  }
  if (gradedPickCount(blended) < MIN_GRADED_PICKS) {
    return {
      fill: blended.fill,
      grade: { key: "provisional", name: "PROVISIONAL" },
      note: PROVISIONAL_SAMPLE_NOTE,
    };
  }
  return { fill: blended.fill, grade: gradeForFill(blended.fill), note: null };
}
