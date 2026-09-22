"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { sportsPath } from "@/lib/links";

const LINKS = [
  { href: sportsPath.home, label: "Overview", exact: true },
  { href: sportsPath.board, label: "Board", exact: false },
  { href: sportsPath.methodology, label: "Methodology", exact: false },
  { href: sportsPath.disclaimer, label: "Disclaimer", exact: false },
  { href: sportsPath.donate, label: "Donate", exact: false },
];

export function SportsNav() {
  const pathname = usePathname();
  if (pathname !== "/sports" && !pathname.startsWith("/sports/")) return null;

  return (
    <div className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-5 py-2">
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">Sports</p>
        <nav aria-label="Sports" className="flex flex-wrap items-center gap-1">
          {LINKS.map((link) => {
            const current = link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`rounded-sm px-2.5 py-1 text-sm ${
                  current ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-2 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
