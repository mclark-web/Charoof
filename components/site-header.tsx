"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";

const NAV = [
  { href: "/", label: "Hub" },
  { href: "/analysts", label: "Analysts" },
  { href: "/fintwit", label: "FinTwit" },
  { href: "/sports", label: "Sports" },
  { href: "/gcbot", label: "GCBot" },
  { href: "/gc-scale", label: "GC Scale" },
  { href: "/method", label: "Method" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand" href="/" aria-label="GradedCalls home">
          <BrandMark />
          <div className="brand-name">
            Graded<span>Calls</span>
          </div>
        </Link>
        <nav className="nav" aria-label="Primary">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={isActive(pathname, item.href) ? "active" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="top-actions">
          <Link className="btn" href="/sign-in">
            Sign in
          </Link>
          <Link className="btn btn-primary" href="/#sectors">
            Browse grades
          </Link>
        </div>
      </div>
    </header>
  );
}
