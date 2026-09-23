import type { Metadata } from "next";

import { ChoiceLink } from "@/components/choice-link";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { SPORTS } from "@/lib/constants";
import { buildBoard, filterLedger, loadLedger } from "@/lib/ledger";
import { boardHref, parseSport, sportsPath, type BoardSport } from "@/lib/links";

export const metadata: Metadata = {
  title: "Sports board",
  description: "Verified Charoof Sports rankings. Demo fiction is excluded.",
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  const query = await searchParams;
  const { sport, invalid } = parseSport(query.sport);
  const board = invalid ? null : buildBoard(filterLedger(await loadLedger(), "verified"), "all", sport);
  const caption = invalid ? "Unknown sport" : `Verified ledger${sport ? `, ${sport}` : ", all sports"}`;
  const sports: BoardSport[] = [...SPORTS, "Soccer"];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-brass">Leaderboard</p>
        <h1 className="mt-2 font-serif text-4xl text-pine">Verified board</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Rankings use verified picks only. A short sample stays under the Chad line until it has 12 settled
          picks. Fiction, including Sample 2025, is on the demo ledger.
        </p>
      </header>

      <nav aria-label="Sport" className="flex flex-wrap gap-2">
        <ChoiceLink href={sportsPath.board} current={!invalid && sport == null}>
          All sports
        </ChoiceLink>
        {sports.map((item) => (
          <ChoiceLink key={item} href={boardHref(item, "all")} current={sport === item}>
            {item}
          </ChoiceLink>
        ))}
      </nav>

      {invalid || !board ? (
        <p className="border border-line bg-card px-4 py-4 text-sm leading-6 text-ink-soft">
          That sport is not on the verified ledger.
        </p>
      ) : (
        <>
          <LeaderboardTable rows={board.rows} window="all" sport={sport} caption={caption} />
          <p className="text-sm leading-6 text-ink-soft">
            {board.settledPicks} settled picks in this scope. {board.note}
          </p>
        </>
      )}
    </div>
  );
}
