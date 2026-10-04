import Link from "next/link";
import { CapperTable } from "@/components/board-row";
import { splitCapperPacks } from "@/lib/capper-pack";
import type { BoardRow } from "@/lib/books";
import { formatNewYorkDate, newYorkToday } from "@/lib/recency";
import type { Sector } from "@/lib/sectors";

const RANK_RULE =
  "Best and Worst are the top and bottom 30% of cappers with 10+ graded picks in the last 90 days. The pill is the grade: STRONG 70+, PROVISIONAL 40–69.9, WEAK under 40.";

const EMPTY_RANKED = "No capper has 10+ graded picks in the last 90 days yet.";

export function CapperPacks({
  rows,
  note,
  sector,
  hint,
}: {
  rows: BoardRow[];
  note: string;
  sector: Sector;
  hint: string;
}) {
  const packs = splitCapperPacks(rows.map((row) => ({ ...row, graded90: row.graded90 ?? 0 })));
  const rankedCount = packs.best.length + packs.middle.length + packs.worst.length;
  const asOf = formatNewYorkDate(newYorkToday());
  return (
    <>
      <h2 className="section-label">Best</h2>
      <p className="board-note pack-rule">
        {RANK_RULE} As of {asOf}.
      </p>
      {rankedCount === 0 ? <p className="board-note">{EMPTY_RANKED}</p> : <CapperTable rows={packs.best} />}
      {rankedCount > 1 ? (
        <>
          <h2 className="section-label">Worst</h2>
          <CapperTable rows={packs.worst} />
        </>
      ) : null}
      {packs.middle.length > 0 ? (
        <details className="pack-details">
          <summary>
            <span className="when-closed">Show the middle</span>
            <span className="when-open">Show less</span>
          </summary>
          <CapperTable rows={packs.middle} />
        </details>
      ) : null}
      {packs.building.length > 0 ? (
        <details className="pack-details">
          <summary>Still building a record</summary>
          <p className="board-note pack-note">
            Fewer than 10 graded picks in the last 90 days. These stay PROVISIONAL and are not in Best or Worst.
          </p>
          <CapperTable rows={packs.building} />
        </details>
      ) : null}
      <details className="pack-details">
        <summary>How this is graded</summary>
        <div className="grade-explainer">
          <p>{sector.summary}</p>
          <ul className="trust-list">
            {sector.trust.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>{hint}</p>
          <p>{note}</p>
          <p>
            <Link className="hit-44" href="/method#sports-score">
              How capper scores are built
            </Link>
          </p>
        </div>
      </details>
    </>
  );
}
