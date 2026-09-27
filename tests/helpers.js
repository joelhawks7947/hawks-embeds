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
  await page.route("**/data.js", (route) =>
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

module.exports = { ROOT, loadData, referenceGames, useData, watchConsole, ready };
