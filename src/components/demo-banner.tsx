import Link from "next/link";

export function DemoBanner() {
  return (
    <div className="bg-pine text-paper">
      <p className="mx-auto max-w-6xl px-5 py-2 text-sm leading-6">
        <span className="font-semibold uppercase tracking-[0.14em]">Demo ledger.</span> Fictional cappers,
        sample clubs, and invented finals. Not live scores. Not gambling advice.{" "}
        <Link href="/methodology" className="underline decoration-paper/60 underline-offset-2 hover:decoration-paper">
          How CH is scored
        </Link>
      </p>
    </div>
  );
}
