// game-preview: preview link when set, News fallback when not, rolls over, hidden after the season.
const { test, expect } = require("@playwright/test");
const { useData, ready } = require("./helpers");

const GP = '[data-hawks="game-preview"]';

test("with a preview set: names the game and links to it", async ({ page }) => {
  await useData(page, (d) => { d.games[3].preview = "https://www.hawks.com.au/news/game-preview-hawks-sydney-kings-rd2-nbl27"; });
  await page.goto("/test/?hk_now=2026-10-21T12:00");
  await ready(page);
  for (const i of [0, 1]) {
    const a = page.locator(GP).nth(i).locator("a");
    await expect(a).toHaveText("Read the Hawks v Sydney Kings preview");
    await expect(a).toHaveAttribute("href", "https://www.hawks.com.au/news/game-preview-hawks-sydney-kings-rd2-nbl27");
    // A hawks.com.au page: opens in the same tab.
    await expect(a).not.toHaveAttribute("target", /.*/);
    await expect(a).not.toHaveAttribute("rel", /.*/);
  }
});

test("with no preview yet: falls back to the News listing", async ({ page }) => {
  await useData(page, (d) => d.games.forEach((g) => { g.preview = ""; }));
  await page.goto("/test/?hk_now=2026-09-27T12:00");
  await ready(page);
  const a = page.locator(GP).first().locator("a");
  await expect(a).toHaveText("Read the latest Hawks news");
  await expect(a).toHaveAttribute("href", "https://www.hawks.com.au/news");
});

test("rolls over with the active game at midnight", async ({ page }) => {
  await useData(page, (d) => { d.games[0].preview = "https://www.hawks.com.au/news/p1"; d.games[1].preview = "https://www.hawks.com.au/news/p2"; });
  await page.clock.install({ time: new Date("2026-09-27T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-09-27T00:00:01Z"));
  await page.goto("/test/?hk_now=2026-10-02T23:59:58");
  await ready(page);
  const a = page.locator(GP).first().locator("a");
  await expect(a).toHaveAttribute("href", "https://www.hawks.com.au/news/p1");
  await page.clock.fastForward(3000);
  await expect(a).toHaveAttribute("href", "https://www.hawks.com.au/news/p2");
  await expect(a).toHaveText("Read the Hawks v Tasmania JackJumpers preview");
});

test("hidden after the season", async ({ page }) => {
  await page.goto("/test/?hk_now=2027-02-05T00:00");
  await ready(page);
  await expect(page.locator(GP).first().locator(".hkgp")).toBeHidden();
});
