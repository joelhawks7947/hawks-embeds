// Offer landing pages: data-hawks="offer" with data-offer set to each page.
const { test, expect } = require("@playwright/test");
const { loadData, useData, watchConsole, ready } = require("./helpers");

const GENERAL = "https://www.ticketmaster.com.au/illawarra-hawks-tickets/artist/1055493";
const PAGES = {
  "flexi": { heading: "More Hawks, your way 🏀", button: "Explore Flexi Memberships 🎟️", href: "https://am.ticketmaster.com/thehawks/FLeximemberships" },
  "family": { heading: "Make game day a family day ❤️", button: "Get your family tickets now 🎟️", href: GENERAL },
  "tickets-from-30": { heading: "Grab a mate and get to a Hawks game 🔴⚫", button: "Get tickets now 🎟️", href: GENERAL },
  "courtside": { heading: "Get closer to the action.", button: "Secure your courtside seats now 🏀", href: "https://hawks-corporate-hospitality.lovable.app/#contact" },
  "vip-function": { heading: "Your game night starts before tip-off.", button: "Secure your place in the VIP experience 🥂", href: "https://www.eventbrite.com.au/o/illawarra-hawks-56775142353" }
};
const CW = [4, 5, 8, 9, 12, 13, 14, 15];
const sel = (k) => '[data-offer="' + k + '"] .hkoff';
async function open(page, url) { const log = watchConsole(page); await page.goto(url || "/test/?hk_now=2026-10-01T12:00"); await ready(page); return log; }

test("every offer page renders its copy, picture and button, with the right link", async ({ page }) => {
  const log = await open(page);
  for (const [k, p] of Object.entries(PAGES)) {
    const root = page.locator(sel(k));
    await expect(root.locator("h2")).toHaveText(p.heading);
    const b = root.locator(".hkoff__text .hkoff__btn");
    await expect(b).toHaveText(p.button);
    await expect(b).toHaveAttribute("href", p.href);
    await expect(b).toHaveAttribute("target", "_blank");
    await expect(b).toHaveAttribute("rel", "noopener noreferrer");
    const img = root.locator("img");
    await expect(img).toHaveAttribute("width", "1080");
    await expect(img).toHaveAttribute("height", "1350");
    await expect(img).toHaveAttribute("loading", "lazy");
    expect(await img.getAttribute("alt")).not.toBe("");
  }
  expect(log.errors).toEqual([]);
});

test("copy matches the Meta ad copy and the venue is spelled in full", async ({ page }) => {
  await open(page);
  await expect(page.locator(sel("flexi") + " .hkoff__body")).toHaveText("Choose a 3-game or 5-game Flexi Membership and lock in your next game day at the WIN Entertainment Centre.");
  await expect(page.locator(sel("family") + " .hkoff__body")).toHaveText("Bring the whole family to the Hawks for just $99 with our Family of 4 package.");
  await expect(page.locator(sel("tickets-from-30") + " .hkoff__body")).toHaveText("There's nothing like experiencing the action live. Get your tickets from just $30 and be part of it.");
  await expect(page.locator(sel("courtside") + " .hkoff__note")).toContainText("Hollywood");
  const txt = await page.locator('[data-hawks="offer"]').allInnerTexts();
  expect(txt.join(" ")).not.toMatch(/\bWEC\b/);
});

test("it is light: the background is transparent and the text is black", async ({ page }) => {
  await open(page);
  const r = page.locator(sel("flexi"));
  expect(await r.evaluate((e) => [getComputedStyle(e).backgroundColor, getComputedStyle(e).color, getComputedStyle(e).borderTopColor])).toEqual(["rgba(0, 0, 0, 0)", "rgb(0, 0, 0)", "rgb(0, 0, 0)"]);
});

test("court walk: lists every Court Walk on sale, with its own link, and drops each one 4 hours before", async ({ page }) => {
  await open(page);
  const rows = page.locator(sel("court-walk") + " .hkoff__row");
  await expect(rows).toHaveCount(8);
  const data = loadData().games.filter((g) => g.courtWalk);
  expect(data.map((g) => g.n)).toEqual(CW);
  const hrefs = await rows.locator("a.hkoff__cw").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect(hrefs).toEqual(data.map((g) => g.courtWalk));
  const first = rows.first().locator("a.hkoff__cw");
  await expect(first).toHaveText("Court Walk tickets");
  await expect(first).toHaveAttribute("aria-label", "Court Walk tickets: Hawks v Sydney Kings, Thursday 22nd October");
  expect(await first.evaluate((a) => [getComputedStyle(a).backgroundColor, getComputedStyle(a).color])).toEqual(["rgb(79, 195, 190)", "rgb(0, 0, 0)"]);
  // After game 4's Court Walk goes off sale (2pm on the 22nd), it leaves the list.
  await page.goto("/test/?hk_now=2026-10-22T14:00"); await ready(page);
  await expect(page.locator(sel("court-walk") + " .hkoff__row")).toHaveCount(7);
  // After the last Court Walk, a plain message and no rows.
  await page.goto("/test/?hk_now=2027-01-30T12:00"); await ready(page);
  await expect(page.locator(sel("court-walk") + " .hkoff__row")).toHaveCount(0);
  await expect(page.locator(sel("court-walk") + " .hkoff__none")).toContainText("no Court Walks on sale");
});

