import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { CHAD, CHUD, GRADES_LINE, PRODUCT } from "@/lib/brand";
import { CORRECTIONS_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Donate",
  description: `${PRODUCT} is free to read. ${GRADES_LINE}`,
};

export default function DonatePage() {
  return (
    <LegalPage
      kicker="Donate"
      title="The board is free. A gift does not buy a grade."
      lede={`${PRODUCT} is donation-only. Every published row is free to read. ${GRADES_LINE}`}
    >
      <div className="panel p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Checkout</p>
        <p className="mt-2 font-serif text-2xl text-ink">No donation checkout is open on this draft.</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          When a way to give is added, it will be on this page. Paying will still not buy a grade, a rank, or a side.
        </p>
      </div>
      <LegalSection id="free" title="Reading is free">
        <p>There is no subscription and no paid tier. You do not need to donate to see a score.</p>
      </LegalSection>
      <LegalSection id="not-a-sale" title="Grades are not for sale">
        <p>
          {PRODUCT} does not sell grades, badges, or alerts. A donation does not buy a better {CHAD.name} or {CHUD.name}{" "}
          mark, an earlier look, or a private call. The{" "}
          <Link href="/disclaimer" className="text-field underline-offset-4 hover:underline">
            disclaimer
          </Link>{" "}
          still applies to anyone who gives.
        </p>
      </LegalSection>
      <LegalSection id="tax" title="Tax">
        <p>
          A donation to {PRODUCT} is not described here as tax-deductible. This draft makes no such statement.
        </p>
      </LegalSection>
      <LegalSection id="contact" title="Questions">
        <p>
          Write to{" "}
          <a className="text-field underline-offset-4 hover:underline" href={`mailto:${CORRECTIONS_EMAIL}`}>
            {CORRECTIONS_EMAIL}
          </a>
          . That address is a placeholder, not a live donations desk.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
