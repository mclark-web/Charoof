/** Public brand lock for this vertical. Copy in the UI and README should come from here. */

export const UMBRELLA = "Charoof";
export const PRODUCT = "Charoof Sports";
export const NAV_LABEL = "Sports";
export const MARK = "CH";

export const CHAD = {
  name: "Chad",
  means: "Accuracy & Discipline",
  rule: "Top 30% of the peer set.",
} as const;

export const CHUD = {
  name: "Chud",
  means: "Uncertainty & Doubt",
  rule: "Any score under 70.",
} as const;

export const GRADES_LINE = "Grades are not for sale.";

export const SITE_DESCRIPTION =
  "Charoof Sports grades public sports calls after the contest. Chad is Accuracy & Discipline. Chud is Uncertainty & Doubt. Grades are not for sale.";

export const FAMILY = [
  {
    id: "analysts",
    label: "Analysts",
    product: "Charoof Analysts",
    href: "/family#analysts",
    placeholder: true,
    blurb: "Public research calls, graded in public.",
  },
  {
    id: "fintwit",
    label: "FinTwit",
    product: "Charoof FinTwit",
    href: "/family#fintwit",
    placeholder: true,
    blurb: "A weekly book of market calls, graded in public.",
  },
  {
    id: "sports",
    label: NAV_LABEL,
    product: "Charoof Sports",
    href: "/",
    placeholder: false,
    blurb: "Public sports calls, graded after the contest.",
  },
] as const;

export type FamilyId = (typeof FAMILY)[number]["id"];

export const PRODUCT_LINKS = [
  { href: "/", label: "Board" },
  { href: "/methodology", label: "Methodology" },
] as const;

export const LEGAL_LINKS = [
  { href: "/methodology", label: "Methodology" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/terms", label: "Terms" },
  { href: "/donate", label: "Donate" },
] as const;
