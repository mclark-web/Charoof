import type { Metadata } from "next";

import { ChoiceLink } from "@/components/choice-link";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { SPORTS } from "@/lib/constants";
import { buildBoard, filterLedger, loadLedger } from "@/lib/ledger";
import { boardHref, parseSport, parseWindow, sportsPath, windowLabel } from "@/lib/links";

export const metadata: Metadata = {
  title: "Sports demo",
  description: "Fictional Charoof Sports ledger. Sample clubs and finals are invented and excluded from the live board.",
};

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; window?: string }>;
}) {
  const query = await searchParams;
  const window = parseWindow(query.window);
  const { sport, invalid } = parseSport(query.sport);
  const demoSport = sport === "Soccer" ? null : sport;
  const board = invalid ? null : buildBoard(filterLedger(await loadLedger(), "demo"), window, demoSport);
  const caption = invalid
    ? "Unknown sport"
    : `${windowLabel(window, "demo")}${demoSport ? `, ${demoSport}` : ", all sports"}`;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-brass">Demo</p>
        <h1 className="mt-2 font-serif text-4xl text-pine">Fiction ledger</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Every row on this page is DEMO. The clubs, lines, and finals are invented. They do not appear on the
          live rankings. The verified board is the Sports home.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <nav aria-label="Ledger window" className="flex flex-wrap gap-2">
          <ChoiceLink href={demoHref(demoSport, "all")} current={window === "all"}>
            Full demo ledger
          </ChoiceLink>
          <ChoiceLink href={demoHref(demoSport, "season")} current={window === "season"}>
            Sample 2025
          </ChoiceLink>
        </nav>
        <nav aria-label="Sport" className="flex flex-wrap gap-2">
          <ChoiceLink href={demoHref(null, window)} current={!invalid && demoSport == null}>
            All sports
          </ChoiceLink>
          {SPORTS.map((item) => (
            <ChoiceLink key={item} href={demoHref(item, window)} current={demoSport === item}>
              {item}
            </ChoiceLink>
          ))}
        </nav>
      </div>

      {invalid || !board ? (
        <p className="border border-line bg-card px-4 py-4 text-sm leading-6 text-ink-soft">
          That sport is not on the demo ledger.
        </p>
      ) : (
        <>
          <LeaderboardTable rows={board.rows} window={window} sport={demoSport} caption={caption} />
          <p className="text-sm leading-6 text-ink-soft">
            {board.settledPicks} settled demo picks in this scope. {board.note}
          </p>
        </>
      )}
    </div>
  );
}

function demoHref(sport: (typeof SPORTS)[number] | null, window: "all" | "season"): string {
  const live = boardHref(sport, window);
  if (live === sportsPath.board) return sportsPath.demo;
  return live.replace(sportsPath.board, sportsPath.demo);
}
