// Data files load from GitHub Pages first, then jsDelivr if Pages fails or is slow.
const { test, expect } = require("@playwright/test");
const fs = require("fs"), path = require("path");
const { ROOT, watchConsole, ready } = require("./helpers");

const CDN = "https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/";
const PAGES = "https://joelhawks7947.github.io/hawks-embeds/";
const js = (f) => ({ contentType: "text/javascript", body: fs.readFileSync(path.join(ROOT, f), "utf8") });
const file = (url) => new URL(url).pathname.split("/").pop();

/* pages: "ok", "fail" or "hang". The jsDelivr copy of data.js is marked so we can tell which one ran. */
async function hosts(page, pages) {
  const hits = [];
  await page.route(CDN + "**", (r) => {
    const f = file(r.request().url()); hits.push("cdn " + f);
    if (f === "data.js") return r.fulfill({ contentType: "text/javascript", body: js(f).body + "\nwindow.HAWKS_DATA.fromCdn = true;" });
    r.fulfill(js(f));
  });
  await page.route(PAGES + "**", (r) => {
    const f = file(r.request().url()); hits.push("pages " + f);
    if (pages === "fail") return r.abort();
    if (pages === "hang") return;
    r.fulfill(js(f));
  });
  return hits;
}

test("data.js and top10.js come from GitHub Pages; code from jsDelivr", async ({ page }) => {
  const hits = await hosts(page, "ok"), log = watchConsole(page);
  await page.goto("/test/cdn.html?hk_now=2026-10-11T11:42");
  await ready(page);
  await expect(page.locator(".hkmvp__btn")).toHaveText("Pick your MVP");
  await expect(page.locator(".hksfeats")).toHaveCount(1);
  expect(await page.evaluate(() => window.HAWKS_DATA.fromCdn)).toBeUndefined();
  expect(hits.sort()).toEqual(["cdn hawks-core.js", "cdn hawks.js", "pages data.js", "pages top10.js"]);
  expect(log.errors).toEqual([]);
});

for (const mode of ["fail", "hang"]) {
  test(`GitHub Pages ${mode === "fail" ? "down" : "not answering"}: falls back to jsDelivr`, async ({ page }) => {
    const hits = await hosts(page, mode), log = watchConsole(page);
    // A hanging request holds up the page "load" event, so don't wait for it.
    await page.goto("/test/cdn.html?hk_now=2026-10-11T11:42", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.__hawksEmbeds && window.__hawksEmbeds.instances.length === 2, null, { timeout: 15000 });
    await expect(page.locator(".hkmvp__btn")).toHaveText("Pick your MVP");
    expect(await page.evaluate(() => window.HAWKS_DATA.fromCdn)).toBe(true);
    expect(hits).toContain("cdn data.js");
    expect(hits).toContain("cdn top10.js");
    // The browser itself logs the failed Pages request; our script must not add errors.
    expect(log.errors.filter((e) => !e.startsWith("Failed to load resource"))).toEqual([]);
    expect(log.warnings.join("\n")).toContain("trying " + CDN);
  });
}
