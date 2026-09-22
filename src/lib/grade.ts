export type Grade = "win" | "loss" | "push" | "void" | "pending";

export type ScoreScope = "final" | "1q" | "1h";

export type GradeInput = {
  market: string;
  side: string;
  line: number | null;
  homeScore: number | null;
  awayScore: number | null;
  propActual: number | null;
  status: string;
  scoreScope?: ScoreScope | string;
  participant?: "home" | "away" | string | null;
  homeFirstQuarter?: number | null;
  awayFirstQuarter?: number | null;
  homeFirstHalf?: number | null;
  awayFirstHalf?: number | null;
};

const EPSILON = 1e-9;

function signGrade(value: number): Grade {
  if (Math.abs(value) < EPSILON) return "push";
  return value > 0 ? "win" : "loss";
}

function pair(
  home: number | null | undefined,
  away: number | null | undefined,
): { home: number; away: number } | null {
  if (home == null || away == null) return null;
  return { home, away };
}

function scoresForScope(input: GradeInput): { home: number; away: number } | null {
  const scope = input.scoreScope ?? "final";
  if (scope === "1q") return pair(input.homeFirstQuarter, input.awayFirstQuarter);
  if (scope === "1h") return pair(input.homeFirstHalf, input.awayFirstHalf);
  if (scope === "final") return pair(input.homeScore, input.awayScore);
  return null;
}

export function gradeMarket(input: GradeInput): Grade {
  if (input.status === "cancelled") return "void";
  if (input.status !== "final") return "pending";

  if (input.market === "prop") {
    if (input.homeScore == null || input.awayScore == null) return "pending";
    if (input.line == null || input.propActual == null) return "void";
    if (input.side === "over") return signGrade(input.propActual - input.line);
    if (input.side === "under") return signGrade(input.line - input.propActual);
    return "void";
  }

  const scores = scoresForScope(input);
  if (!scores) return "pending";
  const { home, away } = scores;

  if (input.market === "moneyline" || input.market === "dnb") {
    if (home === away) return "push";
    const winner = home > away ? "home" : "away";
    return input.side === winner ? "win" : "loss";
  }

  if (input.line == null) return "void";

  if (input.market === "spread") {
    const margin = input.side === "home" ? home - away : away - home;
    return signGrade(margin + input.line);
  }

  if (input.market === "total") {
    const total = home + away;
    if (input.side === "over") return signGrade(total - input.line);
    if (input.side === "under") return signGrade(input.line - total);
    return "void";
  }

  if (input.market === "team_total") {
    const points = input.participant === "home" ? home : input.participant === "away" ? away : null;
    if (points == null) return "void";
    if (input.side === "over") return signGrade(points - input.line);
    if (input.side === "under") return signGrade(input.line - points);
    return "void";
  }

  return "void";
}

export function spreadLine(
  side: "home" | "away",
  home: number,
  away: number,
  grade: "win" | "loss" | "push",
): number {
  const margin = side === "home" ? home - away : away - home;
  if (grade === "push") return -margin;
  if (grade === "win") return -margin + 0.5;
  return -margin - 0.5;
}

export function totalLine(
  side: "over" | "under",
  home: number,
  away: number,
  grade: "win" | "loss" | "push",
): number {
  const total = home + away;
  if (grade === "push") return total;
  if (side === "over") return grade === "win" ? total - 0.5 : total + 0.5;
  return grade === "win" ? total + 0.5 : total - 0.5;
}

export function propActualFor(
  side: "over" | "under",
  line: number,
  grade: "win" | "loss" | "push",
): number {
  if (grade === "push") return line;
  if (grade === "win") return side === "over" ? line + 3 : line - 3;
  return side === "over" ? line - 3 : line + 3;
}

export function unitProfit(grade: Grade, units: number, oddsAmerican: number | null): number {
  if (grade === "win") {
    if (oddsAmerican == null) return units;
    const perUnit = oddsAmerican > 0 ? oddsAmerican / 100 : 100 / Math.abs(oddsAmerican);
    return units * perUnit;
  }
  if (grade === "loss") return -units;
  return 0;
}

export function risksStake(grade: Grade): boolean {
  return grade === "win" || grade === "loss" || grade === "push";
}
