import type { Metadata } from "next";
import { SectorBoard } from "@/components/sector-board";
import { sectorBook } from "@/lib/books";
import { SPORTS_URL } from "@/lib/site-urls";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Sports",
  description:
    "Verified public free picks and the Fri Sep 18 archive, graded on official finals. Demo fiction stays labeled Demo.",
  alternates: {
    canonical: SPORTS_URL,
  },
};

export default function SportsPage() {
  return <SectorBoard book={sectorBook("sports")} />;
}
