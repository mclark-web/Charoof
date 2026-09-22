import Link from "next/link";

export function DemoBanner() {
  return (
    <div className="bg-pine text-paper">
      <p className="mx-auto max-w-6xl px-5 py-2 text-sm leading-6">
        <span className="font-semibold uppercase tracking-[0.14em]">Demo ledger.</span> Sample clubs are
        fictional. The Fri Sep 18 strip is a public pick archive graded on public finals, with no odds feed.
        Not gambling advice.{" "}
        <Link href="/sports/methodology" className="underline decoration-paper/60 underline-offset-2 hover:decoration-paper">
          How CH is scored
        </Link>
      </p>
    </div>
  );
}
