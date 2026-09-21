import type { Metadata } from "next";
import Link from "next/link";

import { DonateForm } from "@/components/donate-form";

export const metadata: Metadata = {
  title: "Donate",
  description: "Charoof is donation-only. The demo form does not process payments and does not sell picks.",
};

export default function DonatePage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.18em] text-brass">Donate</p>
      <h1 className="mt-2 font-serif text-5xl text-pine">Support the ledger</h1>
      <p className="mt-4 rounded-sm border border-brass/40 bg-listed-soft px-4 py-3 text-sm leading-6 text-ink">
        Draft for legal review. Donations only. This is not a checkout and not a sportsbook balance.
      </p>
      <div className="mt-8 space-y-4 text-base leading-7 text-ink-soft">
        <p>
          Charoof does not sell picks, tips, or a place on the board. If the project takes money, it takes
          donations to keep the ledger online. A donation is not gambling, not payment for advice, and not a
          wager.
        </p>
        <p>
          The form below is a demo. Choosing an amount and reviewing it does not charge a card, open a
          processor, or move money. 18+.
        </p>
        <p>
          Read the <Link href="/disclaimer" className="underline underline-offset-4">disclaimer</Link> and the{" "}
          <Link href="/terms" className="underline underline-offset-4">terms</Link> before treating any future
          campaign as live.
        </p>
      </div>
      <DonateForm />
    </article>
  );
}
