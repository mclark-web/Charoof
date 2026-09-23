import type { Metadata } from "next";

import { BranchView } from "@/components/branch-view";
import { getBranch } from "@/lib/branches";

const branch = getBranch("fintwit");

export const metadata: Metadata = {
  title: "FinTwit",
  description:
    "Charoof FinTwit grades weekend crash and melt-up posts against later prints. The live ledger is linked from this branch.",
};

export default function FinTwitPage() {
  return <BranchView branch={branch} />;
}
