// hawks-in-business: events grouped by month, past events grey, Court Walk button, Book now, light theme.
const { test, expect } = require("@playwright/test");
const { useData, watchConsole, ready } = require("./helpers");

const BIZ = '[data-hawks="hawks-in-business"]';
const BOOK = "https://hawks-corporate-hospitality.lovable.app/";
const CW8 = "https://www.eventbrite.com.au/e/hawks-court-walk-thursday-10-december-tickets-2001420777422";

async function open(page, t) { const log = watchConsole(page); await page.goto("/test/?hk_now=" + t); await ready(page); return log; }
function rows(biz) {
  return biz.locator(".hkbiz__ev").evaluateAll((els) => els.map((li) => ({
    title: [...li.querySelector(".hkbiz__title").childNodes].filter((n) => !n.hidden).map((n) => n.textContent).join(""),
    date: li.querySelector(".hkbiz__date").textContent,
    lines: [...li.querySelectorAll(".hkbiz__line")].map((p) => p.textContent),
    by: (li.querySelector(".hkbiz__by") || {}).textContent || "",
    past: li.classList.contains("hkbiz__ev--past")
  })));
}

test("heading, months and every event's copy, carried over from the flyer", async ({ page }) => {
  const log = await open(page, "2026-10-12T12:00");
  for (const i of [0, 1]) {
    const biz = page.locator(BIZ).nth(i);
    await expect(biz.locator("h2")).toHaveText("Hawks in Business NBL27");
    await expect(biz.locator("h3")).toHaveText(["October 2026", "November 2026", "December 2026", "January 2027", "February 2027", "March 2027"]);
    const r = await rows(biz);
    expect(r.map((x) => [x.date, x.title, x.lines, x.by])).toEqual([
      ["14Oct 2026", "Wednesday 14th October: Hawks in Business Lessons in Leadership Luncheon",
        ["Panel 1: Justin Tatum, Terry Egger, Chuck Harmison", "Panel 2: Mick Baines, Paul Jurgens", "City Beach Function Centre · 12:30pm to 3:30pm · Tickets $150pp"], "Presented by Greater Bank"],
      ["5Nov 2026", "Thursday 5th November: Hawks in Business Wine + Watch Party",
        ["Concepts by Gavin Hepper · 6:30pm · Tickets $70pp"], "Presented by Concepts by Gavin Hepper"],
      ["26Nov 2026", "Thursday 26th November: Hawks in Business Breakfast",
        ["Speakers: Coaches", "Sage Hotel · 7:30am · Tickets $65pp"], "Presented by Greater Bank"],
      ["4Dec 2026", "Friday 4th December: Hawks in Business Long Table Christmas Lunch",
        ["Wollongong Golf Club · 12:30pm to 3:30pm · Tickets TBC"], ""],
      ["10Dec 2026", "Thursday 10th December: Hawks Court Walk",
        ["Pre-game experience. Does not include a game ticket.", "WIN Entertainment Centre · 6:00pm · Tickets $50pp"], ""],
      ["29Jan 2027", "Friday 29th January: Hawks in Business & Hawks Alumni Golf Day",
        ["Wollongong Golf Club · 7:30am"], ""],
      ["TBCJan 2027", "January 2027, date TBC: Hawks in Business Breakfast", [], ""],
      ["7Feb 2027", "Sunday 7th February: Hawks in Business Summer Sundowner", ["Venue, time and tickets TBC"], ""],
      ["TBCFeb 2027", "February 2027, date TBC: Illawarra Hawks MVP Presentation Dinner", ["Sage Hotel · Time and tickets TBC"], "Presented by Sage Hotel"],
      ["TBCMar 2027", "March 2027, date TBC: NBL27 Finals", [], ""]
    ]);
    // Date blocks are decorative; the date is read out with the title.
    expect(await biz.locator('.hkbiz__date[aria-hidden="true"]').count()).toBe(10);
  }
  expect(log.errors).toEqual([]);
});

