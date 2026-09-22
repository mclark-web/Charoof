import { DEMO_SEASON, type Sport } from "@/lib/constants";

export type LedgerWindow = "all" | "season";

export function parseWindow(value: string | string[] | undefined): LedgerWindow {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "season" ? "season" : "all";
}

export function parseSport(value: string | string[] | undefined): {
  sport: Sport | null;
  invalid: boolean;
} {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return { sport: null, invalid: false };
  const sports = ["NFL", "NBA", "MLB", "NHL", "NCAAF"] as const;
  const hit = sports.find((sport) => sport.toLowerCase() === raw.toLowerCase());
  if (!hit) return { sport: null, invalid: true };
  return { sport: hit, invalid: false };
}

export function windowLabel(window: LedgerWindow): string {
  return window === "season" ? `${DEMO_SEASON} season to date` : "Full demo ledger";
}

export const sportsPath = {
  home: "/sports",
  board: "/sports/leaderboard",
  methodology: "/sports/methodology",
  disclaimer: "/sports/disclaimer",
  terms: "/sports/terms",
  donate: "/sports/donate",
} as const;

export function boardHref(sport: Sport | null, window: LedgerWindow): string {
  const params = new URLSearchParams();
  if (sport) params.set("sport", sport);
  if (window === "season") params.set("window", "season");
  const query = params.toString();
  return query ? `${sportsPath.board}?${query}` : sportsPath.board;
}

export function capperHref(handle: string, window: LedgerWindow, sport: Sport | null = null): string {
  const params = new URLSearchParams();
  if (window === "season") params.set("window", "season");
  if (sport) params.set("sport", sport);
  const query = params.toString();
  return query ? `/sports/cappers/${handle}?${query}` : `/sports/cappers/${handle}`;
}

export function pickHref(id: string): string {
  return `/sports/picks/${id}`;
}
