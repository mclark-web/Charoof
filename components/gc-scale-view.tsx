"use client";

import { useState } from "react";
import Link from "next/link";
import { Ambient } from "@/components/ambient";
import { GcTube } from "@/components/gc-tube";
import { GRADE_BANDS } from "@/lib/grade";

const PRESETS = [0, 31, 54, 72, 88, 100];

const EXAMPLES = [
  { fill: 88, hint: "Direction held across 7D / 30D / 90D" },
  { fill: 54, hint: "Mixed horizons — still open on one leg" },
  { fill: 31, hint: "Mostly wrong vs print after horizons" },
  { fill: 0, hint: "0% fill · EXIT LIQUIDITY" },
];

function presetLabel(fill: number) {
  if (fill === 0) return "0% EXIT LIQUIDITY";
  if (fill === 31) return "31% Weak";
  if (fill === 54) return "54% Prov";
  if (fill === 72) return "72% Strong";
  if (fill === 88) return "88% Strong";
  return "100%";
}

export function GcScaleView() {
  const [fill, setFill] = useState(72);
  const [live, setLive] = useState(false);

  function jump(next: number) {
    setLive(false);
    setFill(next);
  }

  function animate() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      jump(72);
      return;
    }
    setLive(true);
    setFill(0);
    const start = performance.now();
    const dur = 1600;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - p) ** 3;
      setFill(Math.round(72 * eased));
      if (p < 1) requestAnimationFrame(tick);
      else setLive(false);
    };
    requestAnimationFrame(() => requestAnimationFrame(tick));
  }

  return (
    <>
      <Ambient />
      <section className="gc-hero">
        <div>
          <div className="chip">GC · Grade Calibration</div>
          <h1>
            Grade Calibration as a <em>neon tube</em>
          </h1>
          <p className="lead">
            GC measures how closely a call’s outcome matches its stated direction across horizons — calibrated,
            close-to-close, split-adjusted. Same liquid, two orientations: <strong>vertical vial</strong> (bottom →
            top) and <strong>horizontal tube</strong> (left → right).
          </p>
          <div className="gc-def">
            <div className="card">
              <div className="letter">G · GRADED</div>
              <h3>Graded</h3>
              <p>Every call is scored Strong, Weak, or Provisional against historical closes — never a stale print.</p>
            </div>
            <div className="card">
              <div className="letter">C · CALIBRATED</div>
              <h3>Calibrated</h3>
              <p>The liquid fill is the calibration score: how much of the thesis held under the method’s rules.</p>
            </div>
          </div>
          <div className="grades-note">
            <span>
              <strong>Strong</strong> ≥ {GRADE_BANDS.strongAt}%
            </span>
            <span>
              <strong>Provisional</strong> {GRADE_BANDS.weakAt}% until {GRADE_BANDS.strongAt}%
            </span>
            <span>
              <strong>Weak</strong> below {GRADE_BANDS.weakAt}%
            </span>
            <span>
              <strong>EXIT LIQUIDITY</strong> = 0% fill
            </span>
          </div>
        </div>
        <div className="hero-stage hero-dual">
          <div className="orient-pair">
            <div className="orient-col">
              <div className="orient-label">Vertical · bottom → top</div>
              <GcTube fill={fill} orientation="vertical" variant="hero" rich label="GC · Vertical" live={live} />
            </div>
            <div className="orient-col">
              <div className="orient-label">Horizontal · left → right</div>
              <GcTube fill={fill} variant="hero" rich label="GC · Horizontal" live={live} />
            </div>
          </div>
        </div>
      </section>

      <section className="orient-section panel">
        <h2>Vertical + horizontal</h2>
        <p className="sub">
          GC is Grade Calibration, in two readable forms. The vertical vial fills bottom → top; the horizontal tube fills
          left → right. Both use <code>--gc-fill</code>, the same neon bloom, and the same grade labels — including{" "}
          <strong>EXIT LIQUIDITY</strong> at 0%.
        </p>
        <div className="orient-grid">
          <div className="panel orient-panel">
            <div className="orient-label">Vertical vial</div>
            <GcTube fill={fill} orientation="vertical" rich label="GC" live={live} />
            <p className="hint">Lab vial · fill rises with calibration</p>
          </div>
          <div className="panel orient-panel">
            <div className="orient-label">Horizontal tube</div>
            <GcTube fill={fill} variant="card" rich label="GC" live={live} className="orient-wide" />
            <p className="hint">Board tube · fill reads left → right</p>
          </div>
        </div>
      </section>

      <section className="panel orient-section">
        <h2>Same rules on every board</h2>
        <p className="sub">
          STRONG is {GRADE_BANDS.strongAt}% and above. WEAK is below {GRADE_BANDS.weakAt}%. The fill from{" "}
          {GRADE_BANDS.weakAt}% until {GRADE_BANDS.strongAt}% is PROVISIONAL. 0% is empty glass and{" "}
          <strong>EXIT LIQUIDITY</strong>.
        </p>
        <p className="sub">
          On Sports, a single pick shows a result word — WIN, LOSS, PUSH, VOID, or PENDING — not a grade. A capper’s
          GC score is the win percentage over the last 7, 14, 30, and 90 days — labeled 1W, 2W, 1M, and 3M — weighted
          40 / 30 / 20 / 10. Pushes are excluded. A window with no decided picks is dropped and the remaining weights
          are renormalized. If every window is empty, the capper is PROVISIONAL and the card shows no score. Fewer than
          10 decided picks in the 90-day window stays PROVISIONAL and still shows the percentage, with the note
          “Provisional until 10 graded picks.” A sample of 10 or more uses the same cutoffs. The percentage is rounded
          only for display; 69.5 stays PROVISIONAL. Windows count back from today’s date in America/New_York. A card
          with a publish date and no clock time stays out of the capper score.
        </p>
      </section>

      <div className="section-label">Calibration examples</div>
      <div className="scale-row">
        {EXAMPLES.map((example) => (
          <div className="panel scale-card" key={example.fill}>
            <GcTube fill={example.fill} rich label="GC" />
            <p className="hint">{example.hint}</p>
          </div>
        ))}
      </div>

      <section className="panel demo-panel">
        <h2>Interactive demo</h2>
        <p className="sub">
          Drag the control or tap a preset. Tube fill is driven by <code>--gc-fill</code> — liquid width, bloom, swirl,
          and grade label update live. At 0% the glass is empty and the status is <strong>EXIT LIQUIDITY</strong>.
        </p>
        <div className="demo-controls">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className={preset === fill ? "gc-demo-btn is-active" : "gc-demo-btn"}
              aria-pressed={preset === fill}
              onClick={() => jump(preset)}
            >
              {presetLabel(preset)}
            </button>
          ))}
        </div>
        <div className="demo-live">
          <GcTube fill={fill} variant="hero" rich label="GC · Grade Calibration" live={live} />
          <div className="range-wrap">
            <label htmlFor="gcRange">Calibration fill</label>
            <input
              className="gc-range"
              id="gcRange"
              type="range"
              min={0}
              max={100}
              value={fill}
              step={1}
              onChange={(event) => {
                setLive(true);
                setFill(Number(event.target.value));
              }}
            />
            <div className="range-readout">
              --gc-fill: <strong>{fill}%</strong>
            </div>
            <p className="range-note">
              Bright neon orange (#eb6505) with bloom on charcoal — the liquid reads as emitting light, not a flat bar.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" type="button" onClick={animate}>
                Animate fill
              </button>
              <Link className="btn" href="/analysts">
                See on Analysts →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
