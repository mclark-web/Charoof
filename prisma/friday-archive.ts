import { ARCHIVE_SEASON, ARCHIVE_WEEK, PUBLIC_FINAL_NOTE, PUBLIC_RESULT_SOURCE } from "../src/lib/constants";
import { formatLine } from "../src/lib/format";
import { gradeMarket, type Grade, type ScoreScope } from "../src/lib/grade";

/**
 * Public pick archive for Friday, September 18, 2026.
 *
 * Picks are copied from free published articles. They are not tweets, and this
 * file does not invent tweet IDs. The line is the number in the article.
 * Settlement is a public final or box score. There is no odds API.
 *
 * No NFL row: that Friday was NFL Week 2, and these cards did not post an NFL side.
 *
 * Articles:
 * - Rob Paul, Covers, Fri CFB: https://www.covers.com/ncaaf/friday-night-football-best-bets-week-3-2026
 * - Action Network staff card: https://www.actionnetwork.com/ncaaf/college-football-picks-predictions-bets-texas-tech-vs-houston-wake-forest-vs-miami-more-friday-sept-18
 * - Covers MLB experts: https://www.covers.com/mlb/expert-picks-at-prediction-markets-friday-sept-18-2026
 * - Quinn Allen, Covers, Braves-Astros: https://www.covers.com/mlb/braves-vs-astros-prediction-picks-odds-friday-9-18-2026
 * - The Commish, ProCappers: https://procappers.com/article/procappers-free-picks-predictions-for-today-friday-september-18-2026
 *
 * Finals:
 * - Miami 33, Wake Forest 20 (Wake home). Quarters Miami 7-17-7-2, Wake 7-0-6-7.
 *   https://godeacs.com/news/2026/9/18/football-wake-forests-second-half-comeback-attempt-falls-short-to-no-5-miami-on-friday-night
 * - Malachi Toney 12 receptions, 114 yards.
 *   https://miamihurricanes.com/news/2026/09/18/no-5-miami-picks-up-33-20-win-over-wake-forest
 * - Texas Tech 28, Houston 26 (Tech home). Quarters Houston 10-7-3-6, Tech 0-14-7-7.
 *   https://texastech.com/sports/football/stats/2026/houston/boxscore/21727
 * - Oregon 84, Portland State 0 (Oregon home).
 *   https://goducks.com/sports/football/stats/2026/portland-state/boxscore/24389
 * - Reds 6, Cubs 4. https://www.baseball-reference.com/boxes/CIN/CIN202609180.shtml
 * - Rays 2, Red Sox 4. https://www.baseball-reference.com/boxes/TBA/TBA202609180.shtml
 * - Rangers 7, Blue Jays 1. https://www.espn.com/mlb/recap?gameId=401816990
 * - White Sox 8, Tigers 11. https://www.espn.com/mlb/recap/_/gameId/401816989
 * - Astros 2, Braves 6. Matt Olson homered (one). https://www.espn.com/mlb/recap/_/gameId/401816988
 * - Diamondbacks 2, Yankees 9. https://www.baseball-reference.com/boxes/ARI/ARI202609180.shtml
 * - Dodgers 8, Giants 2. https://www.espn.com/mlb/recap/_/gameId/401816996
 * - Bayern Munich 7, Union Berlin 0. https://www.bundesliga.com/en/bundesliga/news/bayern-munich-union-berlin-match-report-highlights-matchday-4-39252
 * - Brentford 3, Chelsea 0. https://www.skysports.com/football/news/11661/13586052/brentford-3-0-chelsea-xabi-alonsos-side-struggle-in-defence-again-as-jaidon-anthony-igor-thiago-and-fabio-carvalho-strike-in-second-half
 */

const COVERS_CFB = "https://www.covers.com/ncaaf/friday-night-football-best-bets-week-3-2026";
const ACTION_CFB =
  "https://www.actionnetwork.com/ncaaf/college-football-picks-predictions-bets-texas-tech-vs-houston-wake-forest-vs-miami-more-friday-sept-18";
