import Link from "next/link";

import { CharoofNav } from "@/components/charoof-nav";
import { SportsNav } from "@/components/sports-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center border border-pine font-score text-lg text-pine" aria-hidden>
            CH
          </span>
          <span className="leading-none">
            <span className="block font-serif text-[1.65rem] tracking-tight text-pine">Charoof</span>
            <span className="mt-1 block text-[11px] uppercase tracking-[0.18em] text-ink-soft">Parent record</span>
          </span>
        </Link>
        <CharoofNav />
      </div>
      <SportsNav />
    </header>
  );
}
