/** Versioned flag. The value is only the word "dismissed" — no personal data. */
export const DISCLAIMER_NOTICE_KEY = "gradedcalls.disclaimer.v1";
export const DISCLAIMER_NOTICE_VALUE = "dismissed";
export const DISCLAIMER_NOTICE_ATTR = "data-gc-notice";
export const DISCLAIMER_NOTICE_EVENT = "gc-disclaimer-notice";

export function readDisclaimerNoticeDismissed(storage: Pick<Storage, "getItem">): boolean {
  return storage.getItem(DISCLAIMER_NOTICE_KEY) === DISCLAIMER_NOTICE_VALUE;
}

export function dismissDisclaimerNotice(
  storage: Pick<Storage, "setItem"> | null,
  root: { setAttribute(name: string, value: string): void } | null,
) {
  try {
    storage?.setItem(DISCLAIMER_NOTICE_KEY, DISCLAIMER_NOTICE_VALUE);
  } catch {
    // Private mode and disabled storage throw. The attribute still hides this view.
  }
  root?.setAttribute(DISCLAIMER_NOTICE_ATTR, DISCLAIMER_NOTICE_VALUE);
}

/** Runs before the Hub banner is parsed so a returning visitor does not see a flash. */
export function disclaimerNoticeScript(): string {
  const key = JSON.stringify(DISCLAIMER_NOTICE_KEY);
  const value = JSON.stringify(DISCLAIMER_NOTICE_VALUE);
  const attr = JSON.stringify(DISCLAIMER_NOTICE_ATTR);
  return `try{if(localStorage.getItem(${key})===${value}){document.documentElement.setAttribute(${attr},${value})}}catch(e){}`;
}
