"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GcTube, GradePill, tubeIsUngraded } from "@/components/gc-tube";
import type { BoardRow, BoardSection } from "@/lib/books";
import type { ResultPill } from "@/lib/outcome";
import { gradeForBlendedFill } from "@/lib/recency";

const RESULT_TEXT: Record<ResultPill, string> = {
  WIN: "✓ WIN",
  LOSS: "✗ LOSS",
  PUSH: "Push",
  VOID: "Void",
  PENDING: "Pending",
};

const GAME_DATE = /game [A-Z][a-z]+ \d{1,2}, \d{4}/;
const PREVIEW = 8;
const STEP = 24;

function RowDetail({ detail }: { detail: string }) {
  const match = GAME_DATE.exec(detail);
  if (!match || match.index === undefined) return detail;
  const start = match.index;
  const end = start + match[0].length;
  return (
    <>
      {detail.slice(0, start)}
      <span className="game-date">{match[0]}</span>
      {detail.slice(end)}
    </>
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

export function BoardTable({ section }: { section: BoardSection }) {
  const keepOpen = section.id === "public-cappers";
  const [shown, setShown] = useState(keepOpen ? section.rows.length : Math.min(PREVIEW, section.rows.length));
  const [revealed, setRevealed] = useState(false);
  const doneRef = useRef<HTMLParagraphElement>(null);
  const rows = section.rows.slice(0, shown);
  const remaining = section.rows.length - shown;
  const step = Math.min(STEP, remaining);
  useEffect(() => {
    if (revealed && remaining === 0) doneRef.current?.focus();
  }, [revealed, remaining]);
  const resultColumn = section.rows.length > 0 && section.rows.every((row) => row.result);
  const scoreLabel = resultColumn ? "Result" : "GC";
  const rowsId = `${section.id}-rows`;
  return (
    <>
      <div className="section-label">{section.label}</div>
      <p className="board-note">
        {section.note}
        {section.id === "public-cappers" ? (
          <>
            {" "}
            <Link className="hit-44" href="/method#sports-score">
              How capper scores are built
            </Link>
            .
          </>
        ) : null}
      </p>
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
          <tbody id={rowsId}>
            {rows.map((row) => (
              <tr key={row.id}>
                <td data-label="Call">
                  <div>{row.title}</div>
                  <div className="dim">
                    <RowDetail detail={row.detail} />
                  </div>
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
        {remaining > 0 ? (
          <div className="show-more-row">
            <button
              type="button"
              className="btn show-more"
              aria-expanded={revealed}
              aria-controls={rowsId}
              onClick={() => {
                setRevealed(true);
                setShown((count) => Math.min(section.rows.length, count + STEP));
              }}
            >
              Show {step} more
            </button>
          </div>
        ) : revealed ? (
          <div className="show-more-row">
            <p ref={doneRef} tabIndex={-1} role="status" className="show-more-done">
              All {section.rows.length} shown
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}
