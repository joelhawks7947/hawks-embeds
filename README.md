# Hawks embeds

One hosted script that powers the Illawarra Hawks embeds on hawks.com.au: the next home game countdown, upcoming home games, Plan your night, Hawks trivia and MVP vote, and the game preview button.

Every embed on the site is a short placeholder plus the same script tag. Change something here once and every page and News recap updates.

- **Game data and links:** [`data.js`](data.js). This is the only file you normally edit.
- **The script:** [`hawks-core.js`](hawks-core.js), loaded by the small [`hawks.js`](hawks.js) that every embed points at. You shouldn't need to touch either.
- **Live address:** `https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js`

---

## 1. Embed snippets

Paste a snippet into a Webflow **Code Embed** element, either on a page or inside a News article's rich text. Each snippet is the placeholder (with a plain link inside it) plus the script tag.

- If the script can't load for any reason, readers still see the plain link, so never delete it.
- It's fine to have the script tag many times on one page. The script only sets itself up once.
- Never change the script address. Always keep `@main`.

### Next home game (countdown and ticket options)

On the **Game Day Guide page** (the fallback goes to Ticketmaster, since readers are already on the guide):

```html
<div data-hawks="next-game"><a href="https://www.ticketmaster.com.au/illawarra-hawks-tickets/artist/1055493">Buy tickets to Hawks home games</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

In **News recaps and previews** (the fallback goes to the Game Day Guide):

```html
<div data-hawks="next-game"><a href="https://www.hawks.com.au/pages/gameday">Next home game, key times and tickets</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

### Upcoming home games

```html
<div data-hawks="upcoming-games"><a href="https://www.ticketmaster.com.au/illawarra-hawks-tickets/artist/1055493">Tickets to all Hawks home games</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

### Plan your night

```html
<div data-hawks="plan-your-night"><a href="https://www.wsec.com.au/transport">Getting to WIN Entertainment Centre</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

### Hawks trivia and Game MVP vote

```html
<div data-hawks="trivia-mvp"><a href="https://hawks-mvp-vote.lovable.app/">Vote for your Game MVP</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

### Game preview button

This shows "Read the Hawks v (opponent) preview" once that game's preview link is in `data.js`. Until then it shows "Read the latest Hawks news".

You don't need it on the Game Day Guide page: the Next home game embed already shows a "Read the Hawks v (opponent) preview" link under the date as soon as the preview is set. Use this one in recaps or anywhere you want a standalone button.

```html
<div data-hawks="game-preview"><a href="https://www.hawks.com.au/news">Hawks news and game previews</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

### Girls in the Game

Shows the next camp from `data.js`, with a Register button. After the last camp it says to check back later in the term.

```html
<div data-hawks="girls-in-the-game"><a href="https://www.hawks.com.au/pages/girls-in-the-game">Girls in the Game: dates and registration</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

### Newsletter sign-up

```html
<div data-hawks="newsletter"><a href="https://mailchi.mp/hawks/illawarra-hawks-newsletter">Join the Hawks mailing list</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

### All-time Top 10 single-game feats

```html
<div data-hawks="top-10"><a href="https://www.hawks.com.au/pages/illawarra-hawks-history">Hawks history: all-time top 10 single-game feats</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

### White (light) version

Girls in the Game, Newsletter and Top 10 are black by default. For the white version, add `data-hawks-theme="light"` to the placeholder:

```html
<div data-hawks="newsletter" data-hawks-theme="light"><a href="https://mailchi.mp/hawks/illawarra-hawks-newsletter">Join the Hawks mailing list</a></div>
```

### Same embed twice on one page

That works. The first one on the page owns the links described in section 5 (`#game-7`, `#plan-upgrade`). To make a different one the owner, add `data-hawks-primary` to its placeholder, for example `<div data-hawks="upcoming-games" data-hawks-primary>`.

---

## 2. Editing game data and links

