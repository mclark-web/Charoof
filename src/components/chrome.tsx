import Link from "next/link";
import { FAMILY, GRADES_LINE, LEGAL_LINKS, MARK, PRODUCT, UMBRELLA } from "@/lib/brand";
import { ProductNav } from "./product-nav";

export function FamilyNav({ tone = "field" }: { tone?: "field" | "paper" }) {
  return (
    <nav aria-label={UMBRELLA} className="flex flex-wrap items-center gap-1">
      {FAMILY.map((item) => {
        const current = item.id === "sports";
        const currentClass = tone === "field" ? "bg-paint text-field" : "bg-field text-paint";
        const idleClass =
          tone === "field"
            ? "text-paper/85 underline decoration-dotted decoration-paint/70 underline-offset-4 hover:bg-white/10"
            : "text-ink/80 underline decoration-dotted decoration-field/40 underline-offset-4 hover:bg-white";
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={current ? "page" : undefined}
            title={item.placeholder ? `${item.product}. Hub link placeholder.` : item.product}
            className={`rounded-full px-3 py-1.5 text-sm ${current ? currentClass : idleClass}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-field-deep/40 bg-field text-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-field-deep font-mono text-sm font-medium text-paint">
            {MARK}
          </span>
          <span className="leading-none">
            <span className="block font-serif text-[1.35rem] tracking-tight">{PRODUCT}</span>
            <span className="mt-1 block text-[11px] uppercase tracking-[0.16em] text-paint">{UMBRELLA}</span>
          </span>
        </Link>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <FamilyNav />
          <ProductNav />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_auto] md:px-4">
        <div>
          <p className="font-serif text-xl text-ink">
            {UMBRELLA}{" "}
            <span className="text-muted">· {FAMILY.map((item) => item.label).join(" · ")}</span>
          </p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            {PRODUCT} grades a public sports call after the contest, against the recorded result. {GRADES_LINE}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Analysts and FinTwit in the {UMBRELLA} row are placeholders until a shared hub publishes their URLs.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-sm">
          <FamilyNav tone="paper" />
          <nav aria-label="Footer" className="flex flex-col gap-2 text-muted">
            {LEGAL_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="underline-offset-4 hover:text-ink hover:underline">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
