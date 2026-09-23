# Charoof

Charoof is the parent record. Four branches sit in one header:

| Branch | Route on this site | Where the work lives |
| --- | --- | --- |
| Analysts | `/analysts` | Live ledger at [bank-troof.vercel.app](https://bank-troof.vercel.app) |
| FinTwit | `/fintwit` | Live ledger at [fintwittruth.vercel.app](https://fintwittruth.vercel.app) |
| Sports | `/sports` | This repository |
| Charoof Bot | `/bot` | Live demo at [charoofbot.vercel.app](https://charoofbot.vercel.app). Source at [mclark-web/charoofbot](https://github.com/mclark-web/charoofbot). |

`/` is the umbrella. Analysts, FinTwit, and Bot are doors in this chrome that link out to the real instance. Sports is the ledger in this app. The apps are not merged here.

Previous Sports URLs redirect into the branch: `/leaderboard`, `/cappers/:handle`, `/picks/:id`, `/methodology`, `/disclaimer`, `/terms`, and `/donate`.

## Sports

Charoof Sports is a public accountability ledger for posted sports picks. It grades a pick when a free public final is recorded and publishes the result as **CH**, the Charoof factor.

The live board (`/sports`) is verified cards only: a source URL, a timestamp, an event, and a side, settled win / loss / push / void from a public final. Fiction is labeled **DEMO** and lives at `/sports/demo` (also `/demo`). It does not move the live rankings.

A **public pick archive (Fri Sep 18, 2026)** stays on the live board as a labeled historical strip. Those rows are copied from free Covers, Action Network, and ProCappers articles and graded on public finals. Recent verified cards (Sep 19–21, 2026) sit above that strip.

Charoof does not invent a score, a handle, a line, or a tweet ID. It does not call a paid odds API or the paid X API. There is no CLV.

### Lexicon

- **CH** is the Charoof factor, shown as a **1–10** dial and as a score out of **100**. A 74 is **7.4** and **74/100**.
- **Chad** is CH plus **Accuracy & Discipline** — the good end of the scale. It is the top 30% of eligible peers, and only at 70 or above.
- **Chud** is CH plus **Uncertainty & Doubt** — the bad end. **Under 70/100 is Chud territory.**
- **Listed** clears 70 and sits outside that top 30%.
- **Provisional** clears 70 with fewer than 12 settled picks, so it cannot earn Chad yet.

Eligible peers have at least 12 settled picks in the scope you are viewing. The Chad window stays shut until there are at least 3 peers. The full formula is on `/sports/methodology` and in `src/lib/scoring.ts`.

### What is real, and what is demo

Real, on the live board:

- Fri Sep 18 archive from the free articles cited on each pick
- Sep 19–21 verified cards in `prisma/verified-recent.ts` (Covers and Action Network), graded from ESPN scoreboard finals that were also checked against a league or baseball-reference page

Demo, only at `/sports/demo`:

- Invented clubs, lines, and finals, including the Sample 2025 rollup and the open sample fixtures

### Operator loop

Solo, and it stays at $0. There is no paid X API. Paste a card, then grade it when a free final exists.

```bash
npm run ingest -- --dry-run --file fixtures/ingest/labeled-eagles.txt
npm run ingest -- --file path/to/pick.txt
npm run grade
npm run verify-finals
```

`npm run ingest` reads a file or stdin. It accepts a labeled paste or one JSON object. It refuses a pick that is missing a source URL, a timestamp, an event (`Away at Home`), or a side. A bare URL is fetched and still refused unless those fields are actually in the text. It does not invent a line, a price, or a score. An accepted paste is pending, with no score, and is appended to `data/verified-ingested.json` so the next seed keeps it.

`npm run grade` looks up verified events on the public ESPN scoreboard (`site.web.api.espn.com`, no key). A final overwrites the stored score and recomputes the grade from that final. A game that is not final has its score cleared and stays pending. A lookup failure writes nothing.

`npm run verify-finals` re-checks every settled verified final against that same scoreboard and exits non-zero on a mismatch or a missing game. Run it before you trust a grade. Player props are not re-fetched; the game score is. One graded example: Neil Parker's Covers under 42.5 on Pittsburgh at New England (Sep 20, 2026) is a win because the public final was Steelers 3, Patriots 20. Source: the Covers article. Final: the ESPN recap for game 401872946.

Labeled paste:

```
source: https://www.covers.com/nfl/eagles-vs-titans-prediction-picks-best-bets-today-sept-20-2026
timestamp: 2026-09-20T14:10:00-04:00
who: Neil Parker
sport: NFL
event: Philadelphia Eagles at Tennessee Titans
market: spread
side: Philadelphia Eagles
line: -7.5
```

Leave `price` blank when the article did not post American odds. `fixtures/ingest/missing-side.txt` is the refusal example.

### Pages

- `/sports` verified picks, open fixtures, the Fri Sep 18 strip, and verified rankings
- `/sports/leaderboard` verified rankings by sport, including soccer
- `/sports/demo` the fiction ledger
- Capper profiles and pick detail, with DEMO marked when the row is fiction
- `/sports/disclaimer`, `/sports/terms`, and `/sports/donate` (donation-only; the form does not charge anyone)

### Settlement

Demo fixtures settle on invented finals and never enter the live board. Verified picks settle on a public final. The line is the number the article posted. There is no odds feed and no live-lines vendor.

A prediction-market percent in the article is converted to American odds for the unit math, and the original percent stays on the pick. If the article posted no price, the grade is still win, loss, push, or void, and the units use even money. That even-money price is labeled because it was not in the source. Two ProCappers college leans named a side and did not post a number, so those rows are void.

No NFL game is in the archive. The public cards used here did not post an NFL side for that Friday. Sources are cited on each pick. Tweet IDs are not invented.

## Run

```bash
npm install
npm run build
npm start
```

`npm run build` generates the Prisma client, creates the SQLite database, seeds the ledger, checks the scoring rules, and builds the Next.js app. `npm test` checks settlement (a conflicting final cannot grade a win), the scoring rules, and the public finals. For local development:

```bash
npm run dev
```

The database file is `prisma/dev.db` (gitignored). `DATABASE_URL` points at it.

## Legal posture

Charoof Sports is entertainment and accountability, not gambling advice. Past results do not predict future results. It takes no wagers. It claims no affiliation with any league or sportsbook. The legal pages are drafts for review. The product is for adults 18 and older.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Prisma, SQLite.