const COVERS_MLB = "https://www.covers.com/mlb/expert-picks-at-prediction-markets-friday-sept-18-2026";
const COVERS_BRAVES = "https://www.covers.com/mlb/braves-vs-astros-prediction-picks-odds-friday-9-18-2026";
const PROCAPPERS =
  "https://procappers.com/article/procappers-free-picks-predictions-for-today-friday-september-18-2026";

const WAKE_FINAL =
  "https://godeacs.com/news/2026/9/18/football-wake-forests-second-half-comeback-attempt-falls-short-to-no-5-miami-on-friday-night";
const TONEY_YARDS = "https://miamihurricanes.com/news/2026/09/18/no-5-miami-picks-up-33-20-win-over-wake-forest";
const TECH_BOX = "https://texastech.com/sports/football/stats/2026/houston/boxscore/21727";
const OREGON_BOX = "https://goducks.com/sports/football/stats/2026/portland-state/boxscore/24389";
const CUBS_BOX = "https://www.baseball-reference.com/boxes/CIN/CIN202609180.shtml";
const REDSOX_BOX = "https://www.baseball-reference.com/boxes/TBA/TBA202609180.shtml";
const JAYS_RECAP = "https://www.espn.com/mlb/recap?gameId=401816990";
const TIGERS_RECAP = "https://www.espn.com/mlb/recap/_/gameId/401816989";
const BRAVES_RECAP = "https://www.espn.com/mlb/recap/_/gameId/401816988";
const YANKEES_BOX = "https://www.baseball-reference.com/boxes/ARI/ARI202609180.shtml";
const DODGERS_RECAP = "https://www.espn.com/mlb/recap/_/gameId/401816996";
const BAYERN_REPORT =
  "https://www.bundesliga.com/en/bundesliga/news/bayern-munich-union-berlin-match-report-highlights-matchday-4-39252";
const CHELSEA_REPORT =
  "https://www.skysports.com/football/news/11661/13586052/brentford-3-0-chelsea-xabi-alonsos-side-struggle-in-defence-again-as-jaidon-anthony-igor-thiago-and-fabio-carvalho-strike-in-second-half";

const STAKE = "Article did not post a stake. Recorded as 1.00u.";
const EVEN =
  "No price was posted. A win or loss uses even money so the pick can enter CH. That price is not from the article.";

type Market = "spread" | "total" | "moneyline" | "prop" | "team_total" | "dnb";

export type ArchiveCapper = {
  handle: string;
  displayName: string;
  focus: string;
  bio: string;
  hue: number;
};

export type ArchiveEvent = {
  id: string;
  sport: "NCAAF" | "MLB" | "Soccer";
  season: string;
  weekLabel: string;
  name: string;
  startsAt: Date;
  status: "final";
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  homeFirstQuarter: number | null;
  awayFirstQuarter: number | null;
  homeFirstHalf: number | null;
  awayFirstHalf: number | null;
  source: string;
  sourceNote: string;
};

export type ArchivePick = {
  id: string;
  capperId: string;
  eventId: string;
  market: Market;
  side: string;
  line: number | null;
  oddsAmerican: number | null;
  units: number;
  selection: string;
  scoreScope: ScoreScope;
  participant: "home" | "away" | null;
  propPlayer: string | null;
  propStat: string | null;
  propActual: number | null;
  publishedAt: Date;
  clarity: "explicit" | "lean";
  grade: Grade;
  note: string;
  sourceUrl: string;
  isDemo: boolean;
};

/** Friday, Sep 18, 2026 wall clock in Eastern Daylight Time (UTC−4). */
function et(hour: number, minute: number): Date {
  return new Date(Date.UTC(2026, 8, 18, hour + 4, minute, 0));
}

/** Kalshi or Polymarket percent/cents, stored as American odds. 50 is −100. */
export function postedPercentToAmerican(percent: number): number {
  if (percent <= 0 || percent >= 100) {
    throw new Error(`Posted percent ${percent} is outside 0–100`);
  }
  if (Math.abs(percent - 50) < 1e-9) return -100;
  const p = percent / 100;
  if (p > 0.5) return -Math.round((100 * p) / (1 - p));
  return Math.round((100 * (1 - p)) / p);
}

