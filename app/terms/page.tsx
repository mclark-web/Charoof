import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for the GradedCalls demo.",
};

export default function TermsPage() {
  return (
    <section className="prose-panel panel">
      <h1>Terms</h1>
      <p>
        This is a donation-supported demo of the GradedCalls visual system and Grade Calibration labels. Grades describe
        a public record under the published method. They are not a promise of future results.
      </p>
      <p>Do not copy a fixture onto a real book. Misses stay visible when a live record is connected. Silent edits after lock are out of bounds.</p>
    </section>
  );
}
