// A preview link is hidden when the embed sits on that preview article itself.
const { test, expect } = require("@playwright/test");
const fs = require("fs"), path = require("path");
const { ROOT, useData, watchConsole, ready } = require("./helpers");

const G1 = "https://www.hawks.com.au/news/game-preview-hawks-vs-adelaide-36ers-rd3-nbl27";
const G2 = "https://www.hawks.com.au/news/game-preview-hawks-vs-tasmania-jackjumpers-rd4-nbl27";

/* Serve a fake hawks.com.au News article that loads our script from its real jsDelivr address,
   with jsDelivr requests answered from the local files. */
async function fakeArticle(page) {
  await page.route(/https:\/\/cdn\.jsdelivr\.net\/gh\/joelhawks7947\/hawks-embeds@main\/([^?]+)/, (r) => {
    const file = /hawks-embeds@main\/([^?]+)/.exec(r.request().url())[1];
    r.fulfill({ contentType: "text/javascript", body: fs.readFileSync(path.join(ROOT, file), "utf8") });
  });
  await page.route(/https:\/\/(www\.)?hawks\.com\.au\/news\/.*/, (r) => r.fulfill({ contentType: "text/html", body:
    '<!DOCTYPE html><html><head></head><body><div class="w-richtext">' +
    '<div data-hawks="next-game"><a href="https://www.hawks.com.au/pages/gameday">Next home game</a></div>' +
    '<div data-hawks="game-preview"><a href="https://www.hawks.com.au/news">News</a></div>' +
    '<div data-hawks="upcoming-games"><a href="https://www.hawks.com.au/pages/gameday">Upcoming</a></div>' +
    '<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script></div></body></html>' }));
  await useData(page, (d) => { d.games[0].preview = G1; d.games[1].preview = G2; });
}

test("on the game's own preview article: no preview link, but countdown and tickets stay", async ({ page }) => {
  const log = watchConsole(page);
  await fakeArticle(page);
  // Different spelling of the same address: no www, trailing slash, tracking codes, hash.
  await page.goto("https://hawks.com.au/news/game-preview-hawks-vs-adelaide-36ers-rd3-nbl27/?hk_now=2026-09-30T12:00&utm_source=x#top");
  await ready(page);
  const ng = page.locator('[data-hawks="next-game"]');
  await expect(ng.locator("h2")).toHaveText("Hawks v Adelaide 36ers");
  await expect(ng.locator(".hkng__pv")).toBeHidden();
  await expect(ng.locator('[role="timer"]')).toBeVisible();
  await expect(ng.locator(".hkng__tix")).toBeVisible();
  // The standalone preview button falls back to the News listing instead of linking to itself.
  await expect(page.locator('[data-hawks="game-preview"] a')).toHaveText("Read the latest Hawks news");
  // Other games' previews in the upcoming list are unaffected.
  await expect(page.locator("#game-2 .hksl__panel a")).toHaveAttribute("href", G2);
  expect(log.errors).toEqual([]);
});

test("on a different article (game 2's preview): game 1's preview link still shows", async ({ page }) => {
  await fakeArticle(page);
  await page.goto(G2 + "?hk_now=2026-09-30T12:00");
  await ready(page);
  const link = page.locator('[data-hawks="next-game"] .hkng__pvl');
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", G1);
  await expect(page.locator('[data-hawks="game-preview"] a')).toHaveText("Read the Hawks v Adelaide 36ers preview");
  // Game 2's own preview button in the upcoming list is hidden on game 2's article.
  await expect(page.locator("#game-2 .hksl__panel a")).toHaveCount(0);
});
