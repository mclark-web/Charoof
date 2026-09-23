import type { Metadata } from "next";
import Link from "next/link";

import { FridaySlate } from "@/components/friday-slate";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { VerifiedCards } from "@/components/verified-cards";
import { ARCHIVE_SEASON } from "@/lib/constants";
import { archivePicks, buildBoard, filterLedger, loadLedger } from "@/lib/ledger";
import { sportsPath } from "@/lib/links";

export const metadata: Metadata = {
  title: { absolute: "Charoof Sports — public ledger for sports prediction accounts" },
  description:
    "Charoof Sports grades verified public picks against free finals. CH is the Charoof factor. Fiction stays on the demo ledger. Not gambling advice.",
};

const LEXICON = [
  {
    kicker: "CH",
    title: "Charoof factor",
    body: "The score out of 100. The dial reads the same number in tenths, so 74/100 is 7.4 on the 1–10 scale.",
  },
  {
    kicker: "Chad",
    title: "Accuracy & Discipline",
    body: "The good end of the scale. Top 30% of eligible peers, and only when the factor is 70 or higher.",
  },
  {
    kicker: "Chud",
    title: "Uncertainty & Doubt",
    body: "The bad end. Under 70/100 is Chud territory, even for someone sitting near the top of a weak board.",
  },
];

export default async function HomePage() {
  const verified = filterLedger(await loadLedger(), "verified");
  const board = buildBoard(verified, "all", null);
  const openPicks = verified.reduce(
    (sum, capper) => sum + capper.picks.filter((pick) => pick.grade === "pending").length,
    0,
  );
  const chadCount = board.rows.filter((row) => row.badge === "chad").length;
  const archive = archivePicks(verified);
  const recent = verified
    .flatMap((capper) => capper.picks.filter((pick) => pick.event.season !== ARCHIVE_SEASON).map((pick) => ({ capper, pick })))
    .sort((a, b) => a.pick.event.startsAt.getTime() - b.pick.event.startsAt.getTime());

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-10">
      <section className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-brass">Charoof · Sports</p>
          <h1 className="mt-2 max-w-xl font-serif text-5xl leading-tight text-pine sm:text-6xl">
            A public record for a posted pick.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
            Charoof Sports grades a posted pick when a free public final is recorded. CH, the Charoof factor,
            runs from Chud — Uncertainty &amp; Doubt — to Chad — Accuracy &amp; Discipline. Under 70/100 is
            Chud territory. The top 30% of peers earns Chad. Fiction is not on this board.
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-px border border-line bg-line">
          {[
            ["Cappers", String(board.rows.length)],
            ["Settled picks", String(board.settledPicks)],
            ["Chad marks", String(chadCount)],
            ["Chud line", "70/100"],
          ].map(([term, value]) => (
            <div key={term} className="bg-card px-4 py-3">
              <dt className="text-xs uppercase tracking-[0.14em] text-ink-soft">{term}</dt>
              <dd className="font-score text-4xl text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <VerifiedCards rows={recent} />

      <FridaySlate rows={archive} standings={board.rows} />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-3xl text-pine">Verified rankings</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Verified picks only. The Fri Sep 18 archive is included. Demo fiction is not.
            </p>
          </div>
          <Link href={sportsPath.board} className="text-sm underline decoration-line underline-offset-4 hover:decoration-pine">
            Open filters
          </Link>
        </div>
        <LeaderboardTable
          rows={board.rows}
          window="all"
          caption="Verified ledger, all sports"
          empty="No verified cappers yet. Paste a sourced pick with npm run ingest, or open the demo ledger for the fiction sample."
        />
        <p className="text-sm leading-6 text-ink-soft">{board.note}</p>
        <p className="text-sm leading-6 text-ink-soft">
          {openPicks === 0
            ? "No verified fixture is waiting on a final."
            : `${openPicks} verified ${openPicks === 1 ? "fixture is" : "fixtures are"} still open, with no score attached.`}{" "}
          <Link href={sportsPath.demo} className="underline decoration-line underline-offset-4 hover:decoration-pine">
            DEMO fiction
          </Link>{" "}
          is a separate ledger and does not move these ranks.
        </p>
      </section>

      <section className="grid gap-px border border-line bg-line md:grid-cols-3">
        {LEXICON.map((card) => (
          <article key={card.kicker} className="bg-card px-5 py-5">
            <p className="font-score text-3xl text-pine">{card.kicker}</p>
            <h2 className="mt-1 font-serif text-2xl text-ink">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{card.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 border border-line bg-card px-5 py-6 md:grid-cols-3">
        {[
          ["1. Post", "A pick names a sport, an event, a market, and a number or a price when one was posted."],
          ["2. Final", "The grade waits for a recorded final. An open fixture stays blank. Charoof does not invent the score."],
          ["3. Ledger", "Wins, losses, and pushes move units. Discipline scores the stake, the timestamp, and whether the number was explicit."],
        ].map(([title, body]) => (
          <div key={title}>
            <h2 className="font-serif text-2xl text-pine">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
