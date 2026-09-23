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
        Hub figures such as the call count and the strong / weak mix are an illustrative snapshot of the board frame.
        Sector cards and demo rows are calibration fixtures so the tube and the four grade labels can be read. They are
        not live analyst, social, or sports records.
      </p>
      <p>
        Sports does not use a paid odds API. A verified sports row, when one exists, is a public pick graded on an
        official result. Demo rows are fiction. GCBot rows are calibration fixtures for narrative volume. This surface
        does not call a paid social API.
      </p>
    </section>
  );
}
