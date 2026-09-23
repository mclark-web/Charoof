import Link from "next/link";

import { formatOdds, formatWhen, gradeLabel } from "@/lib/format";
import { pickHref } from "@/lib/links";
import type { LedgerCapper, LedgerPick } from "@/lib/ledger";

function gradeClass(grade: string): string {
  if (grade === "win") return "text-chad";
  if (grade === "loss") return "text-chud";
  return "text-ink";
}

function scoreText(pick: LedgerPick): string {
  if (pick.grade === "pending" || pick.event.homeScore == null || pick.event.awayScore == null) {
    return "No score";
  }
  return `${pick.event.awayName} ${pick.event.awayScore}, ${pick.event.homeName} ${pick.event.homeScore}`;
}

export function VerifiedCards({
  rows,
}: {
  rows: Array<{ capper: LedgerCapper; pick: LedgerPick }>;
}) {
  const pending = rows.filter((row) => row.pick.grade === "pending");
  const settled = rows.filter((row) => row.pick.grade !== "pending");

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4" aria-labelledby="verified-settled-title">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-brass">Verified cards</p>
          <h2 id="verified-settled-title" className="mt-1 font-serif text-3xl text-pine">
            Settled on a public final
          </h2>
        </div>
        {settled.length === 0 ? (
          <p className="border border-line bg-card px-4 py-4 text-sm leading-6 text-ink-soft">
            No settled verified picks yet. Paste a sourced card with <span className="font-medium">npm run ingest</span>.
            A grade appears only after a free public final is recorded.
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {settled.map(({ capper, pick }) => (
              <li key={pick.id} className="border border-line bg-card px-4 py-4">
                <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">
                  {pick.event.sport} · {formatWhen(pick.publishedAt, true, "America/New_York")}
                </p>
                <h3 className="mt-1 font-serif text-2xl text-pine">
                  <Link href={pickHref(pick.id)} className="underline-offset-2 hover:underline">
                    {pick.selection}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-ink">{pick.event.name}</p>
                <p className="text-sm text-ink-soft">{scoreText(pick)}</p>
                <p className={`mt-2 font-score text-3xl ${gradeClass(pick.grade)}`}>{gradeLabel(pick.grade)}</p>
                <p className="text-xs text-ink-soft">{formatOdds(pick.oddsAmerican)}</p>
                <p className="mt-2 text-sm text-ink">{capper.displayName}</p>
                {pick.sourceUrl ? (
                  <a href={pick.sourceUrl} className="text-xs underline decoration-line underline-offset-4 hover:decoration-pine">
                    Source
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="verified-open-title">
        <h2 id="verified-open-title" className="font-serif text-3xl text-pine">
          Open fixtures
        </h2>
        {pending.length === 0 ? (
          <p className="border border-line bg-card px-4 py-4 text-sm leading-6 text-ink-soft">
            No open verified fixtures. A game that is not final stays blank. Charoof does not invent the score.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {pending.map(({ capper, pick }) => (
              <li key={pick.id} className="border border-line bg-card px-4 py-4">
                <p className="text-xs uppercase tracking-[0.14em] text-brass">Pending · no score</p>
                <h3 className="mt-1 font-serif text-2xl text-pine">
                  <Link href={pickHref(pick.id)} className="underline-offset-2 hover:underline">
                    {pick.selection}
                  </Link>
                </h3>
                <p className="text-sm text-ink">{pick.event.name}</p>
                <p className="text-sm text-ink-soft">{capper.displayName}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
