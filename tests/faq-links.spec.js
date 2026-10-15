// The small FAQ links in the game day embeds: right answer, same tab, quieter style, editable in data.js.
const { test, expect } = require("@playwright/test");
const { useData, watchConsole, ready } = require("./helpers");

const NG = '[data-hawks="next-game"]', UP = '[data-hawks="upcoming-games"]', PN = '[data-hawks="plan-your-night"]';
const FAQ = (id) => "https://www.hawks.com.au/pages/faqs#faq-" + id;
async function open(page, url) { const log = watchConsole(page); await page.goto(url); await ready(page); return log; }
async function sameTab(loc, href, text) {
  await expect(loc).toHaveText(text);
  await expect(loc).toHaveAttribute("href", href);
  await expect(loc).not.toHaveAttribute("target", /.*/);
  await expect(loc).not.toHaveAttribute("rel", /.*/);
}

test("next game: what's included, when it finishes, compare memberships", async ({ page }) => {
  const log = await open(page, "/test/?hk_now=2026-10-15T12:00");
  const ng = page.locator(NG).first();
  const func = ng.locator(".hkng__times li").first(), tip = ng.locator(".hkng__times li").last();
  await sameTab(func.locator(".hkng__tfaq"), FAQ("tk-11"), "What's included?");
  await expect(func.locator(".hkng__tfaq")).toHaveAttribute("aria-label", "What's included? Pre-game function FAQ");
  await sameTab(tip.locator(".hkng__tfaq"), FAQ("gd-11"), "When does it finish?");
  await sameTab(ng.locator(".hkng__pk a").nth(1), FAQ("mb-01"), "compare memberships");
  // Quieter than Buy ticket: regular weight.
  expect(await func.locator(".hkng__tfaq").evaluate((a) => getComputedStyle(a).fontWeight)).toBe("400");
  expect(await func.locator(".hkng__tbuy").evaluate((a) => getComputedStyle(a).fontWeight)).toBe("700");
  expect(log.errors).toEqual([]);
});

test("next game: What's a Court Walk? sits with the teal button and goes with it", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-09-27T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-09-27T00:00:01Z"));
  await open(page, "/test/?hk_now=2026-10-22T13:59:58");
  const cw = page.locator(NG).first().locator(".hkng__cw");
  await sameTab(cw.locator(".hkng__tfaq"), FAQ("tk-10"), "What's a Court Walk?");
  await expect(cw.locator(".hkng__tfaq")).toBeVisible();
  await page.clock.fastForward(3000);
  await expect(cw.locator(".hkng__tfaq")).toBeHidden();
});

test("upcoming games: key times links, and What's a Court Walk? only on Court Walk games", async ({ page }) => {
  await open(page, "/test/?hk_now=2026-10-01T12:00#game-4");
  const r4 = page.locator(UP).first().locator("#game-4");
  await sameTab(r4.locator(".hksl__times li").first().locator(".hksl__tfaq"), FAQ("tk-11"), "What's included?");
  await sameTab(r4.locator(".hksl__times li").last().locator(".hksl__tfaq"), FAQ("gd-11"), "When does it finish?");
  await sameTab(r4.locator(".hksl__pfaq a"), FAQ("tk-10"), "What's a Court Walk?");
  await expect(page.locator(UP).first().locator("#game-6 .hksl__pfaq")).toHaveCount(0);
});

test("plan your night: accessible parking and drop-off in Getting here", async ({ page }) => {
  await open(page, "/test/#plan-getting-here");
  await sameTab(page.locator(PN).first().locator("#plan-getting-here .hkpn__faql"), FAQ("ac-03"), "Accessible parking and drop-off");
});

test("a link set to \"\" disappears; a bad ID is ignored with a warning; no FAQ page hides them all", async ({ page }) => {
  const log = watchConsole(page);
  await useData(page, (d) => { d.faqLinks.finish = ""; d.faqLinks.preGame = "what's included"; });
  await page.goto("/test/?hk_now=2026-10-15T12:00");
  await ready(page);
  const ng = page.locator(NG).first();
  await expect(ng.locator(".hkng__tfaq")).toHaveCount(1);   // only the Court Walk one is left
  expect(log.warnings.join("\n")).toContain("faqLinks.preGame ignored");
  await expect(ng.locator(".hkng__tbuy")).toHaveCount(1);   // Buy ticket unaffected
  await page.unrouteAll();
  await useData(page, (d) => { d.links.faqPage = ""; });
  await page.goto("/test/?hk_now=2026-10-15T12:00");
  await ready(page);
  await expect(page.locator(".hkng__tfaq, .hksl__tfaq, .hkpn__faql")).toHaveCount(0);
  await expect(page.locator(NG).first().locator(".hkng__pk")).toHaveText("Not sure which option suits you? Try our membership picker");
});

test("phones: the extra links don't cause sideways scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await open(page, "/test/?hk_now=2026-10-15T12:00#game-4");
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(r.sw).toBeLessThanOrEqual(r.cw);
});
