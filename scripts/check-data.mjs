// Checks data.js the same way the live script does, without a browser.
// Fails on a syntax error or on any warning (a skipped game, a bad link).
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ROOT = new URL("..", import.meta.url).pathname;
const problems = [];
const quietConsole = { warn: (m) => problems.push(m), error: (m) => problems.push(m), log() {} };

const win = {};
try {
  vm.runInNewContext(readFileSync(ROOT + "data.js", "utf8"), { window: win }, { filename: "data.js" });
} catch (e) {
  console.error("data.js has a syntax error: " + e.message);
  process.exit(1);
}

// Run hawks-core.js against a minimal stand-in page so its own validation runs.
const doc = {
  currentScript: null, readyState: "complete", head: { appendChild() {} },
  querySelectorAll: () => [], querySelector: () => null, getElementById: () => null,
  createElement: () => ({ appendChild() {} }), createTextNode: () => ({}), addEventListener() {}
};
win.HAWKS_DATA = win.HAWKS_DATA;
win.addEventListener = () => {};
win.console = quietConsole;
vm.runInNewContext(readFileSync(ROOT + "hawks-core.js", "utf8"), {
  window: win, document: doc, location: { search: "", hash: "" }, console: quietConsole,
  Intl, Date, setInterval: () => 0, clearInterval() {}
}, { filename: "hawks-core.js" });

const d = win.__hawksEmbeds && win.__hawksEmbeds.data;
if (problems.length || !d) {
  console.error("data.js problems:\n" + (problems.length ? problems.join("\n") : "data did not load"));
  process.exit(1);
}
// top10.js, checked with the Top 10 module's own validation.
const t = {};
try {
  vm.runInNewContext(readFileSync(ROOT + "top10.js", "utf8"), { window: t }, { filename: "top10.js" });
} catch (e) {
  console.error("top10.js has a syntax error: " + e.message);
  process.exit(1);
}
const top = win.__hawksEmbeds.modules["top-10"].extra.validate(t.HAWKS_TOP10 || {});
if (problems.length || !top) {
  console.error("top10.js problems:\n" + (problems.length ? problems.join("\n") : "no valid categories"));
  process.exit(1);
}
console.log(`Data check passed: ${d.games.length} games, ${Object.keys(d.links).length} links, ${top.categories.length} Top 10 categories.`);
