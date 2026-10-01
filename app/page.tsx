import Link from "next/link";

export const revalidate = 300;
import { GcTube } from "@/components/gc-tube";
import { SectorBoard, SectorCard } from "@/components/sector-board";
import { sectorBooks } from "@/lib/books";

const EXAMPLE_STRONG = "Example: 72% with 10+ graded picks in 90 days";

export default function HubPage() {
  const books = sectorBooks();
  const sports = books.find((book) => book.sector.key === "sports");
  if (!sports) throw new Error("Missing sports book");
  const others = books.filter((book) => book.sector.key !== "sports");
  return (
    <>
      <section className="hero hero-solo">
        <div>
          <div className="chip">Public accountability board</div>
          <h1>
            Public claims.
            <br />
            <em>Graded</em> after the outcome.
          </h1>
          <p className="hero-lead">
            Sports picks are the record on this hub. We freeze what people said in public, then grade it against real
            prices, tape, and final scores.
          </p>
        </div>
      </section>

      <SectorBoard book={sports} />

      <div className="section-label" id="sectors">
        Sectors
      </div>
      <div className="sector-grid">
        {others.map((book) => (
          <SectorCard key={book.sector.key} book={book} />
        ))}
        <Link className="sector sector-copy" href="/method#gc-scale">
          <div className="kicker">Trust · Calibration</div>
          <h3>GC Scale</h3>
          <p>How the four grades work — same rules on every board.</p>
          <div className="foot">
            <span>STRONG · WEAK · PROVISIONAL · EXIT LIQUIDITY</span>
            <span className="go">GC Scale →</span>
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
          <p>Compared to real closes, Monday opens, or final scores and graded on the GC Scale.</p>
        </div>
      </div>

      <div className="panel method-gc">
        <div>
          <h2>GC Scale</h2>
          <p>
            GC Scale: how closely outcomes matched the call — STRONG, PROVISIONAL, WEAK, or EXIT LIQUIDITY.
          </p>
          <p className="method-link">
            <Link className="hit-44" href="/method#gc-scale">GC Scale →</Link>
          </p>
        </div>
        <div className="method-example">
          <GcTube fill={72} rich centered label="GC Scale" className="method-tube" />
          <p className="tube-example">{EXAMPLE_STRONG}</p>
        </div>
      </div>
    </>
  );
}
