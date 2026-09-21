import Link from "next/link";

const LINKS = [
  { href: "/leaderboard", label: "Board" },
  { href: "/methodology", label: "Methodology" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/terms", label: "Terms" },
  { href: "/donate", label: "Donate" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm leading-6 text-ink-soft">
        <p>
          Charoof is an accountability ledger for sports prediction accounts. It is not a sportsbook, not
          gambling advice, and not affiliated with any league or sportsbook. The numbers on this demo are
          invented sample results. 18+.
        </p>
        <p>Part of the same accountability shelf as BankTruth and FinTwitTruth.</p>
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
