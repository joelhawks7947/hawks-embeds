// upcoming-games: closed on load, toggles, key times, hash links, last game, rollover.
const { test, expect } = require("@playwright/test");
const { useData, watchConsole, ready } = require("./helpers");

const UP = '[data-hawks="upcoming-games"]';
async function open(page, url) {
  const log = watchConsole(page);
  await page.goto(url);
  await ready(page);
  return log;
}

test("closed on load, lists games after the next game, with count", async ({ page }) => {
  const log = await open(page, "/test/?hk_now=2026-09-27T12:00");
  const up = page.locator(UP).first();
  const bar = up.locator(".hksl__bar");
  await expect(bar).toHaveAttribute("aria-expanded", "false");
  await expect(up.locator(".hksl__list")).toBeHidden();
  await expect(up.locator(".hksl__bt")).toHaveText("Upcoming home games");
  await expect(up.locator(".hksl__bc")).toHaveText("15 games");
  await expect(up.locator(".hksl__row")).toHaveCount(15);
  await expect(up.locator(".hksl__row").first().locator(".hksl__opp")).toHaveText("v Tasmania JackJumpers");
  await expect(up.locator(".hksl__row").first().locator(".hksl__meta")).toHaveText("Game 2, 7:30pm tip-off");
  await expect(up.locator(".hksl__row").first().locator(".hksl__dow")).toHaveText("Fri");
  await expect(up.locator(".hksl__row").first().locator(".hksl__dm")).toHaveText("9 Oct");
  expect(log.errors).toEqual([]);
});

test("bar opens and closes; key times toggle reveals that game's times", async ({ page }) => {
  await open(page, "/test/?hk_now=2026-09-27T12:00");
  const up = page.locator(UP).first(), bar = up.locator(".hksl__bar");
  await bar.click();
  await expect(bar).toHaveAttribute("aria-expanded", "true");
  await expect(up.locator(".hksl__list")).toBeVisible();
  const r3 = up.locator("#game-3");
  const kt = r3.locator("button");
  await expect(kt).toHaveText("Key times");
  await expect(r3.locator(".hksl__panel")).toBeHidden();
  await kt.click();
  await expect(kt).toHaveAttribute("aria-expanded", "true");
  await expect(r3.locator(".hksl__times li")).toHaveText(["3:30pmPre-game function", "4:00pmMain doors open", "4:30pmShow starts", "5:00pmTip-off"]);
  await kt.click();
  await expect(r3.locator(".hksl__panel")).toBeHidden();
  await bar.click();
  await expect(up.locator(".hksl__list")).toBeHidden();
});

test("keyboard: Enter and Space operate the bar and key times", async ({ page }) => {
  await open(page, "/test/?hk_now=2026-09-27T12:00");
  const up = page.locator(UP).first(), bar = up.locator(".hksl__bar");
  await bar.focus();
  await page.keyboard.press("Enter");
  await expect(bar).toHaveAttribute("aria-expanded", "true");
  await up.locator("#game-2 button").focus();
  await page.keyboard.press("Space");
  await expect(up.locator("#game-2-times")).toBeVisible();
});

test("Tickets buttons: exact link, target, rel, label; preview only when set", async ({ page }) => {
  await useData(page, (d) => { d.games[6].tickets = "https://www.ticketmaster.com.au/test-game-7"; d.games[6].preview = "https://www.hawks.com.au/news/test-7"; });
  await open(page, "/test/?hk_now=2026-09-27T12:00");
  const up = page.locator(UP).first();
  const t2 = up.locator("#game-2 a.hksl__btn");
  await expect(t2).toHaveAttribute("href", "https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-09-10-2026/event/130064FE8BBF264B");
  await expect(t2).toHaveAttribute("target", "_blank");
  await expect(t2).toHaveAttribute("rel", "noopener noreferrer");
  await expect(t2).toHaveAttribute("aria-label", "Tickets for Hawks v Tasmania JackJumpers, Friday 9th October");
  await expect(up.locator("#game-7 .hksl__acts a")).toHaveAttribute("href", "https://www.ticketmaster.com.au/test-game-7");
  const pv = up.locator("#game-7 .hksl__panel a");
  await expect(pv).toHaveAttribute("href", "https://www.hawks.com.au/news/test-7");
  await expect(pv).toHaveText("Read the game preview");
  await expect(pv).toHaveAttribute("rel", "noopener noreferrer");
  await expect(up.locator("#game-2 .hksl__panel a")).toHaveCount(0);
});

test("#game-7 opens the list and game 7's key times, and scrolls to it", async ({ page }) => {
  await open(page, "/test/?hk_now=2026-09-27T12:00#game-7");
  const up = page.locator(UP).first();
  await expect(up.locator(".hksl__bar")).toHaveAttribute("aria-expanded", "true");
  await expect(up.locator("#game-7 button")).toHaveAttribute("aria-expanded", "true");
  await expect(up.locator("#game-7-times")).toBeVisible();
  await expect(up.locator("#game-7")).toBeInViewport();
  // Only the primary instance owns the #game-N ids; the second list stays closed.
  await expect(page.locator(UP).nth(1).locator(".hksl__bar")).toHaveAttribute("aria-expanded", "false");
});

test("hash change after load also works", async ({ page }) => {
  await open(page, "/test/?hk_now=2026-09-27T12:00");
  await page.evaluate(() => { location.hash = "#game-12"; });
  await expect(page.locator("#game-12-times")).toBeVisible();
  await expect(page.locator("#game-12")).toBeInViewport();
});

test("#game-N for the current next game scrolls to the next-game module", async ({ page }) => {
  await open(page, "/test/?hk_now=2026-10-05T12:00#game-2");
  await page.waitForTimeout(200);
  await expect(page.locator('[data-hawks="next-game"]').first().locator("h2")).toHaveText("Hawks v Tasmania JackJumpers");
  await expect(page.locator('[data-hawks="next-game"]').first()).toBeInViewport();
  await expect(page.locator(UP).first().locator(".hksl__bar")).toHaveAttribute("aria-expanded", "false");
});

test("one game left after the next: shows 1 game", async ({ page }) => {
  await open(page, "/test/?hk_now=2027-01-30T09:00");
  await expect(page.locator(UP).first().locator(".hksl__bc")).toHaveText("1 game");
});

test("hidden when only the last game remains, and after the season", async ({ page }) => {
  await open(page, "/test/?hk_now=2027-02-01T09:00");
  await expect(page.locator(UP).first().locator(".hksl")).toBeHidden();
  await expect(page.locator(UP).nth(1).locator(".hksl")).toBeHidden();
  await page.goto("/test/?hk_now=2027-02-06T09:00");
  await ready(page);
  await expect(page.locator(UP).first().locator(".hksl")).toBeHidden();
});

test("played games drop off at midnight", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-09-27T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-09-27T00:00:01Z"));
  await open(page, "/test/?hk_now=2026-10-02T23:59:58");
  const up = page.locator(UP).first();
  await expect(up.locator(".hksl__bc")).toHaveText("15 games");
  await page.clock.fastForward(3000);
  await expect(up.locator(".hksl__bc")).toHaveText("14 games");
  await expect(up.locator(".hksl__row").first()).toHaveAttribute("id", "game-3");
});
