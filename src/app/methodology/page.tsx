import type { Metadata } from "next";
import Link from "next/link";
import { CHAD, CHUD, GRADES_LINE, MARK, PRODUCT, UMBRELLA } from "@/lib/brand";
import { CHAD_TOP_SHARE, CHUD_BELOW } from "@/lib/scoring";

export const metadata: Metadata = {
  title: "Methodology",
  description: `${PRODUCT} shows a 0–100 score, a 1–10 badge, and the ${MARK} marks. ${CHAD.name} is ${CHAD.means}. ${CHUD.name} is ${CHUD.means}.`,
};

export default function MethodologyPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-chad">{PRODUCT}</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight text-ink md:text-5xl">Methodology</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        {PRODUCT} grades a public sports call after the contest. The number on the card comes from a recorded
        result. This page states the marks. It does not fill in a contest.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="font-serif text-3xl text-ink">What a card shows</h2>
        <ul className="space-y-3 text-[15px] leading-7">
          <li>The full score, from 0 to 100.</li>
          <li>A badge from 1 to 10. Scores from 0 to 9 map to 1. Scores from 90 to 100 map to 10.</li>
          <li>
            <strong>{CHAD.name}</strong> means {CHAD.means}. {CHAD.rule} The cutoff is the top{" "}
            {Math.round(CHAD_TOP_SHARE * 100)}% of the peer set, and ties on that score are included.
          </li>
          <li>
            <strong>{CHUD.name}</strong> means {CHUD.means}. {CHUD.rule} The line is {CHUD_BELOW}.
          </li>
        </ul>
        <p className="text-[15px] leading-7">
          {CHAD.name} and {CHUD.name} can both appear on one grade. A call can sit in the top 30% and still be under{" "}
          {CHUD_BELOW}. The score stays visible either way.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-serif text-3xl text-ink">When a row is graded</h2>
        <p className="text-[15px] leading-7">
          The peer set is the calls on the same slate. A row is graded when that contest has a recorded result: the
          recorded winner, and the recorded margin or total when the call stated one. A missing result stays open.
          {` `}
          {MARK} marks are withheld on an open row.
        </p>
        <p className="text-[15px] leading-7">
          The rules live in <code className="font-mono text-sm">src/lib/scoring.ts</code>. They apply to a score that
          already exists. They do not create a contest result.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-serif text-3xl text-ink">{UMBRELLA}</h2>
        <p className="text-[15px] leading-7">
          {PRODUCT} is one vertical of {UMBRELLA}, beside Charoof Analysts and Charoof FinTwit. The same {MARK} language
          is the public standard: {CHAD.name} is {CHAD.means}, and {CHUD.name} is {CHUD.means}.
        </p>
        <p className="text-[15px] leading-7">
          {GRADES_LINE}{" "}
          <Link href="/donate" className="text-field underline-offset-4 hover:underline">
            Donate
          </Link>{" "}
          states that a gift does not buy a mark.
        </p>
      </section>
    </article>
  );
}
