import { PUBLIC_FINAL_NOTE, PUBLIC_RESULT_SOURCE, VERIFIED_SEASON } from "../src/lib/constants";
import { formatLine } from "../src/lib/format";
import { gradeMarket, type Grade } from "../src/lib/grade";

/**
 * Verified public cards from Sep 19–21, 2026.
 * Lines and prices are the numbers in the free article. Finals are ESPN scoreboard
 * results checked against a second public recap. No odds API and no tweet IDs.
 *
 * Cards:
 * - Neil Parker, Covers, Eagles −7.5: https://www.covers.com/nfl/eagles-vs-titans-prediction-picks-best-bets-today-sept-20-2026
 * - Neil Parker, Covers, Steelers/Patriots under 42.5: https://www.covers.com/nfl/steelers-vs-patriots-prediction-picks-best-bets-today-sept-20-2026
 * - Quinn Allen, Covers, Buccaneers −8.5: https://www.covers.com/nfl/browns-vs-buccaneers-prediction-picks-best-bets-today-sept-20-2026
 * - Geoff Clark, Covers, Seahawks/Cardinals under 41.5: https://www.covers.com/nfl/seahawks-vs-cardinals-prediction-picks-best-bets-today-sept-20-2026
 * - Jason Logan, Covers, Colts/Chiefs under 46.5: https://www.covers.com/nfl/colts-vs-chiefs-prediction-picks-best-bets-tonight-sept-20-2026
 * - Stuckey, Action Network, Arkansas +25.5: https://www.actionnetwork.com/ncaaf/college-football-predictions-picks-week-3-stuckey-georgia-vs-arkansas-usc-vs-rutgers-more-saturday-sept-19
 * - Dustin Saracini, Covers, Blue Jays moneyline −105: https://www.covers.com/mlb/blue-jays-vs-orioles-prediction-picks-odds-monday-9-21-2026
 *
 * Finals (ESPN scoreboard, also cited on the pick):
 * - Eagles 24, Titans 20. https://www.espn.com/nfl/recap/_/gameId/401872939
 * - Steelers 3, Patriots 20. https://www.espn.com/nfl/recap/_/gameId/401872946
 * - Browns 23, Buccaneers 19. https://www.espn.com/nfl/recap?gameId=401872935
 * - Seahawks 31, Cardinals 7. https://www.seahawks.com/game-day/2026/reg-week2/seahawks-at-cardinals/
 * - Colts 30, Chiefs 33. https://www.espn.com/nfl/recap/_/gameId/401872945
 * - Georgia 45, Arkansas 17. https://georgiadogs.com/sports/football/stats/2026/arkansas/boxscore/26389
 * - Blue Jays 3, Orioles 4. https://www.baseball-reference.com/boxes/BAL/BAL202609210.shtml
 */

const EAGLES = "https://www.covers.com/nfl/eagles-vs-titans-prediction-picks-best-bets-today-sept-20-2026";
const STEELERS = "https://www.covers.com/nfl/steelers-vs-patriots-prediction-picks-best-bets-today-sept-20-2026";
const BUCS = "https://www.covers.com/nfl/browns-vs-buccaneers-prediction-picks-best-bets-today-sept-20-2026";
const HAWKS = "https://www.covers.com/nfl/seahawks-vs-cardinals-prediction-picks-best-bets-today-sept-20-2026";
const CHIEFS = "https://www.covers.com/nfl/colts-vs-chiefs-prediction-picks-best-bets-tonight-sept-20-2026";
const STUCKEY = "https://www.actionnetwork.com/ncaaf/college-football-predictions-picks-week-3-stuckey-georgia-vs-arkansas-usc-vs-rutgers-more-saturday-sept-19";
const JAYS = "https://www.covers.com/mlb/blue-jays-vs-orioles-prediction-picks-odds-monday-9-21-2026";

const STAKE = "Article did not post a stake. Recorded as 1.00u.";
const NO_PRICE = "No American price was posted. A win or loss uses even money. That price is not from the article.";

type RecentCapper = {
  handle: string;
  displayName: string;
  focus: string;
  bio: string;
  hue: number;
};

type RecentEvent = {
  id: string;
  sport: "NFL" | "NCAAF" | "MLB";
  season: string;
  weekLabel: string;
  name: string;
  startsAt: Date;
  status: "final";
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  homeFirstQuarter: null;
  awayFirstQuarter: null;
  homeFirstHalf: null;
  awayFirstHalf: null;
  source: string;
  sourceNote: string;
};

type RecentPick = {
  id: string;
  capperId: string;
  eventId: string;
  market: "spread" | "total" | "moneyline";
  side: string;
  line: number | null;
  oddsAmerican: number | null;
  units: number;
  selection: string;
  scoreScope: "final";
  participant: null;
  propPlayer: null;
  propStat: null;
  propActual: null;
  publishedAt: Date;
  clarity: "explicit";
  grade: Grade;
  note: string;
  sourceUrl: string;
  isDemo: false;
};

