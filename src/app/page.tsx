import Link from "next/link";
import { CHAD, CHUD, FAMILY, GRADES_LINE, MARK, PRODUCT, UMBRELLA } from "@/lib/brand";

const STEPS = [
  {
    n: "01",
    title: "A public call",
    body: "The call names a contest, and it may name a side, a margin, or a total.",
  },
  {
    n: "02",
    title: "A recorded result",
    body: "The contest finishes. The grade uses the result that was recorded. An open contest stays blank.",
  },
  {
    n: "03",
    title: "The CH marks",
    body: `${CHAD.name} is ${CHAD.means}. ${CHUD.name} is ${CHUD.means}. The 0–100 score stays on the card.`,
  },
] as const;

export default function HomePage() {
  return (
    <div className="space-y-14">
      <section className="grid items-end gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-chad">
            {UMBRELLA} · {FAMILY.map((item) => item.label).join(" · ")}
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight text-ink md:text-6xl">
            Grade the call after the contest.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            {PRODUCT} is the sports vertical of {UMBRELLA}. A public call is graded when the contest result is on
            the record. {CHAD.name} is {CHAD.means}. {CHUD.name} is {CHUD.means}.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/methodology" className="rounded-full bg-field px-4 py-2 text-sm text-paint">
              How scoring works
            </Link>
            <Link href="/family" className="rounded-full border border-line bg-card px-4 py-2 text-sm text-ink">
              {UMBRELLA} verticals
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Fact kicker="Score" value="0–100" detail="Shown in full" />
          <Fact kicker="Badge" value="1–10" detail="Beside the score" />
          <Fact kicker={CHUD.name} value="Under 70" detail={CHUD.means} />
          <Fact kicker={CHAD.name} value="Top 30%" detail={CHAD.means} />
        </div>
      </section>

      <section aria-labelledby="board-title" className="panel overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 id="board-title" className="font-serif text-3xl text-ink">
              Board
            </h2>
            <p className="mt-1 text-sm text-muted">No contest results are loaded.</p>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{MARK} · {PRODUCT}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">Sports board with no recorded contest results</caption>
            <thead className="bg-field text-paper">
              <tr>
                {["Contest", "Call", "Recorded result", "Grade"].map((heading) => (
                  <th key={heading} scope="col" className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em]">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-5 py-10 text-muted">
                  The board stays blank until a finished contest has a recorded result. This build leaves that row empty.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="ch-title" className="grid gap-4 md:grid-cols-2">
        <article className="panel bg-chad-wash p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-chad">{MARK} · {CHAD.name}</p>
          <h2 id="ch-title" className="mt-2 font-serif text-3xl text-ink">
            {CHAD.means}
          </h2>
          <p className="mt-3 leading-relaxed text-ink/85">{CHAD.rule} Ties at the cutoff are included.</p>
        </article>
        <article className="panel bg-chud-wash p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-chud">{MARK} · {CHUD.name}</p>
          <h2 className="mt-2 font-serif text-3xl text-ink">{CHUD.means}</h2>
          <p className="mt-3 leading-relaxed text-ink/85">
            {CHUD.rule} {CHAD.name} and {CHUD.name} can both show. The score stays visible.
          </p>
        </article>
      </section>

      <section aria-labelledby="steps-title">
        <h2 id="steps-title" className="font-serif text-3xl text-ink">
          How a row becomes a grade
        </h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="panel p-5">
              <p className="font-mono text-xs text-muted">{step.n}</p>
              <h3 className="mt-2 font-serif text-2xl text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-sm text-muted">{GRADES_LINE} Reading the board is free.</p>
      </section>
    </div>
  );
}

function Fact({ kicker, value, detail }: { kicker: string; value: string; detail: string }) {
  return (
    <div className="panel p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{kicker}</p>
      <p className="mt-2 font-serif text-3xl text-ink">{value}</p>
      <p className="mt-1 text-sm text-muted">{detail}</p>
    </div>
  );
}
