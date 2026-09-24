/** Single-pick results. A result is not a GC grade. */

export type Outcome = "win" | "loss" | "push" | "void" | "pending";

export type ResultPill = "WIN" | "LOSS" | "PUSH" | "PENDING" | "VOID";

/**
 * Old map from one outcome onto a tube. Do not pass this into a GC grade.
 * Capper scores use the recency blend. A single pick shows resultPill instead.
 */
export function fillForOutcome(outcome: Outcome): number {
  if (outcome === "win") return 100;
  if (outcome === "loss") return 28;
  if (outcome === "push") return 50;
  return 0;
}

export function resultPill(outcome: Outcome): ResultPill {
  if (outcome === "win") return "WIN";
  if (outcome === "loss") return "LOSS";
  if (outcome === "push") return "PUSH";
  if (outcome === "void") return "VOID";
  return "PENDING";
}

export function outcomeLabel(outcome: Outcome): string {
  if (outcome === "win") return "Win";
  if (outcome === "loss") return "Loss";
  if (outcome === "push") return "Push";
  if (outcome === "void") return "Void";
  return "Open";
}

/** Decisive hit rate. Pushes, voids, and open rows stay out of the denominator. Unrounded, so a 69.5 bands as PROVISIONAL. */
export function hitFill(wins: number, losses: number): number {
  const decisive = wins + losses;
  if (decisive <= 0) return 0;
  return (100 * wins) / decisive;
}

export function recordLabel(wins: number, losses: number, pushes = 0): string {
  if (pushes > 0) return `${wins}–${losses}–${pushes}`;
  return `${wins}–${losses}`;
}
