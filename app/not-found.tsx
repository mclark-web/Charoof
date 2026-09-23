import Link from "next/link";

export default function NotFound() {
  return (
    <section className="prose-panel panel">
      <h1>That page is not on the board</h1>
      <p>The link does not match a GradedCalls surface.</p>
      <p>
        <Link href="/">Back to the hub →</Link>
      </p>
    </section>
  );
}
