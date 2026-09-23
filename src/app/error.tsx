"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-5 py-16">
      <h1 className="font-serif text-4xl text-pine">The ledger failed to open.</h1>
      <p className="text-ink-soft">Try the page again. If it keeps failing, the demo database may need a fresh seed.</p>
      <button type="button" onClick={() => reset()} className="w-fit bg-pine px-4 py-2 text-sm text-paper">
        Try again
      </button>
    </div>
  );
}
