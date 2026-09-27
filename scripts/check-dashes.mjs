// Fails if any text file in the repo contains an em dash or en dash
// (or the similar figure dash and horizontal bar). House rule: see CLAUDE.md.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SKIP_DIRS = new Set([".git", "node_modules", "test-results", "playwright-report"]);
const TEXT = /\.(js|mjs|cjs|json|html|css|md|yml|yaml|txt)$|^\.gitignore$/;
const BAD = new RegExp("[" + [0x2012, 0x2013, 0x2014, 0x2015].map((c) => String.fromCharCode(c)).join("") + "]");

const hits = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (!SKIP_DIRS.has(name)) walk(p); continue; }
    if (!TEXT.test(name)) continue;
    readFileSync(p, "utf8").split("\n").forEach((line, i) => {
      if (BAD.test(line)) hits.push(`${relative(ROOT, p)}:${i + 1}: ${line.trim().slice(0, 100)}`);
    });
  }
})(ROOT);

if (hits.length) {
  console.error("Em or en dashes found (use a colon, comma or full stop instead):\n" + hits.join("\n"));
  process.exit(1);
}
console.log("Dash check passed: no em or en dashes.");
