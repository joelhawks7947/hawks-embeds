// trivia-mvp: Coming soon until a trivia link is set; MVP image and vote link; stays on after the season.
const { test, expect } = require("@playwright/test");
const { useData, watchConsole, ready } = require("./helpers");

const PV = '[data-hawks="trivia-mvp"]';

test("Coming soon while the trivia link is empty; MVP panel complete", async ({ page }) => {
  const log = watchConsole(page);
  await page.goto("/test/");
  await ready(page);
  const pv = page.locator(PV).first();
  await expect(pv.locator("h2")).toHaveText("Hawks trivia");
  await expect(pv.locator(".hkpv__soon")).toHaveText("Coming soon");
  // Trivia is the red panel, the MVP vote the black one. Coming soon is black on red for contrast.
  const bg = (sel) => pv.locator(sel).evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(await bg(".hkpv__trivia")).toBe("rgb(255, 0, 19)");
  expect(await bg(".hkpv__mvp")).toBe("rgb(0, 0, 0)");
  expect(await pv.locator(".hkpv__soon").evaluate((e) => getComputedStyle(e).color)).toBe("rgb(0, 0, 0)");
  await expect(pv.locator(".hkpv__trivia a")).toHaveCount(0);
  const img = pv.locator("img");
  await expect(img).toHaveAttribute("src", "https://cdn.prod.website-files.com/689d0b8adfdc2e5ca8e5a604/6ab73bbbf4abbf2c6fdda107_MVP%20Vote_1080x1080_.jpg");
  await expect(img).toHaveAttribute("width", "1080");
  await expect(img).toHaveAttribute("height", "1080");
  await expect(img).toHaveAttribute("loading", "lazy");
  await expect(img).toHaveAttribute("alt", "Vote for your Greater Bank Game MVP");
  const vote = pv.locator(".hkpv__mvp a");
  await expect(vote).toHaveText("Place your vote");
  await expect(vote).toHaveAttribute("href", "https://hawks-mvp-vote.lovable.app/");
  await expect(vote).toHaveAttribute("target", "_blank");
  await expect(vote).toHaveAttribute("rel", "noopener noreferrer");
  expect(log.errors).toEqual([]);
});

test("live Test your knowledge link once the trivia link is set", async ({ page }) => {
  await useData(page, (d) => { d.links.trivia = "https://example.com/hawks-trivia"; });
  await page.goto("/test/");
  await ready(page);
  const a = page.locator(PV).first().locator(".hkpv__trivia a");
  await expect(a).toHaveText("Test your knowledge");
  await expect(a).toHaveAttribute("href", "https://example.com/hawks-trivia");
  await expect(a).toHaveAttribute("target", "_blank");
  await expect(a).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.locator(PV).first().locator(".hkpv__soon")).toHaveCount(0);
});

test("stays on after the final game", async ({ page }) => {
  await page.goto("/test/?hk_now=2027-03-01T12:00");
  await ready(page);
  await expect(page.locator(PV).first().locator(".hkpv")).toBeVisible();
  await expect(page.locator(PV).first().locator(".hkpv__mvp a")).toBeVisible();
});
