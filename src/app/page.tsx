import Link from "next/link";

import { BRANCHES, type Branch } from "@/lib/branches";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-5 py-12">
      <section className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.18em] text-brass">Charoof</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight text-pine sm:text-6xl">
          Measure the claim after the outcome.
        </h1>
        <p className="mt-5 font-serif text-2xl italic leading-snug text-ink">
          Accountability in an age of market FOMO, prediction craze, and loud anonymous voices.
        </p>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-soft">
          Charoof is a public record with four branches. A claim is scored when a result exists: a price, a
          print, or a final. CH, the Charoof factor, runs from Chud — uncertainty and doubt — to Chad —
          accuracy and discipline. Under 70/100 stays Chud. The top of an eligible peer set, and only at 70
          or better, is Chad.
        </p>
      </section>

      <section aria-label="Branches" className="grid gap-px border border-line bg-line md:grid-cols-2">
        {BRANCHES.map((branch) => (
          <BranchCard key={branch.id} branch={branch} />
        ))}
      </section>

      <section className="grid gap-8 border border-line bg-card px-5 py-6 md:grid-cols-[0.8fr_1.2fr] md:items-start">
        <div>
          <h2 className="font-serif text-3xl text-pine">One scale, four instruments</h2>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            The parent is Charoof. Each branch grades a different kind of public claim with the same factor.
          </p>
        </div>
        <ol className="divide-y divide-line">
          {BRANCHES.map((branch) => (
            <li key={branch.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
              <span className="font-score text-lg text-pine">{branch.index}</span>
              <p className="text-sm leading-6">
                <Link href={branch.href} className="text-ink underline decoration-line underline-offset-4 hover:decoration-pine">
                  {branch.title}
                </Link>
                <span className="mt-1 block text-ink-soft">{branch.measures}</span>
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function BranchCard({ branch }: { branch: Branch }) {
  const external = branch.cardHref.startsWith("http");
  const className = "flex flex-col gap-3 bg-card px-5 py-6 hover:bg-paper";
  const body = (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-score text-sm tracking-[0.16em] text-brass">{branch.index}</span>
        <span className="text-xs uppercase tracking-[0.14em] text-ink-soft">{branch.status}</span>
      </div>
      <h2 className="font-serif text-4xl text-pine">{branch.title}</h2>
      <p className="text-sm leading-6 text-ink-soft">{branch.summary}</p>
      <p className="mt-auto text-xs uppercase tracking-[0.14em] text-ink">Measures · {branch.measures}</p>
    </>
  );

  if (external) {
    return (
      <a href={branch.cardHref} className={className} rel="noopener noreferrer">
        {body}
      </a>
    );
  }

  return (
    <Link href={branch.cardHref} className={className}>
      {body}
    </Link>
  );
}
