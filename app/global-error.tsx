"use client";

import { LogoLink } from "@/components/logo-link";
import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
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
          </section>
        </main>
      </body>
    </html>
  );
}
