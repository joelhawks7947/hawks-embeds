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

test("no offer page has an FAQ link", async ({ page }) => {
  await open(page, "/test/?hk_now=2026-10-19T12:00");
  await expect(page.locator('[data-hawks="offer"] .hkoff__faq')).toHaveCount(0);
  await expect(page.locator('[data-hawks="offer"] a[href*="faq"]')).toHaveCount(0);
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
  // The main button follows the next function.
  const main = page.locator(sel("vip-function") + " .hkoff__text .hkoff__btn");
  await expect(main).toHaveAttribute("href", games[0].functionTickets);
  await expect(main).toHaveAttribute("aria-label", "Secure your place in the VIP experience 🥂: Hawks v Sydney Kings, Thursday 22nd October");
  // Nothing from the past: played games are not listed, and a game goes when its function starts.
  expect(await page.locator(sel("vip-function")).innerText()).not.toContain("Adelaide 36ers, Pre");
  await page.goto("/test/?hk_now=2026-10-22T17:59"); await ready(page);
  await expect(page.locator(sel("vip-function") + " .hkoff__row")).toHaveCount(13);
  await page.goto("/test/?hk_now=2026-10-22T18:00"); await ready(page);
  await expect(page.locator(sel("vip-function") + " .hkoff__row")).toHaveCount(12);
  await expect(main).toHaveAttribute("href", games[1].functionTickets);
  await expect(main).toHaveAttribute("aria-label", /Hawks v Brisbane Bullets, Saturday 24th October$/);
  await page.goto("/test/?hk_now=2027-02-04T18:00"); await ready(page);
  await expect(page.locator(sel("vip-function") + " .hkoff__row")).toHaveCount(0);
  await expect(page.locator(sel("vip-function") + " .hkoff__none")).toContainText("no more pre-game functions");
  await expect(main).toHaveAttribute("href", "https://www.eventbrite.com.au/o/illawarra-hawks-56775142353");
  await expect(main).not.toHaveAttribute("aria-label", /.+/);
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
  await useData(page, (d) => { d.offers["court-walk"].videoUrl = ""; d.offers["court-walk"].video = "dQw4w9WgXcQ"; });
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

test("names like constructor or __proto__ find nothing: no broken button, the fallback link stays", async ({ page }) => {
  await useData(page, (d) => { d.offers.flexi.link = "constructor"; d.offers.family.link = "toString"; });
  await page.route((u) => /^\/test\/(index\.html)?$/.test(u.pathname), async (route) => {
    const r = await route.fetch();
    await route.fulfill({ response: r, body: (await r.text()).replace('data-offer="court-walk"', 'data-offer="constructor"').replace('data-hawks="faq-search"', 'data-hawks="__proto__"') });
  });
  const log = await open(page);
  await expect(page.locator(sel("flexi") + " .hkoff__btn")).toHaveCount(0);
  await expect(page.locator(sel("family") + " .hkoff__btn")).toHaveCount(0);
  await expect(page.locator('[data-offer="constructor"] a')).toBeVisible();
  await expect(page.locator('[data-hawks="__proto__"] a').first()).toBeVisible();
  expect(log.errors.join(" ")).toContain('no offer called "constructor"');
  expect(log.warnings.join(" ")).toContain('unknown embed "__proto__"');
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

// ---- video with picture fallback and full-screen lightbox (court-walk and vip-function) ----
const VID = { "court-walk": "https://video.illawarra-hawks.com.au/CourtWalk_4x5.mp4", "vip-function": "https://video.illawarra-hawks.com.au/Pre-GameFunction_4x5.mp4" };

// Headless Chromium has no H.264, so stand in for the browser's player: play() reports "playing", pause() "pause".
async function fakePlayer(page) {
  await page.addInitScript(() => {
    const P = HTMLMediaElement.prototype;
    P.__plays = 0;
    P.load = function () {};
    P.play = function () { this.__plays++; this.__paused = false; setTimeout(() => this.dispatchEvent(new Event("playing")), 0); return Promise.resolve(); };
    P.pause = function () { this.__paused = true; this.dispatchEvent(new Event("pause")); };
    Object.defineProperty(P, "paused", { get() { return this.__paused !== false; }, configurable: true });
  });
}
const fig = (page, k) => page.locator(sel(k) + " .hkoff__fig");
async function near(page, k) { await page.locator(sel(k)).scrollIntoViewIfNeeded(); }

test("only Court Walk and VIP function have a videoUrl, and it is the hosted MP4", () => {
  const o = loadData().offers;
  Object.keys(o).forEach((k) => expect(o[k].videoUrl || "", k).toBe(VID[k] || ""));
});

test("video: not loaded until near the screen, then plays muted on a loop, picture hidden, pause/play works", async ({ page }) => {
  await fakePlayer(page);
  const log = await open(page, "/test/?hk_now=2026-10-19T12:00");
  for (const k of Object.keys(VID)) {
    const v = fig(page, k).locator("video");
    await expect(v).toHaveAttribute("preload", "none");
    expect(await v.evaluate((e) => [e.muted, e.loop, e.hasAttribute("playsinline"), e.getAttribute("aria-hidden")])).toEqual([true, true, true, "true"]);
    expect(await v.getAttribute("poster")).toBe(loadData().offers[k].image);
  }
  // Far below the fold: nothing requested yet.
  await expect(fig(page, "court-walk").locator("video")).not.toHaveAttribute("src", /.+/);
  await near(page, "court-walk");
  const v = fig(page, "court-walk").locator("video"), b = fig(page, "court-walk").locator(".hkoff__vbtn"), z = fig(page, "court-walk").locator(".hkoff__zoom");
  await expect(v).toHaveAttribute("src", VID["court-walk"]);
  await expect(v).toBeVisible();
  // The click target stays on top of the video (so clicking the video opens it full screen); the picture itself is hidden.
  await expect(z).toBeVisible();
  await expect(z).toHaveAttribute("aria-label", "Enlarge video: " + loadData().offers["court-walk"].alt);
  expect(await z.locator("img").evaluate((e) => getComputedStyle(e).opacity)).toBe("0");
  await expect(b).toBeVisible();
  await expect(b).toHaveAttribute("aria-label", "Pause video");
  await b.click();
  await expect(b).toHaveAttribute("aria-label", "Play video");
  expect(await v.evaluate((e) => e.paused)).toBe(true);
  await b.click();
  await expect(b).toHaveAttribute("aria-label", "Pause video");
  expect(await v.evaluate((e) => e.paused)).toBe(false);
  expect(log.errors).toEqual([]);
});

test("video that cannot load: the picture stays, there is no video control, and the picture opens full screen on black", async ({ page }) => {
  await page.route("https://video.illawarra-hawks.com.au/**", (r) => r.fulfill({ status: 404, body: "no" }));
  const log = await open(page, "/test/?hk_now=2026-10-19T12:00");
  await near(page, "vip-function");
  const f = fig(page, "vip-function"), z = f.locator(".hkoff__zoom");
  await expect(f.locator("video")).toBeHidden();
  await expect(f.locator(".hkoff__vbtn")).toBeHidden();
  await expect(z).toBeVisible();
  await expect(z).toHaveAttribute("aria-label", "Enlarge picture: " + loadData().offers["vip-function"].alt);
  await z.click();
  const dlg = page.locator("dialog.hkoff-lb");
  await expect(dlg).toBeVisible();
  expect(await dlg.evaluate((e) => [getComputedStyle(e).backgroundColor, e.getBoundingClientRect().width === innerWidth, e.getBoundingClientRect().height === innerHeight])).toEqual(["rgb(0, 0, 0)", true, true]);
  await expect(dlg.locator("img")).toHaveAttribute("src", loadData().offers["vip-function"].image);
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
  await page.keyboard.press("Escape");
  await expect(dlg).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  await expect(z).toBeFocused();
  // The close button and a click outside the picture also close it.
  await z.click(); await dlg.locator(".hkoff-lb__x").click(); await expect(dlg).toBeHidden();
  await z.click(); await dlg.click({ position: { x: 5, y: 5 } }); await expect(dlg).toBeHidden();
  expect(log.errors.filter((e) => !/Failed to load resource/.test(e))).toEqual([]);
});

test("reduced motion: nothing loads on its own, the picture shows with a Play button, which starts the video", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await fakePlayer(page);
  await open(page, "/test/?hk_now=2026-10-19T12:00");
  await near(page, "court-walk");
  const f = fig(page, "court-walk"), v = f.locator("video"), b = f.locator(".hkoff__vbtn");
  await expect(v).not.toHaveAttribute("src", /.+/);
  await expect(f.locator(".hkoff__zoom")).toBeVisible();
  await expect(b).toBeVisible();
  await expect(b).toHaveAttribute("aria-label", "Play video");
  await b.click();
  await expect(v).toHaveAttribute("src", VID["court-walk"]);
  await expect(v).toBeVisible();
  await expect(b).toHaveAttribute("aria-label", "Pause video");
});

test("autoplay blocked by the browser: the picture stays with a Play button", async ({ page }) => {
  await page.addInitScript(() => {
    const P = HTMLMediaElement.prototype;
    P.load = function () {};
    P.play = function () { return Promise.reject(Object.assign(new Error("blocked"), { name: "NotAllowedError" })); };
  });
  await open(page, "/test/?hk_now=2026-10-19T12:00");
  await near(page, "court-walk");
  const f = fig(page, "court-walk");
  await expect(f.locator(".hkoff__vbtn")).toHaveAttribute("aria-label", "Play video");
  await expect(f.locator(".hkoff__zoom")).toBeVisible();
  await expect(f.locator("video")).toBeHidden();
});

test("a bad videoUrl is ignored with a warning and the page keeps its plain picture", async ({ page }) => {
  await useData(page, (d) => { d.offers["court-walk"].videoUrl = "http://example.com/x.mp4"; });
  const log = await open(page, "/test/?hk_now=2026-10-19T12:00");
  expect(log.warnings.join("\n")).toMatch(/offers\.court-walk\.videoUrl ignored/);
  await expect(fig(page, "court-walk").locator("video")).toHaveCount(0);
  await expect(fig(page, "court-walk").locator("img")).toBeVisible();
});

test("video pages: no horizontal scroll, video fills the 4:5 frame", async ({ page }) => {
  await fakePlayer(page);
  for (const w of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width: w, height: 900 });
    await open(page, "/test/?hk_now=2026-10-19T12:00");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), "width " + w).toBeLessThanOrEqual(0);
  }
  await near(page, "court-walk");
  await expect(fig(page, "court-walk").locator("video")).toBeVisible();
  const r = await fig(page, "court-walk").evaluate((e) => { const b = e.getBoundingClientRect(), v = e.querySelector("video").getBoundingClientRect(); return [Math.abs(b.width / b.height - 0.8) < 0.01, Math.round(v.width) === Math.round(b.width), Math.round(v.height) === Math.round(b.height)]; });
  expect(r).toEqual([true, true, true]);
});

