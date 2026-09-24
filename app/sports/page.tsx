import type { Metadata } from "next";
import { SectorBoard } from "@/components/sector-board";
import { sectorBook } from "@/lib/books";

export const metadata: Metadata = {
  title: "Sports",
  description:
    "Verified public free picks and the Fri Sep 18 archive, graded on official finals. Demo fiction stays labeled Demo.",
};

export default function SportsPage() {
  return <SectorBoard book={sectorBook("sports")} />;
}
