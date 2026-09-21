# Charoof Sports

Charoof Sports is the sports vertical of **Charoof**. The umbrella nav is **Analysts · FinTwit · Sports**.

- **Analysts** — [Charoof Analysts](https://bank-troof.vercel.app)
- **FinTwit** — [Charoof FinTwit](https://fintwittruth.vercel.app)
- **Sports** — this site

Charoof Sports is a public accountability ledger for sports prediction accounts. It grades posted picks when a game is final and publishes the result as **CH**, the Charoof factor.

This repository is a soft-launch demo. The cappers, clubs, and finals are fictional and labeled as such. Charoof does not invent a live score, does not scrape paid tip sites, and is not a sportsbook.

## Lexicon

- **CH** is the Charoof factor, shown as a **1–10** dial and as a score out of **100**. A 74 is **7.4** and **74/100**.
- **Chad** is CH plus **Accuracy & Discipline** — the good end of the scale. It is the top 30% of eligible peers, and only at 70 or above.
- **Chud** is CH plus **Uncertainty & Doubt** — the bad end. **Under 70/100 is Chud territory.**
- **Listed** clears 70 and sits outside that top 30%.
- **Provisional** clears 70 with fewer than 12 settled picks, so it cannot earn Chad yet.

Eligible peers have at least 12 settled picks in the scope you are viewing. The Chad window stays shut until there are at least 3 peers. The full formula is on `/methodology` and in `src/lib/scoring.ts`.

## What the demo contains

- Leaderboards, overall and by sport (NFL, NBA, MLB, NHL, NCAAF)
- Capper profiles with the factor, the component scores, and sport splits
- Pick detail: sport, event, market, line, odds, result, and grade
- Settlement at the game final, plus a Sample 2025 season-to-date rollup
- Open fixtures with no score attached
- `/disclaimer`, `/terms`, and `/donate` (donation-only; the form does not charge anyone)
- A results adapter in `src/lib/feeds.ts`. `RESULTS_FEED=live` returns no finals until a verified feed is configured

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

Charoof is entertainment and accountability, not gambling advice. Past results do not predict future results. It takes no wagers. It claims no affiliation with any league or sportsbook. The legal pages are drafts for review. The product is for adults 18 and older.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Prisma, SQLite.
