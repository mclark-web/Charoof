export type SectorKey = "analysts" | "fintwit" | "sports" | "gcbot";

export type Fixture = {
  id: string;
  lane: "Demo" | "Verified";
  title: string;
  detail: string;
  fill: number;
  sample: string;
};

export type Sector = {
  key: SectorKey;
  href: string;
  kicker: string;
  title: string;
  summary: string;
  foot: string;
  /** Illustrative sector tube from the locked hub comp. Not a live book. */
  exampleFill: number;
  trust: string[];
  fixtures: Fixture[];
};

export const sectors: Sector[] = [
  {
    key: "analysts",
    href: "/analysts",
    kicker: "Equities · Research",
    title: "Analysts",
    summary:
      "Bank and street upgrades, downgrades, and price targets — graded vs real split-adjusted closes.",
    foot: "2W / 30D / 60D / 90D / 1Y",
    exampleFill: 72,
    trust: [
      "Prices are split-adjusted.",
      "The entry locks before the horizon close.",
      "Horizons are 2W, 30D, 60D, 90D, and 1Y.",
      "Sample size sits on every profile.",
    ],
    fixtures: [
      {
        id: "an-30",
        lane: "Demo",
        title: "Demo · upgrade held",
        detail: "Direction held across 30D and 90D closes",
        fill: 88,
        sample: "n = 24",
      },
      {
        id: "an-open",
        lane: "Demo",
        title: "Demo · target still open",
        detail: "One horizon still inside the window",
        fill: 54,
        sample: "n = 11",
      },
      {
        id: "an-miss",
        lane: "Demo",
        title: "Demo · target missed",
        detail: "Mostly wrong vs the split-adjusted print",
        fill: 31,
        sample: "n = 18",
      },
    ],
  },
  {
    key: "fintwit",
    href: "/fintwit",
    kicker: "Markets · Social",
    title: "FinTwit",
    summary:
      "Weekend doom, melt-up calls, and index takes — graded against the next session’s actual tape.",
    foot: "DIA · SPY · QQQ · VIX",
    exampleFill: 61,
    trust: [
      "The tape is the Monday open after a weekend call.",
      "Instruments are DIA, SPY, QQQ, and VIX.",
      "The words are frozen at post time.",
      "Sample size sits on every profile.",
    ],
    fixtures: [
      {
        id: "ft-tape",
        lane: "Demo",
        title: "Demo · Monday open",
        detail: "Stated direction matched the next session",
        fill: 72,
        sample: "n = 16",
      },
      {
        id: "ft-mix",
        lane: "Demo",
        title: "Demo · mixed tape",
        detail: "Index call still open on one leg",
        fill: 61,
        sample: "n = 9",
      },
      {
        id: "ft-flat",
        lane: "Demo",
        title: "Demo · 4 graded, 0 hit",
        detail: "graded 0% fill · empty glass",
        fill: 0,
        sample: "n = 4",
      },
    ],
  },
  {
    key: "sports",
    href: "/sports",
    kicker: "Cappers · Public picks",
    title: "Sports",
    summary:
      "Public free picks frozen at post time, graded against official results. Fiction stays on Demo.",
    foot: "Verified + Demo lanes",
    exampleFill: 54,
    trust: [
      "No paid odds APIs.",
      "Verified picks are public posts graded on official final scores.",
      "Demo rows are fiction for the tube, and they are labeled Demo.",
      "Sample size sits on every profile.",
    ],
    fixtures: [
      {
        id: "sp-held",
        lane: "Demo",
        title: "Demo · Harbor FC",
        detail: "Public-style pick graded on a fictional final score",
        fill: 72,
        sample: "n = 20",
      },
      {
        id: "sp-open",
        lane: "Demo",
        title: "Demo · weekend total",
        detail: "Still open on one game",
        fill: 54,
        sample: "n = 8",
      },
      {
        id: "sp-exit",
        lane: "Demo",
        title: "Demo · 6 graded, 0 hit",
        detail: "graded 0% fill · EXIT LIQUIDITY",
        fill: 0,
        sample: "n = 6",
      },
    ],
  },
  {
    key: "gcbot",
    href: "/gcbot",
    kicker: "Narratives · Volume",
    title: "GCBot",
    summary:
      "Clone speech and amplifiers, scored by narrative volume. The zero-cost demo uses a synthetic corpus.",
    foot: "Clone speech · Amplifiers · Volume",
    exampleFill: 47,
    trust: [
      "Clone speech is the same wording posted as an original.",
      "Amplifiers boost a narrative without being the source.",
      "Narrative volume shows which stories are repeated harder.",
      "This surface does not call a paid social API.",
    ],
    fixtures: [
      {
        id: "gb-clone",
        lane: "Demo",
        title: "Demo · repeated wording",
        detail: "Same phrasing posted again as if it were new",
        fill: 76,
        sample: "n = 14",
      },
      {
        id: "gb-amp",
        lane: "Demo",
        title: "Demo · amplifier cluster",
        detail: "Boosts around a source, still open on one thread",
        fill: 47,
        sample: "n = 9",
      },
      {
        id: "gb-quiet",
        lane: "Demo",
        title: "Demo · 3 graded, 0 hit",
        detail: "graded 0% fill · empty glass",
        fill: 0,
        sample: "n = 3",
      },
    ],
  },
];

export function sectorByKey(key: SectorKey): Sector {
  const sector = sectors.find((item) => item.key === key);
  if (!sector) throw new Error(`Unknown sector ${key}`);
  return sector;
}
