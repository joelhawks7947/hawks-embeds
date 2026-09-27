// plan-your-night: closed on load, one open at a time, reclick closes, keyboard, hash links, links.
const { test, expect } = require("@playwright/test");
const { watchConsole, ready } = require("./helpers");

const PN = '[data-hawks="plan-your-night"]';
async function open(page, url) {
  const log = watchConsole(page);
  await page.goto(url);
  await ready(page);
  return log;
}

test("header copy, and all three panels closed on load", async ({ page }) => {
  const log = await open(page, "/test/");
  const pn = page.locator(PN).first();
  await expect(pn.locator(".hkpn__over")).toHaveText("Before you arrive");
  await expect(pn.locator("h2")).toHaveText("Plan your night");
  await expect(pn.locator(".hkpn__hint")).toHaveText("Choose what you need.");
  await expect(pn.locator(".hkpn__tab")).toHaveText(["Getting here", "Eat and drink", "Upgrade"]);
  for (const t of await pn.locator(".hkpn__tab").all()) await expect(t).toHaveAttribute("aria-expanded", "false");
  await expect(pn.locator(".hkpn__panel:visible")).toHaveCount(0);
  expect(log.errors).toEqual([]);
});

test("one open at a time; clicking the open one closes it", async ({ page }) => {
  await open(page, "/test/");
  const pn = page.locator(PN).first(), tabs = pn.locator(".hkpn__tab");
  await tabs.nth(0).click();
  await expect(pn.locator("#plan-getting-here")).toBeVisible();
  await tabs.nth(1).click();
  await expect(pn.locator("#plan-getting-here")).toBeHidden();
  await expect(pn.locator("#plan-eat-drink")).toBeVisible();
  await expect(tabs.nth(0)).toHaveAttribute("aria-expanded", "false");
  await expect(tabs.nth(1)).toHaveAttribute("aria-expanded", "true");
  await tabs.nth(1).click();
  await expect(pn.locator(".hkpn__panel:visible")).toHaveCount(0);
  await expect(tabs.nth(1)).toHaveAttribute("aria-expanded", "false");
});

test("keyboard: Enter and Space open and close panels", async ({ page }) => {
  await open(page, "/test/");
  const pn = page.locator(PN).first(), tabs = pn.locator(".hkpn__tab");
  await tabs.nth(2).focus();
  await page.keyboard.press("Enter");
  await expect(pn.locator("#plan-upgrade")).toBeVisible();
  await page.keyboard.press("Space");
  await expect(pn.locator("#plan-upgrade")).toBeHidden();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Space");
  await expect(pn.locator("#plan-eat-drink")).toBeVisible();
});

test("disclosure wiring: aria-controls and panel labels match", async ({ page }) => {
  await open(page, "/test/");
  for (const pn of await page.locator(PN).all()) {
    for (const t of await pn.locator(".hkpn__tab").all()) {
      const panelId = await t.getAttribute("aria-controls"), tabId = await t.getAttribute("id");
      await expect(page.locator(`[id="${panelId}"]`)).toHaveAttribute("aria-labelledby", tabId);
      await expect(page.locator(`[id="${panelId}"]`)).toHaveCount(1);
    }
  }
});

for (const [hash, idx] of [["#plan-getting-here", 0], ["#plan-eat-drink", 1], ["#plan-upgrade", 2]]) {
  test(`${hash} opens that panel and scrolls to it`, async ({ page }) => {
    await open(page, "/test/" + hash);
    const pn = page.locator(PN).first();
    await expect(pn.locator(".hkpn__tab").nth(idx)).toHaveAttribute("aria-expanded", "true");
    await expect(pn.locator(hash)).toBeVisible();
    await expect(pn.locator(".hkpn__panel:visible")).toHaveCount(1);
    await expect(pn.locator("h2")).toBeInViewport();
    // The second instance in the recap does not react.
    await expect(page.locator(PN).nth(1).locator(".hkpn__panel:visible")).toHaveCount(0);
  });
}

test("every link: exact URL, target and rel; phone link has no target", async ({ page }) => {
  await open(page, "/test/");
  const pn = page.locator(PN).first();
  const links = await pn.locator("a").evaluateAll((as) => as.map((a) => [a.textContent, a.getAttribute("href"), a.getAttribute("target"), a.getAttribute("rel")]));
  const ext = (u) => ["_blank", "noopener noreferrer"];
  expect(links).toEqual([
    ["Open in Google Maps", "https://maps.app.goo.gl/s4uVZdA6nZJxCpTA8", ...ext()],
    ["Full venue transport info", "https://www.wsec.com.au/transport", ...ext()],
    ["Explore Lower Crown Quarter", "https://www.instagram.com/lowercrownquarter/", ...ext()],
    ["Explore hospitality", "https://hawks-corporate-hospitality.lovable.app/", ...ext()],
    ["Call 1300 1HAWKS", "tel:1300142957", null, null]
  ]);
});

test("rendered copy matches the approved reference embed word for word", async ({ page }) => {
  const fs = require("fs"), path = require("path");
  const ref = fs.readFileSync(path.join(__dirname, "../reference/hawks-plan-your-night.html"), "utf8");
  const body = ref.slice(ref.indexOf('<section class="hkpn"'), ref.indexOf("</section>"));
  const decode = (t) => t.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  const noJsOnly = ["Upgrade your night"];
  const texts = [...body.matchAll(/>([^<>]+)</g)].map((m) => decode(m[1]).trim()).filter((t) => t && !noJsOnly.includes(t));
  const refItems = [...body.matchAll(/<li>([^<]+)<\/li>/g)].map((m) => decode(m[1]));
  await page.goto("/test/");
  await ready(page);
  const pn = page.locator(PN).first();
  const rendered = await pn.evaluate((e) => e.textContent.replace(/\s+/g, " "));
  expect(texts.filter((t) => !rendered.includes(t.replace(/\s+/g, " ")))).toEqual([]);
  expect(await pn.locator(".hkpn__list li").allTextContents()).toEqual(refItems);
});
