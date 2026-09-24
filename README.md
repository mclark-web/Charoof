# GradedCalls

Public claims, graded after the outcome. This is the umbrella hub: Analysts, FinTwit, Sports, and GCBot.

The product name in the interface is **GradedCalls**. GC means Grade Calibration. The tube is luminous neon orange (`#eb6505`) on charcoal. Horizontal tubes sit on boards. Vertical vials are limited to the GC Scale and the Method page.

GCBot scores clone speech and amplifiers by narrative volume. The hub board is a zero-cost demo on a synthetic corpus. It does not call a paid social API.

Grade labels share one uppercase pill. Same rules on every board:

- **STRONG** at 70% and above
- **PROVISIONAL** from 40% until 70%
- **WEAK** below 40%
- **EXIT LIQUIDITY** at 0% fill, which is empty glass

Sports shows the recovered public pick ledger, including the Fri Sep 18 archive. A single pick shows WIN, LOSS, PUSH, or PENDING, not a GC grade. A capper’s GC score is the recency-blended win percentage over the last 7, 14, 30, and 90 days, weighted 40/30/20/10, with pushes left out. Windows use America/New_York calendar days and count back from today’s date. An empty window is dropped and the remaining weights are renormalized. If every window is empty, the capper is PROVISIONAL and the card shows no score. Cappers show PROVISIONAL until they have 10 graded picks in the last 90 days, whatever their score. A card with a publish date and no clock time stays out of that score. The displayed percentage is rounded; the grade uses the raw score, so 69.5 stays PROVISIONAL. Analysts, FinTwit, and GCBot preview the seeded books from those boards and link to the live ledgers. Demo rows stay labeled Demo. Sports does not call a paid odds API.

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
