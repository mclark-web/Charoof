/** Grade Calibration bands. Display labels and tube fill share this function. */

export const GRADE_BANDS = {
  strongAt: 65,
  weakAt: 40,
} as const;

export type GradeKey = "exit" | "weak" | "provisional" | "strong";

export type Grade = {
  key: GradeKey;
  /** Uppercase pill label. Same weight and tracking for all four grades. */
  name: string;
};

const LABELS: Record<GradeKey, string> = {
  exit: "EXIT LIQUIDITY",
  weak: "WEAK",
  provisional: "PROVISIONAL",
  strong: "STRONG",
};

export function clampFill(fill: number): number {
  if (!Number.isFinite(fill)) return 0;
  return Math.max(0, Math.min(100, Math.round(fill)));
}

/**
 * 0% is empty glass and EXIT LIQUIDITY.
 * WEAK is at or below 40. PROVISIONAL is the open mid-band. STRONG starts at 65.
 */
export function gradeForFill(fill: number): Grade {
  const n = clampFill(fill);
  if (n <= 0) return { key: "exit", name: LABELS.exit };
  if (n <= GRADE_BANDS.weakAt) return { key: "weak", name: LABELS.weak };
  if (n < GRADE_BANDS.strongAt) return { key: "provisional", name: LABELS.provisional };
  return { key: "strong", name: LABELS.strong };
}
