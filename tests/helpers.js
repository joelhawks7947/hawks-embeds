// Shared helpers for the Playwright tests.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

/* Run data.js in a sandbox and return window.HAWKS_DATA. */
function loadData() {
  const box = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8"), box);
  return box.window.HAWKS_DATA;
}

/* The games array from Section 1 of the reference gameday embed. */
function referenceGames() {
  const html = fs.readFileSync(path.join(ROOT, "reference/hawks-gameday-nbl27.html"), "utf8");
  const src = /G\.games = (\[[\s\S]*?\]);/.exec(html)[1];
  return vm.runInNewContext(src);
}

/* Serve a modified data.js for one test. mutate(data) edits a copy of the real data. */
async function useData(page, mutate) {
  const data = JSON.parse(JSON.stringify(loadData()));
  if (mutate) mutate(data);
  await page.route("**/data.js*", (route) =>
    route.fulfill({ contentType: "text/javascript", body: "window.HAWKS_DATA = " + JSON.stringify(data) + ";" }));
}

/* Collect console messages and page errors. */
function watchConsole(page) {
  const log = { errors: [], warnings: [], all: [] };
  page.on("console", (m) => {
    log.all.push(m.type() + ": " + m.text());
    if (m.type() === "error") log.errors.push(m.text());
    if (m.type() === "warning") log.warnings.push(m.text());
  });
  page.on("pageerror", (e) => log.errors.push("pageerror: " + e.message));
  return log;
}

/* Wait until the script has rendered (or given up on) every placeholder. */
async function ready(page) {
  await page.waitForFunction(() => document.querySelectorAll("[data-hawks]:not([data-hawks-ready])").length === 0);
}

/* A pretend hawks.com.au page for URLs matching `pattern`, holding `body` (HTML). Its script tags use
   the real addresses: jsDelivr and GitHub Pages requests are both answered from the local files, as
   UTF-8 like the real hosts, so the test runs the local code end to end. */
async function fakeHawksPage(page, pattern, body) {
  await page.route(/https:\/\/(cdn\.jsdelivr\.net\/gh\/joelhawks7947\/hawks-embeds@main|joelhawks7947\.github\.io\/hawks-embeds)\/([^?#]+)/, (r) => {
    const file = /(?:@main|github\.io\/hawks-embeds)\/([^?#]+)/.exec(r.request().url())[1];
    r.fulfill({ contentType: "application/javascript; charset=utf-8", body: fs.readFileSync(path.join(ROOT, file), "utf8") });
  });
  await page.route(pattern, (r) => r.fulfill({ contentType: "text/html; charset=utf-8", body: "<!DOCTYPE html><html><head></head><body>" + body + "</body></html>" }));
}

module.exports = { fakeHawksPage, ROOT, loadData, referenceGames, useData, watchConsole, ready };
