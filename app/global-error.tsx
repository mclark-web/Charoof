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
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a className="hit-44" href="/" title="Hub">
                Hub
              </a>
            </p>
          </section>
        </main>
      </body>
    </html>
  );
}
