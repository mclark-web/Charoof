"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BRANCHES } from "@/lib/branches";

export function CharoofNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Charoof" className={`flex flex-wrap items-center gap-1 ${className}`}>
      {BRANCHES.map((branch) => {
        const current = pathname === branch.href || pathname.startsWith(`${branch.href}/`);
        return (
          <Link
            key={branch.id}
            href={branch.href}
            aria-current={current ? "page" : undefined}
            title={branch.title}
            className={`rounded-sm px-3 py-1.5 text-sm ${
              current ? "bg-pine text-paper" : "text-ink hover:bg-paper-2"
            }`}
          >
            {branch.navLabel}
          </Link>
        );
      })}
    </nav>
  );
}