function priceNote(label: string, percent: number): string {
  const american = postedPercentToAmerican(percent);
  const shown = american > 0 ? `+${american}` : String(american);
  return `${label} posted ${percent}¢ / ${percent}%. Stored as ${shown} for unit math. Not a sportsbook line and not an odds-API lookup.`;
}

function cited(url: string): string {
  return `${PUBLIC_FINAL_NOTE} ${url}`;
}

const bio = (publication: string, article: string) =>
  `Public pick archive label for ${publication}. The card is the free article at ${article}. Not a connected account, not a tweet, and not a live feed.`;

const CAPPERS: ArchiveCapper[] = [
  {
    handle: "robpaul",
    displayName: "Rob Paul",
    focus: "Covers · Fri Sep 18 CFB",
    bio: bio("Rob Paul's Covers Friday college card", COVERS_CFB),
    hue: 64,
  },
  {
    handle: "ryanminion",
    displayName: "Ryan Minion",
    focus: "Action Network · Miami card",
    bio: bio("Ryan Minion's Action Network Wake Forest–Miami bets", ACTION_CFB),
    hue: 88,
  },
  {
    handle: "roadtocfb",
    displayName: "RoadToCFB",
    focus: "Action Network · Texas Tech",
    bio: bio("RoadToCFB's Action Network Houston–Texas Tech bet", ACTION_CFB),
    hue: 110,
  },
  {
    handle: "joshuanunn",
    displayName: "Joshua Nunn",
    focus: "Action Network · Oregon",
    bio: bio("Joshua Nunn's Action Network Portland State–Oregon bet", ACTION_CFB),
    hue: 230,
  },
  {
    handle: "joshinglis",
    displayName: "Josh Inglis",
    focus: "Covers · Cubs",
    bio: bio("Josh Inglis's Covers Cubs moneyline", COVERS_MLB),
    hue: 250,
  },
  {
    handle: "jonmetler",
    displayName: "Jon Metler",
    focus: "Covers · Red Sox",
    bio: bio("Jon Metler's Covers Red Sox moneyline", COVERS_MLB),
    hue: 270,
  },
  {
    handle: "joeosborne",
    displayName: "Joe Osborne",
    focus: "Covers · Blue Jays",
    bio: bio("Joe Osborne's Covers Blue Jays run line", COVERS_MLB),
    hue: 310,
  },
  {
    handle: "dustinsaracini",
    displayName: "Dustin Saracini",
    focus: "Covers · public cards",
    bio: bio("Dustin Saracini's Covers Tigers–White Sox total", COVERS_MLB),
    hue: 330,
  },
  {
    handle: "quinnallen",
    displayName: "Quinn Allen",
    focus: "Covers · public cards",
    bio: bio("Quinn Allen's Covers Braves–Astros card", COVERS_BRAVES),
    hue: 50,
  },
  {
    handle: "thecommish",
    displayName: "The Commish",
    focus: "ProCappers · Fri Sep 18",
    bio: bio("The Commish's ProCappers free card", PROCAPPERS),
    hue: 96,
  },
];

function event(
  input: Omit<ArchiveEvent, "season" | "weekLabel" | "status" | "source" | "sourceNote"> & { url: string },
): ArchiveEvent {
  const { url, ...rest } = input;
  return {
    ...rest,
    season: ARCHIVE_SEASON,
    weekLabel: ARCHIVE_WEEK,
    status: "final",
    source: PUBLIC_RESULT_SOURCE,
    sourceNote: cited(url),
  };
}

