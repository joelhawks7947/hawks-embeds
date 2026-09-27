// top-10: copy, categories, record highlighting, data parity with the original, loading, fallbacks.
const { test, expect } = require("@playwright/test");
const fs = require("fs"), path = require("path"), vm = require("vm");
const { watchConsole, ready } = require("./helpers");

const TT = '[data-hawks="top-10"]';
const ref = fs.readFileSync(path.join(__dirname, "../reference/top-10.html"), "utf8");
const REF = vm.runInNewContext("(" + /var DATA = (\{[\s\S]*?\n    \});/.exec(ref)[1] + ")");
const CATS = [["points", "Points"], ["rebounds", "Rebounds"], ["threes", "3PM"], ["assists", "Assists"], ["blocks", "Blocks"], ["steals", "Steals"]];
const norm = (t) => t.replace(/\s+/g, " ").trim();

async function open(page, url = "/test/") { const log = watchConsole(page); await page.goto(url); await ready(page); return log; }

test("copy matches the original (slogan removed, as agreed)", async ({ page }) => {
  const log = await open(page);
  const tt = page.locator(TT).first();
  const refText = (cls) => norm(new RegExp('class="hksfeats__' + cls + '">([\\s\\S]*?)<').exec(ref)[1]);
  await expect(tt.locator(".hksfeats__overline")).toHaveText(refText("overline"));
  await expect(tt.locator("h2")).toHaveText(refText("heading"));
  expect(norm(await tt.locator(".hksfeats__intro").textContent())).toBe(refText("intro"));
  expect(refText("intro")).toContain("Hawks history - every game since 1979");
  const refNote = refText("note");
  expect(refNote).toContain("STRONGER. LOUDER. TOGETHER.");
  await expect(tt.locator(".hksfeats__note")).toHaveText(refNote.replace(" STRONGER. LOUDER. TOGETHER.", ""));
  await expect(tt).not.toContainText("STRONGER");
  await expect(tt.locator(".hksfeats__tab")).toHaveText(CATS.map((c) => c[1]));
  await expect(tt.locator(".hksfeats__record-label")).toHaveText("Club record");
  expect(log.errors).toEqual([]);
});

test("every category's table matches the original row for row", async ({ page }) => {
  await open(page);
  const tt = page.locator(TT).first();
  for (const [i, [key, tab]] of CATS.entries()) {
    await tt.locator(".hksfeats__tab").nth(i).click();
    const d = REF[key];
    await expect(tt.locator(".hksfeats__statcol")).toHaveText(d.label);
    await expect(tt.locator(".hksfeats__record-stat")).toHaveText(d.record);
    await expect(tt.locator(".hksfeats__record-detail")).toHaveText(d.recordDetail);
    await expect(tt.locator("caption")).toHaveText("Top 10 single-game feats: " + tab);
    const rows = await tt.locator("tbody tr").evaluateAll((trs) => trs.map((tr) => [...tr.cells].map((c) => c.textContent)));
    expect(rows).toEqual(d.rows.map((r) => r.map(String)));
  }
});

test("category buttons: one pressed at a time, keyboard works", async ({ page }) => {
  await open(page);
  const tt = page.locator(TT).first(), tabs = tt.locator(".hksfeats__tab");
  await expect(tt.locator('[role="group"]')).toHaveAttribute("aria-label", "Stat categories");
  await expect(tabs.first()).toHaveAttribute("aria-pressed", "true");
  await tabs.nth(2).focus();
  await page.keyboard.press("Enter");
  await expect(tabs.nth(2)).toHaveAttribute("aria-pressed", "true");
  await expect(tabs.first()).toHaveAttribute("aria-pressed", "false");
  await tabs.nth(4).focus();
  await page.keyboard.press("Space");
  await expect(tt.locator(".hksfeats__statcol")).toHaveText("BLK");
  expect(await tt.locator('.hksfeats__tab[aria-pressed="true"]').count()).toBe(1);
  // The second instance on the page is independent.
  await expect(page.locator(TT).nth(1).locator(".hksfeats__statcol")).toHaveText("PTS");
});

test("every row equal to the record is highlighted with a red left edge, never a dark red background", async ({ page }) => {
  await open(page);
  const tt = page.locator(TT).first();
  for (const [i, n] of [[0, 1], [3, 2], [4, 4]]) {
    await tt.locator(".hksfeats__tab").nth(i).click();
    await expect(tt.locator("tr.hksfeats__row--record")).toHaveCount(n);
  }
  const edge = await tt.locator("tr.hksfeats__row--record td").first().evaluate((td) => getComputedStyle(td).boxShadow);
  expect(edge).toContain("rgb(255, 0, 19)");
  const darkRed = await tt.locator("tr, td").evaluateAll((els) => els.filter((e) => getComputedStyle(e).backgroundColor === "rgb(191, 0, 0)").length);
  expect(darkRed).toBe(0);
});

test("light version via data-hawks-theme", async ({ page }) => {
  await open(page);
  const bg = (i) => page.locator(TT).nth(i).locator(".hksfeats").evaluate((e) => [getComputedStyle(e).backgroundColor, getComputedStyle(e).borderTopColor]);
  expect(await bg(0)).toEqual(["rgb(0, 0, 0)", "rgb(255, 0, 19)"]);
  expect(await bg(1)).toEqual(["rgb(255, 255, 255)", "rgb(0, 0, 0)"]);
});

test("top10.js loads once, and only on pages with the Top 10 embed", async ({ page }) => {
  await open(page);
  expect(await page.locator('script[src*="top10.js?v="]').count()).toBe(1);
  await page.route("**/test/no-top10.html", (r) => r.fulfill({ contentType: "text/html",
    body: '<!DOCTYPE html><html><head><link rel="stylesheet" href="webflow-sim.css"></head><body><div data-hawks="newsletter"><a href="https://mailchi.mp/hawks/illawarra-hawks-newsletter">Join</a></div><script src="../hawks.js" defer></script></body></html>' }));
  await open(page, "/test/no-top10.html");
  await expect(page.locator(".hkscta")).toBeVisible();
  expect(await page.locator('script[src*="top10.js"]').count()).toBe(0);
});

test("if top10.js is broken, Top 10 keeps its fallback link and everything else still renders", async ({ page }) => {
  const log = watchConsole(page);
  await page.route("**/top10.js*", (r) => r.fulfill({ contentType: "text/javascript", body: "window.HAWKS_TOP10 = { categories: [ { tab:'Points',, ] };" }));
  await page.goto("/test/");
  await ready(page);
  await expect(page.locator(TT).first().locator("a")).toHaveAttribute("href", "https://www.hawks.com.au/pages/illawarra-hawks-history");
  await expect(page.locator(TT).first().locator(".hksfeats")).toHaveCount(0);
  await expect(page.locator('[data-hawks="newsletter"] .hkscta').first()).toBeVisible();
  expect(log.errors.join("\n")).toMatch(/top10\.js did not set window\.HAWKS_TOP10|SyntaxError/);
});
