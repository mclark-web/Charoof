import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DISCLAIMER_NOTICE_ATTR,
  DISCLAIMER_NOTICE_KEY,
  DISCLAIMER_NOTICE_VALUE,
  disclaimerNoticeScript,
  dismissDisclaimerNotice,
  readDisclaimerNoticeDismissed,
} from "./disclaimer-notice";

describe("disclaimer notice storage", () => {
  it("treats only the versioned dismissed flag as remembered", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    };
    assert.equal(readDisclaimerNoticeDismissed(storage), false);
    const attrs = new Map<string, string>();
    dismissDisclaimerNotice(storage, {
      setAttribute: (name, value) => {
        attrs.set(name, value);
      },
    });
    assert.equal(store.get(DISCLAIMER_NOTICE_KEY), DISCLAIMER_NOTICE_VALUE);
    assert.equal(attrs.get(DISCLAIMER_NOTICE_ATTR), DISCLAIMER_NOTICE_VALUE);
    assert.equal(readDisclaimerNoticeDismissed(storage), true);
    assert.equal(readDisclaimerNoticeDismissed({ getItem: () => "other" }), false);
  });

  it("still marks the document when storage throws", () => {
    const attrs = new Map<string, string>();
    dismissDisclaimerNotice(
      {
        setItem() {
          throw new Error("quota");
        },
      },
      {
        setAttribute: (name, value) => {
          attrs.set(name, value);
        },
      },
    );
    assert.equal(attrs.get(DISCLAIMER_NOTICE_ATTR), DISCLAIMER_NOTICE_VALUE);
  });

  it("boot script only checks the versioned key", () => {
    const script = disclaimerNoticeScript();
    assert.match(script, /localStorage\.getItem\("gradedcalls\.disclaimer\.v1"\)/);
    assert.match(script, /setAttribute\("data-gc-notice","dismissed"\)/);
    assert.doesNotMatch(script, /<\/script>/i);
    assert.doesNotMatch(script, /charoof|chad|chud/i);
  });
});
