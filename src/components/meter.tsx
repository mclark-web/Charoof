export function Meter({ label, value, hint }: { label: string; value: number | null; hint: string }) {
  const width = value == null ? 0 : Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium text-ink">{label}</h3>
        <p className="font-score text-2xl tabular-nums">{value == null ? "—" : value.toFixed(1)}</p>
      </div>
      <div className="mt-1 h-1.5 bg-line" aria-hidden>
        <div className="h-full bg-pine" style={{ width: `${width}%` }} />
      </div>
      <p className="mt-1 text-xs leading-5 text-ink-soft">{hint}</p>
    </div>
  );
}
