import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { PrismaClient } from "@prisma/client";

import { VERIFIED_OPEN_NOTE, VERIFIED_OPEN_SOURCE, VERIFIED_SEASON } from "../src/lib/constants";
import { sqliteUrl } from "../src/lib/database-url";
import { ingestId, parseIngest, type IngestPick } from "../src/lib/ingest-parse";

const INGESTED_PATH = path.join(process.cwd(), "data", "verified-ingested.json");

type StoredPick = IngestPick & { id: string };

function readArg(flag: string): string | null {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function readPaste(): string {
  const file = readArg("--file");
  if (file) return readFileSync(path.resolve(file), "utf8");
  return readFileSync(0, "utf8");
}

function loadStored(): StoredPick[] {
  return JSON.parse(readFileSync(INGESTED_PATH, "utf8")) as StoredPick[];
}

async function writePick(pick: StoredPick) {
  const prisma = new PrismaClient({ datasources: { db: { url: sqliteUrl() } } });
  const startsAt = new Date(pick.startsAt ?? pick.publishedAt);
  try {
    await prisma.capper.upsert({
      where: { handle: pick.handle },
      update: {},
      create: {
        id: pick.handle,
        handle: pick.handle,
        displayName: pick.who,
        focus: `${pick.sport} · pasted card`,
        bio: `Pasted by the operator from ${pick.sourceUrl}. Not a connected account.`,
        hue: 210,
        isDemo: false,
      },
    });
    await prisma.event.upsert({
      where: { id: `ingested-${pick.id}` },
      update: {},
      create: {
        id: `ingested-${pick.id}`,
        sport: pick.sport,
        season: VERIFIED_SEASON,
        weekLabel: "Operator paste",
        name: pick.eventName,
        startsAt,
        status: "scheduled",
        homeName: pick.homeName,
        awayName: pick.awayName,
        homeScore: null,
        awayScore: null,
        source: VERIFIED_OPEN_SOURCE,
        sourceNote: VERIFIED_OPEN_NOTE,
      },
    });
    await prisma.pick.upsert({
      where: { id: pick.id },
      update: {},
      create: {
        id: pick.id,
        capperId: pick.handle,
        eventId: `ingested-${pick.id}`,
        market: pick.market,
        side: pick.side,
        line: pick.line,
        oddsAmerican: pick.oddsAmerican,
        units: 1,
        selection: pick.selection,
        scoreScope: "final",
        publishedAt: new Date(pick.publishedAt),
        clarity: "explicit",
        grade: "pending",
        note: pick.startsAt
          ? `Operator paste. Article did not post a stake. Recorded as 1.00u. ${pick.sourceUrl}`
          : `Operator paste. No listed start was in the paste, so the clock is the posted timestamp and the pick is not treated as locked. Article did not post a stake. Recorded as 1.00u. ${pick.sourceUrl}`,
        sourceUrl: pick.sourceUrl,
        isDemo: false,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  let raw = "";
  try {
    raw = readPaste();
  } catch {
    console.error("Paste a pick on stdin, or pass --file path.");
    process.exit(1);
  }

  const trimmed = raw.trim();
  if (/^https?:\/\/\S+$/i.test(trimmed)) {
    let page = "";
    try {
      const response = await fetch(trimmed, {
        headers: { "user-agent": "Mozilla/5.0 (compatible; CharoofLedger/1.0)", accept: "text/html" },
      });
      page = await response.text();
    } catch (error) {
      console.error(`Could not fetch ${trimmed}: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
    const text = page.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, "\n");
    const parsed = parseIngest(`${trimmed}\n${text}`);
    if (!parsed.ok) {
      console.error("Refused. A fetched page is not a pick unless it states the required fields.");
      if (parsed.missing.length > 0) console.error(`Missing: ${parsed.missing.join(", ")}`);
      for (const error of parsed.errors) console.error(error);
      process.exit(1);
    }
    await finish(parsed.pick, dryRun);
    return;
  }

  const parsed = parseIngest(raw);
  if (!parsed.ok) {
    console.error("Refused.");
    if (parsed.missing.length > 0) console.error(`Missing: ${parsed.missing.join(", ")}`);
    for (const error of parsed.errors) console.error(error);
    process.exit(1);
  }
  await finish(parsed.pick, dryRun);
}

async function finish(pick: IngestPick, dryRun: boolean) {
  const stored: StoredPick = { ...pick, id: ingestId(pick) };
  if (dryRun) {
    console.log(JSON.stringify(stored, null, 2));
    return;
  }
  const existing = loadStored();
  if (existing.some((row) => row.id === stored.id || (row.sourceUrl === stored.sourceUrl && row.selection === stored.selection))) {
    console.error(`Refused. ${stored.id} is already in data/verified-ingested.json.`);
    process.exit(1);
  }
  existing.push(stored);
  writeFileSync(INGESTED_PATH, `${JSON.stringify(existing, null, 2)}\n`);
  await writePick(stored);
  console.log(`Ingested ${stored.id} as pending. No score was written. Run npm run grade after the game is final.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
