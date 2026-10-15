// faq-search: a search box that hands the fan's question to the FAQ page (?q=), same tab.
const { test, expect } = require("@playwright/test");
const { useData, watchConsole, ready } = require("./helpers");

const FS = '[data-hawks="faq-search"]';
const FAQ_PAGE = "https://www.hawks.com.au/pages/faqs";

async function open(page) { const log = watchConsole(page); await page.goto("/test/"); await ready(page); return log; }
/* Catch the navigation to the live FAQ page instead of leaving the test page. */
async function catchFaq(page) {
  const seen = [];
  await page.route("https://www.hawks.com.au/pages/faqs**", (r) => { seen.push(r.request().url()); r.fulfill({ contentType: "text/html", body: "<p>faq</p>" }); });
  return seen;
}

test("copy, heading level, labelled search box", async ({ page }) => {
  const log = await open(page);
  const fs = page.locator(FS).first();
  await expect(fs.locator(".hkfs__over")).toHaveText("Got a question?");
  await expect(fs.locator("h2")).toHaveText("Search our FAQs");
  await expect(fs.locator('form[role="search"]')).toHaveCount(1);
  await expect(fs.locator("input")).toHaveAttribute("placeholder", "Try parking, tickets or prams");
  await expect(fs.getByRole("searchbox", { name: "Search our FAQs" })).toHaveCount(1);
  await expect(fs.locator("button")).toHaveText("Search");
  expect(log.errors).toEqual([]);
});

test("typing a question and pressing Enter opens the FAQ page with it, in the same tab", async ({ page }) => {
  const seen = await catchFaq(page);
  await open(page);
  const fs = page.locator(FS).first();
  await fs.locator("input").fill("  where do I park?  ");
  await fs.locator("input").press("Enter");
  await page.waitForURL(/pages\/faqs/);
  expect(seen).toEqual([FAQ_PAGE + "?q=where%20do%20I%20park%3F"]);
  expect(page.context().pages().length).toBe(1);
});

test("the Search button does the same; an empty search just opens the FAQ page", async ({ page }) => {
  const seen = await catchFaq(page);
  await open(page);
  await page.locator(FS).first().locator("button").click();
  await page.waitForURL(/pages\/faqs/);
  expect(seen).toEqual([FAQ_PAGE]);
});

test("dark by default, light version with data-hawks-theme", async ({ page }) => {
  await open(page);
  const look = (i) => page.locator(FS).nth(i).locator(".hkfs").evaluate((e) => [getComputedStyle(e).backgroundColor, getComputedStyle(e).borderTopColor]);
  expect(await look(0)).toEqual(["rgb(0, 0, 0)", "rgb(255, 0, 19)"]);
  expect(await look(1)).toEqual(["rgb(255, 255, 255)", "rgb(0, 0, 0)"]);
});

test("phones: box and button stack, button full width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await open(page);
  const fs = page.locator(FS).first();
  const i = await fs.locator("input").boundingBox(), b = await fs.locator("button").boundingBox();
  expect(b.y).toBeGreaterThan(i.y);
  expect(Math.abs(b.width - i.width)).toBeLessThan(2);
});

test("no faqPage link in data.js: the fallback link stays", async ({ page }) => {
  await useData(page, (d) => { d.links.faqPage = ""; });
  await page.goto("/test/");
  await ready(page);
  await expect(page.locator(FS).first().locator("a")).toHaveAttribute("href", FAQ_PAGE);
  await expect(page.locator(FS).first().locator(".hkfs")).toHaveCount(0);
});
