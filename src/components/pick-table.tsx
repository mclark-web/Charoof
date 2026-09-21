import Link from "next/link";

import { formatOdds, formatUnits, formatWhen, gradeLabel, marketLabel } from "@/lib/format";
import { unitProfit } from "@/lib/grade";
import type { LedgerPick } from "@/lib/ledger";

function resultText(pick: LedgerPick): string {
  if (pick.event.status === "cancelled" || pick.grade === "void") return "Voided";
  if (pick.event.status !== "final" || pick.event.homeScore == null || pick.event.awayScore == null) {
    return "No score";
  }
  return `${pick.event.awayScore}–${pick.event.homeScore}`;
}

function gradeClass(grade: string): string {
  if (grade === "win") return "text-chad";
  if (grade === "loss") return "text-chud";
  return "text-ink";
}

export function PickTable({ picks, showSeason }: { picks: LedgerPick[]; showSeason: boolean }) {
  if (picks.length === 0) {
    return <p className="text-ink-soft">No picks in this window.</p>;
  }

  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
        <caption className="sr-only">Picks on this ledger</caption>
        <thead className="bg-paper-2 text-xs uppercase tracking-[0.14em] text-ink-soft">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">Date</th>
            {showSeason ? (
              <th scope="col" className="px-3 py-2 font-medium">Season</th>
            ) : null}
            <th scope="col" className="px-3 py-2 font-medium">Sport</th>
            <th scope="col" className="px-3 py-2 font-medium">Event</th>
            <th scope="col" className="px-3 py-2 font-medium">Market</th>
            <th scope="col" className="px-3 py-2 font-medium">Selection</th>
            <th scope="col" className="px-3 py-2 font-medium">Odds</th>
            <th scope="col" className="px-3 py-2 font-medium">Result</th>
            <th scope="col" className="px-3 py-2 font-medium">Grade</th>
          </tr>
        </thead>
        <tbody>
          {picks.map((pick) => {
            const profit = unitProfit(pick.grade, pick.units, pick.oddsAmerican);
            return (
              <tr key={pick.id} className="border-t border-line align-top">
                <td className="px-3 py-3 whitespace-nowrap">{formatWhen(pick.event.startsAt)}</td>
                {showSeason ? <td className="px-3 py-3 whitespace-nowrap">{pick.event.season}</td> : null}
                <td className="px-3 py-3">{pick.event.sport}</td>
                <td className="px-3 py-3">
                  <p>{pick.event.name}</p>
                  <p className="text-xs text-ink-soft">{pick.event.weekLabel}</p>
                </td>
                <td className="px-3 py-3">{marketLabel(pick.market)}</td>
                <td className="px-3 py-3">
                  <Link href={`/picks/${pick.id}`} className="font-medium underline-offset-2 hover:underline">
                    {pick.selection}
                  </Link>
                  <p className="text-xs text-ink-soft">{pick.units === 1 ? "1.00u" : `${pick.units.toFixed(2)}u`}</p>
                </td>
                <td className="px-3 py-3 tabular-nums">{formatOdds(pick.oddsAmerican)}</td>
                <td className="px-3 py-3">
                  <p className="tabular-nums">{resultText(pick)}</p>
                  <p className="text-xs text-ink-soft">{pick.event.status === "final" ? "Demo seed" : "Not settled"}</p>
                </td>
                <td className={`px-3 py-3 font-medium ${gradeClass(pick.grade)}`}>
                  <p>{gradeLabel(pick.grade)}</p>
                  {pick.grade === "win" || pick.grade === "loss" || pick.grade === "push" ? (
                    <p className="text-xs tabular-nums text-ink-soft">{formatUnits(profit)}</p>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
