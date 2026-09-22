export const SPORTS = ["NFL", "NBA", "MLB", "NHL", "NCAAF"] as const;

export type Sport = (typeof SPORTS)[number];

export const DEMO_SEASONS = ["Sample 2024", "Sample 2025"] as const;

export type DemoSeason = (typeof DEMO_SEASONS)[number];

/** Season-to-date window on the demo ledger. */
export const DEMO_SEASON: DemoSeason = "Sample 2025";

/** Settled picks required before a capper counts as a peer. */
export const MIN_GRADED = 12;

/** Chad is withheld until a scope has at least this many eligible peers. */
export const MIN_PEER_SET = 3;

/** Under this /100 score is Chud territory. */
export const CHUD_LINE = 70;

/** Top share of eligible peers that can earn Chad. */
export const CHAD_FRACTION = 0.3;

/** Phantom picks mixed into a short sample, scored at the prior. */
export const SAMPLE_PRIOR = 10;

export const PRIOR_SCORE = 50;

export const ACCURACY_ANCHOR = 50;

/** Accuracy points added for a 100% ROI. A 10% ROI adds 25 points. */
export const ACCURACY_ROI_SCALE = 250;

export const ACCURACY_WEIGHT = 0.65;

export const DISCIPLINE_WEIGHT = 0.35;

export const STAKE_WEIGHT = 0.4;

export const LOCK_WEIGHT = 0.35;

export const CLARITY_WEIGHT = 0.25;

/** Stake score = 100 − this constant × coefficient of variation. */
export const STAKE_CV_PENALTY = 120;

export const RESULT_SOURCE = "demo-seed";

/** Public finals copied into the Fri Sep 18, 2026 pick archive. Not an odds feed. */
export const PUBLIC_RESULT_SOURCE = "public-box-score";

export const ARCHIVE_SEASON = "Fri Sep 18, 2026";

export const ARCHIVE_WEEK = "Public pick archive (Fri Sep 18)";

export const FINAL_NOTE =
  "Invented sample final for the Charoof demo. Not a live score and not a historical result.";

export const PUBLIC_FINAL_NOTE =
  "Settled from a public final or box score. No odds feed. Not a demo invention.";

export const OPEN_NOTE =
  "Sample fixture left open. Charoof does not invent a final.";

export const VOID_NOTE = "Sample fixture voided. The pick is not graded.";

export function isSport(value: string): value is Sport {
  return (SPORTS as readonly string[]).includes(value);
}
