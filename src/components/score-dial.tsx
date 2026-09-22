import { formatDial, formatFactor } from "@/lib/format";

export function ScoreDial({ ch, compact = false }: { ch: number | null; compact?: boolean }) {
  const spoken =
    ch == null
      ? "No settled picks"
      : `${formatDial(ch)} on the 1 to 10 Chad Chud scale, ${formatFactor(ch)}`;

  return (
    <div className={compact ? "min-w-32" : "max-w-sm"}>
      <p className="sr-only">{spoken}</p>
      <div className="flex items-baseline gap-2" aria-hidden>
        <span className={`font-score leading-none tracking-tight ${compact ? "text-3xl" : "text-7xl"}`}>
          {formatDial(ch)}
        </span>
        {compact ? null : <span className="text-sm text-ink-soft">{formatFactor(ch)}</span>}
      </div>
      {compact ? (
        <p className="text-xs tabular-nums text-ink-soft" aria-hidden>
          {formatFactor(ch)}
        </p>
      ) : null}
      <div className="relative mt-2 h-1.5 rounded-full bg-line" aria-hidden>
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "linear-gradient(90deg, #8d3b32 0%, #a6843d 62%, #1d6b45 100%)" }}
        />
        <span className="absolute -top-1 h-3.5 w-px bg-ink/50" style={{ left: "70%" }} />
        {ch != null ? (
          <span
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper bg-ink"
            style={{ left: `${Math.min(100, Math.max(0, ch))}%` }}
          />
        ) : null}
      </div>
      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.14em] text-ink-soft" aria-hidden>
        <span>1 Chud</span>
        <span>70</span>
        <span>10 Chad</span>
      </div>
    </div>
  );
}
