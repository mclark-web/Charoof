import type { Metadata } from "next";
import { SectorBoard } from "@/components/sector-board";
import { sectorByKey } from "@/lib/sectors";

export const metadata: Metadata = {
  title: "Sports",
  description: "Public free picks graded on official results. No paid odds APIs. Fiction stays on the Demo lane.",
};

export default function SportsPage() {
  const sector = sectorByKey("sports");
  return (
    <>
      <SectorBoard sector={sector} />
      <section className="panel lane-note">
        <h2>Verified lane</h2>
        <p>
          Public free picks freeze at post time and grade against official final scores. This surface does not call a
          paid odds API. No verified slate is locked in this build, so the lane stays empty rather than inventing a
          record.
        </p>
        <p className="dim">Demo rows above are fiction. They show the tube, the sample size, and the EXIT LIQUIDITY empty state.</p>
      </section>
    </>
  );
}
