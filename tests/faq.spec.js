// faq: plain HTML in the embed (readable without JavaScript), accordion, search, topic filters,
// #faq-xx-nn links, related links, structured data. Built by scripts/build-faq.mjs.
const { test, expect } = require("@playwright/test");
const fs = require("fs"), path = require("path");
const { watchConsole, ready } = require("./helpers");

const FAQ = JSON.parse(fs.readFileSync(path.join(__dirname, "../faq/faq.json"), "utf8"));
const EMBED = fs.readFileSync(path.join(__dirname, "../faq/faq-embed.html"), "utf8");
const R = '[data-hawks="faq"]';
const item = (page, id) => page.locator("#faq-" + id.toLowerCase());

async function open(page, url = "/test/faq.html") { const log = watchConsole(page); await page.goto(url); await ready(page); return log; }
async function visibleIds(page) { return page.locator(".hkfaq__item:visible").evaluateAll((els) => els.map((e) => e.id)); }

test("the embed file: CDN script, under Webflow's limit, no internal columns", () => {
  expect(EMBED.length).toBeLessThan(50000);
  expect(EMBED).toContain('<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>');
  expect(EMBED).not.toMatch(/Game day ops|Not started|Issue \/ notes|Draft from website/);
  for (const q of FAQ.questions) expect(q.answer).not.toMatch(/[​-‍﻿]/);
});

test("every question is on the page, in sheet order, closed on load", async ({ page }) => {
  const log = await open(page);
  await expect(page.locator(".hkfaq__sh")).toHaveText(FAQ.sections);
  await expect(page.locator(".hkfaq__qt")).toHaveText(FAQ.questions.map((q) => q.question));
  await expect(page.locator('.hkfaq__btn[aria-expanded="true"]')).toHaveCount(0);
  await expect(page.locator(".hkfaq__a:visible")).toHaveCount(0);
  expect(await page.locator(".hkfaq__a").evaluateAll((els) => els.every((a) => a.getAttribute("hidden") === "until-found"))).toBe(true);
  expect(log.errors).toEqual([]);
});

test("headings: sections are H2, questions are H3 holding the button", async ({ page }) => {
  await open(page);
  expect(await page.locator("h2.hkfaq__sh").count()).toBe(FAQ.sections.length);
  expect(await page.locator("h3.hkfaq__q > button.hkfaq__btn").count()).toBe(FAQ.questions.length);
});

test("accordion: click and keyboard open and close, several can be open", async ({ page }) => {
  await open(page);
  const b1 = item(page, "GD-01").locator("button"), b2 = item(page, "TK-01").locator("button");
  const a1 = page.locator("#" + (await b1.getAttribute("aria-controls")));
  await expect(a1).toHaveClass(/hkfaq__a/);
  await b1.click();
  await expect(b1).toHaveAttribute("aria-expanded", "true");
  await expect(a1).toBeVisible();
  await expect(a1).toContainText(FAQ.questions[0].answer.split("\n")[0]);
  await b2.focus(); await page.keyboard.press("Enter");
  await expect(b2).toHaveAttribute("aria-expanded", "true");
  await expect(b1).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Space");
  await expect(b2).toHaveAttribute("aria-expanded", "false");
  await b1.click();
  await expect(a1).toBeHidden();
});

test("find in page (beforematch) keeps the button in step", async ({ page }) => {
  await open(page);
  const it = item(page, "GD-12");
  await it.locator(".hkfaq__a").evaluate((a) => { a.removeAttribute("hidden"); a.dispatchEvent(new Event("beforematch")); });
  await expect(it.locator("button")).toHaveAttribute("aria-expanded", "true");
});

test("search: plain questions work, words are highlighted, count is announced", async ({ page }) => {
  await open(page);
  await page.fill(".hkfaq__input", "Where do I park?");
  expect(await visibleIds(page)).toEqual(["faq-gd-02", "faq-ac-03"]);
  await expect(item(page, "GD-02").locator("mark.hkfaq__mk").first()).toHaveText(/park/i);
  await expect(page.locator(".hkfaq__status")).toHaveText("2 questions match “Where do I park?”");
  await expect(page.locator(".hkfaq__status")).toHaveAttribute("aria-live", "polite");
  await expect(page.locator(".hkfaq__sec:visible .hkfaq__sh")).toHaveText(["Game day", "Accessibility"]);
  // Plurals and answer text count too.
  await page.fill(".hkfaq__input", "prams");
  expect(await visibleIds(page)).toContain("faq-kf-01");
  // Escape clears.
  await page.press(".hkfaq__input", "Escape");
  await expect(page.locator(".hkfaq__input")).toHaveValue("");
  expect((await visibleIds(page)).length).toBe(FAQ.questions.length);
  await expect(page.locator("mark.hkfaq__mk")).toHaveCount(0);
  await expect(page.locator(".hkfaq__status")).toHaveText("");
});

