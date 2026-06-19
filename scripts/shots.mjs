/* eslint-disable no-console -- CLI render script: console is the intended progress output */
// Renders Claude Design "design system" handoff pages to WebP for the /design page.
// Run manually (NOT part of next build):  node scripts/shots.mjs
// Needs the handoff zips in ~/Downloads. Output -> public/images/design/<name>.webp
//
// Note: the per-screen mockups (*.dc.html) are interactive design canvases whose
// hero preview is painted by a JS bundle that does not render in headless, and the
// settle screens load React via CDN with integrity hashes that fail under file://.
// So only the design SYSTEM pages (pure token CSS) are captured here; the shipped
// product screenshots already live in public/images/<project>/.

import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const DL = join(homedir(), "Downloads");
const OUT = join(process.cwd(), "public", "images", "design");
const TMP = join(tmpdir(), "nm-design-shots");

// design system pages that render cleanly (token CSS, no JS bundle)
const TARGETS = [
  { zip: "Nico Mastakas Design System-handoff.zip", file: "nico-mastakas-design-system/project/Foundations.html", out: "ds-portfolio.webp", width: 1200, fullPage: true },
  { zip: "Hiring Radar Design System-handoff.zip", file: "hiring-radar-design-system/project/Style Guide.html", out: "ds-hiring-radar.webp", width: 1200, fullPage: true },
  // settle Foundations is ~14k px tall; clip to the foundational top (colors/type/spacing)
  { zip: "Settle Design System-handoff.zip", file: "settle-design-system/project/Foundations.html", out: "ds-settle.webp", width: 1200, fullPage: false, height: 2200 },
];

mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
for (const t of TARGETS) {
  const dest = join(TMP, t.zip.replace(/[^a-z0-9]/gi, "_"));
  mkdirSync(dest, { recursive: true });
  execFileSync("unzip", ["-o", "-q", join(DL, t.zip), "-d", dest]);

  // strip em-dashes from the rendered artifact (Nico's hard rule, even in images)
  const htmlPath = join(dest, t.file);
  const html = readFileSync(htmlPath, "utf8").replace(/\s*—\s*/g, ", ");
  writeFileSync(htmlPath, html);

  const page = await browser.newPage({ viewport: { width: t.width, height: t.height ?? 1200 }, deviceScaleFactor: 2 });
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  const png = await page.screenshot({ fullPage: t.fullPage !== false });
  await page.close();

  await sharp(png).webp({ quality: 82 }).toFile(join(OUT, t.out));
  const meta = await sharp(png).metadata();
  console.log(`${t.out}  ${meta.width}x${meta.height}  ->  webp`);
}
await browser.close();
rmSync(TMP, { recursive: true, force: true });
console.log("done");
