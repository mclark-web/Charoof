import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { GRADES_LINE, PRODUCT, UMBRELLA } from "@/lib/brand";
import { CORRECTIONS_EMAIL, GOVERNING_STATE } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms",
  description: `Draft terms for ${PRODUCT}. ${GRADES_LINE}`,
};

export default function TermsPage() {
  return (
    <LegalPage
      kicker="Terms"
      title="Read the board. The grade stays public."
      lede={`These draft terms cover ${PRODUCT}, the sports vertical of ${UMBRELLA}. Counsel has not signed them.`}
    >
      <LegalSection id="license" title="License to read">
        <p>
          You may read the pages, quote a grade with attribution to {PRODUCT}, and link to a public URL. You may not
          present the empty board, or a later recorded grade, as your own product.
        </p>
      </LegalSection>
      <LegalSection id="grades" title="Grades are not for sale">
        <p>
          {GRADES_LINE} Access does not depend on a payment. A gift on the{" "}
          <Link href="/donate" className="text-field underline-offset-4 hover:underline">
            donate
          </Link>{" "}
          page, if one is added later, does not buy a mark, a correction you prefer, or a private call.
        </p>
      </LegalSection>
      <LegalSection id="results" title="Recorded results">
        <p>
          A grade waits for a recorded contest result. {PRODUCT} does not fill a missing result with a generated final.
          This build includes no contest results.
        </p>
      </LegalSection>
      <LegalSection id="liability" title="Liability">
        <p>
          The board is commentary about past public calls. You decide what to do with it. {PRODUCT} is not liable for
          a decision you make from a grade, an open row, or a missing result. The{" "}
          <Link href="/disclaimer" className="text-field underline-offset-4 hover:underline">
            disclaimer
          </Link>{" "}
          is part of these terms.
        </p>
      </LegalSection>
      <LegalSection id="law" title="Governing law">
        <p>
          Governing law is a placeholder: {GOVERNING_STATE}. Counsel will replace it. Questions go to{" "}
          <a className="text-field underline-offset-4 hover:underline" href={`mailto:${CORRECTIONS_EMAIL}`}>
            {CORRECTIONS_EMAIL}
          </a>
          , which is also a placeholder.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
