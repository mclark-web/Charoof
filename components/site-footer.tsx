import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div>© 2026 GradedCalls · Not investment or betting advice · Donation-supported demo</div>
      <div className="footer-links">
        <Link href="/gcbot">GCBot</Link>
        <Link href="/method">Method</Link>
        <Link href="/disclaimer">Disclaimer</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/contact">Contact</Link>
      </div>
    </footer>
  );
}