/** US Eastern Daylight Time (UTC−4) in September. */
function et(month: number, day: number, hour: number, minute: number): Date {
  return new Date(Date.UTC(2026, month - 1, day, hour + 4, minute, 0));
}

function finalNote(url: string): string {
  return `${PUBLIC_FINAL_NOTE} ${url}`;
}

const CAPPERS: RecentCapper[] = [
  {
    handle: "neilparker",
    displayName: "Neil Parker",
    focus: "Covers · NFL Week 2",
    bio: `Public card label for Neil Parker's free Covers NFL writes. Not a connected account and not a tweet. ${EAGLES}`,
    hue: 18,
  },
  {
    handle: "jasonlogan",
    displayName: "Jason Logan",
    focus: "Covers · Sunday night",
    bio: `Public card label for Jason Logan's free Covers Colts–Chiefs write. Not a connected account and not a tweet. ${CHIEFS}`,
    hue: 42,
  },
  {
    handle: "geoffclark",
    displayName: "Geoff Clark",
    focus: "Covers · Seahawks total",
    bio: `Public card label for Geoff Clark's free Covers Seahawks–Cardinals write. Not a connected account and not a tweet. ${HAWKS}`,
    hue: 152,
  },
  {
    handle: "stuckey",
    displayName: "Stuckey",
    focus: "Action Network · Week 3",
    bio: `Public card label for Stuckey's free Action Network college card. The byline does not print a first name. Not a connected account and not a tweet. ${STUCKEY}`,
    hue: 198,
  },
];

const EVENTS: RecentEvent[] = [
  {
    id: "nfl-2026-09-20-titans-eagles",
    sport: "NFL",
    season: VERIFIED_SEASON,
    weekLabel: "Covers · Sun Sep 20",
    name: "Philadelphia Eagles at Tennessee Titans",
    startsAt: new Date("2026-09-20T17:00:00.000Z"),
    status: "final",
    homeName: "Tennessee Titans",
    awayName: "Philadelphia Eagles",
    homeScore: 20,
    awayScore: 24,
    homeFirstQuarter: null,
    awayFirstQuarter: null,
    homeFirstHalf: null,
    awayFirstHalf: null,
    source: PUBLIC_RESULT_SOURCE,
    sourceNote: finalNote("https://www.espn.com/nfl/recap/_/gameId/401872939"),
  },
  {
    id: "nfl-2026-09-20-patriots-steelers",
    sport: "NFL",
    season: VERIFIED_SEASON,
    weekLabel: "Covers · Sun Sep 20",
    name: "Pittsburgh Steelers at New England Patriots",
    startsAt: new Date("2026-09-20T17:00:00.000Z"),
    status: "final",
    homeName: "New England Patriots",
    awayName: "Pittsburgh Steelers",
    homeScore: 20,
    awayScore: 3,
    homeFirstQuarter: null,
    awayFirstQuarter: null,
    homeFirstHalf: null,
    awayFirstHalf: null,
    source: PUBLIC_RESULT_SOURCE,
    sourceNote: finalNote("https://www.espn.com/nfl/recap/_/gameId/401872946"),
  },
  {
    id: "nfl-2026-09-20-buccaneers-browns",
    sport: "NFL",
    season: VERIFIED_SEASON,
    weekLabel: "Covers · Sun Sep 20",
    name: "Cleveland Browns at Tampa Bay Buccaneers",
    startsAt: new Date("2026-09-20T17:00:00.000Z"),
    status: "final",
    homeName: "Tampa Bay Buccaneers",
    awayName: "Cleveland Browns",
    homeScore: 19,
    awayScore: 23,
    homeFirstQuarter: null,
    awayFirstQuarter: null,
    homeFirstHalf: null,
    awayFirstHalf: null,
    source: PUBLIC_RESULT_SOURCE,
    sourceNote: finalNote("https://www.espn.com/nfl/recap?gameId=401872935"),
  },
  {
    id: "nfl-2026-09-20-cardinals-seahawks",
    sport: "NFL",
    season: VERIFIED_SEASON,
    weekLabel: "Covers · Sun Sep 20",
    name: "Seattle Seahawks at Arizona Cardinals",
    startsAt: new Date("2026-09-20T20:25:00.000Z"),
    status: "final",
    homeName: "Arizona Cardinals",
    awayName: "Seattle Seahawks",
    homeScore: 7,
    awayScore: 31,
    homeFirstQuarter: null,
    awayFirstQuarter: null,
    homeFirstHalf: null,
    awayFirstHalf: null,
    source: PUBLIC_RESULT_SOURCE,
    sourceNote: finalNote("https://www.seahawks.com/game-day/2026/reg-week2/seahawks-at-cardinals/"),
  },
  {
    id: "nfl-2026-09-20-chiefs-colts",
    sport: "NFL",
    season: VERIFIED_SEASON,
    weekLabel: "Covers · Sun Sep 20",
    name: "Indianapolis Colts at Kansas City Chiefs",
    startsAt: new Date("2026-09-21T00:20:00.000Z"),
    status: "final",
    homeName: "Kansas City Chiefs",
    awayName: "Indianapolis Colts",
    homeScore: 33,
    awayScore: 30,
    homeFirstQuarter: null,
    awayFirstQuarter: null,
    homeFirstHalf: null,
    awayFirstHalf: null,
    source: PUBLIC_RESULT_SOURCE,
    sourceNote: finalNote("https://www.espn.com/nfl/recap/_/gameId/401872945"),
  },
  {
    id: "cfb-2026-09-19-arkansas-georgia",
    sport: "NCAAF",
    season: VERIFIED_SEASON,
    weekLabel: "Action Network · Sat Sep 19",
    name: "Georgia Bulldogs at Arkansas Razorbacks",
    startsAt: new Date("2026-09-19T16:00:00.000Z"),
    status: "final",
    homeName: "Arkansas Razorbacks",
    awayName: "Georgia Bulldogs",
    homeScore: 17,
    awayScore: 45,
    homeFirstQuarter: null,
    awayFirstQuarter: null,
    homeFirstHalf: null,
    awayFirstHalf: null,
    source: PUBLIC_RESULT_SOURCE,
    sourceNote: finalNote("https://georgiadogs.com/sports/football/stats/2026/arkansas/boxscore/26389"),
  },
  {
    id: "mlb-2026-09-21-orioles-bluejays",
    sport: "MLB",
    season: VERIFIED_SEASON,
    weekLabel: "Covers · Mon Sep 21",
    name: "Toronto Blue Jays at Baltimore Orioles",
    startsAt: new Date("2026-09-21T22:35:00.000Z"),
    status: "final",
    homeName: "Baltimore Orioles",
    awayName: "Toronto Blue Jays",
    homeScore: 4,
    awayScore: 3,
    homeFirstQuarter: null,
    awayFirstQuarter: null,
    homeFirstHalf: null,
    awayFirstHalf: null,
    source: PUBLIC_RESULT_SOURCE,
    sourceNote: finalNote("https://www.baseball-reference.com/boxes/BAL/BAL202609210.shtml"),
  },
];

