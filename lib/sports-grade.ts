/**
 * Unit price for a public card.
 * When the page states an American price, that price is the unit price.
 * When it does not, the board uses even money. That is the same rule as the
 * Quinn Allen cards that posted no American price. Win, loss, and push stay
 * on the stated line. This price is not a sportsbook lookup.
 */
export const BOARD_PRICE_WHEN_UNSTATED = "-100";

export function boardPrice(stated: string | null | undefined): string {
  const value = stated?.trim();
  return value ? value : BOARD_PRICE_WHEN_UNSTATED;
}

export type LineGrade = "win" | "loss" | "push";

/**
 * Grade a full-game spread, run line, total, moneyline, or team total from a
 * final score. Partial-game markets (1H, 1Q, F5) are not graded here.
 * Score shape: "Away 26, Home 30".
 */
export function gradeFullGame(input: {
  market: string;
  side: string;
  number: number | null;
  finalScore: string;
}): LineGrade | null {
  if (!["spread", "run_line", "total", "moneyline", "team_total"].includes(input.market)) return null;
  const match = /^(.+?) (\d+), (.+?) (\d+)$/.exec(input.finalScore.trim());
  if (!match) return null;
  const teams = [
    { name: match[1], score: Number(match[2]) },
    { name: match[3], score: Number(match[4]) },
  ];
  if (input.market === "total") {
    if (input.number == null) return null;
    const sum = teams[0].score + teams[1].score;
    if (sum === input.number) return "push";
    const over = /over/i.test(input.side);
    return (over ? sum > input.number : sum < input.number) ? "win" : "loss";
  }
  const needle = input.side
    .replace(/ team total (Over|Under)$/i, "")
    .trim()
    .toLowerCase();
  const team = teams.find(
    (item) => item.name.toLowerCase().includes(needle) || needle.includes(item.name.toLowerCase()),
  );
  if (!team) return null;
  const opp = teams.find((item) => item !== team);
  if (!opp) return null;
  if (input.market === "moneyline") {
    if (team.score === opp.score) return "push";
    return team.score > opp.score ? "win" : "loss";
  }
  if (input.number == null) return null;
  if (input.market === "team_total") {
    if (team.score === input.number) return "push";
    const over = /over/i.test(input.side);
    return (over ? team.score > input.number : team.score < input.number) ? "win" : "loss";
  }
  const covered = team.score + input.number - opp.score;
  if (covered === 0) return "push";
  return covered > 0 ? "win" : "loss";
}
