"use client";

export default function Error({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <section className="prose-panel panel">
      <h1>This board failed to load</h1>
      <p>The page hit an error before it could finish.</p>
      <p>
        <button type="button" className="btn" onClick={() => retry()}>
          Try again
        </button>
      </p>
    </section>
  );
}
