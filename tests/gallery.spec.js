// Photo gallery: data-hawks="gallery" with data-gallery set to a name in data.js galleries.
const { test, expect } = require("@playwright/test");
const { loadData, useData, watchConsole, ready } = require("./helpers");

const root = '[data-gallery="indigenous-jersey"] .hkgal';
async function open(page, mutate) {
  const log = watchConsole(page);
  await useData(page, mutate);
  await page.goto("/test/?hk_now=2026-10-01T12:00");
  await ready(page);
  return log;
}

test("renders the grid from data.js with captions, declared sizes and no console errors", async ({ page }) => {
  const log = await open(page);
  const G = loadData().galleries["indigenous-jersey"];
  await expect(page.locator(root + " h2")).toHaveText(G.heading);
  const thumbs = page.locator(root + " .hkgal__thumb");
  await expect(thumbs).toHaveCount(G.images.length);
  await expect(thumbs.first().locator(".hkgal__t")).toHaveText(G.images[0].title);
  const img = thumbs.first().locator("img");
  await expect(img).toHaveAttribute("width", "1080");
  await expect(img).toHaveAttribute("height", "1350");
  await expect(img).toHaveAttribute("loading", "lazy");
  await expect(thumbs.first()).toHaveAttribute("aria-label", /^Healthy Deadly Kids Navi & Tom\. View larger: /);
  expect(log.errors).toEqual([]);
});

test("a thumbnail opens the viewer; next, previous, arrows, counter and caption work; close returns focus", async ({ page }) => {
  await open(page);
  const G = loadData().galleries["indigenous-jersey"].images, n = G.length;
  const thumb = page.locator(root + " .hkgal__thumb").nth(1);
  await thumb.click();
  const lb = page.locator("dialog.hkgal-lb");
  await expect(lb).toBeVisible();
  await expect(lb).toHaveAttribute("aria-label", "NBL27 Indigenous Jersey gallery");
  await expect(lb.locator(".hkgal-lb__count")).toHaveText("2 / " + n);
  await expect(lb.locator(".hkgal-lb__t")).toHaveText(G[1].title);
  await expect(lb.locator(".hkgal-lb__img")).toHaveAttribute("alt", G[1].alt);
  await lb.locator(".hkgal-lb__next").click();
  await expect(lb.locator(".hkgal-lb__count")).toHaveText("3 / " + n);
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(lb.locator(".hkgal-lb__count")).toHaveText("1 / " + n);
  await page.keyboard.press("ArrowLeft");
  await expect(lb.locator(".hkgal-lb__count")).toHaveText(n + " / " + n);
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
  await page.keyboard.press("Escape");
  await expect(lb).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  await expect(thumb).toBeFocused();
});

test("close button and a click outside the picture both close the viewer", async ({ page }) => {
  await open(page);
  const lb = page.locator("dialog.hkgal-lb");
  await page.locator(root + " .hkgal__thumb").first().click();
  await lb.locator(".hkgal-lb__x").click();
  await expect(lb).toBeHidden();
  await page.locator(root + " .hkgal__thumb").first().click();
  await page.mouse.click(5, 300);
  await expect(lb).toBeHidden();
});

test("keyboard: Enter on a thumbnail opens the viewer", async ({ page }) => {
  await open(page);
  await page.locator(root + " .hkgal__thumb").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("dialog.hkgal-lb")).toBeVisible();
});

test("a one-picture gallery has no previous or next and no counter", async ({ page }) => {
  await open(page, (d) => { d.galleries["indigenous-jersey"].images = d.galleries["indigenous-jersey"].images.slice(0, 1); });
  await page.locator(root + " .hkgal__thumb").click();
  const lb = page.locator("dialog.hkgal-lb");
  await expect(lb.locator(".hkgal-lb__prev")).toBeHidden();
  await expect(lb.locator(".hkgal-lb__next")).toBeHidden();
  await expect(lb.locator(".hkgal-lb__count")).toHaveText("");
});

