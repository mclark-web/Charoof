import type { Metadata } from "next";
import { SectorBoard } from "@/components/sector-board";
import { sectorByKey } from "@/lib/sectors";

export const metadata: Metadata = {
  title: "FinTwit",
  description: "Public market calls graded against the next session’s tape, with a horizontal Grade Calibration tube.",
};

export default function FinTwitPage() {
  return <SectorBoard sector={sectorByKey("fintwit")} />;
}
