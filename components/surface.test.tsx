import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { SectorBoard } from "./sector-board";
import { SiteFooter } from "./site-footer";
import { sectorBook } from "@/lib/books";
import { LIVE_BOARDS, sectorByKey } from "@/lib/sectors";

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

  it("folds GC Scale into Method and drops the retired preview copy", () => {
    const home = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
    const method = readFileSync(new URL("../app/method/page.tsx", import.meta.url), "utf8").replace(/\s+/g, " ");
    const disclaimer = readFileSync(new URL("../app/disclaimer/page.tsx", import.meta.url), "utf8").replace(/\s+/g, " ");
    const header = readFileSync(new URL("./site-header.tsx", import.meta.url), "utf8");
    const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
    const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
    assert.match(home, /Compared to real closes, Monday opens, or final scores and graded on the GC Scale\./);
    assert.match(home, /How the four grades work — same rules on every board\./);
    assert.match(home, /GC Scale: how closely outcomes matched the call — STRONG, PROVISIONAL, WEAK, or EXIT LIQUIDITY\./);
    assert.equal((home.match(/Example: 72%/g) || []).length, 1);
    assert.doesNotMatch(home, /vertical vial|href="\/gc-scale"|href="\/analysts"|href="\/fintwit"|href="\/gcbot"|--gc-fill/);
    assert.match(method, /id="gc-scale"/);
    assert.match(method, /GC Scale is Grade Calibration: how much of the stated direction held\./);
    assert.match(method, /GC Scale grades how closely a call’s outcome matched its stated direction\./);
    assert.match(method, /\{GRADE_BANDS\.strongAt\}% and above/);
    assert.match(method, /\{GRADE_BANDS\.weakAt\}% up to \{GRADE_BANDS\.strongAt\}%/);
    assert.match(method, /under \{GRADE_BANDS\.weakAt\}%/);
    assert.match(method, /graded 0% =/);
    assert.match(method, /EXIT LIQUIDITY/);
    assert.match(method, /with empty glass/);
    assert.match(method, /An ungraded result reads Not graded yet\./);
    assert.match(method, /Scores are rounded only for display; 69\.5% stays PROVISIONAL\./);
    assert.match(method, /A sample of 10 or more graded picks uses the same cutoffs\./);
    assert.match(method, /id="sports-score"/);
    const board = readFileSync(new URL("./board-table.tsx", import.meta.url), "utf8");
    assert.match(board, /href="\/method#sports-score"/);
    assert.match(board, /How capper scores are built/);
    assert.match(method, /weighted 40 \/ 30 \/ 20 \/ 10/);
    assert.match(method, /\{PROVISIONAL_SAMPLE_NOTE\}/);
    const recency = readFileSync(new URL("../lib/recency.ts", import.meta.url), "utf8");
    assert.match(
      recency,
      /Cappers show PROVISIONAL until they have 10 graded picks in the last 90 days; this overrides every band: STRONG, WEAK, and EXIT LIQUIDITY\./,
    );
    assert.doesNotMatch(method, /vertical vial|horizontal tube|--gc-fill/);
    assert.match(disclaimer, /the home cards link to the live ledgers/);
    assert.match(disclaimer, /Demo rows are fiction, labeled Demo\./);
    assert.doesNotMatch(disclaimer, /each page links to the live ledger/);
    assert.doesNotMatch(header, /Sign in|\/sign-in|\/gc-scale|label: "Sports"|href: "\/sports"/);
    assert.doesNotMatch(header, /href: "\/analysts"|href: "\/fintwit"|href: "\/gcbot"/);
    assert.match(header, /label: "Hub"/);
    assert.match(header, /LIVE_BOARDS/);
    assert.match(header, /label: "Method"/);
    const nav = header.slice(header.indexOf("const NAV"));
    assert.ok(nav.indexOf('label: "Hub"') < nav.indexOf("LIVE_BOARDS"));
    assert.ok(nav.indexOf("LIVE_BOARDS") < nav.indexOf('label: "Method"'));
    assert.deepEqual(
      LIVE_BOARDS.map((board) => board.label),
      ["Analysts", "FinTwit", "GCBot"],
    );
    assert.deepEqual(
      LIVE_BOARDS.map((board) => board.href),
      [
        "https://bank-troof.vercel.app",
        "https://fintwittruth.vercel.app",
        "https://charoofbot.vercel.app",
      ],
    );
    const footerHtml = renderToStaticMarkup(<SiteFooter />);
    assert.match(footerHtml, /href="https:\/\/bank-troof\.vercel\.app"/);
    assert.match(footerHtml, /href="https:\/\/fintwittruth\.vercel\.app"/);
    assert.match(footerHtml, /href="https:\/\/charoofbot\.vercel\.app"/);
    assert.doesNotMatch(footerHtml, /href="\/analysts"|href="\/fintwit"|href="\/gcbot"/);
    assert.ok(footerHtml.indexOf("Analysts") < footerHtml.indexOf("FinTwit"));
    assert.ok(footerHtml.indexOf("FinTwit") < footerHtml.indexOf("GCBot"));
    assert.ok(footerHtml.indexOf("GCBot") < footerHtml.indexOf("Method"));
    assert.doesNotMatch(sitemap, /\/analysts|\/fintwit|\/gcbot|\/gc-scale|\/sign-in|\/sports/);
    assert.match(home, /SectorBoard/);
    assert.match(home, /book\.sector\.key !== "sports"/);
    assert.match(config, /source: "\/sports", destination: "\/", permanent: true/);
    assert.match(config, /source: "\/analysts"/);
    assert.match(config, /source: "\/fintwit"/);
    assert.match(config, /source: "\/gcbot"/);
    assert.equal(existsSync(new URL("../app/sports/page.tsx", import.meta.url)), false);
    assert.equal(existsSync(new URL("../components/gc-scale-view.tsx", import.meta.url)), false);
    assert.equal(existsSync(new URL("../app/gc-scale/page.tsx", import.meta.url)), false);
    assert.equal(existsSync(new URL("../app/analysts/page.tsx", import.meta.url)), false);
    assert.equal(existsSync(new URL("../app/fintwit/page.tsx", import.meta.url)), false);
    assert.equal(existsSync(new URL("../app/gcbot/page.tsx", import.meta.url)), false);
    assert.equal(existsSync(new URL("../app/sign-in/page.tsx", import.meta.url)), false);
  });
});

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("hub sports ledger", () => {
  it("puts the total record and capper cards above the pick rows", () => {
    const book = sectorBook("sports");
    const html = renderToStaticMarkup(<SectorBoard book={book} />);
    const record = html.indexOf("266 public picks · 133–105 · 2 void · 26 pending");
    const cappers = html.indexOf("Public cappers");
    const open = html.indexOf("Open picks");
    const verified = html.indexOf("Verified lane");
    assert.ok(record > -1 && record < cappers);
    assert.ok(cappers < open && open < verified);
    assert.match(html, />Total record</);
    assert.match(html, /Show \d+ more/);
    const capperRows = book.sections.find((section) => section.id === "public-cappers")?.rows ?? [];
    assert.ok(capperRows.length > 8);
    assert.match(html, new RegExp(escapeRegExp(capperRows[capperRows.length - 1]?.title ?? "missing")));
    const verifiedRows = book.sections.find((section) => section.id === "verified-cards")?.rows ?? [];
    const shown = new Set(verifiedRows.slice(0, 8).map((row) => row.title));
    const hidden = verifiedRows.slice(8).find((row) => !shown.has(row.title));
    assert.ok(hidden);
    assert.match(html, new RegExp(escapeRegExp(verifiedRows[0]?.title ?? "missing")));
    assert.doesNotMatch(html, new RegExp(escapeRegExp(hidden?.title ?? "missing")));
  });
});
