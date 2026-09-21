import type { ReactNode } from "react";
import { LEGAL_DRAFT_LABEL, LEGAL_REVISED } from "@/lib/legal";

export function LegalPage({
  kicker,
  title,
  lede,
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-chad">{kicker}</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight text-ink">{title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">{lede}</p>
      <p className="mt-4 inline-flex rounded-full border border-line bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {LEGAL_DRAFT_LABEL} · {LEGAL_REVISED}
      </p>
      <div className="mt-8 space-y-8 text-[15px] leading-7 text-ink">{children}</div>
    </article>
  );
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-serif text-2xl text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-ink/90">{children}</div>
    </section>
  );
}
