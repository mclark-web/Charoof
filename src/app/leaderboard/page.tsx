import type { Metadata } from "next";

import { ChoiceLink } from "@/components/choice-link";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { SPORTS } from "@/lib/constants";
import { getBoard } from "@/lib/ledger";
import { boardHref, parseSport, parseWindow, windowLabel } from "@/lib/links";

export const metadata: Metadata = {
  title: "Board",
  description: "Charoof leaderboard for the demo ledger, overall and by sport, with a season-to-date window.",
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; window?: string }>;
}) {
  const query = await searchParams;
  const window = parseWindow(query.window);
  const { sport, invalid } = parseSport(query.sport);
  const board = invalid ? null : await getBoard(window, sport);
  const caption = invalid
    ? "Unknown sport"
    : `${windowLabel(window)}${sport ? `, ${sport}` : ", all sports"}`;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-brass">Leaderboard</p>
        <h1 className="mt-2 font-serif text-4xl text-pine">The board</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Overall and by sport. The full ledger is every settled demo final. Sample 2025 is the
          season-to-date rollup. A pick still settles at the game final either way.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <nav aria-label="Ledger window" className="flex flex-wrap gap-2">
          <ChoiceLink href={boardHref(sport, "all")} current={window === "all"}>
            Full ledger
          </ChoiceLink>
          <ChoiceLink href={boardHref(sport, "season")} current={window === "season"}>
            Sample 2025
          </ChoiceLink>
        </nav>
        <nav aria-label="Sport" className="flex flex-wrap gap-2">
          <ChoiceLink href={boardHref(null, window)} current={!invalid && sport == null}>
            All sports
          </ChoiceLink>
          {SPORTS.map((item) => (
            <ChoiceLink key={item} href={boardHref(item, window)} current={sport === item}>
              {item}
            </ChoiceLink>
          ))}
        </nav>
      </div>

      {invalid || !board ? (
        <p className="border border-line bg-card px-4 py-4 text-sm leading-6 text-ink-soft">
          That sport is not on the demo ledger. The board covers NFL, NBA, MLB, NHL, and NCAAF.
        </p>
      ) : (
        <>
          <LeaderboardTable rows={board.rows} window={window} sport={sport} caption={caption} />
          <p className="text-sm leading-6 text-ink-soft">
            {board.settledPicks} settled picks in this scope. {board.note}
          </p>
        </>
      )}
    </div>
  );
}
