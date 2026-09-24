/**
 * Pixel-samples grade pills, GC Scale labels, and % readouts against the
 * rendered background with the text hidden. Also checks horizontal overflow.
 * Run against a local server: node scripts/pill-contrast.mjs
 */
import puppeteer from "puppeteer-core";
import { PNG } from "pngjs";

const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const routes = ["/", "/gc-scale", "/sports", "/fintwit", "/gcbot", "/analysts", "/method", "/contact", "/disclaimer", "/terms", "/sign-in"];
const widths = [390, 820, 1440];
const chrome = process.env.CHROME_PATH || "/usr/bin/google-chrome";
const floor = 4.5;

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

function interiorColor(png) {
  const inset = Math.min(4, Math.floor(png.width / 4), Math.floor(png.height / 4));
  const samples = [];
  for (let y = inset; y < png.height - inset; y++) {
    for (let x = inset; x < png.width - inset; x++) {
      const i = (png.width * y + x) << 2;
      if (png.data[i + 3] < 16) continue;
      samples.push([png.data[i], png.data[i + 1], png.data[i + 2]]);
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
const overflows = [];
for (const width of widths) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: "networkidle0", timeout: 45000 });
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth };
    });
    if (overflow.scrollWidth > overflow.clientWidth + 1) {
      overflows.push({ width, route, ...overflow });
    }
    const handles = await page.$$(".gc-grade-tag, .gc-label, .gc-pct");
    for (const handle of handles) {
      const meta = await handle.evaluate((el) => {
        el.scrollIntoView({ block: "center", inline: "center" });
        const s = getComputedStyle(el);
        const kind = el.classList.contains("gc-grade-tag")
          ? ["strong", "provisional", "weak", "exit"].find((name) => el.classList.contains(name)) || "pill"
          : el.classList.contains("gc-label")
            ? "label"
            : "pct";
        return { kind, text: el.textContent.trim(), color: s.color };
      });
      const fg = parseRgb(meta.color);
      await handle.evaluate((el) => {
        el.style.color = "transparent";
        el.style.webkitTextFillColor = "transparent";
        el.style.textShadow = "none";
      });
      const box = await handle.boundingBox();
      const scroll = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
      let bg = null;
      if (box && box.width >= 4 && box.height >= 4) {
        // This Puppeteer build clips in document coordinates, not viewport coordinates.
        const buf = await page.screenshot({
          type: "png",
          clip: {
            x: Math.max(0, box.x + scroll.x),
            y: Math.max(0, box.y + scroll.y),
            width: Math.min(box.width, 1400),
            height: Math.min(box.height, 80),
          },
        });
        bg = interiorColor(PNG.sync.read(buf));
      }
      await handle.evaluate((el) => {
        el.style.color = "";
        el.style.webkitTextFillColor = "";
        el.style.textShadow = "";
      });
      const ratio = fg && bg ? contrast(fg, bg) : 0;
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

const order = ["strong", "provisional", "weak", "exit", "label", "pct"];
console.log("count", rows.length);
for (const width of widths) {
  for (const kind of order) {
    const hit = mins[`${width} ${kind}`];
    if (!hit) {
      console.log(`${width} ${kind}: none`);
      continue;
    }
    const bg = hit.bg ? hit.bg.map((n) => n.toString(16).padStart(2, "0")).join("") : "??????";
    console.log(`${width} ${kind}: min ${hit.ratio.toFixed(2)}:1 on ${hit.route} "${hit.text}" bg #${bg}`);
  }
}

if (overflows.length) {
  console.log("horizontal overflow", overflows.length);
  for (const row of overflows) {
    console.log(`  ${row.width} ${row.route} scroll ${row.scrollWidth} client ${row.clientWidth}`);
  }
}

const failing = rows.filter((row) => row.ratio < floor);
if (failing.length || overflows.length) {
  console.log("below 4.5", failing.length);
  for (const row of failing.slice(0, 20)) {
    const bg = row.bg ? row.bg.map((n) => n.toString(16).padStart(2, "0")).join("") : "??????";
    console.log(`  ${row.ratio.toFixed(2)} ${row.width} ${row.route} ${row.kind} "${row.text}" bg #${bg}`);
  }
  process.exit(1);
}
console.log("pills, labels, and readouts are at least 4.5:1; no horizontal overflow");
