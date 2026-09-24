import type { Metadata } from "next";
import { Ambient } from "@/components/ambient";
import { GcTube } from "@/components/gc-tube";
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
            A grade is a public claim, a locked entry, and an outcome you can check. GC is Grade Calibration: the tube
            fill is how much of the stated direction held.
          </p>
        </div>
        <div className="hero-stage hero-dual">
          <div className="orient-pair">
            <div className="orient-col">
              <div className="orient-label">Vertical vial</div>
              <GcTube fill={72} orientation="vertical" variant="hero" rich label="GC · Method" />
            </div>
            <div className="orient-col">
              <div className="orient-label">Horizontal tube</div>
              <GcTube fill={0} variant="hero" label="GC · Empty" />
            </div>
          </div>
        </div>
      </section>

      <div className="panel method">
        <div>
          <h2>How a call becomes a grade</h2>
          <p>Boards use the horizontal tube. The vertical vial is the lab view on this page and on GC Scale.</p>
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

      <div className="section-label">Labels</div>
      <div className="scale-row">
        <div className="panel scale-card">
          <GcTube fill={GRADE_BANDS.strongAt} label="GC" />
          <p className="hint">STRONG at {GRADE_BANDS.strongAt}% and above</p>
        </div>
        <div className="panel scale-card">
          <GcTube fill={GRADE_BANDS.weakAt} label="GC" />
          <p className="hint">PROVISIONAL from {GRADE_BANDS.weakAt}% until {GRADE_BANDS.strongAt}%</p>
        </div>
        <div className="panel scale-card">
          <GcTube fill={GRADE_BANDS.weakAt - 1} label="GC" />
          <p className="hint">WEAK below {GRADE_BANDS.weakAt}%</p>
        </div>
        <div className="panel scale-card">
          <GcTube fill={0} label="GC" />
          <p className="hint">0% fill is empty glass · EXIT LIQUIDITY</p>
        </div>
      </div>

      <div className="section-label">Sports</div>
      <div className="panel method">
        <div>
          <h2>Picks show a result. Cappers carry GC.</h2>
          <p>Same rules on every board. A single sports pick is a result, not a tube.</p>
        </div>
        <div className="step">
          <div className="n">01</div>
          <h4>Result</h4>
          <p>A result word is not a grade. The pick is WIN, LOSS, PUSH, VOID, or PENDING. None of those fills a GC tube.</p>
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
            The blend uses the cutoffs above. If every window is empty, the card is PROVISIONAL and shows no score.
            {PROVISIONAL_SAMPLE_NOTE} The card still shows that percentage and the window records. Windows count back
            from today’s date in America/New_York, shown on the capper
            section as “as of” that date. A card whose source has a publish date but no clock time stays out of the
            capper score and record.
          </p>
        </div>
      </div>
    </>
  );
}
