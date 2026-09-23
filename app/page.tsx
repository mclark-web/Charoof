import Link from "next/link";
import { GcTube } from "@/components/gc-tube";
import { SectorCard } from "@/components/sector-board";
import { GRADE_BANDS } from "@/lib/grade";
import { sectors } from "@/lib/sectors";

export default function HubPage() {
  return (
    <>
      <section className="hero">
        <div>
          <div className="chip">Public accountability board</div>
          <h1>
            Public claims.
            <br />
            <em>Graded</em> after the outcome.
          </h1>
          <p className="hero-lead">
            We freeze what people said in public, then grade it against real prices, tape, and final scores — so you
            can trust a record, not a highlight reel.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/#sectors">
              Open the boards
            </Link>
            <Link className="btn" href="/method">
              How grading works
            </Link>
          </div>
          <div className="trust-row">
            <span>
              <strong>No paid odds APIs</strong> on Sports
            </span>
            <span>
              <strong>Split-adjusted</strong> prices on Analysts
            </span>
            <span>
              <strong>Monday-open</strong> tape on FinTwit
            </span>
            <span>
              <strong>Sample size</strong> shown on every profile
            </span>
          </div>
          <p className="byline">Built for accountability in an age of market FOMO, prediction craze, and loud anonymous voices.</p>
        </div>
        <div className="stat-grid">
          <div className="stat">
            <div className="label">Calls graded</div>
            <div className="value">12,480</div>
            <div className="hint">Illustrative snapshot · across all sectors</div>
          </div>
          <div className="stat">
            <div className="label">Avg horizon</div>
            <div className="value">
              30<span className="unit">d</span>
            </div>
            <div className="hint">2W · 30D · 60D · 90D · 1Y</div>
          </div>
          <div className="stat">
            <div className="label">Strong / Weak</div>
            <div className="value value-split">
              <span className="ok">41%</span> <span className="dim">/</span> <span className="bad">37%</span>
            </div>
            <div className="hint">Illustrative mix · rest provisional</div>
          </div>
          <div className="stat">
            <div className="label">Sources</div>
            <div className="value value-sm">Public only</div>
            <div className="hint">No private tip sheets</div>
          </div>
        </div>
      </section>

      <div className="section-label" id="sectors">
        Sectors
      </div>
      <div className="sector-grid">
        {sectors.map((sector) => (
          <SectorCard key={sector.key} sector={sector} />
        ))}
        <Link className="sector" href="/gc-scale">
          <div className="kicker">Trust · Calibration</div>
          <h3>GC Scale</h3>
          <p>How Strong, Weak, Provisional, and exit liquidity map onto the laboratory tube — same rules on every board.</p>
          <div className="gc-slot">
            <GcTube fill={72} variant="mini" label="GC" metaInline className="is-card" />
          </div>
          <div className="foot">
            <span>Method · Labels · Fill</span>
            <span className="go">Explore scale →</span>
          </div>
        </Link>
      </div>

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
          <p>
            Compared to real closes, Monday opens, or final scores — labeled Strong, Weak, or Provisional. {GRADE_BANDS.strongAt}%
            and above is Strong. {GRADE_BANDS.weakAt}% and below is Weak.
          </p>
        </div>
      </div>

      <div className="panel method-gc">
        <div>
          <h2>GC · Grade Calibration</h2>
          <p>
            The horizontal tube fill is the calibration score — how closely outcomes matched the stated direction.
            Strong, Weak, or Provisional. Empty glass at 0% is EXIT LIQUIDITY.
          </p>
          <p className="method-link">
            <Link href="/gc-scale">Explore the GC scale →</Link>
          </p>
        </div>
        <GcTube fill={72} rich centered label="GC · Grade Calibration" className="method-tube" />
      </div>
    </>
  );
}
