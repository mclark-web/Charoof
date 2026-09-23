import Link from "next/link";

import type { Branch } from "@/lib/branches";

export function BranchView({ branch }: { branch: Branch }) {
  const destination = branch.externalHref ?? branch.href;

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-12">
      <header>
        <p className="font-score text-sm tracking-[0.18em] text-brass">
          {branch.index} / 04 · {branch.status}
        </p>
        <h1 className="mt-3 font-serif text-5xl text-pine">{branch.title}</h1>
        <p className="mt-4 text-lg leading-8 text-ink-soft">{branch.summary}</p>
      </header>

      <dl className="grid gap-px border border-line bg-line sm:grid-cols-2">
        <div className="bg-card px-4 py-4">
          <dt className="text-xs uppercase tracking-[0.14em] text-ink-soft">Measures</dt>
          <dd className="mt-2 text-base leading-6 text-ink">{branch.measures}</dd>
        </div>
        <div className="bg-card px-4 py-4">
          <dt className="text-xs uppercase tracking-[0.14em] text-ink-soft">Where it lives</dt>
          <dd className="mt-2 break-all text-base leading-6 text-ink">
            {branch.externalHref ? branch.externalHref.replace(/^https:\/\//, "") : "This site, under /sports"}
          </dd>
        </div>
      </dl>

      <p className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <a
          href={destination}
          className="inline-flex bg-pine px-4 py-2 text-sm text-paper hover:bg-ink"
          {...(branch.externalHref ? { rel: "noopener noreferrer" } : {})}
        >
          {branch.externalLabel}
        </a>
        {branch.secondaryHref && branch.secondaryLabel ? (
          <a
            href={branch.secondaryHref}
            className="text-sm underline decoration-line underline-offset-4 hover:decoration-pine"
            rel="noopener noreferrer"
          >
            {branch.secondaryLabel}
          </a>
        ) : null}
      </p>

      <p className="text-sm leading-6 text-ink-soft">{branch.note}</p>

      <p>
        <Link href="/" className="text-sm underline decoration-line underline-offset-4 hover:decoration-pine">
          Back to Charoof
        </Link>
      </p>
    </article>
  );
}
