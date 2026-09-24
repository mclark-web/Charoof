import analystRoster from "@/data/analyst-roster.json";
import fridayArchive from "@/data/friday-archive.json";
import fintwitBook from "@/data/fintwit-book.json";
import gcbotCorpus from "@/data/gcbot-corpus.json";
import verifiedPicks from "@/data/verified-picks.json";
import { GRADE_BANDS, type GradeKey } from "@/lib/grade";
import { hitFill, outcomeLabel, recordLabel, resultPill, type Outcome, type ResultPill } from "@/lib/outcome";
import {
  blendWinRate,
  formatNewYorkDate,
  newYorkToday,
  postedDay,
  presentCapper,
  PROVISIONAL_SAMPLE_NOTE,
} from "@/lib/recency";
import { sectors, type Fixture, type Sector, type SectorKey } from "@/lib/sectors";

export type BoardLane = "Demo" | "Verified" | "Unverified" | "Seeded";

export type BoardRow = {
  id: string;
  lane: BoardLane;
  title: string;
  detail: string;
  fill: number | null;
  /** Decided grades in this score. 0 means nothing is graded yet. */
  graded?: number;
  sample: string;
  href?: string;
  /** Plain result on a single pick. This is not a GC grade. */
  result?: ResultPill;
  /** Capper window line, e.g. 1W 3–1 · 2W 5–3 · 1M 11–8 · 3M 30–24 */
  windows?: string;
  /** Display grade. A short sample can force PROVISIONAL without hiding the fill. */
  gradeKey?: GradeKey;
  gradeName?: string;
  sampleNote?: string;
};

export type BoardSection = {
  id: string;
  label: string;
  note: string;
  rows: BoardRow[];
};

export type HeroMeter =
  | { kind: "tube"; fill: number; hint: string; card: string }
  | { kind: "count"; value: string; hint: string; card: string };

export type SectorBook = {
  sector: Sector;
  hero: HeroMeter;
  liveHref: string | null;
  liveLabel: string | null;
  sections: BoardSection[];
};

type VerifiedPick = {
  tipster: string;
  sport: string;
  event: string;
  market: string;
  side: string;
  number: number | null;
  price: string | null;
  posted_at: string;
  source_url: string;
  game_final: boolean;
  result: string;
  box_score_url: string;
  final_score: string;
};

type FridayPick = {
  id: string;
  capper: string;
  sport: string;
  event: string;
  selection: string;
  grade: string;
  finalScore: string;
  sourceUrl: string;
  postedAt: string;
};

type FintwitCall = {
  id: string;
  cohort: string;
  cohortTitle: string;
  name: string;
  body: string;
  direction: string;
  primary: string;
  ref: number | null;
  mondayOpen: number | null;
  directionGrade: string;
};

const OUTCOMES = new Set<Outcome>(["win", "loss", "push", "void", "pending"]);

function asOutcome(value: string, id: string): Outcome {
  if (OUTCOMES.has(value as Outcome)) return value as Outcome;
  throw new Error(`Unknown grade ${value} on ${id}`);
}

function signedNumber(value: number): string {
  const digits = Number.isInteger(value) ? 0 : 1;
  const absolute = Math.abs(value).toFixed(digits);
  if (value > 0) return `+${absolute}`;
  if (value < 0) return `−${absolute}`;
  return "PK";
}

function verifiedSelection(pick: VerifiedPick): string {
  if (pick.market === "spread" || pick.market === "run_line") {
    return pick.number == null ? pick.side : `${pick.side} ${signedNumber(pick.number)}`;
  }
  if (pick.market === "total" || pick.market === "total_goals") {
    return pick.number == null ? pick.side : `${pick.side} ${pick.number}`;
  }
  if (pick.market === "moneyline") return `${pick.side} moneyline`;
  return pick.side;
}

function outcomeRow(input: {
  id: string;
  lane: BoardLane;
  title: string;
  detail: string;
  outcome: Outcome;
  href?: string;
}): BoardRow {
  return {
    id: input.id,
    lane: input.lane,
    title: input.title,
    detail: input.detail,
    fill: null,
    sample: outcomeLabel(input.outcome),
    href: input.href,
    result: resultPill(input.outcome),
  };
}

function tally(outcomes: Outcome[]) {
  const counts = { win: 0, loss: 0, push: 0, void: 0, pending: 0 };
  for (const outcome of outcomes) counts[outcome] += 1;
  return counts;
}