const EVENTS: ArchiveEvent[] = [
  event({
    id: "cfb-2026-09-18-wake-miami",
    sport: "NCAAF",
    name: "Miami at Wake Forest",
    startsAt: et(19, 30),
    homeName: "Wake Forest",
    awayName: "Miami",
    homeScore: 20,
    awayScore: 33,
    homeFirstQuarter: 7,
    awayFirstQuarter: 7,
    homeFirstHalf: 7,
    awayFirstHalf: 24,
    url: WAKE_FINAL,
  }),
  event({
    id: "cfb-2026-09-18-tech-houston",
    sport: "NCAAF",
    name: "Houston at Texas Tech",
    startsAt: et(20, 0),
    homeName: "Texas Tech",
    awayName: "Houston",
    homeScore: 28,
    awayScore: 26,
    homeFirstQuarter: 0,
    awayFirstQuarter: 10,
    homeFirstHalf: 14,
    awayFirstHalf: 17,
    url: TECH_BOX,
  }),
  event({
    id: "cfb-2026-09-18-oregon-psu",
    sport: "NCAAF",
    name: "Portland State at Oregon",
    startsAt: et(22, 30),
    homeName: "Oregon",
    awayName: "Portland State",
    homeScore: 84,
    awayScore: 0,
    homeFirstQuarter: 28,
    awayFirstQuarter: 0,
    homeFirstHalf: 49,
    awayFirstHalf: 0,
    url: OREGON_BOX,
  }),
  event({
    id: "mlb-2026-09-18-reds-cubs",
    sport: "MLB",
    name: "Cubs at Reds",
    startsAt: et(18, 40),
    homeName: "Cincinnati Reds",
    awayName: "Chicago Cubs",
    homeScore: 6,
    awayScore: 4,
    homeFirstQuarter: null,
    awayFirstQuarter: null,
    homeFirstHalf: null,
    awayFirstHalf: null,
    url: CUBS_BOX,
  }),
  event({
    id: "mlb-2026-09-18-rays-redsox",
    sport: "MLB",
    name: "Red Sox at Rays",
    startsAt: et(19, 10),
    homeName: "Tampa Bay Rays",
    awayName: "Boston Red Sox",
    homeScore: 2,
    awayScore: 4,
    homeFirstQuarter: null,
    awayFirstQuarter: null,
    homeFirstHalf: null,
    awayFirstHalf: null,
    url: REDSOX_BOX,
  }),
  event({
    id: "mlb-2026-09-18-rangers-jays",
    sport: "MLB",
    name: "Blue Jays at Rangers",
    startsAt: et(20, 5),
    homeName: "Texas Rangers",
    awayName: "Toronto Blue Jays",
    homeScore: 7,
    awayScore: 1,
    homeFirstQuarter: null,
    awayFirstQuarter: null,
    homeFirstHalf: null,
    awayFirstHalf: null,
    url: JAYS_RECAP,
  }),
  event({
    id: "mlb-2026-09-18-whitesox-tigers",
    sport: "MLB",
    name: "Tigers at White Sox",
    startsAt: et(19, 40),
    homeName: "Chicago White Sox",
    awayName: "Detroit Tigers",
    homeScore: 8,
    awayScore: 11,
    homeFirstQuarter: null,
    awayFirstQuarter: null,
    homeFirstHalf: null,
    awayFirstHalf: null,
    url: TIGERS_RECAP,
  }),
  event({
    id: "mlb-2026-09-18-astros-braves",
    sport: "MLB",
    name: "Braves at Astros",
    startsAt: et(20, 10),
    homeName: "Houston Astros",
    awayName: "Atlanta Braves",
    homeScore: 2,
    awayScore: 6,
    homeFirstQuarter: null,
    awayFirstQuarter: null,
    homeFirstHalf: null,
    awayFirstHalf: null,
    url: BRAVES_RECAP,
  }),
  event({
    id: "mlb-2026-09-18-dbacks-yankees",
    sport: "MLB",
    name: "Yankees at Diamondbacks",
    startsAt: et(21, 40),
    homeName: "Arizona Diamondbacks",
    awayName: "New York Yankees",
    homeScore: 2,
    awayScore: 9,
    homeFirstQuarter: null,
    awayFirstQuarter: null,
    homeFirstHalf: null,
    awayFirstHalf: null,
    url: YANKEES_BOX,
  }),
  event({
    id: "mlb-2026-09-18-dodgers-giants",
    sport: "MLB",
    name: "Giants at Dodgers",
    startsAt: et(21, 15),
    homeName: "Los Angeles Dodgers",
    awayName: "San Francisco Giants",
    homeScore: 8,
    awayScore: 2,
    homeFirstQuarter: null,
    awayFirstQuarter: null,
    homeFirstHalf: null,
    awayFirstHalf: null,
    url: DODGERS_RECAP,
  }),
  event({
    id: "soc-2026-09-18-bayern-union",
    sport: "Soccer",
    name: "Union Berlin at Bayern Munich",
    startsAt: et(14, 30),
    homeName: "Bayern Munich",
    awayName: "Union Berlin",
    homeScore: 7,
    awayScore: 0,
    homeFirstQuarter: null,
    awayFirstQuarter: null,
    homeFirstHalf: null,
    awayFirstHalf: null,
    url: BAYERN_REPORT,
  }),
  event({
    id: "soc-2026-09-18-brentford-chelsea",
    sport: "Soccer",
    name: "Chelsea at Brentford",
    startsAt: et(15, 0),
    homeName: "Brentford",
    awayName: "Chelsea",
    homeScore: 3,
    awayScore: 0,
    homeFirstQuarter: null,
    awayFirstQuarter: null,
    homeFirstHalf: null,
    awayFirstHalf: null,
    url: CHELSEA_REPORT,
  }),
];

