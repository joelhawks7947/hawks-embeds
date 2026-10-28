// hoopsfest: Hawks page for HoopsFest Perth. Our game, links back to hoopsfest.com.au, Perth time, countdown, bad data.
const { test, expect } = require("@playwright/test");
const { useData, watchConsole, ready } = require("./helpers");

const H = '[data-hawks="hoopsfest"]';
const IMG = "https://cdn.test/player.png";
async function open(page, t, mutate) {
  const log = watchConsole(page);
  await page.route("https://cdn.prod.website-files.com/**", (r) => r.fulfill({ status: 200, contentType: "image/gif", body: Buffer.from("R0lGODlhAQABAAAAACw=", "base64") }));
  await page.route("https://cdn.test/**", (r) => r.fulfill({ status: 200, contentType: "image/gif", body: Buffer.from("R0lGODlhAQABAAAAACw=", "base64") }));
  await useData(page, mutate);
  await page.goto("/test/hoopsfest.html" + (t ? "?hk_now=" + t : ""));
  await ready(page);
  return log;
}

test("every link opens in a new tab with the exact URL from the brief", async ({ page }) => {
  await open(page, "2026-11-10T10:00");
  const hrefs = await page.locator(H + " a").evaluateAll((as) => as.map((a) => [a.href, a.target, a.rel]));
  expect(hrefs.length).toBeGreaterThan(15);
  for (const [, target, rel] of hrefs) { expect(target).toBe("_blank"); expect(rel).toBe("noopener noreferrer"); }
  const urls = hrefs.map((h) => h[0]);
  expect(urls).toContain("https://www.hoopsfest.com.au/#game-schedule");
  expect(urls).toContain("https://www.hoopsfest.com.au/#visit-perth");
  expect(urls).toContain("https://www.hoopsfest.com.au/travel-packages");
  expect(urls).toContain("https://premier.ticketek.com.au/shows/Show.aspx?sh=HPFTGM0527");
  expect(urls).toContain("https://premier.ticketek.com.au/shows/show.aspx?sh=HOOPFEST27");
  expect(urls).toContain("https://www.hoopsfest.com.au/group-tickets");
});

test("our game: Sunday 17th January, 2:00pm Perth time, 5:00pm Sydney time, RAC Arena", async ({ page }) => {
  const log = await open(page, "2026-11-10T10:00");
  const g = page.locator(H + " .hkhf__game");
  await expect(g).toContainText("Illawarra Hawks");
  await expect(g).toContainText("Brisbane Bullets");
  await expect(g).toContainText("Sunday 17th January");
  await expect(g).toContainText("2:00pm Perth time (5:00pm Sydney time)");
  await expect(g).toContainText("RAC Arena, Perth");
  await expect(page.locator(H + " .hkhf__game a")).toHaveCount(2);
  await expect(page.locator(H + " h2").first()).toHaveText("HoopsFest");
  expect(log.errors).toEqual([]);
});

test("countdown: days, tomorrow, then hours, then Game on, then gone after the game", async ({ page }) => {
  const left = H + " [data-r=left]";
  await open(page, "2026-11-10T10:00");
  await expect(page.locator(left)).toHaveText("68 days to go");
  await open(page, "2027-01-16T12:00");
  await expect(page.locator(left)).toHaveText("Tomorrow");
  await open(page, "2027-01-15T18:00");
  await expect(page.locator(left)).toHaveText("2 days to go");
  await open(page, "2027-01-17T09:29:30");
  await expect(page.locator(left)).toHaveText("Tip-off in 7 hr 30 min");
  await open(page, "2027-01-17T17:30");
  await expect(page.locator(left)).toHaveText("Game on");
  await open(page, "2027-01-17T19:30");
  await expect(page.locator(left)).toBeHidden();
});

test("no player pictures supplied: banner has none; supplied pictures show with their alt text", async ({ page }) => {
  await open(page, "2026-11-10T10:00", (d) => { d.hoopsfest.players = []; });
  await expect(page.locator(H + " .hkhf__pl")).toHaveCount(0);
  await open(page, "2026-11-10T10:00", (d) => { d.hoopsfest.players = [{ src: IMG, alt: "Hawks player one" }, { src: IMG, alt: "Hawks player two" }]; });
  await expect(page.locator(H + " .hkhf__pl")).toHaveCount(2);
  await expect(page.locator(H + " .hkhf__pl--l")).toHaveAttribute("alt", "Hawks player one");
});

test("bad data is skipped with a warning, never blanks the module", async ({ page }) => {
  const log = await open(page, "2026-11-10T10:00", (d) => {
    d.hoopsfest.game.date = "2027-02-30";
    d.hoopsfest.tickets[0].url = "http://not-secure.example.com";
    d.hoopsfest.players = [{ src: IMG, alt: "" }];
  });
  await expect(page.locator(H + " .hkhf__game")).toHaveCount(0);
  await expect(page.locator(H + " .hkhf__grid--3").first().locator("li")).toHaveCount(2);
  await expect(page.locator(H + " .hkhf__pl")).toHaveCount(0);
  expect(log.warnings.join("\n")).toMatch(/hoopsfest\.game skipped/);
  expect(log.warnings.join("\n")).toMatch(/hoopsfest\.tickets 1 skipped/);
  expect(log.errors).toEqual([]);
});

test("no sideways scrolling at 320, 365, 768 and 1280 wide", async ({ page }) => {
  await open(page, "2026-11-10T10:00", (d) => { d.hoopsfest.players = [{ src: IMG, alt: "a" }, { src: IMG, alt: "b" }]; });
  for (const w of [320, 365, 768, 1280]) {
    await page.setViewportSize({ width: w, height: 900 });
    const o = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth, document.querySelector(".hkhf").getBoundingClientRect().width]);
    expect(o[0], "page width at " + w).toBeLessThanOrEqual(o[1]);
    expect(o[2], "module width at " + w).toBeLessThanOrEqual(870);
  }
});

test("two placeholders on one page render once each with no duplicate ids", async ({ page }) => {
  await open(page, "2026-11-10T10:00");
  await page.evaluate(() => { const d = document.createElement("div"); d.setAttribute("data-hawks", "hoopsfest"); d.innerHTML = '<a href="https://www.hoopsfest.com.au/">x</a>'; document.body.appendChild(d); window.__hawksEmbeds.scan(); });
  await expect(page.locator(".hkhf")).toHaveCount(2);
  const dup = await page.evaluate(() => { const ids = [...document.querySelectorAll("[id]")].map((e) => e.id); return ids.length - new Set(ids).size; });
  expect(dup).toBe(0);
});
