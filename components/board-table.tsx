"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BoardDataRow } from "@/components/board-row";
import type { BoardSection } from "@/lib/books";

const PREVIEW = 8;
const STEP = 24;

export function BoardTable({ section }: { section: BoardSection }) {
  const keepOpen = section.id === "public-cappers";
  const [shown, setShown] = useState(keepOpen ? section.rows.length : Math.min(PREVIEW, section.rows.length));
  const [revealed, setRevealed] = useState(false);
  const doneRef = useRef<HTMLParagraphElement>(null);
  const rows = section.rows.slice(0, shown);
  const previewCount = keepOpen ? section.rows.length : Math.min(PREVIEW, section.rows.length);
  const extraRows = section.rows.slice(previewCount);
  const remaining = section.rows.length - shown;
  const step = Math.min(STEP, remaining);
  useEffect(() => {
    if (revealed && remaining === 0) doneRef.current?.focus();
  }, [revealed, remaining]);
  const resultColumn = section.rows.length > 0 && section.rows.every((row) => row.result);
  const scoreLabel = resultColumn ? "Result" : "GC";
  const rowsId = `${section.id}-rows`;
  const tenths = section.id === "public-cappers";
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
              <BoardDataRow key={row.id} row={row} scoreLabel={scoreLabel} tenths={tenths} />
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
      {extraRows.length > 0 ? (
        <noscript>
          <div className="panel table-scroll">
            <table className="board-table">
              <tbody>
                {extraRows.map((row) => (
                  <BoardDataRow key={row.id} row={row} scoreLabel={scoreLabel} tenths={tenths} />
                ))}
              </tbody>
            </table>
          </div>
        </noscript>
      ) : null}
    </>
  );
}
