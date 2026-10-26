import Link from "next/link";
import { LIVE_BOARDS } from "@/lib/sectors";
import { sitePath } from "@/lib/site-urls";

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
        <Link href={sitePath("/method")}>Method</Link>
        <Link href={sitePath("/disclaimer")}>Disclaimer</Link>
        <Link href={sitePath("/terms")}>Terms</Link>
        <Link href={sitePath("/contact")}>Contact</Link>
      </div>
    </footer>
  );
}
