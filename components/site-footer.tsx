import Link from "next/link";
import { LIVE_BOARDS } from "@/lib/sectors";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div>© 2026 GradedCalls · Not investment or betting advice · Donation-supported demo</div>
      <div className="footer-links">
        {LIVE_BOARDS.map((board) => (
          <a key={board.href} href={board.href}>
            {board.label}
          </a>
        ))}
        <Link href="/method">Method</Link>
        <Link href="/disclaimer">Disclaimer</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/contact">Contact</Link>
      </div>
    </footer>
  );
}
