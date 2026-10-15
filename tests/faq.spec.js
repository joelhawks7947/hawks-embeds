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
  expect(EMBED).toContain('<div data-hawks="faq" data-hawks-faq-page="https://www.hawks.com.au/pages/faqs">');
  // The structured data is written by the script, keeping the embed small.
  expect(EMBED).not.toContain("application/ld+json");
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
    await expect(more).toHaveCount(q.links.length);
    for (const [i, l] of q.links.entries()) {
      const a = more.nth(i), hawks = /^https:\/\/(www\.)?hawks\.com\.au/.test(l.url);
      await expect(a).toHaveAttribute("href", l.url);
      expect(await a.getAttribute("target")).toBe(hawks ? null : "_blank");
      expect(await a.getAttribute("rel")).toBe(hawks ? null : "noopener noreferrer");
      expect(await a.textContent()).toBe(l.text + (hawks ? "" : " (opens in a new tab)"));
    }
    // The older single "link" field is the first link.
    expect(q.link).toEqual(q.links.length ? { url: q.links[0].url, text: q.links[0].text } : null);
  }
  // Several links in one cell, each with its label; a hyperlink cell's title becomes the link text.
  await expect(item(page, "TK-02").locator(".hkfaq__more")).toHaveText("More info: Ticketmaster (opens in a new tab) (General Public), Hawks Membership website (opens in a new tab) (Hawks Members)");
  await expect(item(page, "MB-03").locator(".hkfaq__more a")).toHaveText("Members Benefits (opens in a new tab)");
  await expect(item(page, "MB-05").locator('a[href="mailto:membership@hawks.com.au"]')).toHaveText("membership@hawks.com.au");
  await expect(item(page, "GD-02").locator(".hkfaq__more")).toHaveText("More info: WIN Entertainment Centre transport (opens in a new tab)");
  // Phone numbers and email addresses are tap-to-call and email links in the same tab.
  await expect(item(page, "GN-01").locator('a[href="tel:1300142957"]')).toHaveText("1300 142 957");
  await expect(item(page, "GN-01").locator('a[href="mailto:info@hawks.com.au"]')).toHaveText("info@hawks.com.au");
  await expect(page.locator('.hkfaq a[href^="tel:"][target], .hkfaq a[href^="mailto:"][target]')).toHaveCount(0);
});

