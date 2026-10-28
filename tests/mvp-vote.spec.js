// mvp-vote: Voting open from tip-off until 3pm two days after each game (home and away),
// "View past winners" otherwise. Copy against the original, links, schedule cross-check.
const { test, expect } = require("@playwright/test");
const fs = require("fs"), path = require("path");
const { loadData, useData, watchConsole, ready } = require("./helpers");

const MV = '[data-hawks="mvp-vote"]';
const URL = "https://hawks-mvp-vote.lovable.app/";
const IMG = "https://cdn.prod.website-files.com/689d0b8adfdc2e5ca8e5a610/6ab2493948d4bd882a387a13_MVP%20Vote_1080x1080.png";
const OPEN_BODY = "Voting for the Greater Bank Game MVP, presented by the Hawks’ Major Community Partner, is open now. One lucky winner will win a Hawks cap after each game, and every voter goes into the main prize draw.";
const SHUT_BODY = "Voting for the Greater Bank Game MVP, presented by the Hawks’ Major Community Partner, opens at tip-off of every game. One lucky winner will win a Hawks cap after each game, and every voter goes into the main prize draw.";

async function open(page, t) { const log = watchConsole(page); await page.goto("/test/?hk_now=" + t); await ready(page); return log; }
async function expectOpen(page, opp) {
  for (const i of [0, 1]) {
    const mv = page.locator(MV).nth(i);
    await expect(mv.locator(".hkmvp__badge")).toBeVisible();
    await expect(mv.locator(".hkmvp__badge")).toHaveText("Voting open now");
    await expect(mv.locator(".hkmvp__dot")).toBeVisible();
    await expect(mv.locator(".hkmvp__btn")).toHaveText("Pick your MVP");
    await expect(mv.locator(".hkmvp__btn")).toHaveAttribute("aria-label", "Pick your MVP: Greater Bank Game MVP, Hawks v " + opp);
    await expect(mv.locator(".hkmvp__body")).toHaveText(OPEN_BODY);
    await expect(mv.locator(".hkmvp__body strong").last()).toHaveText(/^One lucky winner/);
  }
}
async function expectClosed(page, badge) {
  for (const i of [0, 1]) {
    const mv = page.locator(MV).nth(i);
    if (badge) { await expect(mv.locator(".hkmvp__badge")).toHaveText(badge); await expect(mv.locator(".hkmvp__dot")).toBeHidden(); }
    else await expect(mv.locator(".hkmvp__badge")).toBeHidden();
    await expect(mv.locator(".hkmvp__btn")).toHaveText("See past winners");
    await expect(mv.locator(".hkmvp__btn")).toHaveAttribute("aria-label", "See past winners: Greater Bank Game MVP");
    await expect(mv.locator(".hkmvp__body")).toHaveText(SHUT_BODY);
    await expect(mv.locator(".hkmvp__btn")).toHaveAttribute("href", URL);
  }
}

test("schedule: 33 games, and every home game matches the games list exactly", () => {
  const d = loadData(), mvp = d.mvpVote.games;
  expect(mvp.length).toBe(33);
  const home = mvp.filter((g) => g.venue === "WIN Entertainment Centre").map((g) => [g.date, g.tip, g.opp]);
  expect(home).toEqual(d.games.map((g) => [g.date, g.tip, g.opp]));
  const dates = mvp.map((g) => g.date + g.tip);
  expect([...dates].sort()).toEqual(dates);
});

test("home game: opens at tip-off, closes at 3pm two days later", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-10T00:00:00Z") });
  // Friday 9th October game window closed at 3pm Sunday; Cairns tips off at 5pm.
  await open(page, "2026-10-11T16:59:58");
  await expectClosed(page, "Next vote opens Sunday 5:00pm");
  await page.clock.fastForward(3000);
  await expectOpen(page, "Cairns Taipans");
  // Sunday game: closes 3pm Tuesday 13th October.
  await open(page, "2026-10-13T14:59:58");
  await expectOpen(page, "Cairns Taipans");
  await page.clock.fastForward(3000);
  await expectClosed(page, "Next vote opens Sunday 5:00pm");
});

