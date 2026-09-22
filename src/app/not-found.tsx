import Link from "next/link";

import { sportsPath } from "@/lib/links";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-5 py-16">
      <p className="text-xs uppercase tracking-[0.18em] text-brass">404</p>
      <h1 className="font-serif text-4xl text-pine">That page is not on the record.</h1>
      <p className="text-ink-soft">The four branches are still here, including the Sports ledger.</p>
      <p className="flex flex-wrap gap-4 text-sm">
        <Link href="/" className="underline underline-offset-4">
          Back to Charoof
        </Link>
        <Link href={sportsPath.board} className="underline underline-offset-4">
          Sports board
        </Link>
      </p>
    </div>
  );
}
