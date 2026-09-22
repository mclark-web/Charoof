import type { Metadata } from "next";

import {
  ACCURACY_ANCHOR,
  ACCURACY_ROI_SCALE,
  ACCURACY_WEIGHT,
  CHAD_FRACTION,
  CHUD_LINE,
  CLARITY_WEIGHT,
  DEMO_SEASON,
  DISCIPLINE_WEIGHT,
  LOCK_WEIGHT,
  MIN_GRADED,
  MIN_PEER_SET,
  PRIOR_SCORE,
  SAMPLE_PRIOR,
  STAKE_CV_PENALTY,
  STAKE_WEIGHT,
} from "@/lib/constants";
import { feedNotice, getResultsAdapter } from "@/lib/feeds";
import { formatDial, formatNumber, formatRoi, formatUnits } from "@/lib/format";
import { scorePicks } from "@/lib/scoring";

export const metadata: Metadata = {
  title: "Sports methodology",
  description:
    "How Charoof scores CH, the Charoof factor, and when a ledger earns Chad or sits in Chud territory.",
};

const worked = scorePicks(
  Array.from({ length: 20 }, (_, index) => ({
    grade: index < 12 ? ("win" as const) : ("loss" as const),
    units: 1,
    oddsAmerican: -110,
    locked: true,
    explicit: true,
  })),
);

