import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-5 py-16">
      <p className="text-xs uppercase tracking-[0.18em] text-brass">404</p>
      <h1 className="font-serif text-4xl text-pine">That page is not on the ledger.</h1>
      <p className="text-ink-soft">The board, the methodology, and the demo cappers are still here.</p>
      <Link href="/" className="text-sm underline underline-offset-4">
        Back to Charoof
      </Link>
    </div>
  );
}
