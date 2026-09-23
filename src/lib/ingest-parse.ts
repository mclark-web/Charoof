export type IngestMarket = "spread" | "total" | "moneyline" | "prop" | "team_total" | "dnb";

export type IngestPick = {
  sourceUrl: string;
  publishedAt: string;
  who: string;
  handle: string;
  sport: string;
  awayName: string;
  homeName: string;
  eventName: string;
  market: IngestMarket;
  side: string;
  line: number | null;
  oddsAmerican: number | null;
  selection: string;
  /** Posted start, when the paste included one. Null means the paste had no clock. */
  startsAt: string | null;
};

export type IngestResult =
  | { ok: true; pick: IngestPick }
  | { ok: false; missing: string[]; errors: string[] };

const MARKETS = new Set<IngestMarket>(["spread", "total", "moneyline", "prop", "team_total", "dnb"]);

const FIELD_NAMES: Record<string, string> = {
  source: "source",
  url: "source",
  sourceurl: "source",
  timestamp: "timestamp",
  posted: "timestamp",
  published: "timestamp",
  publishedat: "timestamp",
  who: "who",
  capper: "who",
  author: "who",
  sport: "sport",
  event: "event",
  home: "home",
  away: "away",
  market: "market",
  side: "side",
  line: "line",
  number: "line",
  price: "price",
  odds: "price",
  start: "start",
  starts: "start",
  kickoff: "start",
};

function fail(missing: string[], errors: string[]): IngestResult {
  return { ok: false, missing, errors };
}

export function handleFromName(who: string): string {
  return who.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export function parseTimestamp(raw: string): string | null {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed)) {
    const parsed = Date.parse(trimmed);
    if (Number.isNaN(parsed)) return null;
    return new Date(parsed).toISOString();
  }

  const match = trimmed.match(
    /^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4}),?\s+(\d{1,2}):(\d{2})\s*(AM|PM)\s*(ET|EDT|EST)$/i,
  );
  if (!match) return null;
  const months: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };
  const month = months[match[1].slice(0, 3).toLowerCase()];
  if (month == null) return null;
  let hour = Number(match[4]) % 12;
  if (match[6].toUpperCase() === "PM") hour += 12;
  const zone = match[7].toUpperCase();
  const offset = zone === "EST" ? 5 : 4;
  const utc = Date.UTC(Number(match[3]), month, Number(match[2]), hour + offset, Number(match[5]));
  return new Date(utc).toISOString();
}

function splitEvent(event: string): { away: string; home: string } | null {
  const parts = event.split(/\s+at\s+/i);
  if (parts.length !== 2) return null;
  const away = parts[0].trim();
  const home = parts[1].trim();
  if (!away || !home) return null;
  return { away, home };
}

function resolveSide(sideRaw: string, home: string, away: string): string | "ambiguous" | null {
  const side = sideRaw.trim().toLowerCase();
  if (side === "home" || side === "away" || side === "over" || side === "under") return side;
  const needle = normalize(sideRaw);
  const homeName = normalize(home);
  const awayName = normalize(away);
  const homeHit = needle === homeName || homeName.includes(needle) || needle.includes(homeName);
  const awayHit = needle === awayName || awayName.includes(needle) || needle.includes(awayName);
  if (homeHit && awayHit) return "ambiguous";
  if (homeHit) return "home";
  if (awayHit) return "away";
  return null;
}

function signed(line: number): string {
  if (line > 0) return `+${line}`;
  return String(line);
}

function buildSelection(input: {
  market: IngestMarket;
  side: string;
  line: number | null;
  home: string;
  away: string;
}): string {
  if (input.market === "total" || input.market === "team_total") {
    const word = input.side === "over" ? "Over" : "Under";
    return input.line == null ? word : `${word} ${input.line}`;
  }
  const team = input.side === "home" ? input.home : input.away;
  if (input.market === "spread") return input.line == null ? team : `${team} ${signed(input.line)}`;
  if (input.market === "dnb") return `${team} draw no bet`;
  return `${team} moneyline`;
}

