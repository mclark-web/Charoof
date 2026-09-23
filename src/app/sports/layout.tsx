import type { Metadata } from "next";

import { SportsBanner } from "@/components/sports-banner";

export const metadata: Metadata = {
  description:
    "Charoof Sports grades verified public picks against free finals. Fiction stays on the demo ledger. Not gambling advice.",
};

export default function SportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SportsBanner />
      {children}
    </>
  );
}
