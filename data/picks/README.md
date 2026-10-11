# Picks ledger

`picks.csv` is the source of truth. `npm run picks:export` writes `data/verified-picks.json` in the shape the site reads. `npm run picks:settle` grades pending rows from ESPN scoreboards when the game is final. `npm run picks:validate` checks the ledger, including the public record line.

A capper has one card for each game, market, and side. A game is the event on one `game_date`. The same teams on another date are a different game.

When a capper posts a new number for that same pair before kickoff, keep the latest card posted before kickoff and delete the earlier row from `picks.csv`. Renumber `export_index` so the remaining cards stay `0..n-1` in their previous order, and keep the file sorted by `pick_id`. Then run `npm run picks:export`.

`picks:validate` reports a second card for the same capper, game, market, and side as an error. A repeated matchup on a different `game_date` stays a warning.
