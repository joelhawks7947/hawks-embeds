// Builds the FAQ embed from the Hawks fan FAQ tracker spreadsheet.
// Usage: npm run faq -- "/path/to/Hawks-Fan-FAQ-Tracker.xlsx"
//
// Reads the FAQ tab, keeps rows whose Status is Done, and writes:
//   faq/faq-embed.html  the code to paste into the Webflow Code Embed on the FAQ page
//   faq/faq.json        the same questions and answers as data (for a future help bot)
//   test/faq.html       a local test page holding the embed
//
// The questions and answers are written into the embed as plain HTML, not drawn by
// the script, so search engines and AI crawlers that don't run JavaScript can read them.
// hawks.js then adds the styling, accordion and search, and writes the FAQPage structured
// data for Google from those same questions (kept out of the embed, which would otherwise
// pass Webflow's 50,000 character limit at around 50 questions).
//
// Only ID, Section, Question, Answer, Link (and an optional "Link text" column) are
// published. Owners, notes and status never leave the spreadsheet.
import ExcelJS from "exceljs";
import { mkdirSync, writeFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname;
const SCRIPT = "https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js";
const PAGE = "https://www.hawks.com.au/pages/faqs"; // the FAQ page; each question links to PAGE#faq-xx-nn
const LIMIT = 50000, WARN_AT = 45000; // Webflow's Code Embed limit, in characters

// Link text for each related link, shown as "More info: <text>". A "Link text" column in
// the sheet overrides this. A link with no text here and no column value stops the build.
const LINK_TEXT = {
  "hawks.com.au/pages/gameday": "Game Day Guide",
  "hawks.com.au": "hawks.com.au",
  "wsec.com.au/transport": "WIN Entertainment Centre transport",
  "wsec.com.au/plan-your-visit/conditions_of_entry": "WIN Entertainment Centre conditions of entry",
  "wsec.com.au/plan-your-visit/frequently_asked_questions": "WIN Entertainment Centre FAQs",
  "nbl.com.au/pages/nbl-spectator-standards": "NBL spectator standards",
  "nbl.com.au/how-to-watch": "How to watch on the NBL website",
  "illawarrahawks.typeform.com/to/ldprcjhi": "Group tickets form",
  "hawks-membership-picker.lovable.app": "Membership picker",
  "shop-illawarrahawks.com": "Hawks shop"
};

const file = process.argv[2];
if (!file) { console.error('Give the spreadsheet path: npm run faq -- "/path/to/Hawks-Fan-FAQ-Tracker.xlsx"'); process.exit(1); }

const errors = [], warnings = [];
const DASH = /[\u2012-\u2015]/;

function cellText(v) {
  if (v == null) return "";
  if (typeof v === "object") {
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    if (v.richText) return v.richText.map((r) => r.text).join("");
    if ("text" in v) return cellText(v.text);
    if ("result" in v) return cellText(v.result);
    if ("hyperlink" in v) return String(v.hyperlink);
  }
  return String(v);
}
function clean(s) {
  return s.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "").replace(/\u00A0/g, " ")
    .replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\u2026/g, "...").replace(/\r/g, "");
}
function oneLine(s) { return clean(s).replace(/\s+/g, " ").trim(); }
function paragraphs(s) { return clean(s).split(/\n+/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean); }
function esc(s) { return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
function urlKey(u) { return u.toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/[?#].*$/, "").replace(/\/+$/, ""); }
function isHawks(u) { return /^https:\/\/(www\.)?hawks\.com\.au([\/?#]|$)/i.test(u); }
function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

// Phone numbers and email addresses in answers become tap-to-call and email links.
function linkify(html) {
  return html
    .replace(/\b[\w.+-]+@[\w-]+(\.[\w-]+)+\b/g, (m) => `<a href="mailto:${m}">${m}</a>`)
    .replace(/\b(1[38]00 ?\d{3} ?\d{3}|0[2378] ?\d{4} ?\d{4})\b/g, (m) => {
      const d = m.replace(/ /g, "");
      return `<a href="tel:${d[0] === "0" ? "+61" + d.slice(1) : d}">${m}</a>`;
    });
}
function linkAttrs(url) { return `href="${esc(url)}"` + (isHawks(url) ? "" : ' target="_blank" rel="noopener noreferrer"'); }

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(file);
const ws = wb.getWorksheet("FAQ");
if (!ws) { console.error('No "FAQ" tab in ' + file); process.exit(1); }

// Find columns by their heading, so added or moved columns don't break the build.
const col = {};
ws.getRow(1).eachCell((c, i) => { col[oneLine(cellText(c.value)).toLowerCase()] = i; });
for (const h of ["id", "section", "question", "answer", "link", "status"]) if (!col[h]) errors.push(`The FAQ tab has no "${h}" column heading.`);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
const get = (row, h) => (col[h] ? cellText(row.getCell(col[h]).value) : "");

const items = [], seen = new Set();
let skipped = 0;
ws.eachRow((row, n) => {
  if (n === 1) return;
  const id = oneLine(get(row, "id")).toUpperCase();
  const status = oneLine(get(row, "status")).toLowerCase();
  if (!id && !oneLine(get(row, "question"))) return;
  if (status !== "done") { skipped++; return; }
  const where = `Row ${n} (${id || "no ID"})`;
  const section = oneLine(get(row, "section")), question = oneLine(get(row, "question"));
  const answer = paragraphs(get(row, "answer")), link = oneLine(get(row, "link"));
  let linkText = oneLine(get(row, "link text"));
  if (!/^[A-Z]{2}-\d{2,3}$/.test(id)) { errors.push(`${where}: the ID should look like GD-01. Done rows need an ID.`); return; }
  if (seen.has(id)) { errors.push(`${where}: ID ${id} is used twice.`); return; }
  seen.add(id);
  if (!section || !question || !answer.length) { errors.push(`${where}: a Done row needs a Section, Question and Answer.`); return; }
  for (const t of [section, question, linkText, ...answer]) if (DASH.test(t)) errors.push(`${where}: contains an em or en dash. Use a comma, colon or full stop instead.`);
  if (link) {
    if (!/^https:\/\/[^\s"'<>]+$/.test(link)) errors.push(`${where}: the Link should be a full web address starting https://`);
    linkText = linkText || LINK_TEXT[urlKey(link)] || "";
    if (!linkText) errors.push(`${where}: no link text for ${link}. Add it to LINK_TEXT in scripts/build-faq.mjs or a "Link text" column.`);
  }
  if (!/[?]$/.test(question)) warnings.push(`${where}: the question doesn't end with a question mark.`);
  items.push({ id, section, question, answer, link: link ? { url: link, text: linkText } : null });
});
if (errors.length) { console.error("FAQ not built. Fix these in the spreadsheet:\n" + errors.join("\n")); process.exit(1); }
if (!items.length) { console.error("No rows marked Done, so there is nothing to publish."); process.exit(1); }

// Sections in the order they first appear in the sheet.
const sections = [...new Set(items.map((q) => q.section))];

function qUrl(q) { return PAGE + "#faq-" + q.id.toLowerCase(); }

function answerHtml(q) {
  let h = q.answer.map((p) => `<p>${linkify(esc(p))}</p>`).join("");
  if (q.link) {
    h += `<p class="hkfaq__more">More info: <a ${linkAttrs(q.link.url)}>${esc(q.link.text)}` +
      (isHawks(q.link.url) ? "" : '<span class="hkfaq__nt"> (opens in a new tab)</span>') + "</a></p>";
  }
  return h;
}

function embed(src) {
  const body = sections.map((s) =>
    `<section class="hkfaq__sec" aria-labelledby="faq-s-${slug(s)}">\n<h2 class="hkfaq__sh" id="faq-s-${slug(s)}">${esc(s)}</h2>\n` +
    items.filter((q) => q.section === s).map((q) =>
      `<div class="hkfaq__item" id="faq-${q.id.toLowerCase()}">\n<h3 class="hkfaq__q">${esc(q.question)}</h3>\n<div class="hkfaq__a">${answerHtml(q)}</div>\n</div>`
    ).join("\n") + "\n</section>"
  ).join("\n");
  return `<div data-hawks="faq" data-hawks-faq-page="${PAGE}"><div class="hkfaq__src">\n${body}\n</div></div>\n` +
    `<script src="${src}" defer></script>\n`;
}

const html = embed(SCRIPT);
mkdirSync(ROOT + "faq", { recursive: true });
writeFileSync(ROOT + "faq/faq-embed.html", html);
writeFileSync(ROOT + "faq/faq.json", JSON.stringify({
  about: "Illawarra Hawks fan FAQ. Generated from the FAQ tracker by scripts/build-faq.mjs; the same questions and answers as the FAQ page on hawks.com.au.",
  page: PAGE,
  sections,
  questions: items.map((q) => ({ id: q.id, url: qUrl(q), section: q.section, question: q.question, answer: q.answer.join("\n\n"), link: q.link }))
}, null, 2) + "\n");
writeFileSync(ROOT + "test/faq.html", `<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hawks embeds: FAQ test page</title>
<link rel="stylesheet" href="webflow-sim.css">
</head>
<body style="background:#F5F5F5">
<div class="sim-head">hawks.com.au (simulated Webflow page)</div>
<p class="sim-note">FAQ test page, generated by scripts/build-faq.mjs. Try <code>#faq-gd-02</code>.</p>
<h1>Frequently asked questions</h1>
<div class="w-embed w-script">
${embed("../hawks.js")}</div>
</body>
</html>
`);

const size = html.length;
console.log(`FAQ built: ${items.length} questions in ${sections.length} sections (${skipped} rows not Done, left out).`);
console.log(`Embed size: ${size.toLocaleString("en-AU")} of ${LIMIT.toLocaleString("en-AU")} characters.`);
for (const w of warnings) console.warn("Check: " + w);
if (size > LIMIT) { console.error("The embed is over Webflow's limit. It can't be pasted as one Code Embed."); process.exit(1); }
if (size > WARN_AT) console.warn("The embed is close to Webflow's limit.");