test("vip function: future functions only, each with its own Buy ticket link, dropping off when the function starts", async ({ page }) => {
  await open(page, "/test/?hk_now=2026-10-19T12:00");
  const rows = page.locator(sel("vip-function") + " .hkoff__row");
  const games = loadData().games.filter((g) => g.n >= 4);
  expect(games.length).toBe(13);
  await expect(rows).toHaveCount(13);
  await expect(rows.first().locator(".hkoff__rt")).toHaveText("Thursday 22nd October, Hawks v Sydney Kings");
  await expect(rows.first().locator(".hkoff__rs")).toHaveText("Pre-game function 6:00pm");
  const hrefs = await rows.locator("a.hkoff__btn").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect(hrefs).toEqual(games.map((g) => g.functionTickets));
  hrefs.forEach((h) => expect(h).toMatch(/^https:\/\/www\.eventbrite\.com\.au\/e\/illawarra-hawks-v-.*pre-game-function-tickets-\d+$/));
  const b = rows.first().locator("a.hkoff__btn");
  await expect(b).toHaveText("Buy ticket");
  await expect(b).toHaveAttribute("target", "_blank");
  await expect(b).toHaveAttribute("aria-label", "Buy ticket: pre-game function, Hawks v Sydney Kings, Thursday 22nd October");
  // Nothing from the past: played games are not listed, and a game goes when its function starts.
  expect(await page.locator(sel("vip-function")).innerText()).not.toContain("Adelaide 36ers, Pre");
  await page.goto("/test/?hk_now=2026-10-22T17:59"); await ready(page);
  await expect(page.locator(sel("vip-function") + " .hkoff__row")).toHaveCount(13);
  await page.goto("/test/?hk_now=2026-10-22T18:00"); await ready(page);
  await expect(page.locator(sel("vip-function") + " .hkoff__row")).toHaveCount(12);
  await page.goto("/test/?hk_now=2027-02-04T18:00"); await ready(page);
  await expect(page.locator(sel("vip-function") + " .hkoff__row")).toHaveCount(0);
  await expect(page.locator(sel("vip-function") + " .hkoff__none")).toContainText("no more pre-game functions");
});

test("vip function: a game without its own link uses the organiser page", async ({ page }) => {
  await useData(page, (d) => { d.games.find((g) => g.n === 4).functionTickets = ""; });
  await open(page, "/test/?hk_now=2026-10-19T12:00");
  await expect(page.locator(sel("vip-function") + " .hkoff__row").first().locator("a.hkoff__btn")).toHaveAttribute("href", "https://www.eventbrite.com.au/o/illawarra-hawks-56775142353");
});

test("court walk: future only, nothing played or already off sale", async ({ page }) => {
  await open(page, "/test/?hk_now=2026-10-19T12:00");
  const rows = page.locator(sel("court-walk") + " .hkoff__row");
  await expect(rows).toHaveCount(8);
  await open(page, "/test/?hk_now=2026-12-11T12:00");
  expect(await page.locator(sel("court-walk") + " .hkoff__rt").allInnerTexts()).toEqual([
    "Sunday 20th December, Hawks v Melbourne United", "Saturday 2nd January, Hawks v Cairns Taipans", "Wednesday 6th January, Hawks v Perth Wildcats",
    "Wednesday 20th January, Hawks v New Zealand Breakers", "Saturday 30th January, Hawks v Perth Wildcats"]);
});

test("a video ID adds a play button; clicking it loads the YouTube player, nothing loads before", async ({ page }) => {
  await useData(page, (d) => { d.offers["court-walk"].video = "dQw4w9WgXcQ"; });
  await open(page);
  const root = page.locator(sel("court-walk"));
  await expect(root.locator("iframe")).toHaveCount(0);
  await root.locator(".hkoff__play").click();
  await expect(root.locator("iframe")).toHaveAttribute("src", /^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?/);
  await expect(page.locator(sel("flexi") + " .hkoff__play")).toHaveCount(0);
});

test("a bad data-offer name leaves the fallback link and logs an error", async ({ page }) => {
  await page.route((u) => /^\/test\/(index\.html)?$/.test(u.pathname), async (route) => {
    const r = await route.fetch();
    await route.fulfill({ response: r, body: (await r.text()).replace('data-offer="flexi"', 'data-offer="nope"') });
  });
  const log = await open(page);
  await expect(page.locator('[data-offer="nope"] a')).toBeVisible();
  expect(log.errors.join(" ")).toContain('no offer called "nope"');
});

test("bad offer data (empty heading, non-https image, bad video ID) is skipped or ignored with a warning, nothing else breaks", async ({ page }) => {
  await useData(page, (d) => { d.offers.flexi.heading = ""; d.offers.family.image = "http://x"; d.offers.courtside.video = "short"; });
  const log = await open(page);
  expect(log.warnings.join("\n")).toMatch(/offers\.flexi skipped/);
  expect(log.warnings.join("\n")).toMatch(/offers\.family skipped/);
  expect(log.warnings.join("\n")).toMatch(/offers\.courtside\.video ignored/);
  await expect(page.locator(sel("tickets-from-30") + " h2")).toBeVisible();
  await expect(page.locator(sel("courtside") + " h2")).toBeVisible();
});

test("next-game on the same page still renders (the offer pages sit above it)", async ({ page }) => {
  const log = await open(page);
  await expect(page.locator("#offer-next .hkng h2")).toContainText("Hawks v");
  expect(log.errors).toEqual([]);
});

test("no horizontal scroll at phone and desktop widths", async ({ page }) => {
  for (const w of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width: w, height: 900 });
    await open(page);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over, "width " + w).toBeLessThanOrEqual(0);
  }
});
