import type { Metadata } from "next";
import Link from "next/link";
import { FAMILY, UMBRELLA } from "@/lib/brand";

export const metadata: Metadata = {
  title: UMBRELLA,
  description: `${UMBRELLA} is the umbrella for Charoof Analysts, Charoof FinTwit, and Charoof Sports. This site is Charoof Sports.`,
};

export default function FamilyPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-chad">{UMBRELLA}</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight text-ink md:text-5xl">
        {FAMILY.map((item) => item.label).join(" · ")}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        {UMBRELLA} is the umbrella. This site is Charoof Sports. Analysts and FinTwit stay as placeholders until a
        shared hub publishes their URLs.
      </p>
      <div className="mt-8 space-y-4">
        {FAMILY.map((item) => (
          <section id={item.id} key={item.id} className="panel scroll-mt-28 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-serif text-2xl text-ink">{item.product}</h2>
              <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                Nav: {item.label}
              </span>
              {item.placeholder ? (
                <span className="rounded-full bg-chad-wash px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-chad">
                  Placeholder
                </span>
              ) : (
                <span className="rounded-full bg-field px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-paint">
                  This site
                </span>
              )}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.blurb}</p>
            {item.id === "sports" ? (
              <Link href="/" className="mt-4 inline-flex text-sm text-field underline-offset-4 hover:underline">
                Open the board
              </Link>
            ) : (
              <p className="mt-4 text-sm text-muted">Hub link pending. The header label {item.label} points here.</p>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
