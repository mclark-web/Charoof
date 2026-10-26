"use client";

import { LogoLink } from "@/components/logo-link";
import { HUB_URL, sitePath } from "@/lib/site-urls";
import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>This board failed to load · GradedCalls</title>
      </head>
      <body>
        <header className="topbar">
          <div className="topbar-inner">
            <LogoLink />
          </div>
        </header>
        <main id="content" className="wrap">
          <section className="prose-panel panel">
            <h1>This board failed to load</h1>
            <p>The page hit an error before it could finish.</p>
            <p>
              <button type="button" className="btn" onClick={() => reset()}>
                Try again
              </button>
            </p>
            <p>
              {/* The root layout failed, so this is a full navigation, not a client transition. */}
              <a className="hit-44" href={HUB_URL} title="Hub">
                Hub
              </a>
            </p>
          </section>
          <footer className="footer">
            <div>© 2026 GradedCalls · Not investment or betting advice</div>
            <div className="footer-links">
              <a href={sitePath("/disclaimer")}>Disclaimer</a>
            </div>
          </footer>
        </main>
      </body>
    </html>
  );
}