/** A calendar date with no clock time cannot prove the post went up before kickoff. */
export function postTimeUnconfirmed(postedAt: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(postedAt.trim());
}

const UNCONFIRMED_SOURCE_NOTE =
  "Source note: the page only says Published Sunday, September 20, 2026. No article:published_time, archive.org capture, or author social post time was found, so post-before-start is unproven.";

function verifiedBoardRow(pick: VerifiedPick, index: number, unconfirmed: boolean): BoardRow {
  const outcome = asOutcome(pick.result, pick.event);
  const price = pick.price ? ` · price ${pick.price}` : "";
  const row = outcomeRow({
    id: unconfirmed ? `unconfirmed-${index}` : `verified-${index}`,
    lane: unconfirmed ? "Unverified" : "Verified",
    title: `${pick.tipster} · ${verifiedSelection(pick)}`,
    detail: `${pick.sport} · ${pick.event} · Final ${pick.final_score}${price} · posted ${pick.posted_at}${
      unconfirmed ? `. ${UNCONFIRMED_SOURCE_NOTE}` : ""
    }`,
    outcome,
    href: pick.source_url,
  });
  if (unconfirmed) row.sampleNote = "Post time unconfirmed";
  return row;
}

export function verifiedPickRows(): BoardRow[] {
  return (verifiedPicks as VerifiedPick[])
    .map((pick, index) => ({ pick, index }))
    .filter(({ pick }) => !postTimeUnconfirmed(pick.posted_at))
    .map(({ pick, index }) => verifiedBoardRow(pick, index, false));
}

export function unconfirmedPickRows(): BoardRow[] {
  return (verifiedPicks as VerifiedPick[])
    .map((pick, index) => ({ pick, index }))
    .filter(({ pick }) => postTimeUnconfirmed(pick.posted_at))
    .map(({ pick, index }) => verifiedBoardRow(pick, index, true));
}

export function fridayPickRows(): BoardRow[] {
  return (fridayArchive.picks as FridayPick[]).map((pick) => {
    const outcome = asOutcome(pick.grade, pick.id);
    return outcomeRow({
      id: pick.id,
      lane: "Verified",
      title: `${pick.capper} · ${pick.selection}`,
      detail: `${pick.sport} · ${pick.event} · Final ${pick.finalScore} · posted ${pick.postedAt.slice(0, 10)}`,
      outcome,
      href: pick.sourceUrl,
    });
  });
}

type CapperTally = { name: string; picks: { at: number; outcome: Outcome }[] };

/** Drop a single publication tag. A joint byline with a slash stays intact. */
function capperIdentity(name: string): { key: string; label: string } {
  if (name.includes("/")) return { key: name.toLowerCase(), label: name };
  const label = name.replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
  return { key: label.toLowerCase(), label };
}

export function publicCapperRows(asOfDate = newYorkToday()): BoardRow[] {
  const byName = new Map<string, CapperTally>();
  const add = (name: string, outcome: Outcome, posted: string) => {
    const identity = capperIdentity(name);
    const at = postedDay(posted);
    const current = byName.get(identity.key) ?? { name: identity.label, picks: [] };
    current.picks.push({ at, outcome });
    byName.set(identity.key, current);
  };

  for (const pick of verifiedPicks as VerifiedPick[]) {
    if (postTimeUnconfirmed(pick.posted_at)) continue;
    add(pick.tipster, asOutcome(pick.result, pick.event), pick.posted_at);
  }
  for (const pick of fridayArchive.picks as FridayPick[]) {
    add(pick.capper, asOutcome(pick.grade, pick.id), pick.postedAt);
  }

  const asOf = postedDay(asOfDate);
  return [...byName.values()]
    .map((capper) => {
      const counts = tally(capper.picks.map((pick) => pick.outcome));
      const decisive = counts.win + counts.loss;
      const blended = blendWinRate(capper.picks, asOf);
      const presented = presentCapper(blended);
      return {
        id: `capper-${capper.name}`,
        lane: "Verified" as const,
        title: capper.name,
        detail: `${capper.picks.length} public ${capper.picks.length === 1 ? "pick" : "picks"} · ${recordLabel(counts.win, counts.loss, counts.push)}${counts.void ? ` · ${counts.void} void` : ""}`,
        fill: presented.fill,
        graded: decisive,
        sample: decisive ? `n = ${decisive}` : "n = 0",
        windows: blended.label,
        gradeKey: presented.grade.key,
        gradeName: presented.grade.name,
        sampleNote: presented.note ?? undefined,
      };
    })
    .sort((a, b) => (b.fill ?? -1) - (a.fill ?? -1) || a.title.localeCompare(b.title));
}

