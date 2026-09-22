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

Charoof Sports is a public accountability ledger for sports prediction accounts. It grades posted picks when a game is final and publishes the result as **CH**, the Charoof factor.

This repository is a soft-launch demo. The sample cappers, clubs, and finals are fictional and labeled as such. A separate **public pick archive (Fri Sep 18, 2026)** copies free published cards and grades them on public finals. Charoof does not invent a live score, does not call an odds feed, does not scrape paid tip sites, and is not a sportsbook.

### Lexicon

- **CH** is the Charoof factor, shown as a **1–10** dial and as a score out of **100**. A 74 is **7.4** and **74/100**.
- **Chad** is CH plus **Accuracy & Discipline** — the good end of the scale. It is the top 30% of eligible peers, and only at 70 or above.
- **Chud** is CH plus **Uncertainty & Doubt** — the bad end. **Under 70/100 is Chud territory.**
- **Listed** clears 70 and sits outside that top 30%.
- **Provisional** clears 70 with fewer than 12 settled picks, so it cannot earn Chad yet.

Eligible peers have at least 12 settled picks in the scope you are viewing. The Chad window stays shut until there are at least 3 peers. The full formula is on `/sports/methodology` and in `src/lib/scoring.ts`.

### What the demo contains

- Leaderboards, overall and by sport (NFL, NBA, MLB, NHL, NCAAF), at `/sports/leaderboard`
- Capper profiles with the factor, the component scores, and sport splits
- Pick detail: sport, event, market, line, odds, result, and grade
- Settlement at the game final, plus a Sample 2025 season-to-date rollup
- Open fixtures with no score attached
- `/sports/disclaimer`, `/sports/terms`, and `/sports/donate` (donation-only; the form does not charge anyone)
- A results adapter in `src/lib/feeds.ts`. `RESULTS_FEED=live` returns no finals until a verified feed is configured
- A Friday slate strip on `/sports` for the Sep 18, 2026 public pick archive

### Settlement

Sample fixtures settle on invented demo finals. The Fri Sep 18 archive settles on **public box scores and match reports**. The line is the number the article posted. There is no odds feed and no live-lines vendor.

A prediction-market percent in the article is converted to American odds for the unit math, and the original percent stays on the pick. If the article posted no price, the grade is still win, loss, push, or void, and the units use even money. That even-money price is labeled because it was not in the source. Two ProCappers college leans named a side and did not post a number, so those rows are void.

No NFL game is in the archive. The public cards used here did not post an NFL side for that Friday. Sources are cited on each pick. Tweet IDs are not invented.

## Run

```bash
npm install
npm run build
npm start
```

`npm run build` generates the Prisma client, creates the SQLite database, seeds the demo ledger, checks the scoring rules, and builds the Next.js app. For local development:

```bash
npm run dev
```

The database file is `prisma/dev.db` (gitignored). `DATABASE_URL` points at it.

## Legal posture

Charoof Sports is entertainment and accountability, not gambling advice. Past results do not predict future results. It takes no wagers. It claims no affiliation with any league or sportsbook. The legal pages are drafts for review. The product is for adults 18 and older.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Prisma, SQLite.
