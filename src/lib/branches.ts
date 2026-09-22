export type BranchId = "analysts" | "fintwit" | "sports" | "bot";

export type Branch = {
  id: BranchId;
  index: string;
  navLabel: string;
  href: string;
  title: string;
  measures: string;
  summary: string;
  status: string;
  externalHref: string | null;
  externalLabel: string;
  /** Second action on the branch page. Bot keeps the repository beside the live demo. */
  secondaryHref: string | null;
  secondaryLabel: string | null;
  /** Home-grid destination. Bot opens the live demo; the other cards stay in the tree. */
  cardHref: string;
  note: string;
};

export const BOT_LIVE_URL = "https://charoofbot.vercel.app";
export const BOT_REPOSITORY = "https://github.com/mclark-web/charoofbot";

const LEDGER_NOTE =
  "The graded ledger is the live site linked above. This page is the branch inside the Charoof tree.";

export const BRANCHES: readonly Branch[] = [
  {
    id: "analysts",
    index: "01",
    navLabel: "Analysts",
    href: "/analysts",
    title: "Analysts",
    measures: "Sell-side calls against the price that followed",
    summary:
      "Upgrades, downgrades, and price targets, graded once the window closes. Hit rate and the Charoof factor stay on the card.",
    status: "Live ledger",
    externalHref: "https://bank-troof.vercel.app",
    externalLabel: "Open the Analysts ledger",
    secondaryHref: null,
    secondaryLabel: null,
    cardHref: "/analysts",
    note: LEDGER_NOTE,
  },
  {
    id: "fintwit",
    index: "02",
    navLabel: "FinTwit",
    href: "/fintwit",
    title: "FinTwit",
    measures: "Weekend posts against the prints that followed",
    summary:
      "One book of crash calls and melt-up posts, collected from Wednesday noon through Sunday evening, then graded at the open and the days after.",
    status: "Live ledger",
    externalHref: "https://fintwittruth.vercel.app",
    externalLabel: "Open the FinTwit ledger",
    secondaryHref: null,
    secondaryLabel: null,
    cardHref: "/fintwit",
    note: LEDGER_NOTE,
  },
  {
    id: "sports",
    index: "03",
    navLabel: "Sports",
    href: "/sports",
    title: "Sports",
    measures: "Posted picks against the final score",
    summary:
      "Prediction accounts graded when the game is final. The board, profiles, and methodology run on this site.",
    status: "Live · this site",
    externalHref: null,
    externalLabel: "Open the Sports ledger",
    secondaryHref: null,
    secondaryLabel: null,
    cardHref: "/sports",
    note: "Sports runs on this site. The board, profiles, and methodology are the ledger.",
  },
  {
    id: "bot",
    index: "04",
    navLabel: "Bot",
    href: "/bot",
    title: "Charoof Bot",
    measures: "Clone speech and amplifiers by narrative volume",
    summary:
      "Clone speech is the same wording posted as an original. Amplifiers boost a narrative without being the source. Narrative volume, on a zero-cost demo, shows which stories are being sewn harder.",
    status: "Live demo",
    externalHref: BOT_LIVE_URL,
    externalLabel: "Open Charoof Bot",
    secondaryHref: BOT_REPOSITORY,
    secondaryLabel: "Charoof Bot repository",
    cardHref: BOT_LIVE_URL,
    note: "This page is the Bot branch inside the Charoof tree. The live demo scores clone speech and amplifiers apart, on a synthetic corpus, at zero cost.",
  },
];

export function getBranch(id: BranchId): Branch {
  const branch = BRANCHES.find((item) => item.id === id);
  if (!branch) throw new Error(`Unknown Charoof branch: ${id}`);
  return branch;
}
