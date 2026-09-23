import Link from "next/link";

import { FactorBadge } from "@/components/factor-badge";
import { ScoreDial } from "@/components/score-dial";
import { formatRecord, formatRoi, formatUnits, initials } from "@/lib/format";
import { capperHref, windowLabel, type BoardSport, type LedgerWindow } from "@/lib/links";
import type { Standing } from "@/lib/ledger";

export function LeaderboardTable({
  rows,
  window,
  sport = null,
  caption,
  empty = "No cappers have picks in this scope.",
}: {
  rows: Standing[];
  window: LedgerWindow;
  sport?: BoardSport | null;
  caption: string;
  empty?: string;
}) {
  if (rows.length === 0) {
    return <p className="border border-line bg-card px-4 py-4 text-sm leading-6 text-ink-soft">{empty}</p>;
  }

  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
        <caption className="border-b border-line bg-card px-4 py-3 text-left text-ink-soft">{caption}</caption>
        <thead className="bg-paper-2 text-xs uppercase tracking-[0.14em] text-ink-soft">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">Rank</th>
            <th scope="col" className="px-3 py-2 font-medium">Capper</th>
            <th scope="col" className="px-3 py-2 font-medium">Graded</th>
            <th scope="col" className="px-3 py-2 font-medium">Record</th>
            <th scope="col" className="px-3 py-2 font-medium">Units</th>
            <th scope="col" className="px-3 py-2 font-medium">ROI</th>
            <th scope="col" className="px-3 py-2 font-medium">1–10 and /100</th>
            <th scope="col" className="px-3 py-2 font-medium">Mark</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-line align-top">
              <td className="px-3 py-3 font-score text-2xl text-ink-soft">{row.rank ?? "—"}</td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center font-score text-sm text-paper"
                    style={{ backgroundColor: `hsl(${row.hue} 32% 28%)` }}
                    aria-hidden
                  >
                    {initials(row.displayName)}
                  </span>
                  <div>
                    <Link
                      href={capperHref(row.handle, window, sport)}
                      className="font-medium text-ink underline-offset-2 hover:underline"
                    >
                      {row.displayName}
                    </Link>
                    <p className="text-xs text-ink-soft">
                      @{row.handle} · {row.focus}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 tabular-nums">{row.graded}</td>
              <td className="px-3 py-3 tabular-nums">{formatRecord(row.wins, row.losses, row.pushes)}</td>
              <td className="px-3 py-3 tabular-nums">{formatUnits(row.netUnits)}</td>
              <td className="px-3 py-3 tabular-nums">{formatRoi(row.roi)}</td>
              <td className="px-3 py-3">
                <ScoreDial ch={row.ch} compact />
              </td>
              <td className="px-3 py-3">
                <FactorBadge badge={row.badge} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="sr-only">{windowLabel(window)}</p>
    </div>
  );
}
