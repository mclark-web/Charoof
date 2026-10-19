import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "GradedCalls is not investment or betting advice.",
};

export default function DisclaimerPage() {
  return (
    <section className="prose-panel panel">
      <h1>Disclaimer</h1>
      <p>GradedCalls is not investment advice, not betting advice, and not a solicitation to trade or wager.</p>
      <p>
        The hub counts are taken from the books on this site. Verified sports picks are public cards graded on recorded
        finals. The Analysts, FinTwit, and GCBot home cards use the live ledger counts, and the home cards link to the
        live ledgers. Demo rows are fiction, labeled Demo.
      </p>
      <p>
        Sports does not use a paid odds API. A verified sports row is a public pick graded on an official result.
        Analyst calls are sourced from public analyst rating and price-target tables; GradedCalls is not affiliated with
        any analyst or firm. The FinTwit home card uses the live graded calls. GCBot posts are real public posts scored
        on the live board. This surface does not call a paid social API or a paid odds API.
      </p>
    </section>
  );
}
