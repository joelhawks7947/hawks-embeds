// game-countdown: countdown and game list with no ticket links, cutoffs by weekday or weekend.
const { test, expect } = require("@playwright/test");
const { loadData, useData, watchConsole, ready } = require("./helpers");

const GC = '[data-hawks="game-countdown"] .hkgc';
async function freeze(page) {
  await page.clock.install({ time: new Date("2026-09-27T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-09-27T00:00:01Z"));
}
async function open(page, now, route) {
  const log = watchConsole(page);
  await page.goto("/test/?hk_now=" + now); await ready(page);
  return log;
}
const head = (page) => page.locator(GC + " .hkgc__head").first();

test("shows the next game, a countdown to tip-off, and the next 5 games after it", async ({ page }) => {
  await freeze(page);
  const log = await open(page, "2026-10-22T13:00:00");
  await expect(head(page)).toHaveText("Hawks v Sydney Kings");
  await expect(page.locator(GC + " .hkgc__meta").first()).toHaveText("Thursday 22nd October, 7:30pm tip-off, WIN Entertainment Centre");
  const nums = await page.locator(GC + " .hkgc__num").evaluateAll((e) => e.slice(0, 4).map((x) => x.textContent));
  expect(nums).toEqual(["00", "06", "30", "00"]);
  const t = page.locator(GC + " .hkgc__timer").first();
  await expect(t).toHaveAttribute("role", "timer");
  await expect(t).toHaveAttribute("aria-live", "off");
  const opps = await page.locator(GC + " .hkgc__opp").first().locator("xpath=ancestor::ul").locator(".hkgc__opp").allTextContents();
  expect(opps).toEqual(["v Brisbane Bullets", "v Adelaide 36ers", "v Sydney Kings", "v Tasmania JackJumpers", "v Melbourne United"]);
  await expect(page.locator(GC + " .hkgc__sub").first()).toHaveText("Game 5, 5:30pm tip-off");
  expect(log.errors).toEqual([]);
});

test("no ticket links or buttons anywhere in it", async ({ page }) => {
  await open(page, "2026-10-19T12:00");
  expect(await page.locator(GC + " a, " + GC + " button").count()).toBe(0);
});

test("weekday game: stops being the next game 6 hours before tip-off, then the next game takes over", async ({ page }) => {
  await freeze(page);
  await open(page, "2026-10-22T13:29:59");
  await expect(head(page)).toHaveText("Hawks v Sydney Kings");
  await open(page, "2026-10-22T13:30:00");
  await expect(head(page)).toHaveText("Hawks v Brisbane Bullets");
  // Game 6 is a Thursday: 7:30pm tip-off, so 1:30pm cutoff.
  await open(page, "2026-11-19T13:29:59");
  await expect(head(page)).toHaveText("Hawks v Adelaide 36ers");
  await open(page, "2026-11-19T13:30:00");
  await expect(head(page)).toHaveText("Hawks v Sydney Kings");
});

test("weekend games: stop at 12pm on the Friday before (Saturday and Sunday)", async ({ page }) => {
  await freeze(page);
  // Game 5, Saturday 24 October: cutoff Friday 23 October 12:00.
  await open(page, "2026-10-23T11:59:59");
  await expect(head(page)).toHaveText("Hawks v Brisbane Bullets");
  await open(page, "2026-10-23T12:00:00");
  await expect(head(page)).toHaveText("Hawks v Adelaide 36ers");
  // Game 9, Sunday 20 December: cutoff Friday 18 December 12:00.
  await open(page, "2026-12-18T11:59:59");
  await expect(head(page)).toHaveText("Hawks v Melbourne United");
  await open(page, "2026-12-18T12:00:00");
  await expect(head(page)).toHaveText("Hawks v New Zealand Breakers");
});

test("daylight saving (AEDT): the countdown lands on the right tip-off in January", async ({ page }) => {
  await freeze(page);
  // Game 12, Saturday 2 January 2027 (AEDT, UTC+11), 5:30pm tip-off; Friday 1 January 12:00 cutoff.
  await open(page, "2026-12-31T17:30:00");
  await expect(head(page)).toHaveText("Hawks v Cairns Taipans");
  const nums = await page.locator(GC + " .hkgc__num").evaluateAll((e) => e.slice(0, 4).map((x) => x.textContent));
  expect(nums).toEqual(["02", "00", "00", "00"]);
});

test("hidden after the last game's cutoff", async ({ page }) => {
  await freeze(page);
  // Game 16, Thursday 4 February 2027, 7:30pm tip-off: cutoff 1:30pm.
  await open(page, "2027-02-04T13:29:59");
  await expect(head(page)).toHaveText("Hawks v Brisbane Bullets");
  await expect(page.locator(GC + " .hkgc__more").first()).toHaveText("");
  await open(page, "2027-02-04T13:30:00");
  await expect(page.locator(GC).first()).toBeHidden();
});

test("the cutoffs and list length come from data.js; data-count overrides the length", async ({ page }) => {
  await useData(page, (d) => { d.gameCountdown = { weekdayHours: 2, weekendTime: "09:00", count: 2 }; });
  await open(page, "2026-10-22T17:29:00");
  await expect(head(page)).toHaveText("Hawks v Sydney Kings");
  await expect(page.locator(GC + " .hkgc__row").first().locator("xpath=ancestor::ul").locator(".hkgc__row")).toHaveCount(2);
  await open(page, "2026-10-22T17:30:00");
  await expect(head(page)).toHaveText("Hawks v Brisbane Bullets");
});

test("data-count on the placeholder sets the list length", async ({ page }) => {
  await page.route((u) => /^\/test\/(index\.html)?$/.test(u.pathname), async (route) => {
    const r = await route.fetch();
    await route.fulfill({ response: r, body: (await r.text()).replace('data-hawks="game-countdown"', 'data-hawks="game-countdown" data-count="8"') });
  });
  await open(page, "2026-10-19T12:00");
  await expect(page.locator(GC + " .hkgc__row")).toHaveCount(8);
});

test("it is light and transparent", async ({ page }) => {
  await open(page, "2026-10-19T12:00");
  expect(await page.locator(GC).first().evaluate((e) => [getComputedStyle(e).backgroundColor, getComputedStyle(e).color])).toEqual(["rgba(0, 0, 0, 0)", "rgb(0, 0, 0)"]);
});

test("bad gameCountdown settings fall back to the defaults with a warning", async ({ page }) => {
  await useData(page, (d) => { d.gameCountdown = { weekdayHours: "six", weekendTime: "noon", count: -1 }; });
  const log = await open(page, "2026-10-22T13:29:59");
  expect(log.warnings.join("\n")).toMatch(/gameCountdown\.weekdayHours ignored/);
  expect(log.warnings.join("\n")).toMatch(/gameCountdown\.weekendTime ignored/);
  expect(log.warnings.join("\n")).toMatch(/gameCountdown\.count ignored/);
  await expect(head(page)).toHaveText("Hawks v Sydney Kings");
});

test("no horizontal scroll at 320, 390, 768 and 1280", async ({ page }) => {
  for (const w of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width: w, height: 900 });
    await open(page, "2026-10-19T12:00");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), "width " + w).toBeLessThanOrEqual(0);
  }
});
