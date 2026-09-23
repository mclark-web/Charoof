import Link from "next/link";
import { GcTube } from "@/components/gc-tube";
import type { BoardRow, BoardSection, SectorBook } from "@/lib/books";

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

function BoardTable({ section }: { section: BoardSection }) {
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
              <th>GC</th>
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row) => (
              <tr key={row.id}>
                <td data-label="Call">
                  <div>{row.title}</div>
                  <div className="dim">{row.detail}</div>
                  <RowLinks row={row} />
                </td>
                <td className="mono" data-label="Lane">
                  {row.lane}
                </td>
                <td className="mono" data-label="Sample">
                  {row.sample}
                </td>
                <td className="tube-cell" data-label="GC">
                  {row.fill == null ? (
                    <span className="dim">On the live ledger</span>
                  ) : (
                    <GcTube fill={row.fill} variant="inline" label="GC" />
                  )}
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
            <GcTube fill={hero.fill} variant="hero" rich label="GC · Grade Calibration" />
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