test("a second gallery shares one viewer and opens its own pictures", async ({ page }) => {
  await open(page, (d) => {
    d.galleries.second = { heading: "Second", label: "Second gallery", ratio: "1:1", images: [{ src: "https://example.com/a.jpg", alt: "A", title: "Only" }, { src: "https://example.com/b.jpg", alt: "B" }] };
  });
  await page.evaluate(() => {
    const d = document.createElement("div"); d.setAttribute("data-hawks", "gallery"); d.setAttribute("data-gallery", "second");
    d.innerHTML = '<a href="https://www.hawks.com.au/">Gallery</a>'; document.body.appendChild(d); window.__hawksEmbeds.scan();
  });
  await expect(page.locator('[data-gallery="second"] .hkgal__thumb')).toHaveCount(2);
  await expect(page.locator('[data-gallery="second"] img').first()).toHaveAttribute("height", "1080");
  await page.locator('[data-gallery="second"] .hkgal__thumb').nth(1).click();
  await expect(page.locator("dialog.hkgal-lb")).toHaveCount(1);
  await expect(page.locator("dialog.hkgal-lb")).toHaveAttribute("aria-label", "Second gallery");
  await expect(page.locator(".hkgal-lb__count")).toHaveText("2 / 2");
});

test("bad data: unknown name keeps the fallback link; bad pictures are skipped with a warning", async ({ page }) => {
  const log = await open(page, (d) => {
    d.galleries["indigenous-jersey"].images.push({ src: "http://nope", alt: "x" }, { src: "https://example.com/c.jpg", alt: "" });
  });
  await expect(page.locator(root + " .hkgal__thumb")).toHaveCount(4);
  expect(log.warnings.join("\n")).toMatch(/images 5 skipped: it needs an https:\/\/ src/);
  expect(log.warnings.join("\n")).toMatch(/images 6 skipped: it needs alt text/);
  await page.evaluate(() => {
    const d = document.createElement("div"); d.id = "bad"; d.setAttribute("data-hawks", "gallery"); d.setAttribute("data-gallery", "nope");
    d.innerHTML = '<a href="https://www.hawks.com.au/">Fallback</a>'; document.body.appendChild(d); window.__hawksEmbeds.scan();
  });
  await expect(page.locator("#bad a")).toHaveText("Fallback");
});

test("no sideways scroll at 320, 390, 768 and 1280", async ({ page }) => {
  for (const w of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width: w, height: 800 });
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.locator(root + " .hkgal__thumb").first().click();
    const box = await page.locator("dialog.hkgal-lb .hkgal-lb__img").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(w);
    await page.keyboard.press("Escape");
  }
});

test("ratio auto keeps each picture's own shape and declared size; bad sizes warn", async ({ page }) => {
  const log = await open(page, (d) => {
    const g = d.galleries["indigenous-jersey"];
    g.ratio = "auto";
    g.images[0].width = 4898; g.images[0].height = 3265;
    g.images[1].width = 4032; g.images[1].height = 3024;
    g.images[2].width = 0;
  });
  const imgs = page.locator(root + " .hkgal__img");
  await expect(imgs.nth(0)).toHaveAttribute("width", "4898");
  await expect(imgs.nth(1)).toHaveAttribute("height", "3024");
  await expect(imgs.nth(3)).not.toHaveAttribute("width", /.*/);
  expect(log.warnings.join("\n")).toMatch(/images 3 width and height ignored/);
  expect(await imgs.nth(0).evaluate((e) => getComputedStyle(e).aspectRatio)).toBe("auto");
});

test("the Matt Flinn gallery shows its 16 pictures with the year as caption", async ({ page }) => {
  const log = await open(page);
  const G = loadData().galleries["matt-flinn-500"];
  expect(G.images).toHaveLength(16);
  /* The first two pictures (Flinny-01, Flinny-02) have no year in their file names, so no caption. */
  G.images.forEach((im, i) => expect(im.title).toBe(i < 2 ? "" : /_(\d{4})/.exec(im.src.split("/").pop())[1]));
  await page.evaluate(() => {
    const d = document.createElement("div"); d.setAttribute("data-hawks", "gallery"); d.setAttribute("data-gallery", "matt-flinn-500");
    d.innerHTML = '<a href="https://www.hawks.com.au/">Gallery</a>'; document.body.appendChild(d); window.__hawksEmbeds.scan();
  });
  await expect(page.locator('[data-gallery="matt-flinn-500"] h2')).toHaveText("Matt Flinn: 500 Hawks games");
  await expect(page.locator('[data-gallery="matt-flinn-500"] .hkgal__thumb')).toHaveCount(16);
  expect(log.errors).toEqual([]);
});
