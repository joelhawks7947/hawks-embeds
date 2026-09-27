// Core: data parity, time maths, validation, failure fallbacks, single init.
const { test, expect } = require("@playwright/test");
const { loadData, referenceGames, useData, watchConsole } = require("./helpers");

test("data.js games match Section 1 of the reference embed exactly (apart from ticket links)", () => {
  const ours = loadData().games, ref = referenceGames();
  expect(ours.map((g) => ({ ...g, tickets: "" }))).toEqual(ref);
  expect(ours).toHaveLength(16);
});

test("every game has its own Ticketmaster event link for the right date", () => {
  for (const g of loadData().games) {
    const [y, m, d] = g.date.split("-");
    expect(g.tickets, "game " + g.n).toMatch(new RegExp("^https://www\\.ticketmaster\\.com\\.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-" + d + "-" + m + "-" + y + "/event/[0-9A-F]{16}$"));
  }
  const ids = loadData().games.map((g) => g.tickets);
  expect(new Set(ids).size).toBe(16);
});

test("data.js links match the reference and CLAUDE.md canonical links", () => {
  const d = loadData();
  expect(d.venue).toBe("WIN Entertainment Centre");
  expect(d.defaultTickets).toBe("https://www.ticketmaster.com.au/illawarra-hawks-tickets/artist/1055493");
  expect(d.links).toMatchObject({
    flexi: "https://am.ticketmaster.com/thehawks/FLeximemberships",
    member: "https://am.ticketmaster.com/thehawks/",
    picker: "https://hawks-membership-picker.lovable.app/",
    mvpVote: "https://hawks-mvp-vote.lovable.app/",
    mvpImage: "https://cdn.prod.website-files.com/689d0b8adfdc2e5ca8e5a604/6ab73bbbf4abbf2c6fdda107_MVP%20Vote_1080x1080_.jpg",
    hospitality: "https://hawks-corporate-hospitality.lovable.app/",
    transport: "https://www.wsec.com.au/transport",
    map: "https://maps.app.goo.gl/s4uVZdA6nZJxCpTA8",
    instagram: "https://www.instagram.com/lowercrownquarter/",
    phone: "tel:1300142957",
    gameDayGuide: "https://www.hawks.com.au/pages/gameday",
    trivia: ""
  });
});

test.describe("in the browser", () => {
  test("Sydney time converts correctly across both daylight saving changes", async ({ page }) => {
    await page.goto("/test/");
    await page.waitForFunction(() => window.__hawksEmbeds && window.__hawksEmbeds.data);
    const r = await page.evaluate(() => {
      const t = window.__hawksEmbeds.u.toUtc;
      return {
        g1: new Date(t("2026-10-02", "19:30")).toISOString(),   // AEST, UTC+10
        g3: new Date(t("2026-10-11", "17:00")).toISOString(),   // AEDT, UTC+11
        before: new Date(t("2026-10-04", "01:59")).toISOString(),
        after: new Date(t("2026-10-04", "03:00")).toISOString(),
        g16: new Date(t("2027-02-04", "19:30")).toISOString(),  // AEDT
        apr: new Date(t("2027-04-10", "19:30")).toISOString(),  // AEST again
        midnight: new Date(t("2026-10-03", "00:00")).toISOString()
      };
    });
    expect(r).toEqual({
      g1: "2026-10-02T09:30:00.000Z",
      g3: "2026-10-11T06:00:00.000Z",
      before: "2026-10-03T15:59:00.000Z",
      after: "2026-10-03T16:00:00.000Z",
      g16: "2027-02-04T08:30:00.000Z",
      apr: "2027-04-10T09:30:00.000Z",
      midnight: "2026-10-02T14:00:00.000Z"
    });
  });

  test("hk_now sets the clock and the active game", async ({ page }) => {
    await page.goto("/test/?hk_now=2026-10-03T00:01");
    await page.waitForFunction(() => window.__hawksEmbeds && window.__hawksEmbeds.data);
    const s = await page.evaluate(() => { const s = window.__hawksEmbeds.state(); return { n: s.game.n, phase: s.phase }; });
    expect(s).toEqual({ n: 2, phase: "countdown" });
  });

  test("a bad game is skipped with a clear warning; the rest load", async ({ page }) => {
    const log = watchConsole(page);
    await useData(page, (d) => { d.games[6].tip = "7:30pm"; d.games[7].date = "2026-02-30"; });
    await page.goto("/test/");
    await page.waitForFunction(() => window.__hawksEmbeds && window.__hawksEmbeds.data);
    const ns = await page.evaluate(() => window.__hawksEmbeds.data.games.map((g) => g.n));
    expect(ns).toEqual([1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16]);
    expect(log.warnings.join("\n")).toContain('[hawks] game 7 skipped: tip "7:30pm" is not HH:MM');
    expect(log.warnings.join("\n")).toContain('[hawks] game 8 skipped: date "2026-02-30" is not a real YYYY-MM-DD date');
    expect(log.errors).toEqual([]);
  });

  test("a bad link is ignored with a warning", async ({ page }) => {
    const log = watchConsole(page);
    await useData(page, (d) => { d.games[0].preview = "www.hawks.com.au/news/x"; d.links.map = "javascript:alert(1)"; });
    await page.goto("/test/");
    await page.waitForFunction(() => window.__hawksEmbeds && window.__hawksEmbeds.data);
    const r = await page.evaluate(() => ({ p: window.__hawksEmbeds.data.games[0].preview, m: window.__hawksEmbeds.data.links.map }));
    expect(r).toEqual({ p: "", m: "" });
    expect(log.warnings.join("\n")).toContain("game 1 preview ignored");
    expect(log.warnings.join("\n")).toContain("links.map ignored");
  });

  for (const [label, body, status] of [["has a syntax error", "window.HAWKS_DATA = { games: [ {n:1,, };", 200], ["is missing", "Not found", 404]]) {
    test(`if data.js ${label}, every placeholder keeps its fallback link`, async ({ page }) => {
      const log = watchConsole(page);
      await page.route("**/data.js*", (r) => r.fulfill({ status, contentType: "text/javascript", body }));
      await page.goto("/test/");
      await page.waitForTimeout(500);
      const links = await page.$$eval("[data-hawks]", (els) => els.map((e) => e.querySelector("a") && e.querySelector("a").href));
      expect(links).toHaveLength(14);
      links.forEach((h) => expect(h).toMatch(/^https:\/\//));
      expect(log.errors.join("\n")).toMatch(/\[hawks\]|SyntaxError/);
    });
  }

  test("fourteen script tags on one page: initialises once, one style block, one font link", async ({ page }) => {
    await page.goto("/test/");
    await page.waitForFunction(() => window.__hawksEmbeds && window.__hawksEmbeds.data);
    await page.waitForLoadState("load");
    const r = await page.evaluate(() => ({
      scripts: document.querySelectorAll('script[src$="hawks.js"]').length,
      dataScripts: document.querySelectorAll('script[src*="data.js?v="]').length,
      styles: document.querySelectorAll("#hawks-embeds-css").length,
      fonts: document.querySelectorAll('link[href*="fonts.googleapis.com/css2"]').length
    }));
    expect(r.scripts).toBe(14);
    expect(r.dataScripts).toBe(1);
    expect(r.styles).toBeLessThanOrEqual(1);
    expect(r.fonts).toBeLessThanOrEqual(1);
  });
});
