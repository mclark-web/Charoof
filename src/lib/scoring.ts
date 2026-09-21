/**
 * CH marks for a numeric grade.
 * A score exists only after a contest result is recorded. This module does not
 * invent results, and it does not turn a missing result into a number.
 */

export const CHUD_BELOW = 70;
export const CHAD_TOP_SHARE = 0.3;

export type GradedMark = {
  score: number;
  badge: number;
  chad: boolean;
  chud: boolean;
};

export type OpenMark = {
  score: null;
  badge: null;
  chad: false;
  chud: false;
  status: "open";
};

/** 0–9 maps to 1. 90–100 maps to 10. */
export function badgeFromScore(score: number): number {
  const clamped = Math.min(100, Math.max(0, score));
  if (clamped >= 90) return 10;
  return Math.floor(clamped / 10) + 1;
}

export function isChud(score: number): boolean {
  return score < CHUD_BELOW;
}

/**
 * Chad is the top 30% of the peer set. Ties at the cutoff are included.
 * An empty peer set has no Chad marks.
 */
export function chadFlags(scores: readonly number[]): boolean[] {
  if (scores.length === 0) return [];
  const ranked = scores.map((score, index) => ({ score, index })).sort((a, b) => b.score - a.score || a.index - b.index);
  const cutoffCount = Math.max(1, Math.ceil(scores.length * CHAD_TOP_SHARE));
  const cutoffScore = ranked[cutoffCount - 1]?.score ?? ranked[0].score;
  return scores.map((score) => score >= cutoffScore);
}

/** No recorded score stays open. Chad and Chud are withheld. */
export function markOpen(): OpenMark {
  return { score: null, badge: null, chad: false, chud: false, status: "open" };
}

export function markPeers(scores: readonly number[]): GradedMark[] {
  const chad = chadFlags(scores);
  return scores.map((score, index) => ({
    score,
    badge: badgeFromScore(score),
    chad: chad[index] ?? false,
    chud: isChud(score),
  }));
}
