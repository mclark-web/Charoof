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
  status: string;
  propActual: number | null;
  propStat: string | null;
  sourceNote: string;
}): string {
  if (input.status === "cancelled" || input.grade === "void") {
    return input.sourceNote;
  }
  if (input.status !== "final" || input.homeScore == null || input.awayScore == null) {
    return input.sourceNote;
  }

  const score = `${input.awayName} ${input.awayScore}, ${input.homeName} ${input.homeScore}`;
  const prefix = `Demo seed final: ${score}.`;

  if (input.market === "spread") {
    const verb =
      input.grade === "win" ? "covered" : input.grade === "push" ? "pushed" : "did not cover";
    return `${prefix} ${input.selection} ${verb}. ${input.sourceNote}`;
  }

  if (input.market === "total") {
    const total = input.homeScore + input.awayScore;
    return `${prefix} Combined points were ${total} against ${formatLine(input.line)}. ${input.sourceNote}`;
  }

  if (input.market === "moneyline") {
    const verb =
      input.grade === "win" ? "won" : input.grade === "push" ? "tied" : "lost";
    return `${prefix} The selected side ${verb}. ${input.sourceNote}`;
  }

  if (input.market === "prop") {
    return `${prefix} Sample ${input.propStat ?? "stat"} was ${input.propActual ?? "—"} against ${formatLine(input.line)} (${input.side}). This prop stat is demo seed data, not a live box score. ${input.sourceNote}`;
  }

  return `${prefix} ${marketLabel(input.market)} graded ${input.grade}. ${input.sourceNote}`;
}
