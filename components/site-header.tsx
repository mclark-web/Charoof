"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

const COMPACT_QUERY = "(max-width: 820px)";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  const [visibleCount, setVisibleCount] = useState(NAV.length);
  const [open, setOpen] = useState(false);
  const [openPath, setOpenPath] = useState(pathname);
  if (pathname !== openPath) {
    setOpenPath(pathname);
    setOpen(false);
  }
  const shownCount = compact ? visibleCount : NAV.length;

  useEffect(() => {
    const media = window.matchMedia(COMPACT_QUERY);
    const sync = () => setCompact(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    if (!compact) return;
    const nav = navRef.current;
    const strip = measureRef.current;
    if (!nav || !strip) return;

    const measure = () => {
      const samples = [...strip.querySelectorAll<HTMLElement>("[data-measure]")];
      const gap = 4;
      let used = 0;
      let count = 0;
      for (const sample of samples) {
        const next = used + sample.offsetWidth + (count > 0 ? gap : 0);
        if (next > nav.clientWidth) break;
        used = next;
        count += 1;
      }
      setVisibleCount((current) => (current === count ? current : count));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [compact]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      const menu = moreRef.current;
      if (menu && event.target instanceof Node && !menu.contains(event.target)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const overflow = NAV.slice(shownCount);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand" href="/" aria-label="GradedCalls home">
          <BrandMark />
          <div className="brand-name">
            Graded<span>Calls</span>
          </div>
        </Link>
        <nav ref={navRef} className="nav" aria-label="Primary">
          <div ref={measureRef} className="nav-measure" aria-hidden="true">
            {NAV.map((item) => (
              <span key={item.href} data-measure>
                {item.label}
              </span>
            ))}
          </div>
          {NAV.map((item, index) => {
            const hidden = index >= shownCount;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-nav-item
                hidden={hidden}
                className={isActive(pathname, item.href) ? "active" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div ref={moreRef} className="nav-more-wrap">
          <button
            type="button"
            className="nav-more"
            data-nav-more
            aria-expanded={open}
            aria-controls="nav-more-menu"
            onClick={() => setOpen((value) => !value)}
          >
            More
          </button>
          {open ? (
            <div id="nav-more-menu" className="nav-menu">
              {overflow.map((item) => (
                <Link key={item.href} href={item.href} className={isActive(pathname, item.href) ? "active" : undefined}>
                  {item.label}
                </Link>
              ))}
              <Link href="/sign-in">Sign in</Link>
              <Link href="/#sectors">Browse grades</Link>
            </div>
          ) : null}
        </div>
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
