/* eslint-disable no-console -- CLI render script: console is the intended progress output */
// Renders Claude Design design-system handoffs to WebP + a manifest for /design.
// Run manually (NOT part of next build):  pnpm shots
// Needs the 3 DS handoff zips in ~/Downloads.
//
// Why an HTTP server: the component cards render via React + Babel + a CDN bundle
// (<script type="text/babel"> + unpkg React with integrity hashes). Under file://
// those fail (CORS/integrity) and paint gray; over http:// they load and render.
// Em-dashes are stripped from served HTML (Nico's rule, even inside rendered images).

import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, extname } from "node:path";
import sharp from "sharp";

const DL = join(homedir(), "Downloads");
const OUT = join(process.cwd(), "public", "images", "design");
const MANIFEST = join(process.cwd(), "src", "lib", "designManifest.json");
const TMP = join(tmpdir(), "nm-ds-shots");

const SYSTEMS = {
  "hiring-radar": {
    zip: "Hiring Radar Design System-handoff.zip",
    base: "hiring-radar-design-system/project",
    overview: "Style Guide.html",
    cards: [
      "components/core/core.card.html",
      "components/data/data.card.html",
      "components/forms/forms.card.html",
      "components/navigation/navigation.card.html",
      "components/feedback/feedback.card.html",
      "components/overlay/overlay.card.html",
      "guidelines/brand-radar.card.html",
      "guidelines/brand-logo.card.html",
    ],
  },
  portfolio: {
    zip: "Nico Mastakas Design System-handoff.zip",
    base: "nico-mastakas-design-system/project",
    overview: "Foundations.html",
    cards: [
      "components/actions/buttons.card.html",
      "components/cards/case-study.card.html",
      "components/data/metric.card.html",
      "components/labels/tag.card.html",
      "components/navigation/nav.card.html",
      "components/content/content.card.html",
      "guidelines/button-states.card.html",
      "guidelines/case-states.card.html",
    ],
  },
  settle: {
    zip: "Settle Design System-handoff.zip",
    base: "settle-design-system/project",
    overview: "Foundations.html",
    cards: [
      "preview/buttons.html",
      "preview/badges.html",
      "preview/form.html",
      "preview/nav.html",
      "preview/table.html",
      "preview/command-palette.html",
    ],
  },
};

const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".jsx": "text/babel", ".mjs": "text/javascript", ".svg": "image/svg+xml", ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2" };
const stripDash = (s) => s.replace(/\s*—\s*/g, ", ");
const slug = (f) => f.split("/").pop().replace(/\.(card\.)?html$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();

function parseCard(html, file) {
  const m = html.match(/@dsCard([^>]*)-->/);
  const attr = (k) => {
    const r = m && m[1].match(new RegExp(`${k}="([^"]*)"`));
    return r ? stripDash(r[1]) : null;
  };
  const vp = m && m[1].match(/viewport="(\d+)x(\d+)"/);
  return {
    name: attr("name") || slug(file).replace(/-/g, " "),
    subtitle: attr("subtitle") || "",
    group: attr("group") || "Components",
    w: vp ? Number(vp[1]) : 900,
    h: vp ? Number(vp[2]) : 600,
    hasVp: !!vp,
  };
}

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const manifest = {};

for (const [sys, cfg] of Object.entries(SYSTEMS)) {
  const root = join(TMP, sys);
  mkdirSync(root, { recursive: true });
  execFileSync("unzip", ["-o", "-q", join(DL, cfg.zip), "-d", root]);
  const docroot = join(root, cfg.base);
  mkdirSync(join(OUT, sys), { recursive: true });

  const server = createServer(async (req, res) => {
    try {
      const p = join(docroot, decodeURIComponent(req.url.split("?")[0]));
      let buf = await readFile(p);
      if (extname(p) === ".html") buf = Buffer.from(stripDash(buf.toString("utf8")));
      res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" });
      res.end(buf);
    } catch {
      res.writeHead(404);
      res.end("nf");
    }
  });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const base = `http://localhost:${port}`;

  const render = async (file, out, { fullPage = false, w = 1200, h = 1200 } = {}) => {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    await page.goto(`${base}/${file}`, { waitUntil: "networkidle", timeout: 45000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2200);
    const png = await page.screenshot({ fullPage });
    await page.close();
    await sharp(png).webp({ quality: 82 }).toFile(join(OUT, sys, out));
    return sharp(png).metadata();
  };

  // overview (full page)
  await render(cfg.overview, "overview.webp", { fullPage: true, w: 1200 });
  console.log(`${sys}/overview.webp`);

  const cards = [];
  for (const file of cfg.cards) {
    const meta = parseCard(readFileSync(join(docroot, file), "utf8"), file);
    const out = `${slug(file)}.webp`;
    await render(file, out, meta.hasVp ? { w: meta.w, h: meta.h } : { fullPage: true, w: 1000 });
    cards.push({ file: out, name: meta.name, subtitle: meta.subtitle, group: meta.group });
    console.log(`${sys}/${out}  (${meta.group})`);
  }
  manifest[sys] = { overview: "overview.webp", cards };
  server.close();
}

await browser.close();
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
rmSync(TMP, { recursive: true, force: true });
console.log("manifest ->", MANIFEST);
