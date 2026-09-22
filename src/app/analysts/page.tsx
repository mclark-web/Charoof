import type { Metadata } from "next";

import { BranchView } from "@/components/branch-view";
import { getBranch } from "@/lib/branches";

const branch = getBranch("analysts");

export const metadata: Metadata = {
  title: "Analysts",
  description:
    "Charoof Analysts grades sell-side calls against the price that followed. The live ledger is linked from this branch.",
};

export default function AnalystsPage() {
  return <BranchView branch={branch} />;
}
