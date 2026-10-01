// Court Walk: teal buttons for games with a Court Walk link, off sale 4 hours before it starts.
const { test, expect } = require("@playwright/test");
const { loadData, useData, watchConsole, ready } = require("./helpers");

const CW = {
  4: "https://www.eventbrite.com.au/e/hawks-court-walk-thursday-22-october-tickets-2001420620954",
  5: "https://www.eventbrite.com.au/e/hawks-court-walk-saturday-24-october-tickets-2001420752347",
  8: "https://www.eventbrite.com.au/e/hawks-court-walk-thursday-10-december-tickets-2001420777422",
  9: "https://www.eventbrite.com.au/e/hawk-court-walk-sunday-20-december-tickets-2001420831584",
  12: "https://www.eventbrite.com.au/e/hawks-court-walk-saturday-2-january-tickets-2001969164663",
  13: "https://www.eventbrite.com.au/e/hawks-court-walk-wednesday-6-january-tickets-2001421994061",
  14: "https://www.eventbrite.com.au/e/hawks-court-walk-wednesday-20-january-tickets-2001422262865",
  15: "https://www.eventbrite.com.au/e/hawks-court-walk-saturday-30-january-tickets-2001422789440"
};
const NG = '[data-hawks="next-game"]', UP = '[data-hawks="upcoming-games"]';
const TEAL = "rgb(79, 195, 190)", BLACK = "rgb(0, 0, 0)";

async function freeze(page) {
  await page.clock.install({ time: new Date("2026-09-27T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-09-27T00:00:01Z"));
}
async function open(page, url) { const log = watchConsole(page); await page.goto(url); await ready(page); return log; }

test("data.js: the eight Court Walk games have their Eventbrite links, the rest have none", () => {
  const got = {};
  loadData().games.forEach((g) => { if (g.courtWalk) got[g.n] = g.courtWalk; });
  expect(got).toEqual(CW);
  loadData().games.forEach((g) => expect(g).toHaveProperty("courtWalk"));
});

test("upcoming games: teal Court Walk tickets button on exactly the Court Walk games", async ({ page }) => {
  const log = await open(page, "/test/?hk_now=2026-10-01T12:00");
  const up = page.locator(UP).first();
  const rows = await up.locator(".hksl__btn--cw").evaluateAll((as) => as.map((a) => [a.closest("li").id, a.getAttribute("href")]));
  expect(rows).toEqual(Object.entries(CW).map(([n, u]) => ["game-" + n, u]));
  const b = up.locator("#game-4 .hksl__btn--cw");
  await expect(b).toHaveText("Court Walk tickets");
  await expect(b).toHaveAttribute("target", "_blank");
  await expect(b).toHaveAttribute("rel", "noopener noreferrer");
  await expect(b).toHaveAttribute("aria-label", "Court Walk tickets: Hawks v Sydney Kings, Thursday 22nd October");
  expect(await b.evaluate((a) => [getComputedStyle(a).backgroundColor, getComputedStyle(a).color])).toEqual([TEAL, BLACK]);
  await expect(up.locator("#game-6 .hksl__btn--cw")).toHaveCount(0);
  expect(log.errors).toEqual([]);
});

test("next game: Court Walk button under the key times, gone 4 hours before the Court Walk", async ({ page }) => {
  await freeze(page);
  // Game 4: Court Walk at the 6:00pm function, so off sale at 2:00pm.
  await open(page, "/test/?hk_now=2026-10-22T13:59:58");
  const ng = page.locator(NG).first();
  await expect(ng.locator("h2")).toHaveText("Hawks v Sydney Kings");
  const b = ng.locator(".hkng__btn--cw");
  await expect(b).toBeVisible();
  await expect(b).toHaveText("Court Walk tickets");
  await expect(b).toHaveAttribute("href", CW[4]);
  await expect(b).toHaveAttribute("aria-label", "Court Walk tickets: Hawks v Sydney Kings, Thursday 22nd October");
  expect(await b.evaluate((a) => [getComputedStyle(a).backgroundColor, getComputedStyle(a).color])).toEqual([TEAL, BLACK]);
  // It sits between the key times and the ticket panels.
  const order = await ng.locator(".hkng__inner").evaluate((e) => [...e.children].map((c) => c.className.split(" ")[0]));
  expect(order.indexOf("hkng__cw")).toBe(order.indexOf("hkng__times") + 1);
  await page.clock.fastForward(3000);
  await expect(b).toBeHidden();
  await expect(ng.locator(".hkng__tix")).toBeVisible();
});

test("next game: 1:30pm Court Walk (game 9) comes off sale at 9:30am", async ({ page }) => {
  await freeze(page);
  await open(page, "/test/?hk_now=2026-12-20T09:29:58");
  const b = page.locator(NG).first().locator(".hkng__btn--cw");
  await expect(b).toHaveAttribute("href", CW[9]);
  await expect(b).toBeVisible();
  await page.clock.fastForward(3000);
  await expect(b).toBeHidden();
});

test("next game without a Court Walk (game 1): no button", async ({ page }) => {
  await open(page, "/test/?hk_now=2026-10-01T12:00");
  await expect(page.locator(NG).first().locator("h2")).toHaveText("Hawks v Adelaide 36ers");
  await expect(page.locator(NG).first().locator(".hkng__cw")).toBeHidden();
});

test("a bad Court Walk link is ignored with a warning", async ({ page }) => {
  const log = watchConsole(page);
  await useData(page, (d) => { d.games[3].courtWalk = "eventbrite.com.au/e/x"; });
  await page.goto("/test/?hk_now=2026-10-01T12:00");
  await ready(page);
  expect(log.warnings.join("\n")).toContain("game 4 courtWalk ignored: not an https:// link");
  await expect(page.locator(UP).first().locator("#game-4 .hksl__btn--cw")).toHaveCount(0);
});

test("layout: three buttons in a row on wide screens; Court Walk drops below on narrow ones", async ({ page }) => {
  const tops = (loc) => loc.locator(".hksl__acts a, .hksl__acts button").evaluateAll((els) => els.map((e) => [e.textContent, Math.round(e.getBoundingClientRect().top), Math.round(e.getBoundingClientRect().width)]));
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page, "/test/?hk_now=2026-10-01T12:00");
  await page.locator(UP).first().locator(".hksl__bar").click();
  const wide = await tops(page.locator(UP).first().locator("#game-4"));
  expect(new Set(wide.map((r) => r[1])).size).toBe(1);
  for (const w of [390, 768]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(100);
    const r = await tops(page.locator(UP).first().locator("#game-4"));
    const [tix, cw, kt] = r;
    expect(tix[1], `${w}px`).toBe(kt[1]);
    expect(cw[1], `${w}px`).toBeGreaterThan(tix[1]);
    expect(cw[2], `${w}px`).toBeGreaterThan(tix[2] + kt[2]);
  }
});
