import { PrismaClient } from "@prisma/client";

import { PUBLIC_FINAL_NOTE, PUBLIC_RESULT_SOURCE } from "../src/lib/constants";
import { sqliteUrl } from "../src/lib/database-url";
import { espnDate, fetchEspnGames, findGame } from "../src/lib/espn";
import { settleAgainstPublic } from "../src/lib/settle";

const prisma = new PrismaClient({ datasources: { db: { url: sqliteUrl() } } });

async function main() {
  const events = await prisma.event.findMany({
    where: { picks: { some: { isDemo: false } } },
    include: { picks: true },
  });

  let updated = 0;
  let leftOpen = 0;
  for (const event of events) {
    let games;
    try {
      games = await fetchEspnGames(event.sport, espnDate(event.startsAt));
    } catch (error) {
      console.error(`Lookup failed for ${event.id}: ${error instanceof Error ? error.message : String(error)}`);
      console.error("No score was written.");
      process.exitCode = 1;
      continue;
    }
    const found = findGame(games, event.homeName, event.awayName);
    if (found == null || found === "ambiguous") {
      console.log(`${event.id}: ESPN did not return one matching final. Left unchanged.`);
      continue;
    }
    if (found.status !== "final" || found.homeScore == null || found.awayScore == null) {
      await prisma.event.update({
        where: { id: event.id },
        data: { status: "scheduled", homeScore: null, awayScore: null },
      });
      await prisma.pick.updateMany({ where: { eventId: event.id, isDemo: false }, data: { grade: "pending" } });
      leftOpen += 1;
      console.log(`${event.id}: not final on ESPN. Scores cleared.`);
      continue;
    }

    const settled = event.picks.filter((pick) => !pick.isDemo);
    let corrected = false;
    for (const pick of settled) {
      const result = settleAgainstPublic(
        {
          market: pick.market,
          side: pick.side,
          line: pick.line,
          propActual: pick.propActual,
          scoreScope: pick.scoreScope,
          participant: pick.participant,
          homeFirstQuarter: event.homeFirstQuarter,
          awayFirstQuarter: event.awayFirstQuarter,
          homeFirstHalf: event.homeFirstHalf,
          awayFirstHalf: event.awayFirstHalf,
        },
        { status: event.status, homeScore: event.homeScore, awayScore: event.awayScore },
        { status: "final", homeScore: found.homeScore, awayScore: found.awayScore },
      );
      if (result.grade === "win" && result.mismatch) {
        console.error(`${pick.id}: stored final disagreed with ESPN. Refusing to keep a win from the stored score.`);
      }
      await prisma.pick.update({ where: { id: pick.id }, data: { grade: result.grade } });
      if (result.mismatch) {
        corrected = true;
        console.log(`${pick.id}: corrected to ${result.grade} from ESPN ${found.awayScore}-${found.homeScore}`);
      }
    }
    await prisma.event.update({
      where: { id: event.id },
      data: {
        status: "final",
        homeScore: found.homeScore,
        awayScore: found.awayScore,
        source: PUBLIC_RESULT_SOURCE,
        sourceNote:
          !corrected && event.sourceNote.startsWith(PUBLIC_FINAL_NOTE)
            ? event.sourceNote
            : `${PUBLIC_FINAL_NOTE} ${found.sourceUrl}`,
      },
    });
    updated += 1;
    console.log(`${event.id}: final ${found.awayName} ${found.awayScore}, ${found.homeName} ${found.homeScore}`);
  }
  console.log(`Graded ${updated} verified events. ${leftOpen} left open with no score.`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
