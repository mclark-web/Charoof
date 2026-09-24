import Link from "next/link";
import { GcTube, GradePill, tubeIsUngraded } from "@/components/gc-tube";
import type { BoardRow, BoardSection, SectorBook } from "@/lib/books";
import type { ResultPill } from "@/lib/outcome";
import { gradeForBlendedFill } from "@/lib/recency";

const RESULT_TEXT: Record<ResultPill, string> = {
  WIN: "✓ WIN",
  LOSS: "✗ LOSS",
  PUSH: "PUSH",
  VOID: "VOID",
  PENDING: "PENDING",
};

export function SectorCard({ book }: { book: SectorBook }) {
  const { sector, hero } = book;
  return (
    <Link className="sector" href={sector.href}>
      <div className="kicker">{sector.kicker}</div>
      <h3>{sector.title}</h3>
      <p>{sector.summary}</p>
      <div className="gc-slot">
        {hero.kind === "tube" ? (
          <GcTube fill={hero.fill} variant="mini" label="GC" metaInline className="is-card" />
        ) : (
          <div className="roster-meter">
            <div className="value">{hero.value}</div>
            <div className="hint">{hero.card}</div>
          </div>
        )}
      </div>
      <div className="foot">
        <span>{hero.kind === "tube" ? hero.card : sector.foot}</span>
        <span className="go">Open board →</span>
      </div>
    </Link>
  );
}

function RowLinks({ row }: { row: BoardRow }) {
  if (!row.href) return null;
  return (
    <div>
      <a className="source-link" href={row.href} target="_blank" rel="noreferrer">
        Source
      </a>
    </div>
  );
}

function RowScore({ row }: { row: BoardRow }) {
  if (row.result) {
    return <span className={`result-pill ${row.result.toLowerCase()}`}>{RESULT_TEXT[row.result]}</span>;
  }
  if (row.fill == null && row.windows) {
    const grade = gradeForBlendedFill(null);
    return <GradePill grade={grade.key} name={grade.name} />;
  }
  if (row.fill == null) return <span className="dim">On the live ledger</span>;
  if (tubeIsUngraded(row)) return <GcTube fill={0} variant="inline" rich label="GC" ungraded />;
  const grade =
    row.gradeKey && row.gradeName ? { key: row.gradeKey, name: row.gradeName } : undefined;
  return <GcTube fill={row.fill} variant="inline" rich label="GC" grade={grade} />;
}

function BoardTable({ section }: { section: BoardSection }) {
  const resultColumn = section.rows.length > 0 && section.rows.every((row) => row.result);
  const scoreLabel = resultColumn ? "Result" : "GC";
  return (
    <>
      <div className="section-label">{section.label}</div>
      <p className="board-note">{section.note}</p>
      <div className="panel table-scroll">
        <table className="board-table">
          <thead>
            <tr>
              <th>Call</th>
              <th>Lane</th>
              <th>Sample</th>
              <th>{scoreLabel}</th>
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row) => (
              <tr key={row.id}>
                <td data-label="Call">
                  <div>{row.title}</div>
                  <div className="dim">{row.detail}</div>
                  {row.windows ? <div className="window-record">{row.windows}</div> : null}
                  {row.sampleNote ? <div className="sample-note">{row.sampleNote}</div> : null}
                  <RowLinks row={row} />
                </td>
                <td className="mono" data-label="Lane">
                  {row.lane === "Unverified" ? "Post time unconfirmed" : row.lane}
                </td>
                <td className="mono" data-label="Sample">
                  {row.sample}
                </td>
                <td className="tube-cell" data-label={scoreLabel}>
                  <RowScore row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function SectorBoard({ book }: { book: SectorBook }) {
  const { sector, hero } = book;
  return (
    <>
      <section className="board-hero">
        <div>
          <div className="chip">{sector.kicker}</div>
          <h1>{sector.title}</h1>
          <p className="hero-lead">{sector.summary}</p>
          <ul className="trust-list">
            {sector.trust.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {book.liveHref && book.liveLabel ? (
            <div className="board-actions">
              <a className="btn btn-primary" href={book.liveHref} target="_blank" rel="noreferrer">
                {book.liveLabel}
              </a>
            </div>
          ) : null}
        </div>
        <div className="board-tube">
          {hero.kind === "tube" ? (
            <GcTube fill={hero.fill} variant="hero" rich label="GC Scale" />
          ) : (
            <div className="count-hero">
              <div className="label">On this hub</div>
              <div className="value">{hero.value}</div>
              <div className="hint">{hero.card}</div>
            </div>
          )}
          <p className="hint">{hero.hint}</p>
        </div>
      </section>
      {book.sections.map((section) => (
        <BoardTable key={section.id} section={section} />
      ))}
    </>
  );
}