test("search: no results offers the contact question, which opens it", async ({ page }) => {
  await open(page);
  await page.fill(".hkfaq__input", "zzqx");
  await expect(page.locator(".hkfaq__none")).toBeVisible();
  await expect(page.locator(".hkfaq__none p")).toHaveText("No questions match “zzqx”. Try a different word, or get in touch with us.");
  await page.click(".hkfaq__none a");
  await expect(page.locator(".hkfaq__input")).toHaveValue("");
  await expect(item(page, "GN-01").locator("button")).toHaveAttribute("aria-expanded", "true");
  await expect(item(page, "GN-01").locator("button")).toBeFocused();
  await expect(page).toHaveURL(/#faq-gn-01$/);
  await page.fill(".hkfaq__input", "zzqx");
  await page.click(".hkfaq__clear");
  await expect(page.locator(".hkfaq__none")).toBeHidden();
  await expect(page.locator(".hkfaq__input")).toBeFocused();
});

test("topic filters: one pressed at a time, combine with search", async ({ page }) => {
  await open(page);
  const cats = page.locator(".hkfaq__cat");
  await expect(page.locator('.hkfaq__cats[role="group"]')).toHaveAttribute("aria-label", "Filter by topic");
  await expect(cats).toHaveText(["All", ...FAQ.sections]);
  await cats.filter({ hasText: /^Tickets$/ }).click();
  await expect(page.locator('.hkfaq__cat[aria-pressed="true"]')).toHaveText("Tickets");
  expect(await visibleIds(page)).toEqual(FAQ.questions.filter((q) => q.section === "Tickets").map((q) => "faq-" + q.id.toLowerCase()));
  await page.fill(".hkfaq__input", "door");
  expect(await visibleIds(page)).toEqual(["faq-tk-08"]);
  await expect(page.locator(".hkfaq__status")).toHaveText("1 question in Tickets matches “door”");
  await cats.first().click();
  expect((await visibleIds(page))).toContain("faq-gd-01");
});

test("#faq-xx-nn opens that question, clears filters, scrolls and focuses", async ({ page }) => {
  await open(page, "/test/faq.html#faq-ac-01");
  const b = item(page, "AC-01").locator("button");
  await expect(b).toHaveAttribute("aria-expanded", "true");
  await expect(b).toBeFocused();
  expect(await b.evaluate((el) => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; })).toBe(true);
  await page.fill(".hkfaq__input", "pram");
  await page.evaluate(() => { location.hash = "#faq-gd-05"; });
  await expect(item(page, "GD-05").locator("button")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".hkfaq__input")).toHaveValue("");
});

test("related links: exact URL, link text, new tab only off hawks.com.au", async ({ page }) => {
  await open(page);
  for (const q of FAQ.questions) {
    const more = item(page, q.id).locator(".hkfaq__more a");
    if (!q.link) { await expect(more).toHaveCount(0); continue; }
    await expect(more).toHaveAttribute("href", q.link.url);
    const hawks = /^https:\/\/(www\.)?hawks\.com\.au/.test(q.link.url);
    expect(await more.getAttribute("target")).toBe(hawks ? null : "_blank");
    expect(await more.getAttribute("rel")).toBe(hawks ? null : "noopener noreferrer");
    expect(await more.textContent()).toBe(q.link.text + (hawks ? "" : " (opens in a new tab)"));
  }
  await expect(item(page, "GD-02").locator(".hkfaq__more")).toHaveText("More info: WIN Entertainment Centre transport (opens in a new tab)");
  // Phone numbers and email addresses are tap-to-call and email links in the same tab.
  await expect(item(page, "GN-01").locator('a[href="tel:1300142957"]')).toHaveText("1300 142 957");
  await expect(item(page, "GN-01").locator('a[href="mailto:info@hawks.com.au"]')).toHaveText("info@hawks.com.au");
  await expect(page.locator('.hkfaq a[href^="tel:"][target], .hkfaq a[href^="mailto:"][target]')).toHaveCount(0);
});

test("structured data matches the questions on the page", async ({ page }) => {
  await open(page);
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  expect(ld["@type"]).toBe("FAQPage");
  expect(ld.url).toBe("https://www.hawks.com.au/pages/faqs");
  expect(ld.mainEntity.map((q) => q.url)).toEqual(FAQ.questions.map((q) => "https://www.hawks.com.au/pages/faqs#faq-" + q.id.toLowerCase()));
  expect(FAQ.questions.map((q) => q.url)).toEqual(ld.mainEntity.map((q) => q.url));
  expect(ld.mainEntity.map((q) => q.name)).toEqual(FAQ.questions.map((q) => q.question));
  for (const [i, q] of ld.mainEntity.entries()) {
    expect(q.acceptedAnswer["@type"]).toBe("Answer");
    const text = q.acceptedAnswer.text.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    expect(text).toContain(FAQ.questions[i].answer.replace(/\n+/g, ""));
  }
});

test("script blocked: every question and answer is readable as plain HTML", async ({ page }) => {
  await page.route("**/hawks.js*", (r) => r.abort());
  await page.goto("/test/faq.html");
  await expect(page.locator(".hkfaq")).toHaveCount(0);
  await expect(page.locator(R + " h3")).toHaveText(FAQ.questions.map((q) => q.question));
  for (const q of FAQ.questions.slice(0, 5)) await expect(item(page, q.id).locator("p").first()).toBeVisible();
  await expect(item(page, "GD-02").locator("a")).toHaveText("WIN Entertainment Centre transport (opens in a new tab)");
});

test("no horizontal scroll at 320, 390, 768 and 1280", async ({ page }) => {
  await open(page);
  for (const w of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width: w, height: 900 });
    await item(page, "GD-05").locator("button").evaluate((b) => b.getAttribute("aria-expanded") === "true" || b.click());
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
