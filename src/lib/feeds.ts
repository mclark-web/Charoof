import { prisma } from "@/lib/db";

export type FeedMode = "demo" | "live";

export type VerifiedFinal = {
  eventId: string;
  status: "final";
  homeScore: number;
  awayScore: number;
  source: string;
};

export type ResultsAdapter = {
  id: string;
  mode: FeedMode;
  label: string;
  /**
   * Verified finals only. An empty list means there is no verified result.
   * Callers must not invent a score to fill the gap.
   */
  fetchFinals(eventIds: string[]): Promise<VerifiedFinal[]>;
};

const demoSeedAdapter: ResultsAdapter = {
  id: "demo-seed",
  mode: "demo",
  label: "Charoof demo seed",
  async fetchFinals(eventIds) {
    if (eventIds.length === 0) return [];
    const events = await prisma.event.findMany({
      where: {
        id: { in: eventIds },
        status: "final",
        source: "demo-seed",
        homeScore: { not: null },
        awayScore: { not: null },
      },
    });
    return events.flatMap((event) => {
      if (event.homeScore == null || event.awayScore == null) return [];
      return [
        {
          eventId: event.id,
          status: "final" as const,
          homeScore: event.homeScore,
          awayScore: event.awayScore,
          source: event.source,
        },
      ];
    });
  },
};

const unconfiguredLiveAdapter: ResultsAdapter = {
  id: "live-unconfigured",
  mode: "live",
  label: "Live feed (not configured)",
  async fetchFinals() {
    return [];
  },
};

export function getResultsAdapter(): ResultsAdapter {
  if (process.env.RESULTS_FEED === "live") return unconfiguredLiveAdapter;
  return demoSeedAdapter;
}

export function feedNotice(adapter: ResultsAdapter): string {
  if (adapter.mode === "live") {
    return "A live results feed was requested, but no verified adapter is configured. Charoof will not invent finals. Any score still on the ledger is demo seed data and stays labeled that way.";
  }
  return "The live board grades verified public cards on free finals. Demo fiction is only on /sports/demo. Charoof does not invent a score the source did not record, and it does not call a paid odds API.";
}