Everything you'd change lives in **[`data.js`](data.js)**.

1. On GitHub, open `data.js` and click the **pencil icon** (top right of the file).
2. Change the text **inside the quote marks** only. Keep the quote marks, commas and brackets exactly as they are.
3. Click **Commit changes**, then **Commit changes** again in the box that pops up.
4. Open the **data.js purge link** (section 3).
5. Check the Game Day Guide page.

### Common edits

| To do this | Change this in `data.js` |
|---|---|
| Add a game preview | That game's `preview:""` becomes `preview:"https://www.hawks.com.au/news/game-preview-..."` |
| Give a game its own ticket link | That game's `tickets:""` becomes `tickets:"https://..."`. Leave it `""` to use the default. |
| Change a time | For example `tip:"19:30"`. Use 24-hour Sydney time; daylight saving is handled for you. |
| Turn on Hawks trivia | `trivia: ""` becomes `trivia: "https://..."` ("Coming soon" becomes a button) |
| Hide a key time everywhere (for example the pre-game function) | Delete that whole line from the `times` list |
| Change a ticket, MVP or venue link | Edit it in the `links` section |
| Change or hide the pre-game function "Buy ticket" link (next game and upcoming games) | `functionTickets` in the `links` section (`""` hides it) |
| Add the next Girls in the Game camp | Add a line to `girlsInTheGame` (see below) |

### Girls in the Game camps

Each camp is one line in the `girlsInTheGame` section:

```js
{date:"2026-10-06", time:"13:30", venue:"Illawarra Sports Stadium in Berkeley",
 rego:"https://www.eventbrite.com.au/e/...",
 details:"Two hours of basketball and teamwork with our crew, for girls aged 5 to 12."},
```

- The embed shows the next camp until **6 hours after it starts**, then moves to the next one in the list.
- When there are no more camps, it shows "Check back later in the term for dates for the next camp." and the mailing list button.
- You can add several camps at once, as soon as you know the dates. Keep them in date order, and copy an existing line so the commas and brackets stay right.
- `venue` appears after "at", so write it to read that way.
- `details` is the sentence after the date. Use `""` to leave it out.

### Top 10 table

The Top 10 figures are in their own file, **[`top10.js`](top10.js)**. It's only loaded on pages with the Top 10 embed.

- Each row is `["Player", stat, "Date", "Opponent (H or A)", "Result"]`. The stat is a plain number with no quote marks.
- Rows are numbered 1 to 10 for you, in the order they're listed. For a new feat, copy a row, put it in the right place, change it, then delete the last row.
- Every row that equals the top number is highlighted as the record.
- The "Club record" line (`record` and `recordDetail`) and the line under the table (`note`) are edited by hand. Update `note` when the figures change, for example "current to the end of NBL27".
- After committing, open the `top10.js` purge link (section 3).

### Formats

- **Dates:** `"2026-10-02"` (year, month, day)
- **Times:** `"19:30"` (24-hour)
- **Links:** must start with `https://`

### If you make a mistake

The embeds are built to cope. A game with a bad date or time is skipped and the other games still show. A broken link is ignored. If the whole file breaks (for example a missing comma), every embed falls back to its plain link rather than showing an error.

To see what went wrong: open the page, open the browser console (in Chrome: right-click, **Inspect**, then **Console**), and look for yellow or red messages starting with `[hawks]`. They say which game and which field is the problem.

GitHub also checks every change automatically and emails you if `data.js` has a problem. The check never stops a change going live. It's a warning only.

---

## 3. Purge links (bookmark these)

jsDelivr, the service that hosts the files, keeps a copy for up to 12 hours. After a change, open the matching link below and the new version is served within a few minutes.

- **After editing `data.js`:**
  https://purge.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/data.js
- **After editing `top10.js`:**
  https://purge.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/top10.js
- **After a code change (`hawks-core.js`):**
  https://purge.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks-core.js
