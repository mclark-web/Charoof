"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  DISCLAIMER_NOTICE_ATTR,
  DISCLAIMER_NOTICE_EVENT,
  DISCLAIMER_NOTICE_VALUE,
  disclaimerNoticeScript,
  dismissDisclaimerNotice,
  readDisclaimerNoticeDismissed,
} from "@/lib/disclaimer-notice";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(DISCLAIMER_NOTICE_EVENT, onStoreChange);
  return () => window.removeEventListener(DISCLAIMER_NOTICE_EVENT, onStoreChange);
}

function noticeDismissed() {
  try {
    return (
      readDisclaimerNoticeDismissed(localStorage) ||
      document.documentElement.getAttribute(DISCLAIMER_NOTICE_ATTR) === DISCLAIMER_NOTICE_VALUE
    );
  } catch {
    return false;
  }
}

function noticeDismissedOnServer() {
  return false;
}

export function DisclaimerNotice() {
  const dismissed = useSyncExternalStore(subscribe, noticeDismissed, noticeDismissedOnServer);
  if (dismissed) return null;

  return (
    <>
      <script id="gc-disclaimer-notice" dangerouslySetInnerHTML={{ __html: disclaimerNoticeScript() }} />
      <aside className="notice-banner" role="region" aria-label="Disclaimer notice">
        <p className="notice-kicker">Notice</p>
        <p>
          GradedCalls tracks public calls for education, entertainment, and accountability. It is not financial,
          investment, legal, tax, or betting advice. Grades and GC Scale scores are historical, may be wrong or late,
          and past results do not predict future ones.
        </p>
        <div className="notice-actions">
          <Link className="notice-link" href="/disclaimer">
            Full disclaimer
          </Link>
          <button
            type="button"
            className="btn"
            aria-label="Dismiss disclaimer notice"
            onClick={() => {
              dismissDisclaimerNotice(localStorage, document.documentElement);
              window.dispatchEvent(new Event(DISCLAIMER_NOTICE_EVENT));
              requestAnimationFrame(() => {
                const next = document.getElementById("sectors") ?? document.getElementById("content");
                next?.focus({ preventScroll: true, focusVisible: true } as FocusOptions);
              });
            }}
          >
            Dismiss
          </button>
        </div>
      </aside>
    </>
  );
}