function settle(input: {
  id: string;
  capperId: string;
  eventId: string;
  market: RecentPick["market"];
  side: string;
  line: number | null;
  oddsAmerican: number | null;
  selection: string;
  publishedAt: Date;
  sourceUrl: string;
  note: string;
  expected: Grade;
}): RecentPick {
  const eventRow = EVENTS.find((item) => item.id === input.eventId);
  if (!eventRow) throw new Error(`Missing recent event ${input.eventId}`);
  if (input.publishedAt.getTime() >= eventRow.startsAt.getTime()) {
    throw new Error(`${input.id} is stamped at or after the listed start`);
  }
  const grade = gradeMarket({
    market: input.market,
    side: input.side,
    line: input.line,
    homeScore: eventRow.homeScore,
    awayScore: eventRow.awayScore,
    propActual: null,
    status: "final",
  });
  if (grade !== input.expected) {
    throw new Error(`${input.id} graded ${grade}, expected ${input.expected}`);
  }
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
    scoreScope: "final",
    participant: null,
    propPlayer: null,
    propStat: null,
    propActual: null,
    publishedAt: input.publishedAt,
    clarity: "explicit",
    grade,
    note: `${input.note} ${STAKE}`,
    sourceUrl: input.sourceUrl,
    isDemo: false,
  };
}

