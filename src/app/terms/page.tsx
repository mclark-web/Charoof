import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description: "Draft terms for Charoof, an accountability ledger. Not gambling advice.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.18em] text-brass">Terms</p>
      <h1 className="mt-2 font-serif text-5xl text-pine">Terms of use</h1>
      <p className="mt-4 rounded-sm border border-brass/40 bg-listed-soft px-4 py-3 text-sm leading-6 text-ink">
        Draft for legal review. These terms are a product stub so the demo can ship with the right posture.
        They are not a completed agreement.
      </p>
      <div className="mt-8 space-y-8 text-base leading-7 text-ink-soft">
        <Section title="The service">
          Charoof publishes an accountability ledger for sports prediction accounts. The current release is a
          labeled demo: fictional cappers, sample clubs, and invented finals. Using the site means you
          understand that frame.
        </Section>
        <Section title="Not advice">
          Nothing on Charoof is gambling, financial, or betting advice. Scores describe a past sample. They
          are not a recommendation to place, continue, or avoid any wager. Past results do not predict future
          results.
        </Section>
        <Section title="No wagering, donations only">
          Charoof does not accept bets and does not sell picks. Any future payment flow is a donation in
          support of the ledger. A donation does not buy a selection, a mark, or access to a hidden card. The
          demo donation form does not process payments.
        </Section>
        <Section title="Demo data and future feeds">
          Demo scores stay labeled as demo scores. A live result may be shown only when it comes from a
          verified feed. Charoof will not invent a final, and it will not scrape paid tip sites to fill the
          board. If you later submit a public pick, it must be your own public record, posted with a market
          and a number that can be graded at the final.
        </Section>
        <Section title="No affiliation">
          Charoof is not affiliated with, endorsed by, or sponsored by any league, team, conference, players
          association, or sportsbook. Sample club names are fictional.
        </Section>
        <Section title="Age">
          Charoof is for adults 18 and older. It is not directed at minors. If you are under 18, do not use
          the site.
        </Section>
        <Section title="Marks">
          Charoof, CH, Chad, and Chud are used here as the product lexicon for the factor and its two ends.
          Chad means Accuracy &amp; Discipline. Chud means Uncertainty &amp; Doubt. The words describe a
          score on this ledger. They are not a personal judgment beyond that score.
        </Section>
        <Section title="Warranty">
          The demo is provided as-is. Finals in the seed are invented on purpose and must not be reused as
          real results. Scoring rules can change; the methodology page is the current description. To the
          extent the law allows, Charoof disclaims warranties of accuracy, fitness, and uninterrupted access.
        </Section>
        <Section title="Contact">
          Questions about this draft can be sent to ledger@charoof.example. That address is a placeholder.
          Also read the <Link href="/disclaimer" className="underline underline-offset-4">disclaimer</Link>.
        </Section>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-serif text-3xl text-pine">{title}</h2>
      <p>{children}</p>
    </section>
  );
}
