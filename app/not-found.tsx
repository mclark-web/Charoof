import type { Metadata } from "next";
import Link from "next/link";
import { shareMeta } from "@/lib/share-meta";
import { HUB_URL, SITE_URL } from "@/lib/site-urls";

export const metadata: Metadata = {
  ...shareMeta(SITE_URL),
};

export default function NotFound() {
  return (
    <section className="prose-panel panel">
      <h1>That page is not on the board</h1>
      <p>The link does not match a GradedCalls surface.</p>
      <p>
        <Link className="hit-44" href={HUB_URL}>Back to the hub →</Link>
      </p>
    </section>
  );
}
