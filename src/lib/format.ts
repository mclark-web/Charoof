import type { Badge } from "@/lib/scoring";

export function formatWhen(date: Date, withTime = false, timeZone = "UTC"): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit", timeZoneName: "short" } : {}),
  }).format(date);
}

export function formatRecord(wins: number, losses: number, pushes: number): string {
  return `${wins}–${losses}–${pushes}`;
}

export function formatUnits(value: number): string {
  const absolute = Math.abs(value).toFixed(2);
  if (value > 0) return `+${absolute}u`;
  if (value < 0) return `−${absolute}u`;
  return `${absolute}u`;
}

export function formatRoi(roi: number | null): string {
  if (roi == null || Number.isNaN(roi)) return "—";
  const pct = roi * 100;
  const absolute = Math.abs(pct).toFixed(1);
  if (pct > 0) return `+${absolute}%`;
  if (pct < 0) return `−${absolute}%`;
  return `${absolute}%`;
}

export function formatOdds(odds: number | null): string {
  if (odds == null) return "Not posted";
  return odds > 0 ? `+${odds}` : String(odds);
}

export function formatLine(line: number | null, signed = false): string {
  if (line == null) return "—";
  const rounded = Math.round(line * 2) / 2;
  if (signed && Math.abs(rounded) < 1e-9) return "PK";
  const digits = Number.isInteger(rounded) ? 0 : 1;
  const absolute = Math.abs(rounded).toFixed(digits);
  if (!signed) return absolute;
  if (rounded > 0) return `+${absolute}`;
  return `−${absolute}`;
}

export function formatDial(ch: number | null): string {
  if (ch == null) return "—";
  return (ch / 10).toFixed(1);
}

export function formatFactor(ch: number | null): string {
  if (ch == null) return "—";
  return `${ch}/100`;
}

export function formatNumber(value: number | null, digits = 1): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(digits);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function marketLabel(market: string): string {
  switch (market) {
    case "spread":
      return "Spread";
    case "total":
      return "Total";
    case "moneyline":
      return "Moneyline";
    case "prop":
      return "Player prop";
    case "team_total":
      return "Team total";
    case "dnb":
      return "Draw no bet";
    case "run_line":
      return "Run line";
    case "total_goals":
      return "Total goals";
    default:
      return market;
  }
}

export function gradeLabel(grade: string): string {
  switch (grade) {
    case "win":
      return "Win";
    case "loss":
      return "Loss";
    case "push":
      return "Push";
    case "void":
      return "Void";
    case "pending":
      return "Pending";
    default:
      return grade;
  }
}

export function clarityLabel(clarity: string): string {
  return clarity === "lean" ? "Lean" : "Explicit number";
}

export function badgeClass(badge: Badge): string {
  switch (badge) {
    case "chad":
      return "border-chad/30 bg-chad-soft text-chad";
    case "chud":
      return "border-chud/30 bg-chud-soft text-chud";
    case "listed":
      return "border-listed/40 bg-listed-soft text-listed";
    case "provisional":
      return "border-line bg-paper-2 text-ink";
    case "unrated":
      return "border-line bg-paper-2 text-ink-soft";
  }
}