type PickInput = {
  id: string;
  capperId: string;
  eventId: string;
  market: Market;
  side: string;
  line: number | null;
  oddsAmerican: number | null;
  selection: string;
  scoreScope?: ScoreScope;
  participant?: "home" | "away" | null;
  propPlayer?: string | null;
  propStat?: string | null;
  propActual?: number | null;
  publishedAt: Date;
  clarity?: "explicit" | "lean";
  note: string;
};

function articleUrl(note: string): string {
  const labeled = note.match(/Article:\s*(https?:\/\/[^\s)]+)/);
  if (!labeled) throw new Error("Archive pick is missing an article URL");
  return labeled[1];
}

function settle(input: PickInput): ArchivePick {
  const eventRow = EVENTS.find((item) => item.id === input.eventId);
  if (!eventRow) throw new Error(`Missing archive event ${input.eventId}`);
  const scoreScope = input.scoreScope ?? "final";
  const grade = gradeMarket({
    market: input.market,
    side: input.side,
    line: input.line,
    homeScore: eventRow.homeScore,
    awayScore: eventRow.awayScore,
    propActual: input.propActual ?? null,
    status: eventRow.status,
    scoreScope,
    participant: input.participant ?? null,
    homeFirstQuarter: eventRow.homeFirstQuarter,
    awayFirstQuarter: eventRow.awayFirstQuarter,
    homeFirstHalf: eventRow.homeFirstHalf,
    awayFirstHalf: eventRow.awayFirstHalf,
  });
  return {
    id: input.id,
    capperId: input.capperId,
    eventId: input.eventId,
    market: input.market,
    side: input.side,
    line: input.line,
    oddsAmerican: input.oddsAmerican,
    units: 1,
    selection: input.selection,
    scoreScope,
    participant: input.participant ?? null,
    propPlayer: input.propPlayer ?? null,
    propStat: input.propStat ?? null,
    propActual: input.propActual ?? null,
    publishedAt: input.publishedAt,
    clarity: input.clarity ?? "explicit",
    grade,
    note: `${input.note} ${STAKE}`,
    sourceUrl: articleUrl(input.note),
    isDemo: false,
  };
}

