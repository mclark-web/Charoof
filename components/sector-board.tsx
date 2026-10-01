import Link from "next/link";
import { BoardTable } from "@/components/board-table";
import { GcTube } from "@/components/gc-tube";
import type { SectorBook } from "@/lib/books";

export function SectorCard({ book }: { book: SectorBook }) {
  const { sector, hero } = book;
  const external = sector.href.startsWith("http");
  const body = (
    <>
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
    </>
  );
  if (external) {
    return (
      <a className="sector" href={sector.href}>
        {body}
      </a>
    );
  }
  return (
    <Link className="sector" href={sector.href}>
      {body}
    </Link>
  );
}

export function SectorBoard({ book }: { book: SectorBook }) {
  const { sector, hero } = book;
  const cappers = book.sections.filter((section) => section.id === "public-cappers");
  const picks = book.sections.filter((section) => section.id !== "public-cappers");
  const recordFirst = hero.kind === "tube";
  return (
    <>
      {recordFirst ? (
        <section className="record-layout" id="record" aria-label="Total record">
          <div className="record-banner">
            <div className="section-label" id="sports">
              Sports
            </div>
            <p className="label">Total record</p>
            <h2 className="ledger-line">{hero.card}</h2>
            <p className="hint record-hint">{hero.hint}</p>
          </div>
          <div className="board-tube">
            <GcTube fill={hero.fill} variant="hero" rich label="GC Scale" />
          </div>
        </section>
      ) : null}
      <section className={recordFirst ? "sports-intro" : "board-hero"}>
        <div>
          {recordFirst ? null : <div className="chip">{sector.kicker}</div>}
          {recordFirst ? null : <h1>{sector.title}</h1>}
          <p className={recordFirst ? "board-note sports-summary" : "hero-lead"}>{sector.summary}</p>
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
        {recordFirst ? null : hero.kind === "count" ? (
          <div className="board-tube">
            <div className="count-hero">
              <div className="label">On this hub</div>
              <div className="value">{hero.value}</div>
              <div className="hint">{hero.card}</div>
            </div>
            <p className="hint">{hero.hint}</p>
          </div>
        ) : null}
      </section>
      {cappers.map((section) => (
        <BoardTable key={section.id} section={section} />
      ))}
      <div id="picks">
        {picks.map((section) => (
          <BoardTable key={section.id} section={section} />
        ))}
      </div>
    </>
  );
}
