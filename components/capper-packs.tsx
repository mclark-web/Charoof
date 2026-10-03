import Link from "next/link";
import { CapperTable } from "@/components/board-row";
import { splitCapperPacks } from "@/lib/capper-pack";
import type { BoardRow } from "@/lib/books";
import { formatNewYorkDate, newYorkToday } from "@/lib/recency";
import type { Sector } from "@/lib/sectors";

const RANK_RULE =
  "Ranked = 10+ graded picks in the last 90 days. PROVISIONAL = score 40–69.9 or a short sample.";

function PackHeading({ title, rows, rule }: { title: string; rows: BoardRow[]; rule?: string }) {
  return (
    <>
      <h2 className="section-label">{title}</h2>
      {rule ? <p className="board-note pack-rule">{rule}</p> : null}
      {rows.length === 0 ? <p className="board-note">None ranked on this book yet.</p> : <CapperTable rows={rows} />}
    </>
  );
}

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
  const asOf = formatNewYorkDate(newYorkToday());
  return (
    <>
      <PackHeading title="Best" rows={packs.best} rule={`${RANK_RULE} As of ${asOf}.`} />
      <PackHeading title="Worst" rows={packs.worst} />
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
