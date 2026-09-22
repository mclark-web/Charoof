import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sports disclaimer",
  description: "Charoof is an accountability demo, not gambling advice and not a sportsbook.",
};

export default function DisclaimerPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.18em] text-brass">Disclaimer</p>
      <h1 className="mt-2 font-serif text-5xl text-pine">Read this before the board</h1>
      <p className="mt-4 rounded-sm border border-brass/40 bg-listed-soft px-4 py-3 text-sm leading-6 text-ink">
        Draft for legal review. This page is a product stub, not a finished legal opinion.
      </p>
      <div className="mt-8 space-y-4 text-base leading-7 text-ink-soft">
        <p>
          Charoof is an entertainment and accountability ledger. It grades posted picks against recorded
          finals so a public record can be read in one place. It is not gambling advice, not a solicitation
          to wager, and not a promise that any past card will repeat.
        </p>
        <p>
          Past results do not predict future results. A high Charoof factor is a description of a settled
          sample. It is not an instruction to tail the next pick.
        </p>
        <p>
          The cappers, clubs, lines, and finals on this demo are fictional. They are labeled as demo seed
          data. They are not live scores and they are not historical results. If a live feed is not
          configured, Charoof will not invent one.
        </p>
        <p>
          Charoof is not a sportsbook and is not affiliated with any league, team, conference, or sportsbook.
          Names of sample clubs are invented for the demo.
        </p>
        <p>
          Charoof does not take wagers. Support, if any, is donation-only and does not purchase a pick, a
          badge, or a place on the board. See the <Link href="/sports/donate" className="underline underline-offset-4">donation page</Link>.
        </p>
        <p>Charoof is for adults 18 and older. It is not directed at minors.</p>
        <p>
          The scoring rules are published on the <Link href="/sports/methodology" className="underline underline-offset-4">methodology</Link> page.
          The <Link href="/sports/terms" className="underline underline-offset-4">terms</Link> are also a draft for legal review.
        </p>
      </div>
    </article>
  );
}
