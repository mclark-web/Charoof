import type { Metadata } from "next";

import { DemoBanner } from "@/components/demo-banner";

export const metadata: Metadata = {
  description:
    "Charoof Sports grades public sports picks against final scores. CH is the Charoof factor. Demo ledger. Not gambling advice.",
};

export default function SportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoBanner />
      {children}
    </>
  );
}
