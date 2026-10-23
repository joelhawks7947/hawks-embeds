// next-game: a Game Day Guide button under the countdown, on every page except the Game Day Guide itself.
const { test, expect } = require("@playwright/test");
const { fakeHawksPage, watchConsole, ready } = require("./helpers");

const NG = '[data-hawks="next-game"]';
const GUIDE = "https://www.hawks.com.au/pages/gameday";

const SCRIPT = '<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>';
const fakePage = (page, pattern) => fakeHawksPage(page, pattern, '<div data-hawks="next-game"><a href="https://www.hawks.com.au/pages/gameday">Next home game</a></div>' + SCRIPT);

test("on other pages: Game Day Guide button under the countdown, same tab", async ({ page }) => {
  const log = watchConsole(page);
  await page.goto("/test/?hk_now=2026-10-23T12:00");
  await ready(page);
  for (const i of [0, 1]) {
    const b = page.locator(NG).nth(i).locator(".hkng__gd a");
    await expect(b).toHaveText("Game Day Guide");
    await expect(b).toHaveAttribute("href", GUIDE);
    await expect(b).not.toHaveAttribute("target", /.*/);
  }
  const order = await page.locator(NG).first().locator(".hkng__inner").evaluate((e) => [...e.children].map((c) => c.className.split(" ")[0]));
  expect(order.indexOf("hkng__gd")).toBeGreaterThan(order.indexOf("hkng__timer"));
  expect(order.indexOf("hkng__gd")).toBeLessThan(order.indexOf("hkng__times"));
  // Outline style on black: transparent with a white border.
  expect(await page.locator(NG).first().locator(".hkng__gd a").evaluate((a) => [getComputedStyle(a).backgroundColor, getComputedStyle(a).borderTopColor])).toEqual(["rgba(0, 0, 0, 0)", "rgb(255, 255, 255)"]);
  expect(log.errors).toEqual([]);
});

for (const url of [GUIDE, "https://hawks.com.au/pages/gameday/?utm_source=edm#game-4"]) {
  test(`on the Game Day Guide itself (${url.replace("https://", "")}): no button`, async ({ page }) => {
    const log = watchConsole(page);
    await fakePage(page, /https:\/\/(www\.)?hawks\.com\.au\/pages\/gameday.*/);
    await page.goto(url);
    await ready(page);
    await expect(page.locator(NG).locator(".hkng__head")).toBeVisible();
    await expect(page.locator(NG).locator(".hkng__gd")).toHaveCount(0);
    expect(log.errors).toEqual([]);
  });
}

test("on a News article: the button shows", async ({ page }) => {
  await fakePage(page, /https:\/\/www\.hawks\.com\.au\/news\/.*/);
  await page.goto("https://www.hawks.com.au/news/some-recap");
  await ready(page);
  await expect(page.locator(NG).locator(".hkng__gd a")).toHaveAttribute("href", GUIDE);
});

test("after the season: hidden with everything else", async ({ page }) => {
  await page.goto("/test/?hk_now=2027-02-05T09:00");
  await ready(page);
  await expect(page.locator(NG).first().locator(".hkng__gd")).toBeHidden();
});