const PICKS: RecentPick[] = [
  settle({
    id: "neilparker-nfl-2026-09-20-eagles-spread",
    capperId: "neilparker",
    eventId: "nfl-2026-09-20-titans-eagles",
    market: "spread",
    side: "away",
    line: -7.5,
    oddsAmerican: null,
    selection: `Philadelphia Eagles ${formatLine(-7.5, true)}`,
    publishedAt: et(9, 20, 10, 10),
    sourceUrl: EAGLES,
    expected: "loss",
    note: `Covers top pick, Eagles −7.5, play down to 50%. The 50% is a limit, not a filled price. ${NO_PRICE} Updated timestamp on the article is Sep 20, 2026, 10:10 a.m. ET. Article: ${EAGLES}`,
  }),
  settle({
    id: "neilparker-nfl-2026-09-20-steelers-total",
    capperId: "neilparker",
    eventId: "nfl-2026-09-20-patriots-steelers",
    market: "total",
    side: "under",
    line: 42.5,
    oddsAmerican: null,
    selection: `Under ${formatLine(42.5)}`,
    publishedAt: et(9, 20, 9, 55),
    sourceUrl: STEELERS,
    expected: "win",
    note: `Covers top pick, under 42.5, playable down to 40.5. The odds table on the same page shows 41.5 and is not the posted pick number. ${NO_PRICE} Updated timestamp on the article is Sep 20, 2026, 9:55 a.m. ET. Patriots 20, Steelers 3. Article: ${STEELERS}`,
  }),
  settle({
    id: "quinnallen-nfl-2026-09-20-bucs-spread",
    capperId: "quinnallen",
    eventId: "nfl-2026-09-20-buccaneers-browns",
    market: "spread",
    side: "home",
    line: -8.5,
    oddsAmerican: null,
    selection: `Tampa Bay Buccaneers ${formatLine(-8.5, true)}`,
    publishedAt: et(9, 20, 10, 33),
    sourceUrl: BUCS,
    expected: "loss",
    note: `Covers top pick, Buccaneers −8.5, play up to 55%. The 55% is a limit, not a filled price. ${NO_PRICE} Updated timestamp on the article is Sep 20, 2026, 10:33 a.m. ET. Article: ${BUCS}`,
  }),
  settle({
    id: "geoffclark-nfl-2026-09-20-seahawks-total",
    capperId: "geoffclark",
    eventId: "nfl-2026-09-20-cardinals-seahawks",
    market: "total",
    side: "under",
    line: 41.5,
    oddsAmerican: null,
    selection: `Under ${formatLine(41.5)}`,
    publishedAt: et(9, 20, 13, 35),
    sourceUrl: HAWKS,
    expected: "win",
    note: `Covers pick, under 41.5, tradable down to 40.5. ${NO_PRICE} Updated timestamp on the article is Sep 20, 2026, 1:35 p.m. ET. Kickoff 4:25 p.m. ET. Seahawks 31, Cardinals 7. Article: ${HAWKS}`,
  }),
  settle({
    id: "jasonlogan-nfl-2026-09-20-chiefs-total",
    capperId: "jasonlogan",
    eventId: "nfl-2026-09-20-chiefs-colts",
    market: "total",
    side: "under",
    line: 46.5,
    oddsAmerican: null,
    selection: `Under ${formatLine(46.5)}`,
    publishedAt: et(9, 20, 17, 22),
    sourceUrl: CHIEFS,
    expected: "loss",
    note: `Covers top pick, under 46.5. ${NO_PRICE} Updated timestamp on the article is Sep 20, 2026, 5:22 p.m. ET. Kickoff 8:20 p.m. ET. Colts 30, Chiefs 33. Article: ${CHIEFS}`,
  }),
  settle({
    id: "stuckey-cfb-2026-09-19-arkansas-spread",
    capperId: "stuckey",
    eventId: "cfb-2026-09-19-arkansas-georgia",
    market: "spread",
    side: "home",
    line: 25.5,
    oddsAmerican: null,
    selection: `Arkansas Razorbacks ${formatLine(25.5, true)}`,
    publishedAt: et(9, 18, 7, 6),
    sourceUrl: STUCKEY,
    expected: "loss",
    note: `Action Network card, Arkansas +25.5, play to +24.5. ${NO_PRICE} Updated timestamp on the article is Sep 18, 2026, 7:06 a.m. ET. Georgia 45, Arkansas 17 at Razorback Stadium. Article: ${STUCKEY}`,
  }),
  settle({
    id: "dustinsaracini-mlb-2026-09-21-jays-ml",
    capperId: "dustinsaracini",
    eventId: "mlb-2026-09-21-orioles-bluejays",
    market: "moneyline",
    side: "away",
    line: null,
    oddsAmerican: -105,
    selection: "Toronto Blue Jays moneyline",
    publishedAt: et(9, 21, 11, 15),
    sourceUrl: JAYS,
    expected: "loss",
    note: `Covers best bet, Blue Jays moneyline −105, play up to −110. Updated timestamp on the article is Sep 21, 2026, 11:15 a.m. ET. First pitch 6:35 p.m. ET. Blue Jays 3, Orioles 4. Article: ${JAYS}`,
  }),
];

export function verifiedRecent(): {
  cappers: RecentCapper[];
  events: RecentEvent[];
  picks: RecentPick[];
} {
  if (PICKS.length < 3 || PICKS.length > 10) {
    throw new Error(`Recent verified card has ${PICKS.length} picks; expected 3–10`);
  }
  return { cappers: CAPPERS, events: EVENTS, picks: PICKS };
}
