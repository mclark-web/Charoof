import type { Metadata } from "next";
import { SectorBoard } from "@/components/sector-board";
import { sectorBook } from "@/lib/books";

export const metadata: Metadata = {
  title: "Analysts",
  description:
    "Seeded analyst roster from the Analysts ledger, with a link to the live board that grades sample calls on split-adjusted closes.",
};

export default function AnalystsPage() {
  return <SectorBoard book={sectorBook("analysts")} />;
}