const PICKS: ArchivePick[] = [
  settle({
    id: "robpaul-cfb-2026-09-18-wake-miami-total",
    capperId: "robpaul",
    eventId: "cfb-2026-09-18-wake-miami",
    market: "total",
    side: "over",
    line: 56.5,
    oddsAmerican: postedPercentToAmerican(50),
    selection: `Over ${formatLine(56.5)}`,
    publishedAt: et(6, 0),
    note: `Covers Friday card, over 56.5. ${priceNote("Kalshi", 50)} Article: ${COVERS_CFB}`,
  }),
  settle({
    id: "robpaul-cfb-2026-09-18-tech-houston-spread",
    capperId: "robpaul",
    eventId: "cfb-2026-09-18-tech-houston",
    market: "spread",
    side: "home",
    line: -7.5,
    oddsAmerican: postedPercentToAmerican(49),
    selection: `Texas Tech ${formatLine(-7.5, true)}`,
    publishedAt: et(6, 0),
    note: `Covers Friday card, Texas Tech −7.5. ${priceNote("Kalshi", 49)} Article: ${COVERS_CFB}`,
  }),
  settle({
    id: "robpaul-cfb-2026-09-18-oregon-psu-spread",
    capperId: "robpaul",
    eventId: "cfb-2026-09-18-oregon-psu",
    market: "spread",
    side: "home",
    line: -57.5,
    oddsAmerican: postedPercentToAmerican(50),
    selection: `Oregon ${formatLine(-57.5, true)}`,
    publishedAt: et(6, 0),
    note: `Covers Friday card, Oregon −57.5. ${priceNote("Kalshi", 50)} Article: ${COVERS_CFB}`,
  }),
  settle({
    id: "ryanminion-cfb-2026-09-18-wake-miami-1q",
    capperId: "ryanminion",
    eventId: "cfb-2026-09-18-wake-miami",
    market: "spread",
    side: "away",
    line: -6.5,
    oddsAmerican: -112,
    selection: `Miami 1Q ${formatLine(-6.5, true)}`,
    scoreScope: "1q",
    publishedAt: et(6, 36),
    note: `Action Network card by Ryan Minion. Posted American price −112. First quarter from the Wake Forest scoring table (Miami 7, Wake Forest 7). Article: ${ACTION_CFB}`,
  }),
  settle({
    id: "ryanminion-cfb-2026-09-18-wake-miami-toney",
    capperId: "ryanminion",
    eventId: "cfb-2026-09-18-wake-miami",
    market: "prop",
    side: "over",
    line: 95.5,
    oddsAmerican: -115,
    selection: "Malachi Toney over 95.5 receiving yards",
    propPlayer: "Malachi Toney",
    propStat: "receiving yards",
    propActual: 114,
    publishedAt: et(6, 36),
    note: `Action Network card by Ryan Minion. Posted American price −115. Miami recap: 12 catches, 114 yards. ${TONEY_YARDS} Article: ${ACTION_CFB}`,
  }),
  settle({
    id: "roadtocfb-cfb-2026-09-18-tech-houston-1h",
    capperId: "roadtocfb",
    eventId: "cfb-2026-09-18-tech-houston",
    market: "team_total",
    side: "under",
    line: 15.5,
    oddsAmerican: null,
    selection: "Texas Tech 1H team total under 15.5",
    scoreScope: "1h",
    participant: "home",
    publishedAt: et(6, 36),
    note: `Action Network card by RoadToCFB. Posted number 15.5, playable to 14.5. No American price. ${EVEN} First half is Houston 17, Texas Tech 14 on the Texas Tech box score. Article: ${ACTION_CFB}`,
  }),
  settle({
    id: "joshuanunn-cfb-2026-09-18-oregon-psu-tt",
    capperId: "joshuanunn",
    eventId: "cfb-2026-09-18-oregon-psu",
    market: "team_total",
    side: "over",
    line: 64.5,
    oddsAmerican: null,
    selection: "Oregon team total over 64.5",
    participant: "home",
    publishedAt: et(6, 36),
    note: `Action Network card by Joshua Nunn. The pick line is Oregon team total over 64.5. The same piece also says over 62.5; both clear on 84. No American price. ${EVEN} Article: ${ACTION_CFB}`,
  }),
  settle({
    id: "joshinglis-mlb-2026-09-18-reds-cubs-ml",
    capperId: "joshinglis",
    eventId: "mlb-2026-09-18-reds-cubs",
    market: "moneyline",
    side: "away",
    line: null,
    oddsAmerican: postedPercentToAmerican(56),
    selection: "Cubs moneyline",
    publishedAt: et(11, 3),
    note: `Covers expert card, Josh Inglis, Cubs moneyline. First pitch 6:40 p.m. ET in that article. ${priceNote("Polymarket", 56)} Article: ${COVERS_MLB}`,
  }),
  settle({
    id: "jonmetler-mlb-2026-09-18-rays-redsox-ml",
    capperId: "jonmetler",
    eventId: "mlb-2026-09-18-rays-redsox",
    market: "moneyline",
    side: "away",
    line: null,
    oddsAmerican: postedPercentToAmerican(48),
    selection: "Red Sox moneyline",
    publishedAt: et(11, 3),
    note: `Covers expert card, Jon Metler, Red Sox moneyline. First pitch 7:10 p.m. ET. ${priceNote("Polymarket", 48)} Article: ${COVERS_MLB}`,
  }),
  settle({
    id: "joeosborne-mlb-2026-09-18-rangers-jays-rl",
    capperId: "joeosborne",
    eventId: "mlb-2026-09-18-rangers-jays",
    market: "spread",
    side: "away",
    line: -1.5,
    oddsAmerican: postedPercentToAmerican(44),
    selection: `Blue Jays ${formatLine(-1.5, true)}`,
    publishedAt: et(11, 3),
    note: `Covers expert card, Joe Osborne, Toronto −1.5 at Texas. First pitch 8:05 p.m. ET. ${priceNote("Polymarket", 44)} Article: ${COVERS_MLB}`,
  }),
  settle({
    id: "dustinsaracini-mlb-2026-09-18-whitesox-tigers-total",
    capperId: "dustinsaracini",
    eventId: "mlb-2026-09-18-whitesox-tigers",
    market: "total",
    side: "over",
    line: 8.5,
    oddsAmerican: postedPercentToAmerican(50),
    selection: `Over ${formatLine(8.5)}`,
    publishedAt: et(11, 3),
    note: `Covers expert card, Dustin Saracini, Tigers/White Sox over 8.5. First pitch 7:40 p.m. ET. ${priceNote("Polymarket", 50)} Article: ${COVERS_MLB}`,
  }),
  settle({
    id: "quinnallen-mlb-2026-09-18-astros-braves-ml",
    capperId: "quinnallen",
    eventId: "mlb-2026-09-18-astros-braves",
    market: "moneyline",
    side: "away",
    line: null,
    oddsAmerican: postedPercentToAmerican(53),
    selection: "Braves moneyline",
    publishedAt: et(8, 11),
    note: `Covers Braves–Astros card, Quinn Allen, Braves moneyline. He called Atlanta a 53% favorite. ${priceNote("That writeup", 53)} First pitch 8:10 p.m. ET. Article: ${COVERS_BRAVES}`,
  }),
  settle({
    id: "quinnallen-mlb-2026-09-18-astros-braves-total",
    capperId: "quinnallen",
    eventId: "mlb-2026-09-18-astros-braves",
    market: "total",
    side: "over",
    line: 8.5,
    oddsAmerican: null,
    selection: `Over ${formatLine(8.5)}`,
    publishedAt: et(8, 11),
    note: `Covers Braves–Astros card, Quinn Allen, over 8.5, play up to 55%. The 55% is a limit, not a filled price. ${EVEN} Article: ${COVERS_BRAVES}`,
  }),
  settle({
    id: "quinnallen-mlb-2026-09-18-astros-braves-olson",
    capperId: "quinnallen",
    eventId: "mlb-2026-09-18-astros-braves",
    market: "prop",
    side: "over",
    line: 0.5,
    oddsAmerican: null,
    selection: "Matt Olson to homer",
    propPlayer: "Matt Olson",
    propStat: "home runs",
    propActual: 1,
    publishedAt: et(8, 11),
    note: `Covers card, Quinn Allen, Matt Olson home-run pick, play up to 30%. No over/under was posted, so this is graded as a yes/no homer (over 0.5). The recap records one homer, his 40th. ${EVEN} Article: ${COVERS_BRAVES}`,
  }),
  settle({
    id: "thecommish-mlb-2026-09-18-dodgers-giants-ml",
    capperId: "thecommish",
    eventId: "mlb-2026-09-18-dodgers-giants",
    market: "moneyline",
    side: "home",
    line: null,
    oddsAmerican: null,
    selection: "Dodgers moneyline",
    publishedAt: et(9, 0),
    note: `ProCappers free card, Dodgers ML. The article has a Friday date and no clock; stamped 9:00 a.m. ET, before first pitch. ESPN lists 9:15 p.m. on Sep 18 without a time zone, stored here as 9:15 p.m. ET. ${EVEN} Article: ${PROCAPPERS}`,
  }),
  settle({
    id: "thecommish-mlb-2026-09-18-dbacks-yankees-ml",
    capperId: "thecommish",
    eventId: "mlb-2026-09-18-dbacks-yankees",
    market: "moneyline",
    side: "away",
    line: null,
    oddsAmerican: null,
    selection: "Yankees moneyline",
    publishedAt: et(9, 0),
    note: `ProCappers free card, Yankees ML. Stamped 9:00 a.m. ET because the article published no clock. Baseball-Reference start is 6:40 p.m. local at Chase Field (Arizona, UTC−7), which is 9:40 p.m. ET. ${EVEN} Article: ${PROCAPPERS}`,
  }),
  settle({
    id: "thecommish-cfb-2026-09-18-wake-miami-ats",
    capperId: "thecommish",
    eventId: "cfb-2026-09-18-wake-miami",
    market: "spread",
    side: "away",
    line: null,
    oddsAmerican: null,
    selection: "Miami ATS",
    clarity: "lean",
    publishedAt: et(9, 0),
    note: `ProCappers said Miami ATS and told the reader to check the spread. No number was posted, so this row is void and stays out of CH. The final is real; the grade is not. Article: ${PROCAPPERS}`,
  }),
  settle({
    id: "thecommish-cfb-2026-09-18-tech-houston-lean",
    capperId: "thecommish",
    eventId: "cfb-2026-09-18-tech-houston",
    market: "spread",
    side: "home",
    line: null,
    oddsAmerican: null,
    selection: "Texas Tech lean",
    clarity: "lean",
    publishedAt: et(9, 0),
    note: `ProCappers leaned Texas Tech and said the point spread still mattered. No spread, total, or moneyline number was posted, so this row is void. Article: ${PROCAPPERS}`,
  }),
  settle({
    id: "thecommish-soc-2026-09-18-bayern-union-ml",
    capperId: "thecommish",
    eventId: "soc-2026-09-18-bayern-union",
    market: "moneyline",
    side: "home",
    line: null,
    oddsAmerican: null,
    selection: "Bayern Munich moneyline",
    publishedAt: et(9, 0),
    note: `ProCappers free card, Bayern Munich to win at home against Union Berlin. Kickoff 8:30 p.m. local (2:30 p.m. ET) on the DFB listing https://datencenter.dfb.de/en/data-center/bundesliga/2026-2027/4/2419295. ${EVEN} Article: ${PROCAPPERS}`,
  }),
  settle({
    id: "thecommish-soc-2026-09-18-brentford-chelsea-dnb",
    capperId: "thecommish",
    eventId: "soc-2026-09-18-brentford-chelsea",
    market: "dnb",
    side: "away",
    line: null,
    oddsAmerican: null,
    selection: "Chelsea draw no bet",
    publishedAt: et(9, 0),
    note: `ProCappers free card, Chelsea draw no bet at Brentford. A draw would push. Kickoff 8:00 p.m. UK / 3:00 p.m. ET. ${EVEN} Article: ${PROCAPPERS}`,
  }),
];

export function fridayArchive(): {
  cappers: ArchiveCapper[];
  events: ArchiveEvent[];
  picks: ArchivePick[];
} {
  if (PICKS.length < 8 || PICKS.length > 20) {
    throw new Error(`Friday archive has ${PICKS.length} picks; expected 8–20`);
  }
  const handles = new Set(CAPPERS.map((capper) => capper.handle));
  for (const pick of PICKS) {
    if (!handles.has(pick.capperId)) throw new Error(`Unknown archive capper ${pick.capperId}`);
    if (pick.publishedAt.getTime() >= EVENTS.find((eventRow) => eventRow.id === pick.eventId)!.startsAt.getTime()) {
      throw new Error(`${pick.id} is stamped at or after the listed start`);
    }
    if (/tweet/i.test(pick.id) || /status\/\d+/.test(pick.note)) {
      throw new Error(`${pick.id} looks like a fabricated tweet id`);
    }
  }
  return { cappers: CAPPERS, events: EVENTS, picks: PICKS };
}
