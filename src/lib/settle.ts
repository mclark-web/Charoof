import { gradeMarket, type Grade, type GradeInput } from "@/lib/grade";

export type PublicFinal = {
  status: string;
  homeScore: number | null;
  awayScore: number | null;
};

export type SettleResult = {
  grade: Grade;
  /** Recorded scores exist and do not match the public final. */
  mismatch: boolean;
  /** The grade came from a public final. A missing final stays pending. */
  usedPublicFinal: boolean;
};

function isFinal(final: PublicFinal | null): final is PublicFinal & { homeScore: number; awayScore: number } {
  if (!final) return false;
  const status = final.status.toLowerCase();
  const closed = status === "final" || status === "status_final" || status === "status_full_time" || status === "full_time";
  return closed && final.homeScore != null && final.awayScore != null;
}

/**
 * Grade only from a public final. A recorded score that disagrees is a mismatch
 * and is not the score that settles the pick. With no public final, the pick
 * stays pending even when the recorded score would have been a win.
 */
export function settleAgainstPublic(
  pick: Omit<GradeInput, "homeScore" | "awayScore" | "status">,
  recorded: PublicFinal | null,
  publicFinal: PublicFinal | null,
): SettleResult {
  if (!isFinal(publicFinal)) {
    return { grade: "pending", mismatch: false, usedPublicFinal: false };
  }

  const mismatch =
    recorded != null &&
    recorded.homeScore != null &&
    recorded.awayScore != null &&
    (recorded.homeScore !== publicFinal.homeScore || recorded.awayScore !== publicFinal.awayScore);

  const grade = gradeMarket({
    ...pick,
    status: "final",
    homeScore: publicFinal.homeScore,
    awayScore: publicFinal.awayScore,
  });

  return { grade, mismatch, usedPublicFinal: true };
}
