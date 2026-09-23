import { badgeClass } from "@/lib/format";
import { badgeHint, badgeLabel, type Badge } from "@/lib/scoring";

export function FactorBadge({ badge }: { badge: Badge }) {
  return (
    <span
      title={badgeHint(badge)}
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${badgeClass(badge)}`}
    >
      {badgeLabel(badge)}
    </span>
  );
}