- **Only if `hawks.js` itself changes (very rare):**
  https://purge.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js

A page of text that includes `"status": "finished"` means it worked. If you're not sure which file changed, open both.

If the old version is still showing a few minutes after a purge, wait two or three minutes and open the purge link again. jsDelivr sometimes takes a moment to notice that GitHub has changed.

**How quickly people see a change**

- **Data and code changes** (`data.js`, `hawks-core.js`, including new embeds): everyone within about 10 minutes of the purge.
- **`hawks.js`** is a tiny loader that browsers may keep for up to 7 days. That's why it should never need to change.
- If you still see an old version, try a private window or hard-refresh (Cmd+Shift+R on a Mac, Ctrl+Shift+R on Windows).

---

## 4. Test clock (`hk_now`)

Add `?hk_now=` to any page address with an embed to see it as it would look at another time (Sydney time). Only you see this; it doesn't change the page for anyone else.

| To see | Add to the address |
|---|---|
| One minute before game 1 tips off | `?hk_now=2026-10-02T19:29` |
| Game on (after tip-off) | `?hk_now=2026-10-02T20:00` |
| Just after midnight, rolled to game 2 | `?hk_now=2026-10-03T00:01` |
| After daylight saving starts | `?hk_now=2026-10-10T12:00` |
| After the last game (season wrap) | `?hk_now=2027-02-05T00:01` |
| Girls in the Game after the 6 October camp | `?hk_now=2026-10-07T09:00` |

Seconds work too: `?hk_now=2026-10-02T23:59:50`. If the page address already has a `?`, use `&hk_now=` instead.

---

## 5. Links that open a section

Use these in EDMs, social posts and recaps. Add them to the end of the Game Day Guide address, for example `https://www.hawks.com.au/pages/gameday#game-7`.

| Link | What it does |
|---|---|
| `#game-7` | Opens Upcoming home games and game 7's key times, then scrolls to it. If game 7 is the next game, scrolls to the countdown instead. |
| `#plan-getting-here` | Opens Plan your night at Getting here |
| `#plan-eat-drink` | Opens Plan your night at Eat and drink |
| `#plan-upgrade` | Opens Plan your night at Upgrade |

---

## 6. Rolling back

If a change breaks something:

1. On GitHub, open the file that changed and click **History** (top right of the file).
2. Find the last version that worked and click its **`<>`** icon ("Browse repository at this point"). Open the same file there, click **Raw**, and copy everything.
3. Go back to the current file, click the pencil, select everything, paste the good version over it, and commit.
4. Open the purge link for that file (section 3).

A developer can do the same with `git revert` on the bad commit, then purge.

---

## 7. Checking the embeds locally (for developers)

Needs Node.js 18 or later.

```bash
npm install
```

```bash
npx playwright install chromium
```

```bash
npm run serve
```

Then open http://localhost:8080/test/. It has every embed at full width (like the Game Day Guide) and again inside a narrow News article column, with CSS that imitates Webflow. `http://localhost:8080/test/blocked.html` shows what readers see if the script can't load.

To run every check (dash check, data check and the browser tests):

```bash
npm test
```

### Files

| File | What it is |
|---|---|
| `hawks.js` | Tiny loader that every embed points at. Loads `hawks-core.js` from the same folder. **Public address: never rename, and avoid changing it.** |
| `hawks-core.js` | All the embed code. Loads `data.js` from the same folder, checks it, renders every `data-hawks` placeholder. **Don't rename: the loader depends on it.** |
| `data.js` | Season data and every link |
| `top10.js` | Top 10 single-game feats (loaded only by the Top 10 embed) |
| `test/` | Local test pages |
| `tests/` | Automated browser tests (Playwright) |
| `scripts/` | Dash check, data check, local server |
| `reference/` | The original pasted embeds these modules were built from |
| `CLAUDE.md` | Project rules and decisions |
