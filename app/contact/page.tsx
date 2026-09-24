import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to read GradedCalls before you write in.",
};

export default function ContactPage() {
  return (
    <section className="prose-panel panel">
      <h1>Contact</h1>
      <p>
        There is no account desk on this demo. Questions about a grade start with the method: what was said, when it
        locked, and which print it was scored against.
      </p>
      <p>
        <Link className="hit-44" href="/method">Read the method →</Link>
      </p>
    </section>
  );
}
