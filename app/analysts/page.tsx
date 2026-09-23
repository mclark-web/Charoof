import type { Metadata } from "next";
import { SectorBoard } from "@/components/sector-board";
import { sectorByKey } from "@/lib/sectors";

export const metadata: Metadata = {
  title: "Analysts",
  description: "Street research graded against split-adjusted closes, with a horizontal Grade Calibration tube.",
};

export default function AnalystsPage() {
  return <SectorBoard sector={sectorByKey("analysts")} />;
}
