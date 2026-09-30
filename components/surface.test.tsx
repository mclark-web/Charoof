import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { SectorBoard } from "./sector-board";
import { sectorByKey } from "@/lib/sectors";

describe("sports row chrome", () => {
  it("keeps the game date on one line and matches WIN/LOSS pill weight", () => {
    const html = renderToStaticMarkup(
      <SectorBoard
        book={{
          sector: sectorByKey("sports"),
          hero: { kind: "count", value: "1", hint: "hint", card: "card" },
          liveHref: null,
          liveLabel: null,
          sections: [
            {
              id: "open",
              label: "Open picks",
              note: "The pill says Pending.",
              rows: [
                {
                  id: "open-1",
                  lane: "Verified",
                  title: "Atlanta Falcons +2.5",
                  detail: "NFL · Atlanta Falcons @ Tampa Bay Buccaneers · game October 5, 2026 · Not final",
                  fill: null,
                  sample: "Open",
                  result: "PENDING",
                },
                {
                  id: "push-1",
                  lane: "Verified",
                  title: "Push card",
                  detail: "NFL · sample",
                  fill: null,
                  sample: "Push",
                  result: "PUSH",
                },
                {
                  id: "void-1",
                  lane: "Verified",
                  title: "Void card",
                  detail: "NFL · sample",
                  fill: null,
                  sample: "Void",
                  result: "VOID",
                },
              ],
            },
          ],
        }}
      />,
    );
    assert.match(html, /<span class="game-date">game October 5, 2026<\/span>/);
    assert.match(html, /result-pill pending">Pending</);
    assert.match(html, /result-pill push">Push</);
    assert.match(html, /result-pill void">Void</);
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
    assert.match(css, /\.game-date \{ white-space: nowrap; \}/);
    assert.match(css, /\.result-pill\.void,\s*\.result-pill\.push,\s*\.result-pill\.pending \{[^}]*font-weight: 650;/);
    assert.match(
      css,
      /\.result-pill\.void,\s*\.result-pill\.push,\s*\.result-pill\.pending \{\s*text-transform: none;\s*\}/,
    );
  });
});

describe("hub copy", () => {
  it("keeps GradedCalls in the tab title and drops the unused lockup", () => {
    const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
    const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
    const brand = readFileSync(new URL("../BRAND.md", import.meta.url), "utf8");
    const errorPage = readFileSync(new URL("../app/global-error.tsx", import.meta.url), "utf8");
    assert.doesNotMatch(layout, /chad|chud|charoof/i);
    assert.doesNotMatch(page, /chad|chud|charoof/i);
    assert.match(layout, /default: "GradedCalls"/);
    assert.match(readme, /WIN, LOSS, PUSH, VOID, or Pending/);
    assert.match(brand, /Name: GradedCalls/);
    assert.doesNotMatch(readme, /charoof|chad|chud/i);
    assert.match(errorPage, /<title>This board failed to load · GradedCalls<\/title>/);
    assert.match(errorPage, /href="\/"/);
    assert.match(errorPage, /title="Hub"/);
    assert.match(errorPage, />\s*Hub\s*</);
    assert.equal(existsSync(new URL("../public/gradedcalls-lockup.png", import.meta.url)), false);
  });
});
