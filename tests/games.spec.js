// games: Hawks Games page. Cards from data.js gamesPortal, On now tiles, MVP windows shared with
// mvp-vote, quiz from the current-quiz function (mocked here), UTM tags, GA4 click events.
const { test, expect } = require("@playwright/test");
const fs = require("fs"), path = require("path");
const { ROOT, useData, watchConsole, ready } = require("./helpers");

const G = '[data-hawks="games"]';
const IMG_DIR = path.join(ROOT, "test/games-images");
const QUIZ_API = "https://quiz-project.example.test/functions/v1/current-quiz";
const UTM = (id) => "?utm_source=hawks.com.au&utm_medium=referral&utm_campaign=engagement-page&utm_content=" + id;
const URLS = {
  "membership-finder": "https://hawks-membership-picker.lovable.app/",
  "greater-bank-mvp": "https://hawks-mvp-vote.lovable.app/",
  "cmg-midcourt-mayhem": "https://cmg-midcourt-mayhem.lovable.app/",
  "hawks-grid": "https://grid.illawarra-hawks.com.au/",
  "hawks-trivia": "https://quiz.illawarra-hawks.com.au/",
  "hawks-pecking-order": "https://bracket.illawarra-hawks.com.au/"
};
const FILES = { "membership-finder": "membership.jpg", "greater-bank-mvp": "mvp.jpg", "cmg-midcourt-mayhem": "mayhem.jpg", "hawks-grid": "grid.png", "hawks-trivia": "trivia.jpg", "hawks-pecking-order": "pecking.png" };

/* The card screenshots in test/games-images stand in for the Webflow CDN, and the quiz function is mocked. */
async function setup(page, opts = {}) {
  await page.route("https://cdn.test/img/*", (r) => {
    const f = path.join(IMG_DIR, r.request().url().split("/").pop());
    r.fulfill({ contentType: f.endsWith(".png") ? "image/png" : "image/jpeg", body: fs.readFileSync(f) });
  });
  await page.route(QUIZ_API, (r) => {
    if (opts.quiz === "fail") return r.fulfill({ status: 500, body: "no" });
    r.fulfill({ contentType: "application/json", body: JSON.stringify(opts.quiz || { title: "Hawks Quiz #1", description: "10 questions from the current decade (2020 to today)", closes_at: "2026-11-02T13:00:00Z", url: "https://quiz.illawarra-hawks.com.au/" }) });
  });
  await useData(page, (d) => {
    d.gamesPortal.quizApi = opts.noApi ? "" : QUIZ_API;
    d.gamesPortal.cards.forEach((c) => { c.image = "https://cdn.test/img/" + FILES[c.id]; });
    if (opts.mutate) opts.mutate(d);
  });
}
async function open(page, t, opts) {
  const log = watchConsole(page);
  await setup(page, opts);
  await page.goto("/test/games.html?hk_now=" + t);
  await ready(page);
  return log;
}

test("renders every card with the exact link, UTM tags and new-tab rules", async ({ page }) => {
  const log = await open(page, "2026-10-02T19:45");
  for (const [id, url] of Object.entries(URLS)) {
    const a = page.locator(G + ' [data-card="' + id + '"] a');
    await expect(a).toHaveAttribute("href", url + UTM(id));
    await expect(a).toHaveAttribute("target", "_blank");
    await expect(a).toHaveAttribute("rel", "noopener noreferrer");
  }
  await expect(page.locator(G + " h1")).toHaveText("Hawks Games");
  await expect(page.locator(G + " .hkgames__row")).toHaveCount(3);
  await expect(page.locator(G + " .hkgames__col")).toHaveCount(3);
  await expect(page.locator(G + " .hkgames__h2s")).toHaveText("More Hawks games");
  const alts = await page.locator(G + " img").evaluateAll((a) => a.map((i) => i.alt));
  expect(alts.every(Boolean)).toBe(true);
  expect(log.errors).toEqual([]);
});

test("order runs down the whole page: MVP, CMG, the three small cards, then the Membership Finder last", async ({ page }) => {
  await open(page, "2026-10-02T19:45");
  const ids = await page.locator(G + " [data-card]").evaluateAll((a) => a.map((x) => x.getAttribute("data-card")));
  expect(ids).toEqual(["greater-bank-mvp", "cmg-midcourt-mayhem", "hawks-grid", "hawks-trivia", "hawks-pecking-order", "membership-finder"]);
  await expect(page.locator(G + " .hkgames__h2s")).toHaveCount(1);
  const last = await page.locator(G + ' [data-card="membership-finder"]').evaluate((e) => e.getBoundingClientRect().top - document.querySelector('[data-card="hawks-pecking-order"]').getBoundingClientRect().bottom);
  expect(last).toBeGreaterThan(0);
});

