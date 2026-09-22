import Link from "next/link";

import { CharoofNav } from "@/components/charoof-nav";
import { sportsPath } from "@/lib/links";

const LINKS = [
  { href: sportsPath.board, label: "Sports board" },
  { href: sportsPath.methodology, label: "Methodology" },
  { href: sportsPath.disclaimer, label: "Disclaimer" },
  { href: sportsPath.terms, label: "Terms" },
  { href: sportsPath.donate, label: "Donate" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm leading-6 text-ink-soft">
        <p>
          Charoof is the parent record. Analysts, FinTwit, Sports, and Charoof Bot are the branches. Sports
          on this site grades posted picks when a game is final. It is not a sportsbook, not gambling advice,
          and not affiliated with any league or sportsbook. Sample clubs on this Sports demo are invented.
          The Fri Sep 18 archive uses public finals, not an odds feed. 18+.
        </p>
        <CharoofNav />
        <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="underline decoration-line underline-offset-4 hover:decoration-pine">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
