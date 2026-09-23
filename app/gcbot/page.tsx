import type { Metadata } from "next";
import { SectorBoard } from "@/components/sector-board";
import { sectorByKey } from "@/lib/sectors";

export const metadata: Metadata = {
  title: "GCBot",
  description:
    "GCBot scores clone speech and amplifiers by narrative volume. The zero-cost demo uses a synthetic corpus.",
};

export default function GcBotPage() {
  const sector = sectorByKey("gcbot");
  return (
    <>
      <SectorBoard sector={sector} />
      <section className="panel lane-note">
        <h2>Zero-cost demo</h2>
        <p>
          GCBot scores clone speech and amplifiers by narrative volume. Clone speech is the same wording posted as an
          original. Amplifiers boost a narrative without being the source. This surface does not call a paid social API
          and does not invent a live corpus.
        </p>
        <p className="dim">Demo rows above are fixtures. They show the tube, the sample size, and the EXIT LIQUIDITY empty state.</p>
      </section>
    </>
  );
}
