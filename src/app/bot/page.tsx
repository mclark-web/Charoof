import type { Metadata } from "next";

import { BranchView } from "@/components/branch-view";
import { getBranch } from "@/lib/branches";

const branch = getBranch("bot");

export const metadata: Metadata = {
  title: "Charoof Bot",
  description:
    "Charoof Bot is the conversational branch. The repository is public. A live demo is not deployed.",
};

export default function BotPage() {
  return <BranchView branch={branch} />;
}
