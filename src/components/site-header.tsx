"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/leaderboard", label: "Board" },
  { href: "/methodology", label: "Methodology" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/donate", label: "Donate" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center bg-pine font-score text-lg text-paper" aria-hidden>
            CH
          </span>
          <span className="font-serif text-2xl italic tracking-tight text-pine">Charoof</span>
        </Link>
        <nav aria-label="Primary" className="flex flex-wrap items-center gap-1">
          {LINKS.map((link) => {
            const current = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`rounded-sm px-3 py-1.5 text-sm ${
                  current ? "bg-pine text-paper" : "text-ink hover:bg-paper-2"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
