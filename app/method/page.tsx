import type { Metadata } from "next";
import { Ambient } from "@/components/ambient";
import { GradePill } from "@/components/gc-tube";
import { GRADE_BANDS } from "@/lib/grade";
import { PROVISIONAL_SAMPLE_NOTE } from "@/lib/recency";

export const metadata: Metadata = {
  title: "Method",
  description: "How GradedCalls freezes a public claim and scores Grade Calibration.",
};

export default function MethodPage() {
  return (
    <>
      <Ambient />
      <section className="gc-hero">
        <div>
          <div className="chip">Method</div>
          <h1>
            Same rules.
            <br />
            <em>No silent edits.</em>
          </h1>
          <p className="lead">
            A grade is a public claim, a locked entry, and an outcome you can check. GC Scale is Grade Calibration: how
            much of the stated direction held.
          </p>
        </div>
      </section>

      <div className="panel method">
        <div>
          <h2>How a call becomes a grade</h2>
          <p>Same rules on every board. No silent edits after lock. Misses stay on the record.</p>
        </div>
        <div className="step">
          <div className="n">01</div>
          <h4>Capture</h4>
          <p>Public claim, timestamp, source link, and the exact words.</p>
        </div>
        <div className="step">
          <div className="n">02</div>
          <h4>Freeze</h4>
          <p>Entry locks before the outcome window. No rewrite after the print.</p>
        </div>
        <div className="step">
          <div className="n">03</div>
          <h4>Grade</h4>
          <p>Compared to real closes, Monday opens, or final scores.</p>
        </div>
      </div>

      <section id="gc-scale">
        <div className="section-label">GC Scale</div>
        <p className="board-note">GC Scale grades how closely a call’s outcome matched its stated direction.</p>
        <ul className="grade-list">
          <li>
            <GradePill grade="strong" name="STRONG" /> {GRADE_BANDS.strongAt}% and above
          </li>
          <li>
            <GradePill grade="provisional" name="PROVISIONAL" /> {GRADE_BANDS.weakAt}% up to {GRADE_BANDS.strongAt}%
          </li>
          <li>
            <GradePill grade="weak" name="WEAK" /> under {GRADE_BANDS.weakAt}%
          </li>
          <li>
            graded 0% = <GradePill grade="exit" name="EXIT LIQUIDITY" /> with empty glass
          </li>
        </ul>
        <p className="board-note">An ungraded result reads Not graded yet.</p>
      </section>

      <div className="section-label">Sports</div>
      <div className="panel method">
        <div>
          <h2>Picks show a result. Cappers carry GC.</h2>
          <p>Same rules on every board. A single sports pick is a result, not a tube.</p>
        </div>
        <div className="step">
          <div className="n">01</div>
          <h4>Result</h4>
          <p>A result word is not a grade. The pick is WIN, LOSS, PUSH, VOID, or Pending. None of those fills a GC tube.</p>
        </div>
        <div className="step">
          <div className="n">02</div>
          <h4>Blend</h4>
          <p>
            A capper’s score is the win percentage over the last 7, 14, 30, and 90 days, labeled 1W, 2W, 1M, and 3M,
            weighted 40 / 30 / 20 / 10. Pushes stay out of the rate. A window with no decided picks is dropped and the
            remaining weights are renormalized.
          </p>
        </div>
        <div className="step">
          <div className="n">03</div>
          <h4>Grade</h4>
          <p>
            The blend uses the cutoffs above. If every window is empty, the card is PROVISIONAL and shows no score.{" "}
            {PROVISIONAL_SAMPLE_NOTE} The card still shows that percentage and the window records. Windows count back
            from today’s date in America/New_York, shown on the capper section as “as of” that date. A card whose
            source has a publish date but no clock time stays out of the capper score and record.
          </p>
        </div>
      </div>
    </>
  );
}
