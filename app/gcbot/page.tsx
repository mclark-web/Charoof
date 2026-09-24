import type { Metadata } from "next";
import { SectorBoard } from "@/components/sector-board";
import { sectorBook } from "@/lib/books";

export const metadata: Metadata = {
  title: "GCBot",
  description:
    "Fixture narratives from the GCBot corpus. Clone and amplifier scores stay on the live board.",
};

export default function GcBotPage() {
  return <SectorBoard book={sectorBook("gcbot")} />;
}
