import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FactorBadge } from "@/components/factor-badge";
import { explainSettlement } from "@/lib/explain";
import {
  clarityLabel,
  formatDial,
  formatFactor,
  formatLine,
  formatOdds,
  formatUnits,
  formatWhen,
  gradeLabel,
  marketLabel,
} from "@/lib/format";
import { unitProfit } from "@/lib/grade";
import { buildBoard, getPickById, loadLedger } from "@/lib/ledger";
import { capperHref } from "@/lib/links";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const found = await getPickById(id);
  if (!found) return { title: "Pick" };
  return {
    title: `${found.pick.selection} · ${found.capper.displayName}`,
    description: `${found.pick.event.sport} pick on the Charoof demo ledger. ${found.pick.event.sourceNote}`,
  };
}

function Fact({ term, value }: { term: string; value: React.ReactNode }) {
  return (
    <div className="bg-card px-4 py-3">
      <dt className="text-xs uppercase tracking-[0.14em] text-ink-soft">{term}</dt>
      <dd className="mt-1 text-base text-ink">{value}</dd>
    </div>
  );
}

export default async function PickPage({ params }: PageProps) {
  const { id } = await params;
  const found = await getPickById(id);
  if (!found) notFound();
  const { pick, capper } = found;
  const ledger = await loadLedger();
  const standing = buildBoard(ledger, "all", null).rows.find((row) => row.handle === capper.handle);
  const final =
    pick.event.status === "final" && pick.event.homeScore != null && pick.event.awayScore != null;
  const locked = pick.publishedAt.getTime() < pick.event.startsAt.getTime();
  const profit = unitProfit(pick.grade, pick.units, pick.oddsAmerican);
  const explanation = explainSettlement({
    market: pick.market,
    side: pick.side,
    selection: pick.selection,
    line: pick.line,
    grade: pick.grade,
    homeName: pick.event.homeName,
    awayName: pick.event.awayName,
    homeScore: pick.event.homeScore,
    awayScore: pick.event.awayScore,
    status: pick.event.status,
    propActual: pick.propActual,
    propStat: pick.propStat,
    sourceNote: pick.event.sourceNote,
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-10">
      <p className="text-sm">
        <Link
          href={capperHref(capper.handle, "all")}
          className="underline decoration-line underline-offset-4 hover:decoration-pine"
        >
          {capper.displayName}
        </Link>
      </p>
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-brass">
          {pick.event.sport} · {pick.event.season} · {pick.event.weekLabel}
        </p>
        <h1 className="mt-2 font-serif text-4xl text-pine">{pick.selection}</h1>
        <p className="mt-2 text-sm text-ink-soft">{pick.event.name}</p>
      </header>

      <section className="border border-line bg-card px-5 py-5">
        {final ? (
          <>
            <p className="text-xs uppercase tracking-[0.16em] text-brass">Demo seed final</p>
            <p className="mt-2 font-score text-5xl text-ink">
              {pick.event.awayScore}
              <span className="text-ink-soft">–</span>
              {pick.event.homeScore}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {pick.event.awayName} at {pick.event.homeName}
            </p>
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-[0.16em] text-brass">No final recorded</p>
            <p className="mt-2 font-serif text-3xl text-ink">Score withheld</p>
          </>
        )}
        <p className={`mt-4 font-score text-3xl ${pick.grade === "win" ? "text-chad" : pick.grade === "loss" ? "text-chud" : "text-ink"}`}>
          {gradeLabel(pick.grade)}
          {pick.grade === "win" || pick.grade === "loss" || pick.grade === "push" ? ` · ${formatUnits(profit)}` : ""}
        </p>
        <p className="mt-3 text-sm leading-6 text-ink-soft">{explanation}</p>
      </section>

      <dl className="grid gap-px border border-line bg-line sm:grid-cols-2">
        <Fact term="Sport" value={pick.event.sport} />
        <Fact term="Event" value={pick.event.name} />
        <Fact term="Market" value={marketLabel(pick.market)} />
        <Fact term="Selection" value={pick.selection} />
        <Fact term="Line" value={formatLine(pick.line, pick.market === "spread")} />
        <Fact term="Odds" value={formatOdds(pick.oddsAmerican)} />
        <Fact term="Units" value={pick.units.toFixed(2)} />
        <Fact term="Published" value={formatWhen(pick.publishedAt, true)} />
        <Fact term="Listed start" value={formatWhen(pick.event.startsAt, true)} />
        <Fact term="Timing" value={locked ? "Before the listed start" : "After the listed start"} />
        <Fact term="Clarity" value={clarityLabel(pick.clarity)} />
        <Fact term="Result source" value={`${pick.event.source} · ${pick.event.status}`} />
      </dl>

      {pick.note ? <p className="text-sm leading-6 text-ink-soft">{pick.note}</p> : null}

      {standing ? (
        <p className="text-sm leading-6 text-ink-soft">
          On the full ledger, {capper.displayName} is {formatDial(standing.ch)} · {formatFactor(standing.ch)}{" "}
          <FactorBadge badge={standing.badge} />. One pick does not carry its own Charoof factor. It settles into
          that record.
        </p>
      ) : null}
    </div>
  );
}
