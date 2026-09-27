# CLAUDE.md: Illawarra Hawks hosted embeds

## Absolute rules

- **Never use em dashes** anywhere: code, comments, copy, docs, commit messages, conversation. No exceptions. Avoid en dashes too.
- **Australian English** in all copy and docs.
- **Never fabricate** prices, dates, times, program details, URLs or facts. If an input is missing, stop and ask, or leave a clearly marked placeholder and list it under "Open items" below. Do not guess.
- **Do not reorder or rename public contracts** (placeholder names, hash links, data field names, file paths in the published URL) once they exist. See "Public contracts".

## What this project is

The Illawarra Hawks are an NBL club based in Wollongong. The club website (hawks.com.au) runs on **Webflow, managed by the league (NBL)**. The club can only create:

- **Static pages** (for example the Game Day Guide page)
- **News items** (CMS items whose body is a rich text field, for example game previews and game recaps)

The club **cannot** create CMS collections, cannot add site-wide code, and should assume no Designer access to Components.

Until now, features were built as self-contained HTML embeds pasted into Webflow Code Embed elements. That works on one page but can't be maintained across many News recaps. This repository replaces that with **one hosted script** served by jsDelivr from this public GitHub repo. Every embed on the site becomes a short placeholder plus the same script tag. One edit here updates every page and recap.

### Verified environment facts

- **External scripts from `cdn.jsdelivr.net` run** in embeds on the league site (tested with a canvas-confetti script from jsDelivr inside a News article rich text embed). **GitHub Pages is untested** for this site; do not switch hosts without re-testing.
- **Webflow custom code limit is 50,000 characters** per Code Embed, including embeds inside CMS rich text. The placeholder embeds here are tiny, so this is no longer a constraint, but keep embeds short so editors can paste them safely.
- Webflow's base CSS (normalize, `.w-` classes, default typography, `body{line-height:20px}`) is on every page, plus the league's own site CSS. Our styles must survive both.

## Architecture

### Embed contract (what editors paste)

Every embed is a placeholder element plus one script tag:

```html
<div data-hawks="next-game"><a href="https://www.hawks.com.au/pages/gameday">Next home game and tickets</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

Requirements:

- **The fallback link inside the placeholder is mandatory.** If the script is blocked, fails, or jsDelivr is down, the reader still gets a working link. The script replaces the placeholder's contents when it renders.
- **Idempotent loading.** The same script tag may appear several times on one page (several embeds). The script must initialise once (global guard) and render every `[data-hawks]` placeholder once (mark rendered placeholders, for example `data-hawks-ready`).
- **Multiple instances.** A module may appear more than once on a page. No hard-coded element IDs that would collide. Page-level anchors (see Public contracts) are only created by the instance marked primary, or by the first instance.
- **Rich text safe.** Placeholders will be pasted inside News rich text fields as well as standalone Code Embeds. Assume a narrow article column.
- Styles and the Google Fonts link are injected **once** per page by the script, not per instance.

### Hosting and updates

- Embeds point at **`@main`** and never change. Do not use version tags in embed URLs: game data changes weekly and editors cannot update the URL in dozens of recaps.
- jsDelivr caches branch URLs (up to about 12 hours). After each change, the editor opens a purge URL for each changed file, in the form `https://purge.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/<file>`. **Verify this format against jsDelivr's current documentation**, then document the exact purge URLs in `README.md` so they can be bookmarked.
- Rollback is a git revert (or restoring the file on GitHub) followed by a purge.
- Purge URL format verified against the live CDN on 27 September 2026: `https://purge.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/<file>` returns `"status": "finished"`.
- jsDelivr sends `Cache-Control: public, max-age=604800, s-maxage=43200` for branch files: 12 hours at the CDN, but **7 days in visitors' browsers**, which a purge cannot clear. jsDelivr ignores query strings (same cached object), so `hawks.js` loads `data.js?v=<10 minute bucket>`: data edits reach everyone within about 10 minutes of a purge. `hawks.js` itself can be stale for up to 7 days for returning visitors, so keep code changes rare and backwards compatible with `data.js`.

### Data

- All season data lives in **one data file** that a non-developer can edit in GitHub's web editor (pencil icon). It must be obvious, commented, and forgiving.
- **No build step may be required for a data edit to go live.** Either the script loads the data file at runtime, or the published file is plain hand-maintained JS. If you propose a build step, it must run automatically (for example a GitHub Action) and a data edit on github.com must still go live without the editor running anything locally. Explain the trade-off before choosing.
- Validate the data at load (boundary validation): bad dates or times should log a clear console warning and skip that game, never crash the whole script or blank every module.
- The current data (16 games, times, links) is in `reference/hawks-gameday-nbl27.html`, Section 1. Carry it over exactly, including the corrections already made (see Open items). Cross-check against `reference/Homes_Games_with_Key_Timings.xlsx`.

