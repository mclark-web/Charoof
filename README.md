# Charoof Sports

Charoof Sports is the sports vertical of **Charoof**.

The umbrella is Charoof. The public nav labels are **Analysts**, **FinTwit**, and **Sports**.

| Nav | Product | Where it lives in this repo |
| --- | --- | --- |
| Analysts | Charoof Analysts | Placeholder on `/family#analysts` until a shared hub publishes a URL |
| FinTwit | Charoof FinTwit | Placeholder on `/family#fintwit` until a shared hub publishes a URL |
| Sports | Charoof Sports | This site |

## CH

**CH** is the public mark.

- **Chad** is Accuracy & Discipline: the top 30% of the peer set. Ties at the cutoff are included.
- **Chud** is Uncertainty & Doubt: any score under 70.

Both marks can show on one grade. The full 0–100 score stays visible. A 1–10 badge sits beside it: 0–9 maps to 1, and 90–100 maps to 10.

Grades are not for sale.

## The board

A row is graded after the contest, against the recorded result. An open contest stays blank. This build does not include contest results, sample finals, or a generated book. The home board is empty on purpose.

The mark rules are in `src/lib/scoring.ts`. They apply to a score that already exists. They do not create a result.

## Run

Requires Node.js 22.

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | What it does |
| --- | --- |
| `npm test` | Brand lock and CH mark checks |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

No environment variables are required. `NEXT_PUBLIC_SITE_URL` overrides the metadata base when you have a public origin.

## Pages

| Route | What it shows |
| --- | --- |
| `/` | Charoof Sports, the empty board, and the CH marks |
| `/methodology` | Score, badge, Chad, and Chud |
| `/family` | Charoof verticals. Analysts and FinTwit are placeholders |
| `/disclaimer` | Draft: a grade is a record, and grades are not for sale |
| `/terms` | Draft terms, including the recorded-result rule |
| `/donate` | Draft donations page. No checkout. Grades are not for sale |

## Deploy

Import the repository. Leave the default commands. No environment variables.

| Setting | Value |
| --- | --- |
| Framework preset | Next.js |
| Root directory | repository root |
| Node.js version | 22.x |
| Install command | `npm install` |
| Build command | `npm run build` |
| Environment variables | none |

Legal pages are labeled “Draft for legal review” until counsel signs off. The corrections address is `corrections@charoof.example`, a placeholder, not a live inbox.
