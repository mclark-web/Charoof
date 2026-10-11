import assert from "node:assert/strict";
import { describe, it } from "node:test";
import verifiedPicks from "@/data/verified-picks.json";
import { openPickRows, postTimeUnconfirmed, verifiedPickRows } from "./books";
import { boardPrice, gradeFullGame } from "./sports-grade";

type StoredPick = {
  tipster: string;
  event: string;
  market: string;
  side: string;
  number: number | null;
  price: string | null;
  result: string;
  game_final: boolean;
  final_score: string;
  box_score_url: string;
  posted_at: string;
  source_url: string;
  game_date?: string;
};

const picks = verifiedPicks as StoredPick[];

describe("board price rule", () => {
  it("uses even money when the page states no American price", () => {
    assert.equal(boardPrice(null), "-100");
    assert.equal(boardPrice("  "), "-100");
    assert.equal(boardPrice("+315"), "+315");
    assert.equal(boardPrice("-111"), "-111");
    assert.equal(boardPrice("+115"), "+115");
  });
});

describe("Sep 19–30 verified finals", () => {
  it("partitions every card into a known result and keeps dropped cutoff titles out", () => {
    assert.ok(picks.length > 0);
    const allowed = new Set(["win", "loss", "push", "void", "pending"]);
    const counts = { win: 0, loss: 0, push: 0, void: 0, pending: 0 };
    for (const pick of picks) {
      assert.ok(allowed.has(pick.result), pick.result);
      counts[pick.result as keyof typeof counts] += 1;
      if (pick.result === "pending") {
        assert.equal(pick.game_final, false);
        assert.equal(pick.final_score, "Not final");
      } else {
        assert.equal(pick.game_final, true);
        assert.notEqual(pick.final_score, "");
        assert.notEqual(pick.final_score, "Not final");
        assert.notEqual(pick.box_score_url, "");
      }
    }
    assert.equal(counts.win + counts.loss + counts.push + counts.void + counts.pending, picks.length);
    assert.equal(
      verifiedPickRows().length,
      picks.filter((pick) => pick.result !== "pending" && !postTimeUnconfirmed(pick.posted_at)).length,
    );
    const titles = picks.map((pick) => `${pick.event} ${pick.side} ${pick.number ?? ""} ${pick.market}`);
    assert.equal(titles.some((title) => title.includes("South Dakota") && title.includes("58.5")), false);
    assert.equal(titles.some((title) => title.includes("Baylor") && title.includes("55.5")), false);
    assert.equal(titles.some((title) => title.includes("Liberty") && title.includes("52.5")), false);
    assert.equal(titles.some((title) => title.includes("Louisville") && title.includes("moneyline")), false);
    assert.equal(titles.some((title) => title.includes("Texas A&M") && title.includes("-16.5")), false);
    assert.equal(picks.some((pick) => pick.market === "yrfi"), false);
    const keys = picks.map((pick) =>
      [pick.tipster, pick.event, pick.market, pick.side, pick.number ?? "", pick.posted_at].join("|"),
    );
    assert.equal(new Set(keys).size, keys.length);
  });

  it("regrades full-game lines against the stored final", () => {
    let checked = 0;
    for (const pick of picks) {
      if (!pick.game_final) continue;
      const again = gradeFullGame({
        market: pick.market,
        side: pick.side,
        number: pick.number,
        finalScore: pick.final_score,
      });
      if (again == null) continue;
      checked += 1;
      assert.equal(again, pick.result, `${pick.tipster} ${pick.side} ${pick.final_score}`);
    }
    assert.ok(checked > 0);
  });

  it("grades the eight Sep 30 MLB finals that are no longer pending", () => {
    const settled = [
      ["Quinn Allen (Covers)", "Houston Astros", "Chicago White Sox @ Houston Astros", "loss", "Chicago White Sox 7, Houston Astros 3"],
      ["Quinn Allen (Covers)", "New York Yankees", "Boston Red Sox @ New York Yankees", "win", "Boston Red Sox 2, New York Yankees 9"],
      ["Quinn Allen (Covers)", "Chicago Cubs", "Chicago Cubs @ San Diego Padres", "loss", "Chicago Cubs 1, San Diego Padres 4"],
      ["Joe Osborne (Covers)", "Over", "Boston Red Sox @ New York Yankees", "win", "Boston Red Sox 2, New York Yankees 9"],
      ["Dustin Saracini (Covers)", "San Diego Padres", "Chicago Cubs @ San Diego Padres", "win", "Chicago Cubs 1, San Diego Padres 4"],
      ["Todd Cordell (Covers)", "Houston Astros", "Chicago White Sox @ Houston Astros", "loss", "Chicago White Sox 7, Houston Astros 3"],
      ["Chris Hatfield (Covers)", "Under", "Boston Red Sox @ New York Yankees", "loss", "Boston Red Sox 2, New York Yankees 9"],
      ["Chris Hatfield (Covers)", "Philadelphia Phillies", "Philadelphia Phillies @ Atlanta Braves", "win", "Philadelphia Phillies 4, Atlanta Braves 3 (10 innings)"],
    ] as const;
    for (const [tipster, side, event, result, finalScore] of settled) {
      const pick = picks.find((item) => item.tipster === tipster && item.side === side && item.event === event && item.game_date === "2026-09-30");
      assert.ok(pick, `${tipster} ${side}`);
      assert.equal(pick.game_final, true);
      assert.equal(pick.result, result);
      assert.equal(pick.final_score, finalScore);
      assert.notEqual(pick.box_score_url, "");
      const again = gradeFullGame({
        market: pick.market,
        side: pick.side,
        number: pick.number,
        finalScore: pick.final_score,
      });
      if (again != null) assert.equal(again, result);
    }
  });

  it("shows a stated price and the even-money unit price on the card", () => {
    const rows = verifiedPickRows();
    const rice = rows.find((row) => row.title.includes("Rice Owls moneyline"));
    assert.match(rice?.detail ?? "", /price \+315/);
    const unlv = rows.find((row) => row.detail.includes("UNLV Rebels @ Akron Zips"));
    assert.match(unlv?.detail ?? "", /price -146/);
    const ncState = rows.find((row) => row.title.includes("NC State −14"));
    assert.match(ncState?.detail ?? "", /price -108/);
    const tennessee = rows.find((row) => row.title.includes("Tennessee −34.5"));
    assert.match(tennessee?.detail ?? "", /price -112/);
    const rams = rows.find((row) => row.detail.includes("Los Angeles Rams @ Denver Broncos") && row.title.includes("Under"));
    assert.equal(rams?.result, "LOSS");
    assert.match(rams?.detail ?? "", /unit price -100/);
    assert.equal(rams?.fill, null);
  });
});

