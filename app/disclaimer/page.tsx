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
        finals. Analyst, FinTwit, and GCBot previews are the seeded or fixture books from those earlier boards, and each
        page links to the live ledger for the full interactive view. Demo rows are fiction and are labeled Demo.
      </p>
      <p>
        Sports does not use a paid odds API. A verified sports row is a public pick graded on an official result.
        Analyst names in the seeded roster are fictional sample desks. FinTwit handles are fictional. GCBot posts are a
        synthetic corpus. This surface does not call a paid social API or a paid odds API.
      </p>
    </section>
  );
}