test("structured data matches the questions on the page", async ({ page }) => {
  await open(page);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
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

/* ---------------- Smarter search ---------------- */

async function ids(page, q) { await page.fill(".hkfaq__input", q); return visibleIds(page); }

test("fan wording finds the FAQ's words", async ({ page }) => {
  await open(page);
  expect(await ids(page, "stroller")).toEqual(["faq-kf-01"]);
  expect(await ids(page, "can I bring a stroller?")).toEqual(["faq-kf-01"]);
  expect(await ids(page, "uber")).toContain("faq-gd-04");
  expect(await ids(page, "jersey")).toEqual(["faq-gd-12"]);
  expect(await ids(page, "tix")).toContain("faq-tk-01");
  await expect(page.locator(".hkfaq__none")).toBeHidden();
});

test("typos still find the answer", async ({ page }) => {
  await open(page);
  expect(await ids(page, "parkng")).toContain("faq-gd-02");
  expect(await ids(page, "wollongon")).toContain("faq-gd-03");
  expect(await ids(page, "concesion")).toEqual(["faq-tk-06"]);
  // Short words are never treated as typos.
  expect(await ids(page, "zzq")).toEqual([]);
});

test("no exact match: the closest 3 questions show, with a way to get in touch", async ({ page }) => {
  await open(page);
  const found = await ids(page, "can I bring my dog");
  expect(found.length).toBeLessThanOrEqual(3);
  expect(found).toContain("faq-ac-06");
  await expect(page.locator(".hkfaq__none p")).toHaveText("No exact match for “can I bring my dog”. These questions might help, or get in touch with us.");
  await expect(page.locator(".hkfaq__status")).toHaveText("No exact match for “can I bring my dog”. Showing 3 questions that might help");
  await expect(item(page, "AC-06").locator("mark.hkfaq__mk")).toHaveText(["animal", "animal", "animal"]);
});

/* ---------------- Analytics (the site's Google Analytics) ---------------- */

async function withGtag(page, url = "/test/faq.html") {
  await page.addInitScript(() => { window.__ev = []; window.gtag = (...a) => window.__ev.push(a); });
  const log = await open(page, url);
  return log;
}
const events = (page) => page.evaluate(() => window.__ev.filter((e) => e[0] === "event").map((e) => [e[1], e[2]]));

test("a search is reported once the fan stops typing, with personal details removed", async ({ page }) => {
  await withGtag(page);
  await page.fill(".hkfaq__input", "parkng");
  expect(await events(page)).toEqual([]);
  await page.waitForTimeout(1700);
  expect(await events(page)).toEqual([["search", { search_term: "parkng", faq_results: 2, faq_match: "exact", faq_topic: "All" }]]);
  // Leaving the box does not report the same search twice.
  await page.locator(".hkfaq__input").blur();
  expect((await events(page)).length).toBe(1);
  await page.fill(".hkfaq__input", "order 1234 5678 for jo@example.com");
  await page.locator(".hkfaq__input").blur();
  const [ev, p] = (await events(page)).find((e) => e[0] === "faq_no_results");
  expect(p.search_term).toBe("order [number] for [email]");
  expect(p.faq_results).toBe(0);
});

test("searches with no exact match are flagged faq_no_results", async ({ page }) => {
  await withGtag(page);
  await page.fill(".hkfaq__input", "is there wifi");
  await page.press(".hkfaq__input", "Escape");
  expect(await events(page)).toEqual([
    ["search", { search_term: "is there wifi", faq_results: 0, faq_match: "none", faq_topic: "All" }],
    ["faq_no_results", { search_term: "is there wifi", faq_results: 0, faq_match: "none", faq_topic: "All" }]
  ]);
  await page.fill(".hkfaq__input", "can I bring my dog");
  await page.click(".hkfaq__clear");
  expect((await events(page)).slice(2).map((e) => e[0] + ":" + e[1].faq_match)).toEqual(["search:closest", "faq_no_results:closest"]);
});

test("opening a question is reported with how the fan got there", async ({ page }) => {
  await withGtag(page, "/test/faq.html#faq-ac-01");
  await item(page, "GD-01").locator("button").click();
  await item(page, "GD-01").locator("button").click(); // closing is not reported
  await page.fill(".hkfaq__input", "pram");
  await item(page, "KF-01").locator("button").click();
  const ev = await events(page);
  expect(ev.filter((e) => e[0] === "faq_open").map((e) => e[1])).toEqual([
    { faq_id: "AC-01", faq_question: "How do I book wheelchair or accessible seating?", faq_via: "link" },
    { faq_id: "GD-01", faq_question: "What time do doors open?", faq_via: "browse" },
    { faq_id: "KF-01", faq_question: "Can I bring a pram?", faq_via: "search" }
  ]);
  // The search that led to the answer is reported first.
  expect(ev.map((e) => e[0]).slice(-2)).toEqual(["search", "faq_open"]);
});

test("a broken analytics function never breaks the FAQ", async ({ page }) => {
  await page.addInitScript(() => { window.gtag = () => { throw new Error("blocked"); }; });
  const log = await open(page);
  await page.fill(".hkfaq__input", "pram");
  await page.locator(".hkfaq__input").blur();
  await item(page, "KF-01").locator("button").click();
  await expect(item(page, "KF-01").locator("button")).toHaveAttribute("aria-expanded", "true");
  expect(log.errors).toEqual([]);
});

test("structured data: links kept, no screen reader text, never added twice", async ({ page }) => {
  await open(page);
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  const gd02 = ld.mainEntity.find((q) => q.url.endsWith("#faq-gd-02")).acceptedAnswer.text;
  expect(gd02).toContain('<p>More info: <a href="https://www.wsec.com.au/transport">WIN Entertainment Centre transport</a></p>');
  expect(JSON.stringify(ld)).not.toContain("opens in a new tab");
  expect(ld.mainEntity.find((q) => q.url.endsWith("#faq-gn-01")).acceptedAnswer.text).toContain('<a href="tel:1300142957">1300 142 957</a>');
  // An older embed that carries its own structured data: the script adds none.
  const old = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [] };
  await page.addInitScript((o) => {
    document.addEventListener("DOMContentLoaded", () => {
      const sc = document.createElement("script"); sc.type = "application/ld+json"; sc.textContent = JSON.stringify(o); document.body.appendChild(sc);
    });
  }, old);
  await page.reload(); await ready(page);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  expect(JSON.parse(await page.locator('script[type="application/ld+json"]').textContent()).mainEntity).toEqual([]);
});