export function sportsOutcomes(): Outcome[] {
  return [
    ...(verifiedPicks as VerifiedPick[])
      .filter((pick) => !postTimeUnconfirmed(pick.posted_at))
      .map((pick) => asOutcome(pick.result, pick.event)),
    ...(fridayArchive.picks as FridayPick[]).map((pick) => asOutcome(pick.grade, pick.id)),
  ];
}

function money(value: number | null): string {
  if (value == null) return "—";
  return value.toFixed(2);
}

export function fintwitCallRows(cohort: string): BoardRow[] {
  return (fintwitBook.calls as FintwitCall[])
    .filter((call) => call.cohort === cohort)
    .map((call) => {
      const outcome = asOutcome(call.directionGrade, call.id);
      const tape =
        outcome === "pending"
          ? "no Monday open on the stored tape"
          : `${call.primary} Monday open ${money(call.mondayOpen)} vs Friday close ${money(call.ref)}`;
      return outcomeRow({
        id: call.id,
        lane: "Seeded",
        title: `${call.name} · ${call.direction} ${call.primary}`,
        detail: `${call.body} · ${tape}`,
        outcome,
      });
    });
}

export function fintwitCohortRows(): BoardRow[] {
  return fintwitBook.cohorts.map((cohort) => {
    const calls = (fintwitBook.calls as FintwitCall[]).filter((call) => call.cohort === cohort.slug);
    const counts = tally(calls.map((call) => asOutcome(call.directionGrade, call.id)));
    const graded = counts.win + counts.loss;
    return {
      id: cohort.slug,
      lane: "Seeded" as const,
      title: cohort.title,
      detail: cohort.summary,
      fill: hitFill(counts.win, counts.loss),
      graded,
      sample: graded === 0 ? "Open window" : recordLabel(counts.win, counts.loss),
    };
  });
}

export function fintwitOutcomes(): Outcome[] {
  return (fintwitBook.calls as FintwitCall[]).map((call) => asOutcome(call.directionGrade, call.id));
}

export function analystRows(): BoardRow[] {
  return analystRoster.analysts.map((analyst) => ({
    id: analyst.slug,
    lane: "Seeded" as const,
    title: analyst.name,
    detail: `${analyst.title} · ${analyst.bankName} · ${analyst.sector}`,
    fill: null,
    sample: `since ${analyst.startedYear}`,
  }));
}

export function bankRows(): BoardRow[] {
  return analystRoster.banks.map((bank) => ({
    id: bank.slug,
    lane: "Seeded" as const,
    title: bank.name,
    detail: `${bank.headquarters}. ${bank.description}`,
    fill: null,
    sample: "Seeded desk",
  }));
}

type CorpusPost = {
  id: string;
  account: string;
  text: string;
  postedAt: string;
  narrativeId: string | null;
};

export function gcbotNarrativeRows(): BoardRow[] {
  const posts = gcbotCorpus.posts as CorpusPost[];
  const accounts = new Map(gcbotCorpus.accounts.map((account) => [account.handle, account.name]));
  return gcbotCorpus.narratives
    .map((narrative) => {
      const related = posts
        .filter((post) => post.narrativeId === narrative.id)
        .sort((a, b) => a.postedAt.localeCompare(b.postedAt));
      const first = related[0];
      const speaker = first ? (accounts.get(first.account) ?? first.account) : "No post";
      const excerpt = first ? first.text : narrative.summary;
      return {
        count: related.length,
        row: {
          id: narrative.id,
          lane: "Seeded" as const,
          title: narrative.title,
          detail: `${narrative.topic}. ${narrative.summary} Earliest fixture: ${speaker} — ${excerpt}`,
          fill: null,
          sample: `n = ${related.length}`,
        },
      };
    })
    .sort((a, b) => b.count - a.count || a.row.title.localeCompare(b.row.title))
    .map((item) => item.row);
}

function demoSection(sector: Sector): BoardSection {
  return {
    id: `${sector.key}-demo`,
    label: "Demo fixtures",
    note: "Fiction for the tube, the sample size, and the empty glass. These rows are not the verified or seeded book above.",
    rows: sector.fixtures.map(fixtureRow),
  };
}