export default function MethodologyPage() {
  const adapter = getResultsAdapter();

  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.18em] text-brass">Methodology</p>
      <h1 className="mt-2 font-serif text-5xl text-pine">How a ledger becomes a factor</h1>
      <p className="mt-4 text-lg leading-8 text-ink-soft">
        Charoof is an accountability board. It grades a posted pick against a recorded final, then rolls
        those grades into CH, the Charoof factor. The dial is that score in tenths. Chad is Accuracy &amp;
        Discipline. Chud is Uncertainty &amp; Doubt.
      </p>

      <Section title="Lexicon">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-ink">CH</strong> is the Charoof factor, from 0 to 100. A 74
            reads as <strong className="font-medium text-ink">7.4</strong> on the 1–10 scale and as{" "}
            <strong className="font-medium text-ink">74/100</strong>.
          </li>
          <li>
            <strong className="font-medium text-ink">Chad</strong> is the good end: Accuracy &amp; Discipline.
            A ledger earns it by clearing {CHUD_LINE}/100 and landing in the top {Math.round(CHAD_FRACTION * 100)}%
            of eligible peers.
          </li>
          <li>
            <strong className="font-medium text-ink">Chud</strong> is the bad end: Uncertainty &amp; Doubt.
            Under {CHUD_LINE}/100 is Chud territory. Rank does not grant a way out.
          </li>
          <li>
            <strong className="font-medium text-ink">Listed</strong> means the factor is {CHUD_LINE} or higher
            and the ledger is outside that top share, or the scope does not have enough peers to award Chad.
          </li>
          <li>
            <strong className="font-medium text-ink">Provisional</strong> means the factor is {CHUD_LINE} or
            higher and the sample has fewer than {MIN_GRADED} settled picks. It cannot earn Chad yet.
          </li>
        </ul>
      </Section>

      <Section title="When a pick settles">
        <p>
          The primary grade is the game final. A win, loss, or push is fixed then. A push returns the stake
          and still counts as risked. A voided fixture is ignored. An open fixture stays pending, with no
          score and no invented result.
        </p>
        <p>
          Season-to-date is a rollup, not a second settlement. On this demo, that window is {DEMO_SEASON}. The
          full ledger keeps the prior sample year as well.
        </p>
        <p>
          Charoof grades the number that was posted. This demo does not claim a closing line. A pick published
          after the listed start still settles. The timestamp lowers Discipline. It does not erase the result.
          A lean still settles when a number was recorded, and it lowers the clarity score.
        </p>
      </Section>

      <Section title="The formula">
        <p>Accuracy starts at {ACCURACY_ANCHOR} when ROI is zero. Each full unit of ROI moves it by {ACCURACY_ROI_SCALE}, so a 10% ROI is {ACCURACY_ANCHOR + ACCURACY_ROI_SCALE * 0.1}.</p>
        <Formula>Accuracy = clamp({ACCURACY_ANCHOR} + ROI × {ACCURACY_ROI_SCALE}, 0, 100)</Formula>
        <p>
          Discipline mixes three habits. The stake score is 100 when every pick is the same size, and it falls
          by {STAKE_CV_PENALTY} times the coefficient of variation. The lock score is the share posted before
          the listed start. The clarity score is the share posted as an explicit number rather than a lean.
        </p>
        <Formula>
          Discipline = {STAKE_WEIGHT.toFixed(2)}×stake + {LOCK_WEIGHT.toFixed(2)}×lock + {CLARITY_WEIGHT.toFixed(2)}×clarity
        </Formula>
        <Formula>
          Raw = {ACCURACY_WEIGHT.toFixed(2)}×Accuracy + {DISCIPLINE_WEIGHT.toFixed(2)}×Discipline
        </Formula>
        <p>
          The sample prior is {SAMPLE_PRIOR} phantom picks scored at {PRIOR_SCORE}. A short card is mostly that
          prior, which is the Uncertainty &amp; Doubt end of the scale. A long card keeps most of the raw
          score, which is how Accuracy &amp; Discipline can become Chad.
        </p>
        <Formula>Weight = graded / (graded + {SAMPLE_PRIOR})</Formula>
        <Formula>
          CH = round(weight × raw + (1 − weight) × {PRIOR_SCORE})
        </Formula>
        <p>The dial is CH divided by 10, shown to one decimal. The Chud line is {CHUD_LINE / 10} on that dial and {CHUD_LINE}/100 on the factor.</p>
      </Section>

      <Section title="Worked example">
        <p>
          Twelve wins and eight losses, one unit, −110, every pick explicit and posted before the start. These
          figures come from the same function the board uses.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Net units {formatUnits(worked.netUnits)}</li>
          <li>ROI {formatRoi(worked.roi)}</li>
          <li>Accuracy {formatNumber(worked.accuracy)}</li>
          <li>Discipline {formatNumber(worked.discipline)}</li>
          <li>Raw {formatNumber(worked.raw)}</li>
          <li>Sample weight {formatNumber((worked.shrink ?? 0) * 100, 0)}%</li>
          <li>
            CH {worked.ch}/100 · dial {formatDial(worked.ch)}
          </li>
        </ul>
        <p>
          That factor is only the score. Chad still depends on the peer window. A perfect six-pick card stays
          near the prior and does not escape Chud territory on sample size alone.
        </p>
      </Section>

      <Section title="Peers">
        <p>
          Eligible peers have at least {MIN_GRADED} settled picks in the scope you are viewing: all sports, one
          sport, the full ledger, or {DEMO_SEASON}. The Chad window is the top {Math.round(CHAD_FRACTION * 100)}%
          of that set, rounded up, and only when the set has at least {MIN_PEER_SET} peers. Ties at the cutoff
          stay inside the window. Anyone in the window under {CHUD_LINE} remains Chud. Anyone at or above{" "}
          {CHUD_LINE} outside the window is Listed.
        </p>
        <p>
          A capper can be Chad in the sport they actually play and Listed on the all-sport board, because the
          peers change. Sort order is the factor. The mark is not the sort. Provisional rows are shown and are
          not peers.
        </p>
      </Section>

      <Section title="Where the results come from">
        <p>
          Active adapter: {adapter.label} ({adapter.id}, mode {adapter.mode}). {feedNotice(adapter)}
        </p>
        <p>
          A future feed implements the same contract: return verified finals, or return nothing. An empty
          response is not permission to guess. Paid tip sheets are not a source. Charoof does not scrape them.
        </p>
        <p>
          Set <code className="bg-paper-2 px-1">RESULTS_FEED=live</code> only when a real adapter is wired.
          Until then the live path returns no finals, and the demo ledger keeps its demo label.
        </p>
      </Section>

      <Section title="What this is not">
        <p>
          Not gambling advice. Not a prediction that the next card resembles the last one. Not a sportsbook,
          and not affiliated with any league or sportsbook. Donations, if they are ever processed, do not buy
          a pick. The clubs, finals, and cappers on this site are a labeled demo.
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 space-y-3 text-base leading-7 text-ink-soft">
      <h2 className="font-serif text-3xl text-pine">{title}</h2>
      {children}
    </section>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return <p className="border border-line bg-card px-4 py-3 font-mono text-sm text-ink">{children}</p>;
}
