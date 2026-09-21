"use client";

import Link from "next/link";

const FAMILY = [
  {
    label: "Analysts",
    product: "Charoof Analysts",
    href: "https://bank-troof.vercel.app",
    external: true,
  },
  {
    label: "FinTwit",
    product: "Charoof FinTwit",
    href: "https://fintwittruth.vercel.app",
    external: true,
  },
  {
    label: "Sports",
    product: "Charoof Sports",
    href: "/",
    external: false,
  },
] as const;

export function FamilyNav({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Charoof" className={`flex flex-wrap items-center gap-1 ${className}`}>
      {FAMILY.map((item) => {
        const current = item.label === "Sports";
        const itemClass = current
          ? "rounded-sm bg-pine px-3 py-1.5 text-sm text-paper"
          : "rounded-sm px-3 py-1.5 text-sm text-ink hover:bg-paper-2";
        if (item.external) {
          return (
            <a
              key={item.label}
              href={item.href}
              title={item.product}
              className={itemClass}
              rel="noopener noreferrer"
            >
              {item.label}
            </a>
          );
        }
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current="page"
            title={item.product}
            className={itemClass}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
