/** Map a settled outcome onto the hub tube. 0% stays empty glass. */

export type Outcome = "win" | "loss" | "push" | "void" | "pending";

export function fillForOutcome(outcome: Outcome): number {
  if (outcome === "win") return 100;
  if (outcome === "loss") return 28;
  if (outcome === "push") return 50;
  return 0;
}

export function outcomeLabel(outcome: Outcome): string {
  if (outcome === "win") return "Win";
  if (outcome === "loss") return "Loss";
  if (outcome === "push") return "Push";
  if (outcome === "void") return "Void";
  return "Open";
}

/** Decisive hit rate. Pushes, voids, and open rows stay out of the denominator. */
export function hitFill(wins: number, losses: number): number {
  const decisive = wins + losses;
  if (decisive <= 0) return 0;
  return Math.round((100 * wins) / decisive);
}

export function recordLabel(wins: number, losses: number, pushes = 0): string {
  if (pushes > 0) return `${wins}–${losses}–${pushes}`;
  return `${wins}–${losses}`;
}
