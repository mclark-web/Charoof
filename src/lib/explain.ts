import { PUBLIC_RESULT_SOURCE } from "@/lib/constants";
import { formatLine, marketLabel } from "@/lib/format";

export function explainSettlement(input: {
  market: string;
  side: string;
  selection: string;
  line: number | null;
  grade: string;
  homeName: string;
  awayName: string;
  homeScore: number | null;
  awayScore: number | null;
  homeFirstQuarter?: number | null;
  awayFirstQuarter?: number | null;
  homeFirstHalf?: number | null;
  awayFirstHalf?: number | null;
  scoreScope?: string;
  participant?: string | null;
  status: string;
  propActual: number | null;
  propStat: string | null;
  source: string;
  sourceNote: string;
}): string {
  if (input.status === "cancelled" || input.grade === "void") {
    return input.sourceNote;
  }
  if (input.status !== "final" || input.homeScore == null || input.awayScore == null) {
    return input.sourceNote;
  }

  const scope = input.scoreScope ?? "final";
  const home =
    scope === "1q" ? input.homeFirstQuarter : scope === "1h" ? input.homeFirstHalf : input.homeScore;
  const away =
    scope === "1q" ? input.awayFirstQuarter : scope === "1h" ? input.awayFirstHalf : input.awayScore;
  if (home == null || away == null) return input.sourceNote;

  const slice = scope === "1q" ? "First quarter" : scope === "1h" ? "First half" : "Final";
  const score = `${input.awayName} ${away}, ${input.homeName} ${home}`;
  const prefix =
    input.source === PUBLIC_RESULT_SOURCE
      ? `Public final, ${slice.toLowerCase()}: ${score}.`
      : `Demo seed final: ${score}.`;

  if (input.market === "spread") {
    const verb =
      input.grade === "win" ? "covered" : input.grade === "push" ? "pushed" : "did not cover";
    return `${prefix} ${input.selection} ${verb}. ${input.sourceNote}`;
  }

  if (input.market === "total") {
    const total = home + away;
    return `${prefix} Combined points were ${total} against ${formatLine(input.line)}. ${input.sourceNote}`;
  }

  if (input.market === "team_total") {
    const points = input.participant === "away" ? away : home;
    const name = input.participant === "away" ? input.awayName : input.homeName;
    return `${prefix} ${name} scored ${points} against ${formatLine(input.line)}. ${input.sourceNote}`;
  }

  if (input.market === "moneyline" || input.market === "dnb") {
    const verb = input.grade === "win" ? "won" : input.grade === "push" ? "tied" : "lost";
    return `${prefix} The selected side ${verb}. ${input.sourceNote}`;
  }

  if (input.market === "prop") {
    const origin =
      input.source === PUBLIC_RESULT_SOURCE
        ? "Recorded stat from the public box score."
        : "This prop stat is demo seed data, not a live box score.";
    return `${prefix} ${input.propStat ?? "Stat"} was ${input.propActual ?? "—"} against ${formatLine(input.line)} (${input.side}). ${origin} ${input.sourceNote}`;
  }

  return `${prefix} ${marketLabel(input.market)} graded ${input.grade}. ${input.sourceNote}`;
}
