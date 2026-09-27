// next-game: countdown, Game on, midnight rollover, daylight saving, wrap, links.
const { test, expect } = require("@playwright/test");
const { useData, watchConsole, ready } = require("./helpers");

const NG = '[data-hawks="next-game"]';
async function timer(page, i = 0) {
  return page.locator(NG).nth(i).locator(".hkng__num").allTextContents();
}
/* Freeze the page clock so exact countdown values are stable; fastForward moves it on. */
async function freeze(page) {
  await page.clock.install({ time: new Date("2026-09-27T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-09-27T00:00:01Z"));
}
async function open(page, url) {
  const log = watchConsole(page);
  await page.goto(url);
  await ready(page);
  return log;
}

test("renders the next game, venue, key times and a live countdown", async ({ page }) => {
  const log = await open(page, "/test/?hk_now=2026-09-27T12:00");
  const ng = page.locator(NG).first();
  await expect(ng.locator(".hkng__over")).toHaveText("Next home game");
  await expect(ng.locator("h2")).toHaveText("Hawks v Adelaide 36ers");
  await expect(ng.locator(".hkng__meta")).toHaveText("Friday 2nd October, WIN Entertainment Centre");
  await expect(ng.locator(".hkng__times li")).toHaveText(["6:00pmPre-game function", "6:30pmMain doors open", "7:00pmShow starts", "7:30pmTip-off"]);
  await expect(ng.locator('[role="timer"]')).toHaveAttribute("aria-live", "off");
  const a = await timer(page);
  expect(a.slice(0, 2)).toEqual(["05", "07"]);
  await page.waitForTimeout(1200);
  expect(await timer(page)).not.toEqual(a);
  expect(log.errors).toEqual([]);
});

test("one minute before tip-off, then flips to Game on", async ({ page }) => {
  await freeze(page);
  await open(page, "/test/?hk_now=2026-10-02T19:29");
  expect(await timer(page)).toEqual(["00", "00", "01", "00"]);
  await page.clock.fastForward(61000);
  const ng = page.locator(NG).first();
  await expect(ng.locator(".hkng__status")).toHaveText("Game on");
  await expect(ng.locator('[role="timer"]')).toBeHidden();
  await expect(ng.locator("h2")).toHaveText("Hawks v Adelaide 36ers");
});

test("rolls to the next game at midnight Sydney time", async ({ page }) => {
  await freeze(page);
  await open(page, "/test/?hk_now=2026-10-02T23:59:58");
  const ng = page.locator(NG).first();
  await expect(ng.locator(".hkng__status")).toHaveText("Game on");
  await page.clock.fastForward(3000);
  await expect(ng.locator("h2")).toHaveText("Hawks v Tasmania JackJumpers");
  await expect(ng.locator(".hkng__status")).toBeHidden();
  await expect(page.locator(NG).nth(1).locator("h2")).toHaveText("Hawks v Tasmania JackJumpers");
});

test("countdown is right across the October daylight saving start", async ({ page }) => {
  // Sat 3 Oct 17:00 AEST to Fri 9 Oct 19:30 AEDT is 6 days 1 hour 30 minutes.
  await freeze(page);
  await open(page, "/test/?hk_now=2026-10-03T17:00");
  expect(await timer(page)).toEqual(["06", "01", "30", "00"]);
});

test("countdown is right for a game after daylight saving ends in April 2027", async ({ page }) => {
  // Fixture game: Sat 3 Apr 19:30 AEDT to Sat 10 Apr 19:30 AEST is 7 days 1 hour.
  await useData(page, (d) => { d.games.push({ n: 17, date: "2027-04-10", opp: "Test Opponent", func: "", doors: "18:30", show: "19:00", tip: "19:30", tickets: "", preview: "" }); });
  await freeze(page);
  await open(page, "/test/?hk_now=2027-04-03T19:30");
  await expect(page.locator(NG).first().locator("h2")).toHaveText("Hawks v Test Opponent");
  expect(await timer(page)).toEqual(["07", "01", "00", "00"]);
  await expect(page.locator(NG).first().locator(".hkng__times li")).toHaveCount(3);
});

test("after the final game: wrap message, everything else hidden", async ({ page }) => {
  const log = await open(page, "/test/?hk_now=2027-02-05T00:00");
  for (const i of [0, 1]) {
    const ng = page.locator(NG).nth(i);
    await expect(ng.locator("h2")).toHaveText("That's a wrap on the home season");
    await expect(ng.locator(".hkng__meta")).toHaveText("Thanks for every minute of noise, Hawkheads.");
    for (const sel of ['[role="timer"]', ".hkng__status", ".hkng__times", ".hkng__prev", ".hkng__tix", ".hkng__pk"]) await expect(ng.locator(sel)).toBeHidden();
  }
  expect(log.errors).toEqual([]);
});

test("final game night still counts down to game 16", async ({ page }) => {
  await freeze(page);
  await open(page, "/test/?hk_now=2027-02-04T18:00");
  await expect(page.locator(NG).first().locator("h2")).toHaveText("Hawks v Brisbane Bullets");
  expect(await timer(page)).toEqual(["00", "01", "30", "00"]);
});

test("ticket panels and preview button: exact links, target, rel, labels", async ({ page }) => {
  await useData(page, (d) => {
    d.games[0].preview = "https://www.hawks.com.au/news/test-preview";
    d.games[1].tickets = "https://www.ticketmaster.com.au/test-game-2";
  });
  await open(page, "/test/?hk_now=2026-09-27T12:00");
  const ng = page.locator(NG).first();
  const check = async (loc, href, label) => {
    await expect(loc).toBeVisible();
    await expect(loc).toHaveAttribute("href", href);
    await expect(loc).toHaveAttribute("target", "_blank");
    await expect(loc).toHaveAttribute("rel", "noopener noreferrer");
    if (label) await expect(loc).toHaveAttribute("aria-label", label);
  };
  await expect(ng.locator(".hkng__oh")).toHaveText(["Single game ticket", "3 & 5 game Flexi pack", "Season membership"]);
  await check(ng.locator('[data-k="single"]'), "https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-02-10-2026/event/130064FDD1FC7914", "Buy tickets: single game, Hawks v Adelaide 36ers");
  await check(ng.locator('[data-k="flexi"]'), "https://am.ticketmaster.com/thehawks/FLeximemberships", "Pick your games: 3 and 5 game Flexi pack");
  await check(ng.locator('[data-k="member"]'), "https://am.ticketmaster.com/thehawks/", "Join now: season membership");
  await check(ng.locator('[data-k="picker"]'), "https://hawks-membership-picker.lovable.app/");
  await expect(ng.locator(".hkng__pk")).toHaveText("Not sure which option suits you? Try our membership picker");
  await check(ng.locator('[data-k="prev"]'), "https://www.hawks.com.au/news/test-preview");
  await expect(ng.locator('[data-k="prev"]')).toHaveText("Read the game preview");

  // Game 2 (overridden in this test) has a different ticket link and no preview.
  await page.goto("/test/?hk_now=2026-10-03T09:00");
  await ready(page);
  await expect(ng.locator('[data-k="single"]')).toHaveAttribute("href", "https://www.ticketmaster.com.au/test-game-2");
  await expect(ng.locator('[data-k="prev"]')).toBeHidden();
});

test("a game with no ticket link of its own uses the default", async ({ page }) => {
  await useData(page, (d) => { d.games[0].tickets = ""; });
  await open(page, "/test/?hk_now=2026-09-27T12:00");
  await expect(page.locator(NG).first().locator('[data-k="single"]')).toHaveAttribute("href", "https://www.ticketmaster.com.au/illawarra-hawks-tickets/artist/1055493");
});
