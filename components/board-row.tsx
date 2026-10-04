import { GcTube, GradePill, tubeIsUngraded } from "@/components/gc-tube";
import type { BoardRow } from "@/lib/books";
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

function RowScore({ row, tenths }: { row: BoardRow; tenths: boolean }) {
  if (row.result) {
    return <span className={`result-pill ${row.result.toLowerCase()}`}>{RESULT_TEXT[row.result]}</span>;
  }
  if (row.fill == null && row.windows) {
    const grade = gradeForBlendedFill(null);
    return <GradePill grade={grade.key} name={grade.name} />;
  }
  if (row.fill == null) return <span className="dim">On the live ledger</span>;
  if (tubeIsUngraded(row)) return <GcTube fill={0} variant="inline" rich label="GC" ungraded />;
  const grade = row.gradeKey && row.gradeName ? { key: row.gradeKey, name: row.gradeName } : undefined;
  return <GcTube fill={row.fill} variant="inline" rich label="GC" grade={grade} tenths={tenths} />;
}

export function BoardDataRow({
  row,
  scoreLabel,
  tenths = false,
}: {
  row: BoardRow;
  scoreLabel: string;
  tenths?: boolean;
}) {
  return (
    <tr>
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
        <RowScore row={row} tenths={tenths} />
      </td>
    </tr>
  );
}

export function CapperTable({ rows }: { rows: BoardRow[] }) {
  return (
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
          {rows.map((row) => (
            <BoardDataRow key={row.id} row={row} scoreLabel="GC" tenths />
          ))}
        </tbody>
      </table>
    </div>
  );
}
