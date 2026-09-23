import Link from "next/link";

import { FactorBadge } from "@/components/factor-badge";
import { formatDial, formatFactor, formatOdds, formatWhen, gradeLabel } from "@/lib/format";
import { capperHref, pickHref } from "@/lib/links";
import type { LedgerCapper, LedgerPick, Standing } from "@/lib/ledger";

function firstUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s)]+/);
  return match?.[0] ?? null;
}

function gradeClass(grade: string): string {
  if (grade === "win") return "text-chad";
  if (grade === "loss") return "text-chud";
  return "text-ink";
}

export function FridaySlate({
  rows,
  standings,
}: {
  rows: Array<{ capper: LedgerCapper; pick: LedgerPick }>;
  standings: Standing[];
}) {
  const wins = rows.filter((row) => row.pick.grade === "win").length;
  const losses = rows.filter((row) => row.pick.grade === "loss").length;
  const pushes = rows.filter((row) => row.pick.grade === "push").length;
  const voids = rows.filter((row) => row.pick.grade === "void").length;

  return (
    <section id="friday-slate" aria-labelledby="friday-slate-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-brass">Public pick archive (Fri Sep 18)</p>
          <h2 id="friday-slate-title" className="mt-1 font-serif text-3xl text-pine">
            Friday slate results
          </h2>
        </div>
        <p className="font-score text-2xl text-ink">
          {wins}–{losses}–{pushes}
          {voids > 0 ? <span className="text-base text-ink-soft"> · {voids} void</span> : null}
        </p>
      </div>
      <p className="max-w-3xl text-sm leading-6 text-ink-soft">
        Named cards from free Covers, Action Network, and ProCappers articles, graded on public finals.
        The line is the number in the article. There is no odds feed and no tweet ID. September 18, 2026
        was not an NFL Friday on these cards, so this strip has no NFL row. Two college leans named a side
        and posted no number; those stay void.
      </p>
      <ul className="flex gap-3 overflow-x-auto pb-2">
        {rows.map(({ capper, pick }) => {
          const standing = standings.find((row) => row.handle === capper.handle);
          const finalUrl = firstUrl(pick.event.sourceNote);
          const score =
            pick.event.homeScore == null || pick.event.awayScore == null
              ? "No score"
              : `${pick.event.awayName} ${pick.event.awayScore}, ${pick.event.homeName} ${pick.event.homeScore}`;
          return (
            <li key={pick.id} className="w-72 shrink-0 border border-line bg-card">
              <article className="flex h-full flex-col gap-2 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">
                  {pick.event.sport} · {formatWhen(pick.event.startsAt, true, "America/New_York")}
                </p>
                <h3 className="font-serif text-xl leading-6 text-pine">
                  <Link href={pickHref(pick.id)} className="underline-offset-2 hover:underline">
                    {pick.selection}
                  </Link>
                </h3>
                <p className="text-sm text-ink">{pick.event.name}</p>
                <p className="text-sm text-ink-soft">{score}</p>
                <p className={`font-score text-2xl ${gradeClass(pick.grade)}`}>{gradeLabel(pick.grade)}</p>
                <p className="text-xs text-ink-soft">{formatOdds(pick.oddsAmerican)}</p>
                <p className="mt-auto text-sm">
                  <Link
                    href={capperHref(capper.handle, "all")}
                    className="underline decoration-line underline-offset-4 hover:decoration-pine"
                  >
                    {capper.displayName}
                  </Link>
                  {standing?.ch != null ? (
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                      <FactorBadge badge={standing.badge} />
                      {formatDial(standing.ch)} · {formatFactor(standing.ch)}
                    </span>
                  ) : null}
                </p>
                {finalUrl ? (
                  <a
                    href={finalUrl}
                    className="text-xs underline decoration-line underline-offset-4 hover:decoration-pine"
                  >
                    Public final
                  </a>
                ) : null}
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