describe("Oct 3–5 finals", () => {
  it("grades the 26 games that were still pending", () => {
    const settled = [
      ["Jason Logan (Covers)", "Denver Broncos", "Denver Broncos @ San Francisco 49ers", "loss", "Denver Broncos 14, San Francisco 49ers 24"],
      ["Jason Logan (Covers)", "New York Giants", "Arizona Cardinals @ New York Giants", "win", "Arizona Cardinals 24, New York Giants 36"],
      ["Jason Logan (Covers)", "Los Angeles Rams", "Los Angeles Rams @ Philadelphia Eagles", "win", "Los Angeles Rams 24, Philadelphia Eagles 20"],
      ["Jason Logan (Covers)", "Under", "Los Angeles Rams @ Philadelphia Eagles", "win", "Los Angeles Rams 24, Philadelphia Eagles 20"],
      ["Jason Logan (Covers)", "Chicago Bears", "New York Jets @ Chicago Bears", "win", "New York Jets 12, Chicago Bears 23"],
      ["Jason Logan (Covers)", "Over", "New York Jets @ Chicago Bears", "loss", "New York Jets 12, Chicago Bears 23"],
      ["Jason Logan (Covers)", "Buffalo Bills", "New England Patriots @ Buffalo Bills", "loss", "New England Patriots 29, Buffalo Bills 26"],
      ["Dustin Saracini (Covers)", "San Francisco 49ers", "Denver Broncos @ San Francisco 49ers", "win", "Denver Broncos 14, San Francisco 49ers 24"],
      ["Dustin Saracini (Covers)", "Over", "Denver Broncos @ San Francisco 49ers", "loss", "Denver Broncos 14, San Francisco 49ers 24"],
      ["Dustin Saracini (Covers)", "Buffalo Bills", "New England Patriots @ Buffalo Bills", "loss", "New England Patriots 29, Buffalo Bills 26"],
      ["Dustin Saracini (Covers)", "Under", "New England Patriots @ Buffalo Bills", "loss", "New England Patriots 29, Buffalo Bills 26"],
      ["Jason Logan (Covers)", "Detroit Lions", "Detroit Lions @ Carolina Panthers", "loss", "Detroit Lions 26, Carolina Panthers 32"],
      ["Jason Logan (Covers)", "Over", "Detroit Lions @ Carolina Panthers", "win", "Detroit Lions 26, Carolina Panthers 32"],
      ["Quinn Allen (Covers)", "Dallas Cowboys", "Dallas Cowboys @ Houston Texans", "win", "Dallas Cowboys 34, Houston Texans 30"],
      ["Quinn Allen (Covers)", "Over", "Dallas Cowboys @ Houston Texans", "win", "Dallas Cowboys 34, Houston Texans 30"],
      ["Quinn Allen (Covers)", "Green Bay Packers", "Green Bay Packers @ Tampa Bay Buccaneers", "loss", "Green Bay Packers 17, Tampa Bay Buccaneers 14"],
      ["Quinn Allen (Covers)", "Over", "Green Bay Packers @ Tampa Bay Buccaneers", "loss", "Green Bay Packers 17, Tampa Bay Buccaneers 14"],
      ["Quinn Allen (Covers)", "Indianapolis Colts", "Indianapolis Colts vs Washington Commanders (neutral site, London)", "win", "Indianapolis Colts 30, Washington Commanders 13"],
      ["Quinn Allen (Covers)", "Over", "Indianapolis Colts vs Washington Commanders (neutral site, London)", "loss", "Indianapolis Colts 30, Washington Commanders 13"],
      ["Joshua Nunn (Action Network)", "Coastal Carolina Chanticleers", "Georgia Southern Eagles @ Coastal Carolina Chanticleers", "loss", "Georgia Southern Eagles 31, Coastal Carolina Chanticleers 24"],
      ["Rob Paul (Covers)", "Ohio State Buckeyes", "Ohio State Buckeyes @ Iowa Hawkeyes", "win", "Ohio State Buckeyes 31, Iowa Hawkeyes 14"],
      ["Rob Paul (Covers)", "Over", "Ohio State Buckeyes @ Iowa Hawkeyes", "loss", "Ohio State Buckeyes 31, Iowa Hawkeyes 14"],
      ["Rob Paul (Covers)", "Michigan Wolverines", "Michigan Wolverines @ Minnesota Golden Gophers", "loss", "Michigan Wolverines 14, Minnesota Golden Gophers 20"],
      ["Rob Paul (Covers)", "Under", "Michigan Wolverines @ Minnesota Golden Gophers", "win", "Michigan Wolverines 14, Minnesota Golden Gophers 20"],
      ["Jason Logan (Covers)", "Atlanta Falcons", "Atlanta Falcons @ New Orleans Saints", "win", "Atlanta Falcons 45, New Orleans Saints 24"],
      ["Jason Logan (Covers)", "Over", "Atlanta Falcons @ New Orleans Saints", "win", "Atlanta Falcons 45, New Orleans Saints 24"],
    ] as const;
    assert.equal(settled.length, 26);
    for (const [tipster, side, event, result, finalScore] of settled) {
      const matches = picks.filter((item) => item.tipster === tipster && item.side === side && item.event === event);
      assert.equal(matches.length, 1, `${tipster} ${side} ${event}`);
      const pick = matches[0];
      assert.ok(pick);
      assert.equal(pick.game_final, true);
      assert.equal(pick.result, result);
      assert.equal(pick.final_score, finalScore);
      assert.match(pick.box_score_url, /^https:\/\/www\.espn\.com\//);
      const again = gradeFullGame({
        market: pick.market,
        side: pick.side,
        number: pick.number,
        finalScore: pick.final_score,
      });
      assert.equal(again, result);
    }
  });
});

describe("open picks stay pending", () => {
  const open = picks.filter((pick) => pick.result === "pending");

  it("keeps games that are not final out of the win-loss record", () => {
    assert.equal(open.length, 29);
    assert.equal(
      openPickRows().length,
      open.filter((pick) => !postTimeUnconfirmed(pick.posted_at)).length,
    );
    assert.equal(
      open.some((pick) => pick.event.includes("Phillies") && /Quinn Allen|Jon Metler/.test(pick.tipster)),
      false,
    );
    assert.ok(open.every((pick) => pick.game_final === false && pick.final_score === "Not final"));
    const rows = openPickRows();
    assert.equal(verifiedPickRows().some((row) => row.result === "PENDING"), false);
    for (const row of rows) {
      assert.equal(row.sample, "Open");
      assert.equal(row.fill, null);
      assert.match(row.detail, /Not final/);
      assert.doesNotMatch(row.detail, /Final /);
      assert.notEqual(row.result, "LOSS");
    }
    assert.equal(open.some((pick) => pick.game_date === "2026-09-30"), false);
    assert.equal(open.some((pick) => pick.source_url.includes("red-sox-vs-yankees")), false);
    assert.equal(open.some((pick) => pick.source_url.includes("white-sox-vs-astros")), false);
    const logan = picks.filter(
      (pick) => pick.tipster.startsWith("Jason Logan") && pick.source_url.includes("picks-and-predictions-week-4"),
    );
    assert.equal(logan.length, 3);
    assert.ok(logan.every((pick) => pick.posted_at === "2026-09-30 13:55 ET" && pick.result !== "pending"));
    const lions = picks.filter((pick) => pick.source_url.includes("lions-vs-panthers"));
    assert.ok(lions.every((pick) => pick.posted_at === "2026-09-28 12:51 ET" && pick.game_final));
    const bears = picks.filter((pick) => pick.source_url.includes("jets-vs-bears"));
    assert.ok(bears.every((pick) => pick.posted_at === "2026-09-29 12:39 ET" && pick.game_final));
    const coastal = verifiedPickRows().find((row) => row.title.includes("Coastal Carolina"));
    assert.equal(coastal?.result, "LOSS");
    assert.match(coastal?.detail ?? "", /price \+115/);
    assert.match(coastal?.title ?? "", /Joshua Nunn/);
  });
});
