import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { SHARE_IMAGE_URL, SITE_URL, SPORTS_URL, sitePath } from "../lib/site-urls";

const previewSuffix = ["vercel", "app"].join(".");
const previewHost = `charoof-git-preview-hoonu.${previewSuffix}`;
const distDir = ".next-preview-head";
const textExt = new Set([".html", ".rsc", ".json", ".meta"]);
const skipDirs = new Set(["node_modules", ".git", ".next", distDir, "out", "build", "coverage"]);

function appPath(rel: string) {
  return fileURLToPath(new URL(`../${distDir}/server/app/${rel}`, import.meta.url));
}

function readApp(rel: string) {
  return readFileSync(appPath(rel), "utf8");
}

/** Built HTML, RSC payloads, and static JSON under server/app for one route. */
function routeFiles(rel: string): string[] {
  const abs = appPath(rel);
  let entries;
  try {
    entries = readdirSync(abs, { withFileTypes: true });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOTDIR") return textExt.has(extname(rel)) ? [rel] : [];
    throw error;
  }
  const out: string[] = [];
  for (const entry of entries) out.push(...routeFiles(join(rel, entry.name)));
  return out;
}

function headOf(html: string, file: string) {
  const end = html.indexOf("</head>");
  assert.ok(end > 0, `${file} has no head`);
  return html.slice(0, end);
}

function contents(head: string, attr: "property" | "name", key: string) {
  const pattern = new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`, "g");
  return [...head.matchAll(pattern)].map((match) => match[1]);
}

function walkFiles(root: string, skip: Set<string>): string[] {
  const out: string[] = [];
  const visit = (rel: string) => {
    const abs = rel ? join(root, rel) : root;
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const child = rel ? join(rel, entry.name) : entry.name;
      if (entry.isDirectory()) visit(child);
      else if (entry.isFile()) out.push(child);
    }
  };
  visit("");
  return out;
}

describe("preview deployment heads", () => {
  it("allows the retired production host only on its redirect config line", () => {
    const root = fileURLToPath(new URL("..", import.meta.url));
    const legacyHost = `charoof.${previewSuffix}`;
    const allowedLine = `has: [{ type: "host", value: "${legacyHost}" }],`;
    let allowedCount = 0;
    const leaks: string[] = [];

    for (const rel of walkFiles(root, skipDirs)) {
      const text = readFileSync(join(root, rel), "utf8");
      if (!text.toLowerCase().includes(previewSuffix)) continue;
      for (const line of text.split("\n")) {
        if (!line.toLowerCase().includes(previewSuffix)) continue;
        if (rel === "next.config.ts" && line.trim() === allowedLine) {
          allowedCount += 1;
          continue;
        }
        leaks.push(`${rel}: ${line.trim()}`);
      }
    }

    assert.equal(allowedCount, 1);
    assert.deepEqual(leaks, [], `unexpected ${previewSuffix} source:\n${leaks.join("\n")}`);
  });

  it("keeps built pages off the preview host when Vercel preview hosts are set", { timeout: 180_000 }, () => {
    const root = fileURLToPath(new URL("..", import.meta.url));
    const tsconfigPath = fileURLToPath(new URL("../tsconfig.json", import.meta.url));
    const tsconfig = readFileSync(tsconfigPath);
    let build;
    try {
      build = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
        cwd: root,
        env: {
          ...process.env,
          NEXT_DIST_DIR: distDir,
          VERCEL: "1",
          VERCEL_ENV: "preview",
          VERCEL_URL: previewHost,
          VERCEL_BRANCH_URL: previewHost,
        },
        encoding: "utf8",
      });
    } finally {
      writeFileSync(tsconfigPath, tsconfig);
    }
    assert.equal(
      build.status,
      0,
      `preview build failed\n${build.stdout?.slice(-2000) ?? ""}\n${build.stderr?.slice(-2000) ?? ""}`,
    );

    const pages: { html: string; url?: string; data: string[] }[] = [
      {
        html: "index.html",
        url: SITE_URL,
        data: ["index.rsc", "index.meta", "index.segments", "page", "page.js.nft.json"],
      },
      {
        html: "_not-found.html",
        data: ["_not-found.rsc", "_not-found.meta", "_not-found.segments", "_not-found"],
      },
      {
        html: "sports.html",
        url: SPORTS_URL,
        data: ["sports.rsc", "sports.meta", "sports.segments", "sports"],
      },
      {
        html: "method.html",
        url: sitePath("/method"),
        data: ["method.rsc", "method.meta", "method.segments", "method"],
      },
      {
        html: "disclaimer.html",
        url: sitePath("/disclaimer"),
        data: ["disclaimer.rsc", "disclaimer.meta", "disclaimer.segments", "disclaimer"],
      },
      {
        html: "terms.html",
        url: sitePath("/terms"),
        data: ["terms.rsc", "terms.meta", "terms.segments", "terms"],
      },
      {
        html: "contact.html",
        url: sitePath("/contact"),
        data: ["contact.rsc", "contact.meta", "contact.segments", "contact"],
      },
    ];

    const leaks: string[] = [];
    const scanned = new Set<string>();

    for (const page of pages) {
      const html = readApp(page.html);
      const head = headOf(html, page.html);
      assert.equal(head.toLowerCase().includes(previewSuffix), false, `${page.html} head contains ${previewSuffix}`);
      assert.deepEqual(contents(head, "property", "og:image"), [SHARE_IMAGE_URL], page.html);
      assert.deepEqual(contents(head, "name", "twitter:image"), [SHARE_IMAGE_URL], page.html);
      assert.deepEqual(contents(head, "property", "og:url"), page.url ? [page.url] : [], page.html);

      for (const file of [page.html, ...page.data.flatMap(routeFiles)]) {
        if (scanned.has(file)) continue;
        scanned.add(file);
        if (readApp(file).toLowerCase().includes(previewSuffix)) leaks.push(file);
      }
    }

    const distRoot = fileURLToPath(new URL(`../${distDir}`, import.meta.url));
    const metadata = walkFiles(distRoot, new Set()).filter((rel) => /robots|sitemap/i.test(rel));
    const appEntries = readdirSync(join(distRoot, "server/app")).join("\n");
    assert.ok(metadata.some((rel) => /robots/i.test(rel)), `expected robots output\n${appEntries}`);
    assert.ok(metadata.some((rel) => /sitemap/i.test(rel)), `expected sitemap output\n${appEntries}`);
    for (const rel of metadata) {
      if (readFileSync(join(distRoot, rel), "utf8").toLowerCase().includes(previewSuffix)) leaks.push(rel);
    }

    assert.equal(pages.length, 7);
    assert.ok([...scanned].some((file) => file.endsWith(".html")));
    assert.ok([...scanned].some((file) => file.endsWith(".rsc")), "expected RSC payloads");
    assert.ok([...scanned].some((file) => file.endsWith(".json")), "expected static JSON");
    assert.deepEqual(
      leaks,
      [],
      `built HTML, page data, robots, or sitemap contains ${previewSuffix}:\n${leaks.join("\n")}`,
    );
  });
});
