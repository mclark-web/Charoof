import type { Metadata } from "next";

import { BranchView } from "@/components/branch-view";
import { getBranch } from "@/lib/branches";

const branch = getBranch("bot");

export const metadata: Metadata = {
  title: "Charoof Bot",
  description:
    "Charoof Bot scores clone speech and amplifiers by narrative volume. The live zero-cost demo is linked from this branch.",
};

export default function BotPage() {
  return <BranchView branch={branch} />;
}
