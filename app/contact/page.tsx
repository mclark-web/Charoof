import type { Metadata } from "next";
import Link from "next/link";
import { sitePath } from "@/lib/site-urls";
import { shareMeta } from "@/lib/share-meta";

const contactUrl = sitePath("/contact");

export const metadata: Metadata = {
  title: "Contact",
  description:
    "A dedicated dispute channel is coming. Each call links to its original source so you can verify it.",
  alternates: { canonical: contactUrl },
  ...shareMeta(contactUrl),
};

export default function ContactPage() {
  return (
    <section className="prose-panel panel">
      <h1>Contact</h1>
      <p>
        A dedicated dispute channel is coming. Each call links to its original source so you can verify it.
      </p>
      <p>
        Questions about a grade start with the method: what was said, when it locked, and which print it was scored
        against.
      </p>
      <p>
        <Link className="hit-44" href={sitePath("/method")}>
          Read the method →
        </Link>
      </p>
    </section>
  );
}
