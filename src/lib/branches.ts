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
};

export const BOT_REPOSITORY = "https://github.com/mclark-web/charoofbot";

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
  },
  {
    id: "bot",
    index: "04",
    navLabel: "Bot",
    href: "/bot",
    title: "Charoof Bot",
    measures: "The same record, asked in conversation",
    summary:
      "The fourth branch is being built in its own repository. A public demo is not deployed, so this page does not point at a live bot.",
    status: "Not deployed",
    externalHref: BOT_REPOSITORY,
    externalLabel: "Charoof Bot repository",
  },
];

export function getBranch(id: BranchId): Branch {
  const branch = BRANCHES.find((item) => item.id === id);
  if (!branch) throw new Error(`Unknown Charoof branch: ${id}`);
  return branch;
}
