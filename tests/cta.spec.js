// girls-in-the-game and newsletter: shared CTA block, camp dates, check-back state, light theme, copy.
const { test, expect } = require("@playwright/test");
const fs = require("fs"), path = require("path");
const { useData, watchConsole, ready } = require("./helpers");

const GG = '[data-hawks="girls-in-the-game"]', NL = '[data-hawks="newsletter"]';
const REGO = "https://www.eventbrite.com.au/e/illawarra-hawks-girls-in-the-game-tickets-1995414633885";
const MAIL = "https://mailchi.mp/hawks/illawarra-hawks-newsletter";
const BODY1 = "Tuesday 6th October, 1:30pm at Illawarra Sports Stadium in Berkeley. Two hours of basketball and teamwork with our crew, for girls aged 5 to 12.";
const CHECK = "Check back later in the term for dates for the next camp.";

async function freeze(page) {
  await page.clock.install({ time: new Date("2026-09-27T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-09-27T00:00:01Z"));
}
async function open(page, url) { const log = watchConsole(page); await page.goto(url); await ready(page); return log; }
async function links(loc) {
  return loc.locator("a").evaluateAll((as) => as.map((a) => [a.textContent, a.getAttribute("href"), a.target, a.rel]));
}

test("upcoming camp: date line, details, Register now and mailing list", async ({ page }) => {
  const log = await open(page, "/test/?hk_now=2026-09-27T12:00");
  for (const i of [0, 1]) {
    const gg = page.locator(GG).nth(i);
    await expect(gg.locator(".hkscta__overline")).toHaveText("Girls in the Game");
    await expect(gg.locator("h2")).toHaveText("Get her on the court");
    await expect(gg.locator(".hkscta__body")).toHaveText(BODY1);
    expect(await links(gg)).toEqual([
      ["Register now", REGO, "_blank", "noopener noreferrer"],
      ["Join the mailing list", MAIL, "_blank", "noopener noreferrer"]
    ]);
    await expect(gg.locator("a").first()).toHaveAttribute("aria-label", "Register now: Girls in the Game, Tuesday 6th October");
  }
  expect(log.errors).toEqual([]);
});

test("camp stays up until 6 hours after it starts, then shows the check back line", async ({ page }) => {
  await freeze(page);
  await open(page, "/test/?hk_now=2026-10-06T19:29:58");
  const gg = page.locator(GG).first();
  await expect(gg.locator(".hkscta__body")).toHaveText(BODY1);
  await page.clock.fastForward(3000);
  await expect(gg.locator(".hkscta__body")).toHaveText(CHECK);
  await expect(gg.locator("h2")).toHaveText("Get her on the court");
  expect(await links(gg)).toEqual([["Join the mailing list", MAIL, "_blank", "noopener noreferrer"]]);
});

test("rolls to the next camp in the list, including after the basketball season", async ({ page }) => {
  await useData(page, (d) => {
    d.girlsInTheGame.camps.push({ date: "2027-04-13", time: "10:00", venue: "Test Stadium", rego: "https://www.eventbrite.com.au/e/test-camp-2", details: "" });
  });
  await freeze(page);
  await open(page, "/test/?hk_now=2026-10-06T19:29:58");
  const gg = page.locator(GG).first();
  await page.clock.fastForward(3000);
  await expect(gg.locator(".hkscta__body")).toHaveText("Tuesday 13th April, 10:00am at Test Stadium.");
  await expect(gg.locator("a").first()).toHaveAttribute("href", "https://www.eventbrite.com.au/e/test-camp-2");
  // After the last home game the clock keeps running, so camps still roll over.
  await page.goto("/test/?hk_now=2027-04-13T15:59:58");
  await ready(page);
  await expect(gg.locator(".hkscta__body")).toHaveText("Tuesday 13th April, 10:00am at Test Stadium.");
  await page.clock.fastForward(3000);
  await expect(gg.locator(".hkscta__body")).toHaveText(CHECK);
});

test("no camps listed: check back line; a bad camp is skipped with a warning", async ({ page }) => {
  const log = watchConsole(page);
  await useData(page, (d) => { d.girlsInTheGame.camps = [{ date: "2026-10-40", time: "1:30pm", venue: "", rego: "eventbrite.com" }]; });
  await page.goto("/test/?hk_now=2026-09-27T12:00");
  await ready(page);
  await expect(page.locator(GG).first().locator(".hkscta__body")).toHaveText(CHECK);
  expect(log.warnings.join("\n")).toContain('Girls in the Game camp 1 skipped: date "2026-10-40" is not a real YYYY-MM-DD date; time "1:30pm" is not HH:MM; venue is empty; rego is not an https:// link');
});

test("newsletter: approved copy and mailing list link", async ({ page }) => {
  await open(page, "/test/");
  for (const i of [0, 1]) {
    const nl = page.locator(NL).nth(i);
    await expect(nl.locator(".hkscta__overline")).toHaveText("Hawks Newsletter");
    await expect(nl.locator("h2")).toHaveText("Be the first to know");
    await expect(nl.locator(".hkscta__body")).toHaveText("Team news, ticket releases and game day updates, straight from us to your inbox. Sign up in seconds and stay in the loop all season.");
    expect(await links(nl)).toEqual([["Join the mailing list", MAIL, "_blank", "noopener noreferrer"]]);
  }
});

test("dark by default; data-hawks-theme=\"light\" gives the white version", async ({ page }) => {
  await open(page, "/test/?hk_now=2026-09-27T12:00");
  const bg = (loc) => loc.locator(".hkscta").evaluate((e) => [getComputedStyle(e).backgroundColor, getComputedStyle(e).borderTopColor]);
  expect(await bg(page.locator(GG).nth(0))).toEqual(["rgb(0, 0, 0)", "rgb(255, 0, 19)"]);
  expect(await bg(page.locator(GG).nth(1))).toEqual(["rgb(255, 255, 255)", "rgb(0, 0, 0)"]);
  expect(await bg(page.locator(NL).nth(0))).toEqual(["rgb(255, 255, 255)", "rgb(0, 0, 0)"]);
  expect(await bg(page.locator(NL).nth(1))).toEqual(["rgb(0, 0, 0)", "rgb(255, 0, 19)"]);
  expect(await page.locator("#hawks-embeds-css").evaluate((s) => s.textContent.split(".hkscta .hkscta__inner{").length - 1)).toBe(1);
});

/* Rendered copy against the originals in reference/. The only deliberate change:
   times use a colon ("1:30pm", not "1.30pm") to match the gameday embeds. */
for (const [file, sel, fix] of [["girls-in-the-game.html", GG, (t) => t.replace("1.30pm", "1:30pm")], ["newsletter.html", NL, (t) => t]]) {
  test(`${file}: rendered copy matches the original word for word`, async ({ page }) => {
    const ref = fs.readFileSync(path.join(__dirname, "../reference", file), "utf8");
    const section = ref.slice(ref.indexOf('<section class="hkscta">'), ref.indexOf("</section>"));
    const texts = [...section.matchAll(/>([^<>]+)</g)].map((m) => fix(m[1].replace(/\s+/g, " ").trim())).filter(Boolean);
    await open(page, "/test/?hk_now=2026-09-27T12:00");
    const got = await page.locator(sel).first().locator(".hkscta__overline, h2, .hkscta__body, a").allTextContents();
    expect(got.map((t) => t.replace(/\s+/g, " ").trim())).toEqual(texts);
  });
}