test("On now tiles: grid date, quiz countdown, MVP round when a vote is open", async ({ page }) => {
  await open(page, "2026-10-27T09:59:30"); // quiz closes 6 days 14:00:30 later
  const grid = page.locator(G + ' [data-tile="grid"]');
  await expect(grid.locator(".hkgames__tv")).toHaveText("27 Oct");
  const q = page.locator(G + ' [data-tile="quiz"] .hkgames__tv');
  await expect(q).toHaveText("6D 14:00");
  await expect(q).toHaveAttribute("role", "timer");
  await expect(q).toHaveAttribute("aria-live", "off");
  await expect(page.locator(G + ' [data-tile="quiz"] .hkgames__ts')).toHaveText("Hawks Quiz #1");
  await expect(page.locator(G + " .hkgames__tile").first()).toHaveAttribute("href", /^#hk\d+-/ );
});

test("MVP open: tile and card show the round and opponent, button reads Vote now", async ({ page }) => {
  await open(page, "2026-10-02T19:45");
  const t = page.locator(G + ' [data-tile="mvp"]');
  await expect(t.locator(".hkgames__tl")).toHaveText("MVP voting open");
  await expect(t.locator(".hkgames__tv")).toHaveText("Round 3");
  await expect(t.locator(".hkgames__ts")).toHaveText("Hawks v Adelaide 36ers");
  const c = page.locator(G + ' [data-card="greater-bank-mvp"]');
  await expect(c.locator(".hkgames__m")).toHaveText("Now voting: Round 3, Hawks v Adelaide 36ers.");
  await expect(c.locator(".hkgames__badge")).toHaveText("Voting open");
  await expect(c.locator("a")).toHaveText("Vote now");
});

test("MVP closed: next home game, opens at tip-off, See past winners", async ({ page }) => {
  await open(page, "2026-10-07T12:00");
  const t = page.locator(G + ' [data-tile="mvp"]');
  await expect(t.locator(".hkgames__tl")).toHaveText("Next MVP vote");
  await expect(t.locator(".hkgames__tv")).toHaveText("9 Oct");
  await expect(t.locator(".hkgames__ts")).toHaveText("Hawks v Tasmania JackJumpers, opens at tip-off");
  const c = page.locator(G + ' [data-card="greater-bank-mvp"]');
  await expect(c.locator("a")).toHaveText("See past winners");
  await expect(c.locator(".hkgames__badge")).toHaveText("Voting opens at tip-off");
});

test("MVP closed with an away game next: the tile and card name that away game", async ({ page }) => {
  await open(page, "2026-10-31T10:00"); // next tip-off is Perth (away) at 9:30pm; the next home game is 19 Nov
  const t = page.locator(G + ' [data-tile="mvp"]');
  await expect(t.locator(".hkgames__tv")).toHaveText("31 Oct");
  await expect(t.locator(".hkgames__ts")).toHaveText("Hawks v Perth Wildcats, opens at tip-off");
  await expect(page.locator(G + ' [data-card="greater-bank-mvp"] .hkgames__m')).toHaveText("Next vote: Hawks v Perth Wildcats.");
});

test("MVP open for an away game: round and opponent", async ({ page }) => {
  await open(page, "2026-10-31T22:00");
  const t = page.locator(G + ' [data-tile="mvp"]');
  await expect(t.locator(".hkgames__tv")).toHaveText("Round 7");
  await expect(t.locator(".hkgames__ts")).toHaveText("Hawks v Perth Wildcats");
});

test("after the season: no MVP tile, quiz card still renders", async ({ page }) => {
  await open(page, "2027-03-01T12:00");
  await expect(page.locator(G + ' [data-tile="mvp"]')).toBeHidden();
  await expect(page.locator(G + ' [data-card="greater-bank-mvp"] a')).toHaveText("See past winners");
});

test("quiz card shows this week's title and description", async ({ page }) => {
  await open(page, "2026-10-27T10:00");
  const p = page.locator(G + ' [data-card="hawks-trivia"] .hkgames__cp');
  await expect(p).toContainText("This week: Hawks Quiz #1");
  await expect(p).toContainText("10 questions from the current decade (2020 to today)");
});

test("quiz failure: fallback text and no countdown tile", async ({ page }) => {
  await open(page, "2026-10-27T10:00", { quiz: "fail" });
  await expect(page.locator(G + ' [data-card="hawks-trivia"] .hkgames__cp')).toHaveText("This week's Hawks quiz");
  await expect(page.locator(G + ' [data-tile="quiz"]')).toBeHidden();
  await expect(page.locator(G + ' [data-tile="grid"]')).toBeVisible();
});

test("no quizApi set: same fallback, no network call", async ({ page }) => {
  let hit = false;
  await page.route(QUIZ_API, (r) => { hit = true; r.abort(); });
  await open(page, "2026-10-27T10:00", { noApi: true });
  await expect(page.locator(G + ' [data-card="hawks-trivia"] .hkgames__cp')).toHaveText("This week's Hawks quiz");
  expect(hit).toBe(false);
});

test("quiz closed (closes_at in the past): countdown tile hidden", async ({ page }) => {
  await open(page, "2026-10-27T10:00", { quiz: { title: "Old quiz", description: "", closes_at: "2026-10-20T00:00:00Z" } });
  await expect(page.locator(G + ' [data-tile="quiz"]')).toBeHidden();
});

test("moving a card between column and full width is a data edit", async ({ page }) => {
  await open(page, "2026-10-02T19:45", { mutate: (d) => { d.gamesPortal.cards.find((c) => c.id === "hawks-grid").layout = "full"; } });
  await expect(page.locator(G + " .hkgames__row")).toHaveCount(4);
  await expect(page.locator(G + " .hkgames__col")).toHaveCount(2);
});

test("status soon shows Coming soon with no link; hidden and bad cards are skipped", async ({ page }) => {
  const log = await open(page, "2026-10-02T19:45", { mutate: (d) => {
    const c = d.gamesPortal.cards;
    c.find((x) => x.id === "hawks-grid").status = "soon";
    c.find((x) => x.id === "hawks-pecking-order").status = "hidden";
    c.push({ id: "Bad Id", title: "x", layout: "column", url: "http://nope" });
  } });
  const g = page.locator(G + ' [data-card="hawks-grid"]');
  await expect(g.locator("a")).toHaveCount(0);
  await expect(g).toContainText("Coming soon");
  await expect(page.locator(G + ' [data-tile="grid"]')).toHaveCount(0);
  await expect(page.locator(G + ' [data-card="hawks-pecking-order"]')).toHaveCount(0);
  expect(log.warnings.join("\n")).toContain("skipped");
});

test("GA4 click event carries card id and position, only if gtag exists", async ({ page }) => {
  await open(page, "2026-10-27T10:00");
  await page.evaluate(() => { window.__ev = []; window.gtag = (...a) => window.__ev.push(a); document.querySelectorAll("a[href]").forEach((a) => a.addEventListener("click", (e) => e.preventDefault())); });
  await page.locator(G + ' [data-card="hawks-trivia"] a').click();
  await page.locator(G + ' [data-tile="grid"]').click();
  const ev = await page.evaluate(() => window.__ev);
  expect(ev[0]).toEqual(["event", "games_card_click", { card_id: "hawks-trivia", position: 4, location: "card" }]);
  expect(ev[1]).toEqual(["event", "games_card_click", { card_id: "hawks-grid", position: 3, location: "tile" }]);
  // no gtag: clicking must not throw
  await page.evaluate(() => { delete window.gtag; });
  const errs = []; page.on("pageerror", (e) => errs.push(e.message));
  await page.locator(G + ' [data-card="hawks-trivia"] a').click();
  expect(errs).toEqual([]);
});

test("duplicate script tags: renders once, no duplicate IDs", async ({ page }) => {
  const log = await open(page, "2026-10-02T19:45");
  await expect(page.locator(G + " .hkgames")).toHaveCount(1);
  const dup = await page.evaluate(() => { const ids = [...document.querySelectorAll("[id]")].map((e) => e.id); return ids.length - new Set(ids).size; });
  expect(dup).toBe(0);
  expect(log.errors).toEqual([]);
});

for (const w of [320, 390, 780, 870, 1280]) {
  test("width " + w + ": no horizontal scroll", async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await open(page, "2026-10-02T19:45");
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over).toBeLessThanOrEqual(0);
    const box = await page.locator(G + " .hkgames").boundingBox();
    expect(box.width).toBeLessThanOrEqual(870);
  });
}

test("script blocked: the fallback links are all there", async ({ page }) => {
  await page.route(/hawks\.js|hawks-core\.js/, (r) => r.abort());
  await page.goto("/test/games.html");
  const links = page.locator(G + " > a");
  await expect(links).toHaveCount(5);
  await expect(links.nth(0)).toBeVisible();
});

test("styles and fonts are injected once with game-preview on the same page", async ({ page }) => {
  await open(page, "2026-10-02T19:45");
  expect(await page.locator("style#hawks-embeds-css").count()).toBe(1);
  expect(await page.locator('link[href*="fonts.googleapis.com/css2"]').count()).toBe(1);
  await expect(page.locator('[data-hawks="game-preview"] a')).toBeVisible();
});