test("clicking the playing video opens it full screen on black, playing, with pause/play and close; the page video resumes after", async ({ page }) => {
  await fakePlayer(page);
  const log = await open(page, "/test/?hk_now=2026-10-19T12:00");
  await near(page, "vip-function");
  const f = fig(page, "vip-function"), v = f.locator("video"), z = f.locator(".hkoff__zoom");
  await expect(v).toBeVisible();
  await z.click();
  const dlg = page.locator("dialog.hkoff-lb"), lv = dlg.locator("video"), lp = dlg.locator(".hkoff-lb__p");
  await expect(dlg).toBeVisible();
  expect(await dlg.evaluate((e) => [getComputedStyle(e).backgroundColor, e.getBoundingClientRect().width === innerWidth, e.getBoundingClientRect().height === innerHeight])).toEqual(["rgb(0, 0, 0)", true, true]);
  await expect(lv).toBeVisible();
  await expect(lv).toHaveAttribute("src", VID["vip-function"]);
  expect(await lv.evaluate((e) => [e.muted, e.loop, e.getAttribute("aria-hidden")])).toEqual([true, true, "true"]);
  await expect(dlg.locator("img")).toBeHidden();
  await expect(lp).toBeVisible();
  await expect(lp).toHaveAttribute("aria-label", "Pause video");
  expect(await v.evaluate((e) => e.paused)).toBe(true); // the one on the page waits behind
  await lp.click();
  await expect(lp).toHaveAttribute("aria-label", "Play video");
  expect(await lv.evaluate((e) => e.paused)).toBe(true);
  await lp.click();
  await expect(lp).toHaveAttribute("aria-label", "Pause video");
  await page.keyboard.press("Escape");
  await expect(dlg).toBeHidden();
  await expect(z).toBeFocused();
  await expect.poll(() => v.evaluate((e) => e.paused)).toBe(false); // it was playing, so it carries on
  expect(log.errors).toEqual([]);
});

test("a page video the visitor paused stays paused after the full screen view closes", async ({ page }) => {
  await fakePlayer(page);
  await open(page, "/test/?hk_now=2026-10-19T12:00");
  await near(page, "court-walk");
  const f = fig(page, "court-walk"), v = f.locator("video");
  await expect(v).toBeVisible();
  await f.locator(".hkoff__vbtn").click(); // pause
  await f.locator(".hkoff__zoom").click();
  const dlg = page.locator("dialog.hkoff-lb");
  await expect(dlg.locator(".hkoff-lb__p")).toHaveAttribute("aria-label", "Play video");
  await dlg.locator(".hkoff-lb__x").click();
  await expect(dlg).toBeHidden();
  expect(await v.evaluate((e) => e.paused)).toBe(true);
});
