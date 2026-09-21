import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { CHAD, CHUD, GRADES_LINE, PRODUCT, UMBRELLA } from "@/lib/brand";
import { CORRECTIONS_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `${PRODUCT} is a public grade of past sports calls. ${GRADES_LINE}`,
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      kicker="Disclaimer"
      title="A grade is a record. It is not a wager."
      lede={`${PRODUCT} comments on public sports calls after a contest result is recorded. ${GRADES_LINE}`}
    >
      <LegalSection id="record" title="What the board is">
        <p>
          {PRODUCT} is the sports vertical of {UMBRELLA}. A published grade compares a public call with a recorded
          contest result. {CHAD.name} means {CHAD.means}. {CHUD.name} means {CHUD.means}. This build ships with an
          empty board: no contest rows are included.
        </p>
      </LegalSection>
      <LegalSection id="wagering" title="Wagering">
        <p>
          {PRODUCT} is not a sportsbook, a bookmaker, or a tipping service. A grade is not an instruction to bet, and
          it is not a promise about a contest that has not been recorded. Past accuracy is a record of past calls.
        </p>
      </LegalSection>
      <LegalSection id="sale" title="Grades are not for sale">
        <p>
          {GRADES_LINE} A donation does not buy a score, a badge, a {CHAD.name} mark, or a {CHUD.name} mark. The{" "}
          <Link href="/donate" className="text-field underline-offset-4 hover:underline">
            donate
          </Link>{" "}
          page has no checkout in this build.
        </p>
      </LegalSection>
      <LegalSection id="affiliation" title="Affiliation">
        <p>
          {PRODUCT} is not affiliated with a league, a team, a broadcaster, or a sportsbook. Names of contests, when a
          later feed adds them, identify the public event being graded.
        </p>
      </LegalSection>
      <LegalSection id="contact" title="Corrections">
        <p>
          Write to{" "}
          <a className="text-field underline-offset-4 hover:underline" href={`mailto:${CORRECTIONS_EMAIL}`}>
            {CORRECTIONS_EMAIL}
          </a>{" "}
          about a wrong recorded result. That address is a placeholder, not a live desk.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
