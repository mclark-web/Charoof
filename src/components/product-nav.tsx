"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRODUCT_LINKS } from "@/lib/brand";

export function ProductNav({ tone = "field" }: { tone?: "field" | "paper" }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Charoof Sports" className="flex flex-wrap items-center gap-1">
      {PRODUCT_LINKS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const activeClass = tone === "field" ? "bg-paint text-field" : "bg-field text-paint";
        const idleClass = tone === "field" ? "text-paper/80 hover:bg-white/10" : "text-ink/80 hover:bg-white";
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 text-sm ${active ? activeClass : idleClass}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