function fixtureRow(row: Fixture): BoardRow {
  return {
    id: row.id,
    lane: row.lane,
    title: row.title,
    detail: row.detail,
    fill: row.fill,
    sample: row.sample,
  };
}

function sportsBook(sector: Sector): SectorBook {
  const counts = tally(sportsOutcomes());
  const fill = hitFill(counts.win, counts.loss);
  const record = recordLabel(counts.win, counts.loss, counts.push);
  const verified = verifiedPickRows();
  const unconfirmed = unconfirmedPickRows();
  const asOfDate = newYorkToday();
  const asOfLabel = formatNewYorkDate(asOfDate);
  return {
    sector,
    hero: {
      kind: "tube",
      fill,
      card: `${counts.win + counts.loss + counts.push + counts.void} public picks · ${record}`,
      hint: `Decisive win rate on the timed public book, including the Fri Sep 18 archive. ${record} on wins and losses${counts.void ? `, ${counts.void} void kept out of the fill` : ""}. ${unconfirmed.length} cards with no publish time stay out of this record. Pushes stay out of the rate. A single pick shows WIN, LOSS, PUSH, or PENDING. Capper cards use the recency blend.`,
    },
    liveHref: null,
    liveLabel: null,
    sections: [
      {
        id: "verified-cards",
        label: "Verified lane",
        note: `${verified.length} public free picks with a recorded clock time, recovered from data/verified-picks.json. Each card shows WIN, LOSS, PUSH, or PENDING. It does not get a GC grade. Graded on the public finals stored with each card. No paid odds API.`,
        rows: verified,
      },
      {
        id: "post-time-unconfirmed",
        label: "Post time unconfirmed",
        note: "These cards only say Published Sunday, September 20, 2026. The ProCappers page has no article:published_time, archive.org has no capture of the article, and no author social post with a clock time was found. Post-before-start is unproven. They stay out of Verified and out of capper GC scores and records. The stored result is unchanged.",
        rows: unconfirmed,
      },
      {
        id: "friday-archive",
        label: "Fri Sep 18 archive",
        note: "Public cards from Covers, Action Network, and ProCappers for Friday, September 18, 2026, graded with the recovered market grader against recorded finals. Two leans with no posted number stay VOID. The card shows that result, not a GC fill.",
        rows: fridayPickRows(),
      },
      {
        id: "public-cappers",
        label: "Public cappers",
        note: `Combined record for each name across the timed verified cards and the Friday archive. Cards with no publish time are excluded from these scores and records. The tube is the recency-blended win percentage: last 7, 14, 30, and 90 days, weighted 40/30/20/10, pushes excluded. An empty window is dropped and the remaining weights are renormalized. If every window is empty, the card is PROVISIONAL with no score. ${PROVISIONAL_SAMPLE_NOTE} STRONG is ${GRADE_BANDS.strongAt}% and above; below ${GRADE_BANDS.weakAt}% is WEAK. The card still shows the percentage. Windows count back from today in America/New_York, as of ${asOfLabel}.`,
        rows: publicCapperRows(asOfDate),
      },
      demoSection(sector),
    ],
  };
}

function analystsBook(sector: Sector): SectorBook {
  return {
    sector,
    hero: {
      kind: "count",
      value: String(analystRoster.analysts.length),
      card: `${analystRoster.analysts.length} analysts · seeded book`,
      hint: `${analystRoster.banks.length} sample desks · ${analystRoster.tickers.length} tickers · vintage ${analystRoster.asOf}. Names are the bank_troof roster. Price grades stay on the live ledger, so this hub does not invent a hit rate.`,
    },
    liveHref: analystRoster.liveUrl,
    liveLabel: "Open the live Analysts ledger",
    sections: [
      {
        id: "analyst-roster",
        label: "Seeded analyst roster",
        note: "Fictional analysts from the Analysts seed. The live board grades their sample calls against historical split-adjusted closes. This table is the roster, not a regenerated price grade.",
        rows: analystRows(),
      },
      {
        id: "bank-roster",
        label: "Seeded desks",
        note: "Each desk is labeled as a sample franchise in the seed. The description is the seed copy, not a report on the bank.",
        rows: bankRows(),
      },
      demoSection(sector),
    ],
  };
}

