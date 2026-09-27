// Whole page: single render, no duplicate IDs, fallbacks, widths, links, console, headings.
const { test, expect } = require("@playwright/test");
const { watchConsole, ready } = require("./helpers");

const STATES = ["2026-09-27T12:00", "2026-10-02T19:45", "2026-12-31T12:00", "2027-02-04T20:00", "2027-02-05T09:00"];

test("every placeholder renders exactly once; no duplicate IDs; no console errors", async ({ page }) => {
  for (const t of STATES) {
    const log = watchConsole(page);
    await page.goto("/test/?hk_now=" + t + "#game-7");
    await ready(page);
    await page.waitForLoadState("load");
    const r = await page.evaluate(() => {
      const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
      return {
        dupes: ids.filter((id, i) => ids.indexOf(id) !== i),
        hosts: [...document.querySelectorAll("[data-hawks]")].map((e) => e.children.length + ":" + e.classList.contains("hk-host")),
        instances: window.__hawksEmbeds.instances.length
      };
    });
    expect(r.dupes, t).toEqual([]);
    expect(r.hosts, t).toEqual(Array(16).fill("1:true"));
    expect(r.instances, t).toBe(16);
    expect(log.errors, t).toEqual([]);
  }
});

test("works when Webflow drops defer and the script sits above the placeholders", async ({ page }) => {
  const log = watchConsole(page);
  await page.goto("/test/nodefer.html?hk_now=2026-09-27T12:00");
  await ready(page);
  await expect(page.locator('[data-hawks="next-game"] h2').first()).toHaveText("Hawks v Adelaide 36ers");
  expect(await page.locator(".hk-host").count()).toBe(16);
  expect(log.errors).toEqual([]);
});

test("script blocked: every fallback link is visible, readable and correct", async ({ page }) => {
  await page.goto("/test/blocked.html");
  const links = await page.$$eval("[data-hawks] a", (as) => as.map((a) => [a.closest("[data-hawks]").dataset.hawks, a.textContent, a.href, a.offsetHeight > 0]));
  expect(links).toEqual([
    ["next-game", "Buy tickets to Hawks home games", "https://www.ticketmaster.com.au/illawarra-hawks-tickets/artist/1055493", true],
    ["upcoming-games", "Tickets to all Hawks home games", "https://www.ticketmaster.com.au/illawarra-hawks-tickets/artist/1055493", true],
    ["plan-your-night", "Getting to WIN Entertainment Centre", "https://www.wsec.com.au/transport", true],
    ["trivia-mvp", "Vote for your Game MVP", "https://hawks-mvp-vote.lovable.app/", true],
    ["game-preview", "Hawks news and game previews", "https://www.hawks.com.au/news", true],
    ["girls-in-the-game", "Girls in the Game: dates and registration", "https://www.hawks.com.au/pages/girls-in-the-game", true],
    ["newsletter", "Join the Hawks mailing list", "https://mailchi.mp/hawks/illawarra-hawks-newsletter", true],
    ["top-10", "Hawks history: all-time top 10 single-game feats", "https://www.hawks.com.au/pages/illawarra-hawks-history", true],
    ["next-game", "Next home game, key times and tickets", "https://www.hawks.com.au/pages/gameday", true],
    ["game-preview", "Hawks news and game previews", "https://www.hawks.com.au/news", true],
    ["upcoming-games", "Tickets to all Hawks home games", "https://www.ticketmaster.com.au/illawarra-hawks-tickets/artist/1055493", true],
    ["plan-your-night", "Getting to WIN Entertainment Centre", "https://www.wsec.com.au/transport", true],
    ["trivia-mvp", "Vote for your Game MVP", "https://hawks-mvp-vote.lovable.app/", true],
    ["girls-in-the-game", "Girls in the Game: dates and registration", "https://www.hawks.com.au/pages/girls-in-the-game", true],
    ["newsletter", "Join the Hawks mailing list", "https://mailchi.mp/hawks/illawarra-hawks-newsletter", true],
    ["top-10", "Hawks history: all-time top 10 single-game feats", "https://www.hawks.com.au/pages/illawarra-hawks-history", true]
  ]);
});

for (const w of [320, 390, 768, 1280]) {
  test(`no horizontal scroll at ${w}px, with everything open`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 800 });
    for (const t of STATES) {
      await page.goto("/test/?hk_now=" + t);
      await ready(page);
      await page.evaluate(() => document.fonts.ready);
      // Open every disclosure so hidden content is measured too.
      await page.evaluate(() => {
        document.querySelectorAll(".hksl__bar, .hksl__row button").forEach((b) => b.click());
        document.querySelector(".hkpn__tab").click();
      });
      for (const panel of [0, 1, 2]) {
        if (panel) await page.evaluate((i) => document.querySelectorAll(".hkpn__tab")[i].click(), panel);
        const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
        expect(r.sw, `${t} panel ${panel}`).toBeLessThanOrEqual(r.cw);
        const wide = await page.evaluate(() => [...document.querySelectorAll(".hk-host *")].filter((e) => { const b = e.getBoundingClientRect(); return b.width && b.right > document.documentElement.clientWidth + 0.5; }).map((e) => e.className).slice(0, 5));
        expect(wide, `${t} panel ${panel}`).toEqual([]);
      }
    }
  });
}

test("every rendered link: https or tel, external links open safely", async ({ page }) => {
  await page.goto("/test/?hk_now=2026-09-27T12:00");
  await ready(page);
  const bad = await page.$$eval(".hk-host a", (as) => as.filter((a) => !a.closest("[hidden]")).map((a) => {
    const h = a.getAttribute("href") || "";
    if (h.startsWith("tel:")) return a.target || a.rel ? "tel link has target/rel: " + h : null;
    if (!/^https:\/\//.test(h)) return "not https: " + a.textContent + " " + h;
    if (a.target !== "_blank" || a.rel !== "noopener noreferrer") return "missing target/rel: " + h;
    return null;
  }).filter(Boolean));
  expect(bad).toEqual([]);
});

test("heading levels: each module starts at H2 and only uses H2 and H3", async ({ page }) => {
  await page.goto("/test/?hk_now=2026-09-27T12:00");
  await ready(page);
  const r = await page.$$eval(".hk-host", (hosts) => hosts.map((h) => [...h.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((x) => x.tagName).join(",")));
  for (const s of r) expect(s === "" || /^H2(,H[23])*$/.test(s), s).toBeTruthy();
});

test("[hidden] wins on every module root, even roots that set display", async ({ page }) => {
  await page.goto("/test/?hk_now=2026-09-27T12:00");
  await ready(page);
  const shown = await page.evaluate(() => [".hkng", ".hksl", ".hkpn", ".hkpv", ".hkgp", ".hkscta", ".hksfeats"].filter((sel) => {
    const el = document.querySelector(sel); el.hidden = true;
    const vis = getComputedStyle(el).display !== "none"; el.hidden = false; return vis;
  }));
  expect(shown).toEqual([]);
});

test("styles survive the simulated Webflow CSS: fixed body line-height does not leak", async ({ page }) => {
  await page.goto("/test/?hk_now=2026-09-27T12:00");
  await ready(page);
  // Webflow sets a fixed px body line-height; use an unmistakable value so any leak shows.
  await page.addStyleTag({ content: "body{line-height:37px !important}" });
  const leaks = await page.$$eval(".hk-host *", (els) => els.filter((e) => e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && getComputedStyle(e).lineHeight === "37px").map((e) => e.className));
  expect(leaks).toEqual([]);
});