function fromFields(fields: Record<string, string>): IngestResult {
  const missing: string[] = [];
  const errors: string[] = [];
  const source = fields.source?.trim() ?? "";
  const timestampRaw = fields.timestamp?.trim() ?? "";
  const who = fields.who?.trim() ?? "";
  const sport = fields.sport?.trim() ?? "";
  const sideRaw = fields.side?.trim() ?? "";

  if (!source) missing.push("source");
  else if (!/^https?:\/\/\S+$/i.test(source)) errors.push("Source must be an http(s) URL.");

  let publishedAt = "";
  if (!timestampRaw) missing.push("timestamp");
  else {
    const parsed = parseTimestamp(timestampRaw);
    if (!parsed) errors.push("Timestamp must be ISO-8601 or like Sep 20, 2026, 9:55 AM ET.");
    else publishedAt = parsed;
  }

  let away = fields.away?.trim() ?? "";
  let home = fields.home?.trim() ?? "";
  if ((!away || !home) && fields.event) {
    const split = splitEvent(fields.event);
    if (split) {
      away = away || split.away;
      home = home || split.home;
    }
  }
  if (!away || !home) missing.push("event");

  if (!sideRaw) missing.push("side");
  if (!who) missing.push("who");
  if (!sport) missing.push("sport");

  if (missing.length > 0 || errors.length > 0) return fail(missing, errors);

  const side = resolveSide(sideRaw, home, away);
  if (side == null) {
    errors.push("Side did not match home, away, over, or under.");
    return fail(missing, errors);
  }
  if (side === "ambiguous") {
    errors.push("Side matches both clubs. Use home, away, over, or under.");
    return fail(missing, errors);
  }

  let line: number | null = null;
  if (fields.line?.trim()) {
    const parsed = Number(fields.line.trim().replace("−", "-"));
    if (!Number.isFinite(parsed)) {
      errors.push("Line is not a number.");
      return fail(missing, errors);
    }
    line = parsed;
  }

  let oddsAmerican: number | null = null;
  if (fields.price?.trim()) {
    const parsed = Number(fields.price.trim().replace("−", "-"));
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
      errors.push("Price must be American odds, such as -110 or +105, or left blank.");
      return fail(missing, errors);
    }
    oddsAmerican = parsed;
  }

  let market = fields.market?.trim().toLowerCase() ?? "";
  if (!market) {
    if (side === "over" || side === "under") market = "total";
    else if (line == null) market = "moneyline";
    else market = "spread";
  }
  if (!MARKETS.has(market as IngestMarket)) {
    errors.push("Market must be spread, total, moneyline, prop, team_total, or dnb.");
    return fail(missing, errors);
  }
  const resolvedMarket = market as IngestMarket;
  if ((resolvedMarket === "spread" || resolvedMarket === "total" || resolvedMarket === "team_total") && line == null) {
    errors.push("That market needs a posted number. Leave it out only for a moneyline, draw no bet, or lean you will void.");
    return fail(missing, errors);
  }

  let startsAt: string | null = null;
  if (fields.start?.trim()) {
    const parsed = parseTimestamp(fields.start);
    if (!parsed) {
      errors.push("Start must be ISO-8601 or like Sep 20, 2026, 1:00 PM ET.");
      return fail(missing, errors);
    }
    startsAt = parsed;
  }

  return {
    ok: true,
    pick: {
      sourceUrl: source,
      publishedAt,
      who,
      handle: handleFromName(who),
      sport: sport.toUpperCase() === "SOCCER" ? "Soccer" : sport.toUpperCase(),
      awayName: away,
      homeName: home,
      eventName: `${away} at ${home}`,
      market: resolvedMarket,
      side,
      line,
      oddsAmerican,
      selection: buildSelection({ market: resolvedMarket, side, line, home, away }),
      startsAt,
    },
  };
}

function parseLabeled(text: string): IngestResult {
  const fields: Record<string, string> = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    if (/^https?:\/\/\S+$/i.test(line)) {
      if (!fields.source) fields.source = line;
      continue;
    }
    const match = line.match(/^([A-Za-z][A-Za-z ]{0,30})\s*:\s*(.*)$/);
    if (!match) continue;
    const key = FIELD_NAMES[match[1].toLowerCase().replace(/\s+/g, "")];
    if (!key) continue;
    fields[key] = match[2].trim();
  }
  return fromFields(fields);
}

function parseJson(text: string): IngestResult {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return fail(["source", "timestamp", "event", "side"], ["JSON did not parse."]);
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fail(["source", "timestamp", "event", "side"], ["JSON must be one pick object."]);
  }
  const row = value as Record<string, unknown>;
  const stringOf = (keys: string[]) => {
    for (const key of keys) {
      const item = row[key];
      if (typeof item === "string" && item.trim()) return item.trim();
      if (typeof item === "number" && Number.isFinite(item)) return String(item);
    }
    return "";
  };
  return fromFields({
    source: stringOf(["source", "sourceUrl", "url"]),
    timestamp: stringOf(["timestamp", "publishedAt", "posted"]),
    who: stringOf(["who", "capper", "author"]),
    sport: stringOf(["sport"]),
    event: stringOf(["event", "eventName"]),
    home: stringOf(["home", "homeName"]),
    away: stringOf(["away", "awayName"]),
    market: stringOf(["market"]),
    side: stringOf(["side"]),
    line: stringOf(["line", "number"]),
    price: stringOf(["price", "odds", "oddsAmerican"]),
    start: stringOf(["start", "startsAt", "kickoff"]),
  });
}

export function parseIngest(raw: string): IngestResult {
  const text = raw.trim();
  if (!text) {
    return fail(["source", "timestamp", "event", "side"], ["Paste was empty."]);
  }
  if (text.startsWith("{")) return parseJson(text);
  if (/^https?:\/\/\S+$/i.test(text)) {
    return fail(["timestamp", "event", "side"], [
      "A URL alone has no timestamp, event, or side. Paste those fields with the URL. Charoof will not invent them.",
    ]);
  }
  return parseLabeled(text);
}

export function ingestId(pick: IngestPick): string {
  const day = pick.publishedAt.slice(0, 10);
  const slug = pick.selection.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${pick.handle}-${pick.sport.toLowerCase()}-${day}-${slug}`.slice(0, 80);
}
