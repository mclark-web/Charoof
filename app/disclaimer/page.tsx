import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "GradedCalls is not financial, investment, legal, tax, or betting advice. Grades and GC Scale scores are historical records, not a promise of future results.",
};

export default function DisclaimerPage() {
  return (
    <section className="prose-panel panel">
      <p className="legal-meta">Last updated October 22, 2026</p>
      <h1>Disclaimer</h1>
      <p>This site is operated by [GradedCalls LLC — pending formation].</p>

      <h2>Not advice</h2>
      <p className="[text-wrap:pretty]">
        GradedCalls is not investment advice, not betting advice, and not a solicitation to trade or wager.
      </p>
      <p>
        Nothing on this site is financial, investment, legal, tax, or betting advice. The boards exist for education,
        entertainment, and accountability tracking.
      </p>

      <h2>No advisory relationship</h2>
      <p>
        GradedCalls is not a registered investment adviser, broker-dealer, or financial planner. Reading a grade, a GC
        Scale score, or a narrative does not create a fiduciary, advisory, brokerage, or client relationship.
      </p>

      <h2>Grades and scores</h2>
      <p className="[text-wrap:pretty]">
        Hub card counts are a dated snapshot of each live board’s own ledger (as of Oct 20, 2026). Verified sports
        picks are public cards graded on recorded finals. The Analysts, FinTwit, and GCBot home cards show that
        snapshot, and the home cards link to the live ledgers. Demo rows are fiction, labeled Demo.
      </p>
      <p>
        GC Scale scores, analyst grades, FinTwit grades, sports call tracking, and GCBot narrative tracking are
        historical and informational. They may contain errors, omissions, or delays. Past performance does not
        guarantee future results.
      </p>
      <p className="[text-wrap:pretty]">
        Sports does not use a paid odds API. A verified sports row is a public pick graded on an official result.
        Analyst calls are sourced from public analyst rating tables and news reports; GradedCalls is not affiliated with
        any analyst or firm. The FinTwit home card uses the live graded calls. GCBot posts are real public posts scored
        on the live board. This surface does not call a paid social API.
      </p>
      <p>
        <Link className="hit-44" href="/method">
          Read the method
        </Link>
      </p>

      <h2>Third-party content</h2>
      <p>
        Calls attributed to a named analyst, firm, or X account are that speaker’s own statements. GradedCalls sources
        them and links the public record. Those statements are not ours. Naming a person, firm, league, team, or
        platform does not mean GradedCalls is affiliated with them, sponsored by them, or endorsing them.
      </p>
      <p>
        Trademarks, logos, and names belong to their owners. Use here is to identify the source of a public statement.
      </p>
      <p>
        To correct a record or dispute an attribution, email the address below.{" "}
        <strong className="legal-todo">TODO:</strong> replace this address with a monitored inbox.
      </p>
      <p>
        <a className="hit-44" href="mailto:contact@gradedcalls.com">
          contact@gradedcalls.com
        </a>
      </p>

      <h2>Sports</h2>
      <p>
        Sports tracking does not offer wagering, odds products, or a way to place a bet. Gambling involves risk,
        including the loss of money. You must be at least 21 years old where that is the legal age, and in every case
        you must follow the law where you live.
      </p>
      <p>If gambling is causing harm, use the resources below.</p>
      <ul className="legal-links">
        <li>
          <a href="tel:1-800-GAMBLER">Call or text 1-800-GAMBLER</a>
        </li>
        <li>
          <a href="https://www.ncpgambling.org/" rel="noreferrer">
            National Council on Problem Gambling
          </a>
        </li>
      </ul>

      <h2>No warranty and liability</h2>
      <p>
        The site is provided as-is and as-available. To the fullest extent the law allows, [GradedCalls LLC — pending
        formation] and the people who operate it disclaim warranties of accuracy, merchantability, fitness for a
        particular purpose, and non-infringement.
      </p>
      <p>
        They are not liable for trading losses, wagering losses, lost profits, or decisions you make after reading a
        grade, score, or narrative, including where a record was wrong, late, or missing. You are responsible for your
        own decisions. Consult a licensed financial, legal, or tax professional before you act.
      </p>
      <p>
        If a claim is brought because of how you use the site, or because you traded or wagered based on what you read
        here, you agree to cover the resulting loss and reasonable defense costs, to the extent the law allows.
      </p>

      <h2>Privacy</h2>
      <p>
        The application does not create accounts and does not ask for your name, email, or payment details. Its source
        code does not include an analytics package and does not set cookies.
      </p>
      <p>
        Dismissing the notice on the Hub stores one flag in localStorage on your device, under the key
        gradedcalls.disclaimer.v1. That value stays in the browser until you clear site data. It is not sent to
        GradedCalls.
      </p>
      <p>
        The host, Vercel, may keep ordinary server logs, such as IP address, browser type, and the page requested, to
        run and protect the site. If Web Analytics or Speed Insights is turned on in the host dashboard, that product
        may record page views. GradedCalls does not sell personal information.
      </p>

      <h2>Governing law</h2>
      <p>
        The laws of the Commonwealth of Pennsylvania govern this disclaimer and your use of the site, without regard to
        conflict-of-law rules.
      </p>
    </section>
  );
}
