import { PrismaClient } from "@prisma/client";

import { sqliteUrl } from "../src/lib/database-url";
import { espnDate, fetchEspnGames, findGame } from "../src/lib/espn";

const prisma = new PrismaClient({ datasources: { db: { url: sqliteUrl() } } });

const problems: string[] = [];

async function main() {
  const events = await prisma.event.findMany({
    where: {
      status: "final",
      picks: { some: { isDemo: false } },
      homeScore: { not: null },
      awayScore: { not: null },
    },
  });

  if (events.length === 0) {
    problems.push("No settled verified events to check.");
  }

  const sample = [...events].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  console.log(`Checking ${sample.length} settled verified finals against ESPN.`);

  for (const event of sample) {
    let games;
    try {
      games = await fetchEspnGames(event.sport, espnDate(event.startsAt));
    } catch (error) {
      problems.push(`${event.id}: lookup failed (${error instanceof Error ? error.message : String(error)})`);
      continue;
    }
    const found = findGame(games, event.homeName, event.awayName);
    if (found == null) {
      problems.push(`${event.id}: ESPN scoreboard has no ${event.awayName} at ${event.homeName}`);
      console.log(`MISS  ${event.id}`);
      continue;
    }
    if (found === "ambiguous") {
      problems.push(`${event.id}: more than one ESPN game matched ${event.awayName} at ${event.homeName}`);
      console.log(`AMBIG ${event.id}`);
      continue;
    }
    if (found.status !== "final" || found.homeScore == null || found.awayScore == null) {
      problems.push(`${event.id}: ESPN has not recorded a final, but the ledger has ${event.awayScore}-${event.homeScore}`);
      console.log(`OPEN  ${event.id}`);
      continue;
    }
    const same = found.homeScore === event.homeScore && found.awayScore === event.awayScore;
    console.log(
      `${same ? "OK   " : "DIFF "} ${event.id}: ledger ${event.awayScore}-${event.homeScore} / ESPN ${found.awayScore}-${found.homeScore}`,
    );
    if (!same) {
      problems.push(
        `${event.id}: ledger ${event.awayName} ${event.awayScore}, ${event.homeName} ${event.homeScore}; ESPN ${found.awayName} ${found.awayScore}, ${found.homeName} ${found.homeScore} (${found.sourceUrl})`,
      );
    }
  }
}

main()
  .catch((error: unknown) => {
    problems.push(error instanceof Error ? error.message : String(error));
  })
  .finally(async () => {
    await prisma.$disconnect();
    if (problems.length > 0) {
      console.error(`\n${problems.length} final check${problems.length === 1 ? "" : "s"} failed:`);
      for (const problem of problems) console.error(`- ${problem}`);
      process.exit(1);
    }
    console.log("\nPublic finals matched the ledger.");
  });
