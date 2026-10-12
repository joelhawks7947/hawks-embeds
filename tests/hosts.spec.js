// The core and data files load from GitHub Pages first, then jsDelivr if Pages fails or is slow.
const { test, expect } = require("@playwright/test");
const fs = require("fs"), path = require("path"), { execSync } = require("child_process");
const { ROOT, watchConsole, ready } = require("./helpers");

const CDN = "https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/";
const PAGES = "https://joelhawks7947.github.io/hawks-embeds/";
/* The last commit before the loader moved the core to Pages: browsers may hold this loader for 7 days. */
const BEFORE = "6453c0e";
const old = (f) => execSync("git show " + BEFORE + ":" + f, { cwd: ROOT, encoding: "utf8" });
const js = (f) => ({ contentType: "text/javascript", body: fs.readFileSync(path.join(ROOT, f), "utf8") });
const file = (url) => new URL(url).pathname.split("/").pop();

/* pages: "ok", "fail" or "hang", for the files in `on` (default: every file).
   Each host marks its copy of data.js so we can tell which one ran.
   swap: { "cdn hawks.js": body } serves an older version of a file from that host. */
async function hosts(page, pages, on, swap) {
  const hits = [];
  function serve(r, host) {
    const f = file(r.request().url());
    const body = (swap && swap[host + " " + f]) || js(f).body;
    r.fulfill({ contentType: "text/javascript", body: f === "data.js" ? body + "\nwindow.HAWKS_DATA.from = \"" + host + "\";" : body });
  }
  await page.route(CDN + "**", (r) => { hits.push("cdn " + file(r.request().url())); serve(r, "cdn"); });
  await page.route(PAGES + "**", (r) => {
    const f = file(r.request().url()); hits.push("pages " + f);
    if (!on || on.includes(f)) {
      if (pages === "fail") return r.abort();
      if (pages === "hang") return;
    }
    serve(r, "pages");
  });
  return hits;
}
async function go(page) {
  // A hanging request holds up the page "load" event, so don't wait for it.
  await page.goto("/test/cdn.html?hk_now=2026-10-11T11:42", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.__hawksEmbeds && window.__hawksEmbeds.instances.length === 2, null, { timeout: 25000 });
  await expect(page.locator(".hkmvp__btn")).toHaveText("Pick your MVP");
  await expect(page.locator(".hksfeats")).toHaveCount(1);
}
const from = (page) => page.evaluate(() => window.HAWKS_DATA.from);
const ourErrors = (log) => log.errors.filter((e) => !e.startsWith("Failed to load resource"));

test("core, data.js and top10.js all come from GitHub Pages; only the loader from jsDelivr", async ({ page }) => {
  const hits = await hosts(page, "ok"), log = watchConsole(page);
  await go(page);
  expect(await from(page)).toBe("pages");
  expect(hits.sort()).toEqual(["cdn hawks.js", "pages data.js", "pages hawks-core.js", "pages top10.js"]);
  expect(log.errors).toEqual([]);
  expect(log.warnings.filter((w) => w.includes("could not load"))).toEqual([]);
});

for (const mode of ["fail", "hang"]) {
  test(`GitHub Pages ${mode === "fail" ? "down" : "not answering"}: everything falls back to jsDelivr`, async ({ page }) => {
    test.setTimeout(60000);
    const hits = await hosts(page, mode), log = watchConsole(page);
    await go(page);
    expect(await from(page)).toBe("cdn");
    expect(hits).toEqual(expect.arrayContaining(["cdn hawks-core.js", "cdn data.js", "cdn top10.js"]));
    // The browser itself logs the failed Pages request; our script must not add errors.
    expect(ourErrors(log)).toEqual([]);
    expect(log.warnings.join("\n")).toContain("could not load " + PAGES + "hawks-core.js");
    expect(log.warnings.join("\n")).toContain("trying " + CDN);
  });
}

test("core from Pages but Pages fails for data: data still falls back to jsDelivr", async ({ page }) => {
  const hits = await hosts(page, "fail", ["data.js", "top10.js"]), log = watchConsole(page);
  await go(page);
  expect(hits).toContain("pages hawks-core.js");
  expect(hits).not.toContain("cdn hawks-core.js");
  expect(await from(page)).toBe("cdn");
  expect(hits).toContain("cdn top10.js");
  expect(ourErrors(log)).toEqual([]);
});

test("a browser still holding the old loader: core from jsDelivr, data from Pages", async ({ page }) => {
  const hits = await hosts(page, "ok", null, { "cdn hawks.js": old("hawks.js") }), log = watchConsole(page);
  await go(page);
  expect(hits.sort()).toEqual(["cdn hawks-core.js", "cdn hawks.js", "pages data.js", "pages top10.js"]);
  expect(await from(page)).toBe("pages");
  expect(log.errors).toEqual([]);
});

test("new loader with the previous core on Pages (mid-deploy): still renders", async ({ page }) => {
  const hits = await hosts(page, "ok", null, { "pages hawks-core.js": old("hawks-core.js") }), log = watchConsole(page);
  await go(page);
  expect(hits).toContain("pages hawks-core.js");
  expect(await from(page)).toBe("pages");
  expect(log.errors).toEqual([]);
});

test("local copy (not jsDelivr): core and data come from the same folder", async ({ page }) => {
  const log = watchConsole(page), urls = [];
  page.on("request", (r) => urls.push(r.url()));
  await page.goto("/test/?hk_now=2026-10-11T11:42");
  await ready(page);
  expect(urls.filter((u) => /github\.io|jsdelivr/.test(u) && /\.js/.test(u))).toEqual([]);
  expect(log.errors).toEqual([]);
});
