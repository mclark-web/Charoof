import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { SHARE_IMAGE_URL, SITE_URL, SPORTS_URL, sitePath } from "../lib/site-urls";

const previewSuffix = ["vercel", "app"].join(".");
const previewHost = `charoof-git-preview-hoonu.${previewSuffix}`;
const distDir = ".next-preview-head";

function headOf(file: string) {
  const html = readFileSync(new URL(`../${distDir}/server/app/${file}`, import.meta.url), "utf8");
  const end = html.indexOf("</head>");
  assert.ok(end > 0, `${file} has no head`);
  return html.slice(0, end);
}

function contents(head: string, attr: "property" | "name", key: string) {
  const pattern = new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`, "g");
  return [...head.matchAll(pattern)].map((match) => match[1]);
}

describe("preview deployment heads", () => {
  it("keeps share tags on the site origin when Vercel preview hosts are set", { timeout: 180_000 }, () => {
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

    const pages: Record<string, string> = {
      "index.html": SITE_URL,
      "_not-found.html": SITE_URL,
      "sports.html": SPORTS_URL,
      "method.html": sitePath("/method"),
      "disclaimer.html": sitePath("/disclaimer"),
      "terms.html": sitePath("/terms"),
      "contact.html": sitePath("/contact"),
    };

    for (const [file, url] of Object.entries(pages)) {
      const head = headOf(file);
      assert.equal(head.toLowerCase().includes(previewSuffix), false, `${file} head contains ${previewSuffix}`);
      assert.deepEqual(contents(head, "property", "og:image"), [SHARE_IMAGE_URL], file);
      assert.deepEqual(contents(head, "name", "twitter:image"), [SHARE_IMAGE_URL], file);
      assert.deepEqual(contents(head, "property", "og:url"), [url], file);
    }
  });
});