Current data shape (keep field names unless there's a strong reason, and say so if you change them):

```js
{n:1, date:"2026-10-02", opp:"Adelaide 36ers", func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"", preview:""}
```

- Times are **24-hour Sydney local time**. The code converts to UTC using the `Australia/Sydney` time zone via `Intl.DateTimeFormat`, so AEST/AEDT is handled automatically. NSW daylight saving starts Sunday 4th October 2026 and ends Sunday 4th April 2027. The existing `toUtc` / `parts` functions in the reference file are tested and correct; reuse the approach.
- `tickets: ""` falls back to the default single game ticket link. `preview: ""` means no preview yet.
- A game "ends" at midnight Sydney time after its date. The active game is the first game whose end is in the future.

### Modules

Each module is a render function keyed by its `data-hawks` name, with its own scoped CSS prefix. Match the behaviour and look of the reference embeds exactly unless this file says otherwise.

| `data-hawks` | CSS prefix | Reference | Behaviour |
|---|---|---|---|
| `next-game` | `.hkng` | gameday Section 2 | Next home game: overline, "Hawks v Opponent", long date and venue, "Read the Hawks v Opponent preview" text link under the date line, shown only once a preview is set (moved from an outline button below the key times at the editor's request, 27 September 2026; no news fallback here), countdown (days, hours, mins, secs) to tip-off, key times row, three ticket panels (Single game red, Flexi white, Season membership black), membership picker line below the panels. At tip-off shows "Game on". Rolls to the next game at midnight. After the season: wrap message, everything else hidden. |
| `upcoming-games` | `.hksl` | gameday Section 3 | Collapsed bar "Upcoming home games" with live count and plus/minus icon. Lists games **after** the next game. Each row: date block, "v Opponent", "Game N, 7:30pm tip-off", Tickets button, Key times toggle revealing that game's times and optional preview button. Hidden when no games remain after the next one. |
| `plan-your-night` | `.hkpn` | plan-your-night file | "Before you arrive / Plan your night / Choose what you need." Three disclosure toggles (Getting here, Eat and drink, Upgrade), **all closed on load**, one open at a time, clicking the open one closes it. `aria-expanded` disclosure pattern, not ARIA tabs. |
| `trivia-mvp` | `.hkpv` | trivia-mvp file | Two-panel slab. Left red (swapped from the reference at the editor's request, 27 September 2026): "Hawks trivia", "Coming soon" label (black on red for contrast) until a trivia URL is set, then a "Test your knowledge" link. Right black: 1:1 MVP graphic (width/height 1080 declared, lazy loaded, alt text) and "Place your vote". |
| `game-preview` | `.hkgp` | **new** | A button that reads the active game's `preview` link: "Read the Hawks v Opponent preview". If no preview is set, falls back to the News listing URL (**URL is an open item: ask**). Rolls over with the active game. Intended for recaps and other standalone spots; not used on the Game Day Guide page, where `next-game` carries the preview link. |

| `girls-in-the-game` | `.hkscta` (shared) | `reference/girls-in-the-game.html` | Shared CTA block. Overline "Girls in the Game", heading "Get her on the court", then the next camp from `data.js` (`girlsInTheGame.camps`): "Tuesday 6th October, 1:30pm at {venue}." plus the camp's optional `details` sentence, **Register now** (camp `rego`) and **Join the mailing list** (secondary). A camp shows until **6 hours after its start time**, then the next camp. With no camp to show: "Check back later in the term for dates for the next camp." and only the mailing list button. Fallback link: https://www.hawks.com.au/pages/girls-in-the-game |
| `newsletter` | `.hkscta` (shared) | `reference/newsletter.html` | Shared CTA block with fixed approved copy ("Hawks Newsletter", "Be the first to know") and one **Join the mailing list** button (`links.newsletter`). |

Keep the season-end, "Game on" and rollover logic shared, not duplicated per module. The shared clock keeps ticking after the last home game, because non-game modules (camps) still change by date.

**Themes:** CTA modules are dark by default; `data-hawks-theme="light"` on the placeholder gives the white version (black top rule). **Time format:** every module shows times with a colon ("1:30pm"), including Girls in the Game (the original embed said "1.30pm"; changed at the editor's request, 27 September 2026).

### Test clock and links

- `?hk_now=YYYY-MM-DDTHH:MM` (Sydney time) fakes the current time for every module. Keep this. Document it.
- Hash links: `#game-N` opens the upcoming games list and that game's key times, then scrolls to it; if N is the current next game, scroll to the next-game module instead. `#plan-getting-here`, `#plan-eat-drink`, `#plan-upgrade` open that panel and scroll to it.

## Public contracts (do not break)

Once these are in use in EDMs, social posts and recaps, changing them breaks links and embeds silently.

- Script URL path: `hawks-embeds@main/hawks.js` (confirm the final filename once, then never rename it)
- Placeholder names: `next-game`, `upcoming-games`, `plan-your-night`, `trivia-mvp`, `game-preview`, `girls-in-the-game`, `newsletter`
- Placeholder attributes: `data-hawks-primary`, `data-hawks-theme="light"`
- Hash links: `#game-N`, `#plan-getting-here`, `#plan-eat-drink`, `#plan-upgrade`
- Test clock parameter: `hk_now`
- Data field names

Add new things; don't rename or remove existing ones.

## Design system (locked)

- **Colours:** Red `#FF0013`, Dark Red `#BF0000` (hover states only, never as a background), Black `#000000`, White `#FFFFFF`. Supporting greys already in the reference files (`#D8D8D8` body text on dark, `#373737` on light) are fine. **Never red on red** (including dark red next to red). No gradients.
- **Fonts:** Anton (headings, uppercase, line-height 0.95) and Poppins 400/700 (everything else), from Google Fonts. Always give fallbacks: `'Anton',Impact,sans-serif` and `'Poppins',Arial,Helvetica,sans-serif`.
- **Hard square corners** everywhere: `border-radius:0`.
- **Buttons:** primary solid red, hover dark red. Secondary outline (white on dark, black on light), hover inverts to filled. Press scales to 0.98. `:focus-visible` gets a 2px outline offset 2px.
- **Motion:** 120ms `cubic-bezier(0.22,1,0.36,1)`. Nothing playful. Respect `prefers-reduced-motion`.
- **Section rule:** 6px top border (red on dark sections, black on light).
- Mobile: buttons go full width and stack; panels stack.

## CSS hardening (from hard experience with Webflow)

- Every rule is scoped under the module's root class (`.hkng .hkng__x`), so child rules sit at specificity 0,2,0 or higher and beat Webflow's element-level typography and descendant selectors in league CSS.
- Declare `line-height` on every text element; Webflow sets a fixed `body{line-height:20px}` that otherwise leaks in.
- Pin `:link` and `:visited` colours on every link-styled button.
- Declare `margin` explicitly on headings and paragraphs (Webflow adds heading margins).
- `[hidden]` must win: include `.prefix[hidden], .prefix [hidden] {display:none !important;}` for every root that sets `display` (a real bug we hit: a root with `display:grid` ignored `hidden`).
- Selector order is load-bearing where specificity ties. Keep a deliberate order.
- **Never** output document scaffolding (`<!DOCTYPE>`, `<html>`, `<head>`, `<body>`, `<meta>`) or global resets (`body{margin:0}`) into the page.
- External links: `target="_blank" rel="noopener noreferrer"`. `tel:` and `mailto:` links have no `target`.

## Accessibility (WCAG 2.2 AA)

- Countdown: `role="timer"`, `aria-live="off"` (don't announce every second).
- Disclosures: real `<button>`s with `aria-expanded` and `aria-controls`; panels labelled by their button.
- Ticket buttons have descriptive labels where the visible text is generic. Labels start with the visible text (WCAG 2.5.3), approved by the editor: "Buy tickets: single game, Hawks v Adelaide 36ers", "Pick your games: 3 and 5 game Flexi pack", "Join now: season membership".
- Full keyboard operation, visible focus, logical heading levels inside a News article (modules will sit under an article H1, so start at H2).
- Colour contrast: body text on red must pass; keep the existing pairings.
- Images: meaningful alt text; declared dimensions.
- No-JS / script-blocked: the fallback link in the placeholder is the experience. Make sure it reads sensibly.

## Voice and copy

First-person club voice ("we", "us", "our"), bold and direct, Australian English. Fans are **Hawkheads**. Venue is always **WIN Entertainment Centre** in full. The mascot is **Tomahawk**. Dates read "Friday 2nd October". "Preseason" is one word. Don't use the slogan in these modules. Copy already approved lives in the reference files: carry it over, don't rewrite it.

## Canonical links

- Single game tickets (default): https://www.ticketmaster.com.au/illawarra-hawks-tickets/artist/1055493
- Flexi 3 & 5 game: https://am.ticketmaster.com/thehawks/FLeximemberships
- Season membership: https://am.ticketmaster.com/thehawks/
- Membership picker: https://hawks-membership-picker.lovable.app/
- MVP vote: https://hawks-mvp-vote.lovable.app/
- MVP graphic: https://cdn.prod.website-files.com/689d0b8adfdc2e5ca8e5a604/6ab73bbbf4abbf2c6fdda107_MVP%20Vote_1080x1080_.jpg
- Hospitality: https://hawks-corporate-hospitality.lovable.app/
- Venue transport: https://www.wsec.com.au/transport
- Venue map: https://maps.app.goo.gl/s4uVZdA6nZJxCpTA8
- Hawks shop: https://shop-illawarrahawks.com/
- Game Day Guide page (fallback link target): https://www.hawks.com.au/pages/gameday (confirmed by the editor, 27 September 2026)
- News listing (game-preview fallback): https://www.hawks.com.au/news (confirmed by the editor, 27 September 2026). Fallback button text is "Read the latest Hawks news"; the button is hidden after the season.
- Per-game Ticketmaster event links are in each game's `tickets` field (supplied by the editor, 27 September 2026; dates in each URL checked against the game dates). The artist page above stays as `defaultTickets` for any game without its own link.
- Game previews are News articles, URL pattern `https://www.hawks.com.au/news/game-preview-hawks-<opponent>-rd<N>-nbl27`, published anywhere from two days before to the day of the game (away games get previews too, with the same URL pattern). Paste each home game's preview into its `preview` field; do not derive or auto-discover it. Until then the button falls back to the News listing.

Put every link in the data/config file, not inside render code.

## Testing (required before any push to main)

Build a local test page (`test/index.html`) that includes every placeholder, loads the script the same way the site will, and wraps modules in a narrow column to mimic a News article. Then run automated browser checks (Playwright is fine) covering at least:

1. Live countdown; `?hk_now` one minute before tip-off flips to "Game on"; midnight rollover to the next game.
2. A game after 4th October 2026 (daylight saving) and after 4th April 2027: countdown lands on the right tip-off.
3. After the final game: wrap state; upcoming games, ticket panels and trivia/MVP behave as specified.
4. Upcoming games: closed on load, opens, key times toggle, hidden when only the last game remains.
5. Hash links: `#game-7`, a link to the current next game, each `#plan-*` link.
6. Plan your night: all closed on load, one open at a time, reclick closes, keyboard Enter/Space.
7. Trivia: "Coming soon" with empty URL, live link when set.
8. Multiple placeholders and duplicate script tags on one page: renders once each, script initialises once, no duplicate IDs.
9. Script blocked: fallback links visible and working.
10. Widths 320, 390, 768, 1280: no horizontal scroll.
11. Every link: exact URL, `target` and `rel` as specified.
12. No console errors. No em dashes or en dashes anywhere in the repo (add a check).

Also spot-check against the reference embeds side by side: same look, same behaviour.

## Open items (do not invent answers; ask or leave a marked placeholder)

- Hawks trivia URL (show "Coming soon" until provided)
- Bus routes near WIN Entertainment Centre (currently omitted; copy says check Transport for NSW)
- "Around 1,200 parking spaces" and "about a 15 minute walk" from Wollongong Station (unverified, from club copy)
- Phone link `tel:1300142957` derived from 1300 1HAWKS (needs a test call)
- Instagram URL `https://www.instagram.com/lowercrownquarter/` (built from the handle)
- Flexi URL capital L (`/FLeximemberships`): confirm it resolves
- Games 12 and 15 show start set to 17:00 (spreadsheet said 5:00am)
- Game 11 function 15:30 with doors 16:30 (one hour gap, others are 30 minutes)
- Whether the pre-game function is public (if not, remove it from key times via config)
- League sign-off on hosting code for their site on GitHub/jsDelivr

## Standalone embeds still to convert

The editor has other standalone embeds pasted on many pages. Convert them one at a time into modules in `hawks.js` (same script tag), following the Working style below. Date-driven content goes in `data.js`, never in code (see the 7-day browser cache note). Originals go in `reference/` and get a word-for-word copy test.

- `reference/top-10.html` (`.hksfeats`): not started. Its copy contains an em dash (line 226), so it fails the dash check and has not been committed; ask the editor for replacement wording before committing it.

## Out of scope for the first release

- Gameday activations section (planned next; design so it can read the same game data)
- Any change to approved copy or design beyond what's needed to become hosted modules

## Working style

- Plan first: produce a short spec and ordered task list, get approval, then build module by module with a test after each.
- Small, reviewable commits with clear messages (no em dashes).
- When something in this file conflicts with the reference embeds, this file wins; point out the conflict.
- Keep `README.md` current: embed snippets for each module, the data file location, the purge URLs, the `hk_now` test clock, and the rollback steps, written for a non-developer.
