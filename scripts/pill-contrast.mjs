/**
 * Measures each grade pill's text color against the rendered fill behind it.
 * Run against a local server: node scripts/pill-contrast.mjs
 */
import puppeteer from "puppeteer-core";
import { PNG } from "pngjs";

const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const routes = ["/", "/gc-scale", "/sports", "/fintwit", "/gcbot", "/analysts", "/method"];
const widths = [390, 1440];
const chrome = process.env.CHROME_PATH || "/usr/bin/google-chrome";

function channel(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(r, g, b) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(fg, bg) {
  const a = luminance(fg[0], fg[1], fg[2]);
  const b = luminance(bg[0], bg[1], bg[2]);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

function parseRgb(value) {
  const m = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function dist(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function interiorColor(png, text) {
  const samples = [];
  const x0 = 2;
  const x1 = Math.max(x0 + 1, Math.floor(png.width * 0.42));
  for (let y = 2; y < png.height - 2; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (png.width * y + x) << 2;
      const px = [png.data[i], png.data[i + 1], png.data[i + 2]];
      if (dist(px, text) < 48) continue;
      samples.push(px);
    }
  }
  if (!samples.length) return null;
  samples.sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  return samples[Math.floor(samples.length / 2)];
}

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
});

const rows = [];
for (const width of widths) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: "networkidle0", timeout: 30000 });
    const handles = await page.$$(".gc-grade-tag");
    for (const handle of handles) {
      const meta = await handle.evaluate((el) => {
        const s = getComputedStyle(el);
        const kind = ["strong", "provisional", "weak", "exit"].find((name) => el.classList.contains(name)) || "other";
        return { kind, text: el.textContent.trim(), color: s.color };
      });
      const fg = parseRgb(meta.color);
      const buf = await handle.screenshot({ type: "png" });
      const png = PNG.sync.read(buf);
      const bg = interiorColor(png, fg);
      const ratio = bg ? contrast(fg, bg) : 0;
      rows.push({ width, route, ...meta, bg, ratio });
    }
  }
  await page.close();
}
await browser.close();

const mins = {};
for (const row of rows) {
  const key = `${row.width} ${row.kind}`;
  if (!mins[key] || row.ratio < mins[key].ratio) mins[key] = row;
}

const order = ["strong", "provisional", "weak", "exit"];
console.log("count", rows.length);
for (const width of widths) {
  for (const kind of order) {
    const hit = mins[`${width} ${kind}`];
    if (!hit) {
      console.log(`${width} ${kind}: none`);
      continue;
    }
    const bg = hit.bg ? hit.bg.map((n) => n.toString(16).padStart(2, "0")).join("") : "??????";
    console.log(
      `${width} ${kind}: min ${hit.ratio.toFixed(2)}:1 on ${hit.route} "${hit.text}" bg #${bg}`,
    );
  }
}

const failing = rows.filter((row) => row.kind !== "exit" && row.ratio < 4.5);
if (failing.length) {
  console.log("below 4.5", failing.length);
  for (const row of failing.slice(0, 12)) {
    console.log(`  ${row.ratio.toFixed(2)} ${row.width} ${row.route} ${row.kind}`);
  }
  process.exit(1);
}
console.log("all STRONG / PROVISIONAL / WEAK pills are at least 4.5:1");