function fintwitBookView(sector: Sector): SectorBook {
  const latest = fintwitBook.cohorts.find((cohort) => cohort.isLatest) ?? fintwitBook.cohorts[fintwitBook.cohorts.length - 1];
  const counts = tally(fintwitOutcomes());
  const fill = hitFill(counts.win, counts.loss);
  return {
    sector,
    hero: {
      kind: "tube",
      fill,
      card: `${fintwitBook.calls.length} seeded posts · ${recordLabel(counts.win, counts.loss)}`,
      hint: `Monday-open direction for the seeded demo book: stated bullish or bearish versus the stored Friday close and Monday regular-session open. ${counts.pending} posts have no Monday open, so they stay PENDING and out of the fill. A single post shows its result, not a GC grade.`,
    },
    liveHref: fintwitBook.liveUrl,
    liveLabel: "Open the live FinTwit ledger",
    sections: [
      {
        id: "fintwit-latest",
        label: `Latest seeded weekend · ${latest.title}`,
        note: latest.summary,
        rows: fintwitCallRows(latest.slug),
      },
      {
        id: "fintwit-cohorts",
        label: "Seeded weekends",
        note: "Five demo cohorts. The tube is the Monday-open hit rate. The September 7 cohort is Labor Day, so that window stays empty rather than copying an earlier print. This board grades Monday-open direction against the prior Friday close. The FinTwit site grades on the Monday 12:00 PM ET print and the Wednesday/Friday 4:00 PM ET closes.",
        rows: fintwitCohortRows(),
      },
      {
        id: "fintwit-accounts",
        label: "Seeded accounts",
        note: "Fictional handles from the FinTwit seed. Bios are the seed copy.",
        rows: fintwitBook.accounts.map((account) => ({
          id: account.handle,
          lane: "Seeded" as const,
          title: account.displayName,
          detail: `@${account.handle} · ${account.bio}`,
          fill: null,
          sample: account.posture,
        })),
      },
      demoSection(sector),
    ],
  };
}

function gcbotBook(sector: Sector): SectorBook {
  const posts = gcbotCorpus.posts.length;
  const narratives = gcbotCorpus.narratives.length;
  const accounts = gcbotCorpus.accounts.length;
  return {
    sector,
    hero: {
      kind: "count",
      value: String(posts),
      card: `${posts} fixture posts · ${narratives} narratives`,
      hint: `${accounts} fixture accounts. Clone speech and amplifier scores are computed on the live GCBot board from this same corpus. This hub shows the narratives and the earliest post in each thread, and does not invent those two scores.`,
    },
    liveHref: "https://charoofbot.vercel.app",
    liveLabel: "Open the live GCBot board",
    sections: [
      {
        id: "gcbot-narratives",
        label: "Fixture narratives",
        note: "Synthetic corpus recovered from the GCBot data file. Volume is the post count. A narrative with posts is not given a fake accuracy grade on this hub.",
        rows: gcbotNarrativeRows(),
      },
      demoSection(sector),
    ],
  };
}

export function sectorBook(key: SectorKey): SectorBook {
  const sector = sectors.find((item) => item.key === key);
  if (!sector) throw new Error(`Unknown sector ${key}`);
  if (key === "sports") return sportsBook(sector);
  if (key === "analysts") return analystsBook(sector);
  if (key === "fintwit") return fintwitBookView(sector);
  return gcbotBook(sector);
}

export function sectorBooks(): SectorBook[] {
  return sectors.map((sector) => sectorBook(sector.key));
}

export function hubStats() {
  const sports = tally(sportsOutcomes());
  const fintwit = tally(fintwitOutcomes());
  const sportsCards = sports.win + sports.loss + sports.push + sports.void + sports.pending;
  return {
    sportsCards,
    sportsRecord: recordLabel(sports.win, sports.loss, sports.push),
    sportsVoids: sports.void,
    sportsHitFill: hitFill(sports.win, sports.loss),
    analysts: analystRoster.analysts.length,
    banks: analystRoster.banks.length,
    tickers: analystRoster.tickers.length,
    fintwitPosts: fintwitBook.calls.length,
    fintwitRecord: recordLabel(fintwit.win, fintwit.loss, fintwit.push),
    fintwitOpen: fintwit.pending,
    fintwitHitFill: hitFill(fintwit.win, fintwit.loss),
    gcbotPosts: gcbotCorpus.posts.length,
    gcbotNarratives: gcbotCorpus.narratives.length,
    gcbotAccounts: gcbotCorpus.accounts.length,
  };
}
