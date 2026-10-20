import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "GradedCalls is not investment or betting advice.",
};

export default function DisclaimerPage() {
  return (
    <section className="prose-panel panel">
      <h1>Disclaimer</h1>
      <p className="[text-wrap:pretty]">
        GradedCalls is not investment advice, not betting advice, and not a solicitation to trade or wager.
      </p>
      <p className="[text-wrap:pretty]">
        Hub card counts are a dated snapshot of each live board’s own ledger (as of Oct 20, 2026). Verified sports
        picks are public cards graded on recorded finals. The Analysts, FinTwit, and GCBot home cards show that
        snapshot, and the home cards link to the live ledgers. Demo rows are fiction, labeled Demo.
      </p>
      <p className="[text-wrap:pretty]">
        Sports does not use a paid odds API. A verified sports row is a public pick graded on an official result.
        Analyst calls are sourced from public analyst rating tables and news reports; GradedCalls is not affiliated with
        any analyst or firm. The FinTwit home card uses the live graded calls. GCBot posts are real public posts scored
        on the live board. This surface does not call a paid social API.
      </p>
    </section>
  );
}
