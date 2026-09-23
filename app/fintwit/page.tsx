import type { Metadata } from "next";
import { SectorBoard } from "@/components/sector-board";
import { sectorBook } from "@/lib/books";

export const metadata: Metadata = {
  title: "FinTwit",
  description:
    "Seeded weekend posts graded on the stored Monday open, with a link to the live FinTwit ledger.",
};

export default function FinTwitPage() {
  return <SectorBoard book={sectorBook("fintwit")} />;
}