test("away games count too, in Sydney time (Perth 9:30pm, daylight saving)", async ({ page }) => {
  await open(page, "2026-10-31T21:29");
  await expectClosed(page, "Next vote opens Saturday 9:30pm");
  const log = await open(page, "2026-10-31T21:30");
  await expectOpen(page, "Perth Wildcats");
  await open(page, "2026-11-02T14:59");
  await expectOpen(page, "Perth Wildcats");
  await open(page, "2026-12-26T09:00");
  await expectOpen(page, "Sydney Kings");
  expect(log.errors).toEqual([]);
});

test("overlapping windows show the latest game; before and after the season it is closed", async ({ page }) => {
  // Christmas Day window runs to 3pm on the 27th, exactly when the Breakers tip off.
  await open(page, "2026-12-27T15:00");
  await expectOpen(page, "New Zealand Breakers");
  await useData(page, (d) => { d.mvpVote.games.push({ round: 99, date: "2026-12-26", tip: "12:00", opp: "Test Opponent", venue: "Test" }); });
  await open(page, "2026-12-26T13:00");
  await expectOpen(page, "Test Opponent");
  await page.unroute("**/data.js*");
  await open(page, "2026-09-20T14:59");
  await expectClosed(page, "Next vote opens Sunday 3:00pm");
  // More than six days away: the date is spelt out.
  await open(page, "2026-11-23T16:00");
  await expectClosed(page, "Next vote opens Friday 4th December, 7:30pm");
  await open(page, "2027-02-15T14:59");
  await expectOpen(page, "Melbourne United");
  await open(page, "2027-02-15T15:00");
  await expectClosed(page);  // after the last game: no badge
});

test("a bad MVP game is skipped with a warning; a missing section just stays closed", async ({ page }) => {
  await useData(page, (d) => { d.mvpVote.games[3].tip = "7:30pm"; });
  const log = await open(page, "2026-10-02T20:00");
  await expectClosed(page, "Next vote opens Sunday 3:00pm");
  expect(log.warnings.join("\n")).toContain('MVP vote game in position 4 skipped: tip "7:30pm" is not HH:MM');
  await useData(page, (d) => { delete d.mvpVote; });
  const log2 = await open(page, "2026-10-02T20:00");
  await expectClosed(page);  // no schedule: no badge
  await expect(page.locator(MV).first().locator("img")).toHaveCount(0);
  expect(log2.errors).toEqual([]);
});

test("links and image", async ({ page }) => {
  await open(page, "2026-10-02T20:00");
  const mv = page.locator(MV).first();
  expect(await mv.locator("a").evaluateAll((as) => as.map((a) => [a.getAttribute("href"), a.target, a.rel]))).toEqual([
    [URL, "_blank", "noopener noreferrer"], [URL, "_blank", "noopener noreferrer"]
  ]);
  const img = mv.locator("img");
  await expect(img).toHaveAttribute("src", IMG);
  await expect(img).toHaveAttribute("width", "1080");
  await expect(img).toHaveAttribute("height", "1080");
  await expect(img).toHaveAttribute("loading", "lazy");
  await expect(mv.locator("h2")).toHaveCount(1);
});

test("reference/mvp-vote.html: open state copy matches the original word for word", async ({ page }) => {
  const ref = fs.readFileSync(path.join(__dirname, "../reference/mvp-vote.html"), "utf8");
  const copy = ref.slice(ref.indexOf('<div class="hmvp-copy">'), ref.indexOf("</section>"));
  const texts = [...copy.replace(/<span class="hmvp-sr">[^<]*<\/span>/, "").replace(/<br>/g, " ").replace(/<\/?(strong|span)[^>]*>/g, "")
    .matchAll(/>([^<>]+)</g)].map((m) => m[1].replace(/&amp;/g, "&").replace(/\s+/g, " ").trim()).filter(Boolean);
  await open(page, "2026-10-02T20:00");
  const got = await page.locator(MV).first().locator(".hkmvp__badge, h2, .hkmvp__body, .hkmvp__btn, .hkmvp__terms").evaluateAll((els) => els.map((e) => e.innerText.replace(/\s+/g, " ").trim()));
  // Approved changes: the open-state button reads "Pick your MVP", not "Vote now" (11 October 2026),
  // and the body ends with the prize line (28 October 2026).
  const PRIZE = " One lucky winner will win a Hawks cap after each game, and every voter goes into the main prize draw.";
  const fix = (t) => (t === "Vote now" ? "Pick your MVP" : /is open now\.$/.test(t) ? t + PRIZE : t);
  expect(got.map((t) => t.toLowerCase())).toEqual(texts.map((t) => fix(t).toLowerCase()));
});
