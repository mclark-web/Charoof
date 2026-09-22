import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ChoiceLink } from "@/components/choice-link";
import { FactorBadge } from "@/components/factor-badge";
import { Meter } from "@/components/meter";
import { PickTable } from "@/components/pick-table";
import { ScoreDial } from "@/components/score-dial";
import { formatNumber, formatRecord, formatRoi, formatUnits, initials } from "@/lib/format";
import {
  buildBoard,
  loadLedger,
  picksInScope,
  scopeBoards,
  sortPicks,
  type Standing,
} from "@/lib/ledger";
import { boardHref, capperHref, parseSport, parseWindow, windowLabel } from "@/lib/links";
import { badgeHint } from "@/lib/scoring";

type PageProps = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ window?: string; sport?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const ledger = await loadLedger();
  const capper = ledger.find((item) => item.handle === handle.toLowerCase());
  if (!capper) return { title: "Capper" };
  return {
    title: capper.displayName,
    description: capper.bio,
  };
}

export default async function CapperPage({ params, searchParams }: PageProps) {
  const [{ handle }, query] = await Promise.all([params, searchParams]);
  const window = parseWindow(query.window);
  const { sport, invalid } = parseSport(query.sport);
  const scopeSport = invalid ? null : sport;
  const ledger = await loadLedger();
  const capper = ledger.find((item) => item.handle === handle.toLowerCase());
  if (!capper) notFound();
  if (capper.handle !== handle) redirect(capperHref(capper.handle, window, scopeSport));

  const standing = buildBoard(ledger, window, scopeSport).rows.find((row) => row.handle === capper.handle) ?? null;
  const picks = sortPicks(picksInScope(capper.picks, window, scopeSport));
  const scopes = scopeBoards(ledger, window, capper.handle);
  const scopeLabel = scopeSport ?? "All sports";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10">
      <p className="text-sm">
        <Link href={boardHref(scopeSport, window)} className="underline decoration-line underline-offset-4 hover:decoration-pine">
          Back to the board
        </Link>
      </p>

      <header className="grid gap-6 border border-line bg-card px-5 py-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <span
          className="grid h-16 w-16 place-items-center font-score text-2xl text-paper"
          style={{ backgroundColor: `hsl(${capper.hue} 32% 28%)` }}
          aria-hidden
        >
          {initials(capper.displayName)}
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-brass">{capper.focus}</p>
          <h1 className="mt-1 font-serif text-4xl text-pine">{capper.displayName}</h1>
          <p className="mt-1 text-sm text-ink-soft">@{capper.handle} · Demo capper</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">{capper.bio}</p>
        </div>
        <div className="flex flex-col items-start gap-3">
          {standing ? <FactorBadge badge={standing.badge} /> : null}
          <ScoreDial ch={standing?.ch ?? null} />
        </div>
      </header>

      <nav aria-label="Ledger window" className="flex flex-wrap gap-2">
        <ChoiceLink href={capperHref(capper.handle, "all", scopeSport)} current={window === "all"}>
          Full ledger
        </ChoiceLink>
        <ChoiceLink href={capperHref(capper.handle, "season", scopeSport)} current={window === "season"}>
          Sample 2025
        </ChoiceLink>
      </nav>

      {standing ? (
        <>
          <p className="text-sm leading-6 text-ink-soft">
            {scopeLabel} · {windowLabel(window)}. {badgeHint(standing.badge)} The table below is every scope in
            this window, so an all-sports mark can differ from a single sport when the peers change.
          </p>
          <dl className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
            {[
              ["Record", formatRecord(standing.wins, standing.losses, standing.pushes)],
              ["Units", formatUnits(standing.netUnits)],
              ["ROI", formatRoi(standing.roi)],
              ["Graded", String(standing.graded)],
            ].map(([term, value]) => (
              <div key={term} className="bg-card px-4 py-3">
                <dt className="text-xs uppercase tracking-[0.14em] text-ink-soft">{term}</dt>
                <dd className="font-score text-3xl text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <section className="grid gap-6 md:grid-cols-3">
            <Meter
              label="Accuracy"
              value={standing.accuracy}
              hint="Starts at 50 on a break-even ROI. The posted American odds set the price."
            />
            <Meter
              label="Discipline"
              value={standing.discipline}
              hint={`Stake ${formatNumber(standing.stakeScore)}, lock ${formatNumber(standing.lockScore)}, clarity ${formatNumber(standing.clarityScore)}.`}
            />
            <Meter
              label="Sample weight"
              value={standing.shrink == null ? null : standing.shrink * 100}
              hint="Share of the raw score that is kept. The rest is pulled toward 50."
            />
          </section>
        </>
      ) : (
        <p className="text-sm text-ink-soft">No picks in this window.</p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-3xl text-pine">By sport</h2>
        <ScopeTable scopes={scopes} window={window} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-3xl text-pine">Picks</h2>
        <PickTable picks={picks} showSeason={window === "all"} />
      </section>
    </div>
  );
}

function ScopeTable({
  scopes,
  window,
}: {
  scopes: Array<{ sport: import("@/lib/constants").Sport | null; label: string; standing: Standing; note: string }>;
  window: import("@/lib/links").LedgerWindow;
}) {
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <caption className="sr-only">Factor by sport for this window</caption>
        <thead className="bg-paper-2 text-xs uppercase tracking-[0.14em] text-ink-soft">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">Scope</th>
            <th scope="col" className="px-3 py-2 font-medium">Record</th>
            <th scope="col" className="px-3 py-2 font-medium">Graded</th>
            <th scope="col" className="px-3 py-2 font-medium">Factor</th>
            <th scope="col" className="px-3 py-2 font-medium">Mark</th>
          </tr>
        </thead>
        <tbody>
          {scopes.map((scope) => (
            <tr key={scope.label} className="border-t border-line">
              <th scope="row" className="px-3 py-3 font-medium">
                <Link href={boardHref(scope.sport, window)} className="underline-offset-2 hover:underline">
                  {scope.label}
                </Link>
              </th>
              <td className="px-3 py-3 tabular-nums">
                {formatRecord(scope.standing.wins, scope.standing.losses, scope.standing.pushes)}
              </td>
              <td className="px-3 py-3 tabular-nums">{scope.standing.graded}</td>
              <td className="px-3 py-3 tabular-nums">
                {scope.standing.ch == null ? "—" : `${(scope.standing.ch / 10).toFixed(1)} · ${scope.standing.ch}/100`}
              </td>
              <td className="px-3 py-3">
                <FactorBadge badge={scope.standing.badge} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
