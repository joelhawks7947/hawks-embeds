// next-game: where-to-watch line (NBL broadcast wording) under the tickets, sold-out games, game on.
const { test, expect } = require("@playwright/test");
const { useData, watchConsole, ready } = require("./helpers");

const NG = '[data-hawks="next-game"]';
async function open(page, url) {
  const log = watchConsole(page);
  await page.goto(url);
  await ready(page);
  return { log, ng: page.locator(NG).first() };
}

test("tickets on sale: one information line under the ticket panels, tickets stay the only buttons", async ({ page }) => {
  const { log, ng } = await open(page, "/test/?hk_now=2026-11-19T08:00");
  await expect(ng.locator("h2")).toHaveText("Hawks v Adelaide 36ers");
  const tv = ng.locator(".hkng__tv");
  await expect(tv).toBeVisible();
  await expect(tv).toHaveText("Can't make it to WIN Entertainment Centre? Watch live on ESPN from 7:30pm AEDT.");
  await expect(tv.locator("a")).toHaveCount(0);
  await expect(ng.locator(".hkng__tvt")).toBeHidden();
  await expect(ng.locator('[data-k="tix"]')).toBeVisible();
  // The line comes after the ticket panels.
  const below = await page.evaluate(() => {
    const r = document.querySelector(".hkng"), t = r.querySelector('[data-k="tix"]'), l = r.querySelector(".hkng__tv");
    return !!(t.compareDocumentPosition(l) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(below).toBe(true);
  expect(log.errors).toEqual([]);
});

test("Saturday game: ESPN, 9Go! and 9Now", async ({ page }) => {
  const { ng } = await open(page, "/test/?hk_now=2027-01-02T06:00");
  await expect(ng.locator("h2")).toHaveText("Hawks v Cairns Taipans");
  await expect(ng.locator(".hkng__tv")).toHaveText("Can't make it to WIN Entertainment Centre? Watch live on ESPN, 9Go! and 9Now from 5:30pm AEDT.");
});

test("tickets on sale: no line until 12 hours before tip-off", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-09-27T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-09-27T00:00:01Z"));
  const { ng } = await open(page, "/test/?hk_now=2026-11-19T07:29");
  await expect(ng.locator("h2")).toHaveText("Hawks v Adelaide 36ers");
  await expect(ng.locator(".hkng__tv")).toBeHidden();
  await page.clock.fastForward(61000);
  await expect(ng.locator(".hkng__tv")).toHaveText("Can't make it to WIN Entertainment Centre? Watch live on ESPN from 7:30pm AEDT.");
});

test("during the game: Watch live on ESPN.", async ({ page }) => {
  const { ng } = await open(page, "/test/?hk_now=2026-11-19T19:45");
  await expect(ng.locator(".hkng__status")).toHaveText("Game on");
  // Moves up under the date during the game.
  await expect(ng.locator(".hkng__tvt")).toHaveText("Watch live on ESPN.");
  await expect(ng.locator(".hkng__tv")).toBeHidden();
  const order = await page.evaluate(() => [...document.querySelector(".hkng").querySelectorAll(".hkng__meta,.hkng__tvt,.hkng__status")].map((n) => n.className.split(" ")[0]));
  expect(order).toEqual(["hkng__meta", "hkng__tvt", "hkng__status"]);
  await expect(ng.locator(".hkng__meta")).toHaveClass(/hkng__meta--tight/);
});

test("flips from the pre-game line to the game-on line at tip-off", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-09-27T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-09-27T00:00:01Z"));
  const { ng } = await open(page, "/test/?hk_now=2026-11-19T19:29");
  await expect(ng.locator(".hkng__tv")).toHaveText(/from 7:30pm AEDT\.$/);
  await page.clock.fastForward(61000);
  await expect(ng.locator(".hkng__tvt")).toHaveText("Watch live on ESPN.");
  await expect(ng.locator(".hkng__tv")).toBeHidden();
});

test("sold out: the line replaces the ticket panels, days out too", async ({ page }) => {
  await useData(page, (d) => { d.games.find((g) => g.n === 6).soldOut = true; });
  const { log, ng } = await open(page, "/test/?hk_now=2026-11-15T12:00");
  await expect(ng.locator('[data-k="tix"]')).toBeHidden();
  await expect(ng.locator(".hkng__tvt")).toHaveText("Sold out. Watch live on ESPN from 7:30pm AEDT.");
  await expect(ng.locator(".hkng__tv")).toBeHidden();
  // Key times (with the function's Buy ticket link) stay.
  await expect(ng.locator(".hkng__times")).toBeVisible();
  // The next game is not sold out: its tickets come back after the rollover.
  const { ng: ng2 } = await open(page, "/test/?hk_now=2026-11-19T21:31");
  await expect(ng2.locator("h2")).toHaveText("Hawks v Sydney Kings");
  await expect(ng2.locator('[data-k="tix"]')).toBeVisible();
  await expect(ng2.locator(".hkng__tvt")).toBeHidden();
  expect(log.errors).toEqual([]);
});

test("no watch set: no line", async ({ page }) => {
  const { ng } = await open(page, "/test/?hk_now=2026-09-27T12:00");
  await expect(ng.locator("h2")).toHaveText("Hawks v Adelaide 36ers");
  await expect(ng.locator(".hkng__tv")).toBeHidden();
  await expect(ng.locator(".hkng__tvt")).toBeHidden();
});

test("after daylight saving ends the line says AEST", async ({ page }) => {
  await useData(page, (d) => { d.games[d.games.length - 1].date = "2027-04-10"; });
  const { ng } = await open(page, "/test/?hk_now=2027-04-10T12:00");
  await expect(ng.locator(".hkng__tv")).toHaveText("Can't make it to WIN Entertainment Centre? Watch live on ESPN from 7:30pm AEST.");
});

test("bad watch or soldOut values warn and are ignored", async ({ page }) => {
  await useData(page, (d) => { const g = d.games.find((x) => x.n === 6); g.watch = 5; g.soldOut = "yes"; });
  const { log, ng } = await open(page, "/test/?hk_now=2026-11-19T08:00");
  await expect(ng.locator('[data-k="tix"]')).toBeVisible();
  await expect(ng.locator(".hkng__tv")).toBeHidden();
  expect(log.warnings.join("\n")).toContain("game 6 watch ignored");
  expect(log.warnings.join("\n")).toContain("game 6 soldOut ignored");
});

test("with a preview link: date, preview link, then the line, during the game", async ({ page }) => {
  await useData(page, (d) => { d.games.find((g) => g.n === 6).preview = "https://www.hawks.com.au/news/test-preview"; });
  const { ng } = await open(page, "/test/?hk_now=2026-11-19T20:00");
  await expect(ng.locator(".hkng__pv")).toHaveClass(/hkng__pv--tight/);
  const order = await page.evaluate(() => [...document.querySelector(".hkng").querySelectorAll(".hkng__meta,.hkng__pv,.hkng__tvt")].map((n) => n.className.split(" ")[0]));
  expect(order).toEqual(["hkng__meta", "hkng__pv", "hkng__tvt"]);
  await expect(ng.locator(".hkng__tvt")).toHaveText("Watch live on ESPN.");
});

test("after the season: hidden", async ({ page }) => {
  const { ng } = await open(page, "/test/?hk_now=2027-02-05T12:00");
  await expect(ng.locator(".hkng__tv")).toBeHidden();
  await expect(ng.locator(".hkng__tvt")).toBeHidden();
});
