import Link from "next/link";
import { PRODUCT, UMBRELLA } from "@/lib/brand";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-chad">{UMBRELLA}</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">That page is not on the board.</h1>
      <p className="mt-4 text-muted">{PRODUCT} has the board, the methodology, and the draft legal pages.</p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-field px-4 py-2 text-sm text-paint">
        Back to the board
      </Link>
    </div>
  );
}
