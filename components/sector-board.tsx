import Link from "next/link";
import { GcTube } from "@/components/gc-tube";
import type { Sector } from "@/lib/sectors";

export function SectorCard({ sector }: { sector: Sector }) {
  return (
    <Link className="sector" href={sector.href}>
      <div className="kicker">{sector.kicker}</div>
      <h3>{sector.title}</h3>
      <p>{sector.summary}</p>
      <div className="gc-slot">
        <GcTube fill={sector.exampleFill} variant="mini" label="GC" metaInline className="is-card" />
      </div>
      <div className="foot">
        <span>{sector.foot}</span>
        <span className="go">Open board →</span>
      </div>
    </Link>
  );
}

export function SectorBoard({ sector }: { sector: Sector }) {
  return (
    <>
      <section className="board-hero">
        <div>
          <div className="chip">{sector.kicker}</div>
          <h1>{sector.title}</h1>
          <p className="hero-lead">{sector.summary}</p>
          <ul className="trust-list">
            {sector.trust.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="board-tube">
          <GcTube fill={sector.exampleFill} variant="hero" rich label="GC · Grade Calibration" />
          <p className="hint">Illustrative sector calibration from the hub. Demo rows below are fixtures, not a live book.</p>
        </div>
      </section>

      <div className="section-label">Calibration fixtures</div>
      <div className="panel table-scroll">
        <table className="board-table">
          <thead>
            <tr>
              <th>Call</th>
              <th>Lane</th>
              <th>Sample</th>
              <th>GC</th>
            </tr>
          </thead>
          <tbody>
            {sector.fixtures.map((row) => (
                <tr key={row.id}>
                  <td data-label="Call">
                    <div>{row.title}</div>
                    <div className="dim">{row.detail}</div>
                  </td>
                  <td className="mono" data-label="Lane">{row.lane}</td>
                  <td className="mono" data-label="Sample">{row.sample}</td>
                  <td className="tube-cell" data-label="GC">
                    <GcTube fill={row.fill} variant="inline" label="GC" />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