test("past events turn grey; a timed event at its end time, others at midnight", async ({ page }) => {
  const past = async () => (await rows(page.locator(BIZ).first())).map((x) => x.past);
  await open(page, "2026-10-14T15:29");
  expect((await past())[0]).toBe(false);
  await open(page, "2026-10-14T15:30");
  expect((await past())[0]).toBe(true);
  const first = page.locator(BIZ).first().locator(".hkbiz__ev").first();
  expect(await first.locator(".hkbiz__title").evaluate((t) => [...t.childNodes].filter((n) => !n.hidden).map((n) => n.textContent).join(""))).toBe("Past event: Wednesday 14th October: Hawks in Business Lessons in Leadership Luncheon");
  expect(await first.locator(".hkbiz__title").evaluate((e) => getComputedStyle(e).color)).toBe("rgb(140, 140, 140)");
  expect(await first.locator(".hkbiz__date").evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  // No end time: grey from midnight after the date.
  await open(page, "2026-11-05T23:59");
  expect((await past()).slice(0, 2)).toEqual([true, false]);
  await open(page, "2026-11-06T00:00");
  expect((await past()).slice(0, 2)).toEqual([true, true]);
  // Month-only events: grey once the month ends.
  await open(page, "2027-01-31T23:59");
  expect((await past())[6]).toBe(false);
  await open(page, "2027-02-01T00:00");
  expect((await past())[6]).toBe(true);
  // Light theme greys with its own colour.
  const light = page.locator(BIZ).nth(1).locator(".hkbiz__ev").first().locator(".hkbiz__title");
  expect(await light.evaluate((e) => getComputedStyle(e).color)).toBe("rgb(118, 118, 118)");
});

test("Court Walk row: teal button from game 8, gone 4 hours before; Book now under the list", async ({ page }) => {
  await open(page, "2026-12-10T13:59");
  const biz = page.locator(BIZ).first();
  const cw = biz.locator(".hkbiz__btn--cw");
  await expect(cw).toBeVisible();
  await expect(cw).toHaveAttribute("href", CW8);
  await expect(cw).toHaveAttribute("target", "_blank");
  await expect(cw).toHaveAttribute("aria-label", "Court Walk tickets: Hawks v Tasmania JackJumpers, Thursday 10th December");
  expect(await cw.evaluate((a) => getComputedStyle(a).backgroundColor)).toBe("rgb(79, 195, 190)");
  const book = biz.locator(".hkbiz__cta a");
  await expect(book).toHaveText("Book now");
  await expect(book).toHaveAttribute("href", BOOK);
  await expect(book).toHaveAttribute("rel", "noopener noreferrer");
  await expect(book).toHaveAttribute("aria-label", "Book now: Hawks in Business events");
  await open(page, "2026-12-10T14:00");
  await expect(page.locator(BIZ).first().locator(".hkbiz__btn--cw")).toBeHidden();
});

test("after the last event: everything grey and no Book now button", async ({ page }) => {
  await open(page, "2027-04-01T00:00");
  const biz = page.locator(BIZ).first();
  expect((await rows(biz)).every((x) => x.past)).toBe(true);
  await expect(biz.locator(".hkbiz__cta")).toBeHidden();
});

test("bad events are skipped with a warning; the rest still show", async ({ page }) => {
  const log = watchConsole(page);
  await useData(page, (d) => {
    d.hawksInBusiness.events.push({ date: "2027-02-30", title: "", start: "6pm", end: "21:00" });
    d.hawksInBusiness.events.push({ month: "2027-13", title: "Test" });
  });
  await page.goto("/test/?hk_now=2026-10-12T12:00");
  await ready(page);
  expect(await page.locator(BIZ).first().locator(".hkbiz__ev").count()).toBe(10);
  const w = log.warnings.join("\n");
  expect(w).toContain('Hawks in Business event 11 skipped: date "2027-02-30" is not a real YYYY-MM-DD date; title is empty; start "6pm" is not HH:MM or TBC; end "21:00" needs to be HH:MM, with a start time');
  expect(w).toContain("Hawks in Business event 12 skipped: needs a date (YYYY-MM-DD) or a month (YYYY-MM)");
  expect(log.errors).toEqual([]);
});
