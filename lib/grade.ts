/** Grade Calibration bands. Display labels and tube fill share this function. */

export const GRADE_BANDS = {
  strongAt: 70,
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

/** Clamp onto 0–100 without rounding. Grades read this raw value. */
export function clampFill(fill: number): number {
  if (!Number.isFinite(fill)) return 0;
  return Math.max(0, Math.min(100, fill));
}

/** Rounded percentage for the tube label only. 69.5 displays as 70 and still bands as PROVISIONAL. */
export function displayFill(fill: number): number {
  return Math.round(clampFill(fill));
}

/**
 * 0% is empty glass and EXIT LIQUIDITY.
 * Below 40 is WEAK. From 40 up to but not including 70 is PROVISIONAL. 70 and above is STRONG.
 */
export function gradeForFill(fill: number): Grade {
  const n = clampFill(fill);
  if (n <= 0) return { key: "exit", name: LABELS.exit };
  if (n < GRADE_BANDS.weakAt) return { key: "weak", name: LABELS.weak };
  if (n < GRADE_BANDS.strongAt) return { key: "provisional", name: LABELS.provisional };
  return { key: "strong", name: LABELS.strong };
}
