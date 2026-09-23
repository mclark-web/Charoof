"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { sportsPath } from "@/lib/links";

export function SportsBanner() {
  const pathname = usePathname();
  const demo = pathname === sportsPath.demo || pathname.startsWith(`${sportsPath.demo}/`);

  if (demo) {
    return (
      <div className="bg-pine text-paper">
        <p className="mx-auto max-w-6xl px-5 py-2 text-sm leading-6">
          <span className="font-semibold uppercase tracking-[0.14em]">Demo.</span> These clubs, lines, and
          finals are fiction. They are off the live rankings.{" "}
          <Link href={sportsPath.home} className="underline decoration-paper/60 underline-offset-2 hover:decoration-paper">
            Verified board
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="border-b border-line bg-paper-2">
      <p className="mx-auto max-w-6xl px-5 py-2 text-sm leading-6 text-ink-soft">
        Live board: verified public cards only, graded on free finals. Fiction is labeled DEMO and kept on{" "}
        <Link href={sportsPath.demo} className="underline decoration-line underline-offset-4 hover:decoration-pine">
          the demo ledger
        </Link>
        . Not gambling advice.
      </p>
    </div>
  );
}
