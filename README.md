# Hawks embeds

One hosted script that powers the Illawarra Hawks embeds on hawks.com.au: the next home game countdown, upcoming home games, Plan your night, Hawks trivia and MVP vote, the game preview button, and the Hawks in Business events list.

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

The "Game MVP" button reads **Pick your MVP** while a vote is open and **See past winners** the rest of the time (same link).

### Greater Bank Game MVP vote

```html
<div data-hawks="mvp-vote"><a href="https://hawks-mvp-vote.lovable.app/">Vote for your Greater Bank Game MVP</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

Voting opens at tip-off of every game, home and away, and closes at 3pm two days after the game. While a vote is open the embed says **Voting open now** with a **Pick your MVP** button. The rest of the time it says when the next vote opens (for example "Next vote opens Sunday 5:00pm") and the button reads **See past winners**. After the last game the badge disappears.

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

### Hawks in Business events

```html
<div data-hawks="hawks-in-business" data-hawks-theme="light"><a href="https://www.hawks.com.au/">Hawks in Business events</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

The NBL27 events, grouped by month. Finished events move to a collapsed **Past events** bar at the bottom (grey, most recent first). The events are in `data.js` (see section 2).

### Hawks Games page (engagement page)

For hawks.com.au/pages/engagement. Put this in a Code Embed, with the game preview embed below it if wanted:

```html
<div data-hawks="games">
  <a href="https://hawks-membership-picker.lovable.app/">Membership Finder</a>
  <a href="https://hawks-mvp-vote.lovable.app/">Greater Bank MVP</a>
  <a href="https://cmg-midcourt-mayhem.lovable.app/">CMG Midcourt Mayhem</a>
  <a href="https://quiz.illawarra-hawks.com.au/">Hawks Trivia</a>
  <a href="https://bracket.illawarra-hawks.com.au/">Hawks Pecking Order</a>
</div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

### Offer landing pages

One embed for each offer page. Paste it into a Webflow Code Embed on that page. Only `data-offer` and the fallback link change; the script line is the same every time. Each page is a light, transparent block with the picture, headline, copy and button. The copy, pictures and links are in `data.js` under `offers`.

The fallback link is what readers see if the script is blocked, so always keep it.

**Flexi Memberships**

Button goes to the Flexi link.

```html
<div data-hawks="offer" data-offer="flexi"><a href="https://am.ticketmaster.com/thehawks/FLeximemberships">Explore Flexi Memberships</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

**Family of 4 for $99**

Button goes to single game tickets (Ticketmaster).

```html
<div data-hawks="offer" data-offer="family"><a href="https://www.ticketmaster.com.au/illawarra-hawks-tickets/artist/1055493">Get your family tickets</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

**Tickets from $30**

Button goes to single game tickets (Ticketmaster).

```html
<div data-hawks="offer" data-offer="tickets-from-30"><a href="https://www.ticketmaster.com.au/illawarra-hawks-tickets/artist/1055493">Get tickets to a Hawks game</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

**Premium courtside seats**

Button goes to the hospitality enquiry form. The page mentions Hollywood seats.

```html
<div data-hawks="offer" data-offer="courtside"><a href="https://hawks-corporate-hospitality.lovable.app/#contact">Enquire about courtside seats</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

**VIP pre-game function**

Lists the pre-game functions still to come (nothing past), each with its own Buy ticket button. The main button goes to the next function's tickets and moves on by itself.

```html
<div data-hawks="offer" data-offer="vip-function"><a href="https://www.eventbrite.com.au/o/illawarra-hawks-56775142353">Book the VIP pre-game function</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

**Hawks Court Walk**

Lists every Court Walk still on sale, each with its own ticket button. A Court Walk drops off 4 hours before it starts.

```html
<div data-hawks="offer" data-offer="court-walk"><a href="https://www.hawks.com.au/pages/gameday">Hawks Court Walk tickets</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

**Optional: next game countdown and tickets, under any of the above**

```html
<div data-hawks="next-game"><a href="https://www.hawks.com.au/pages/gameday">Next home game and tickets</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

If `next-game` is on the same page, you only need the script line once. A second copy does no harm.

**Video on the Court Walk and VIP function pages:** these two show a muted, looping video in place of the picture, with a pause/play button in the bottom right corner. The files are `https://video.illawarra-hawks.com.au/CourtWalk_4x5.mp4` and `https://video.illawarra-hawks.com.au/Pre-GameFunction_4x5.mp4` (the `videoUrl` of each offer in `data.js`). To swap a video, upload a new file with the same name and address. To use one on another page, paste an MP4 link into that offer's `videoUrl`.
- It starts only when the page scrolls near it, and pauses when it scrolls away.
- **Clicking the video** opens it full screen on black, playing from the same spot, with its own pause/play button and a close button (Esc or a click outside also closes it). When it closes, the page video carries on, unless the visitor had paused it.
- The picture is the fallback. It shows if the video can't play, if the visitor has "reduce motion" or Data Saver on (then there's a Play button), or if the browser blocks autoplay. Clicking the picture opens it full screen on black the same way.
- Best file: 4x5 shape (for example 720 x 900), no sound, H.264, a few MB, exported with "fast start" on.

**Adding a YouTube Short instead:** paste its 11 character ID (the part after `youtube.com/shorts/`) into that offer's `video`. It only loads when someone clicks the play button. If `videoUrl` is also set, the MP4 is used.

### Game countdown (for the premium seating page)

The next game with a live countdown, then the next few home games, and **no ticket links at all** (the only control is the Show all button), so a page that sells one thing isn't diluted. Light and transparent, to sit under an offer page.

```html
<div data-hawks="game-countdown"><a href="https://hawks-corporate-hospitality.lovable.app/#contact">Enquire about premium courtside seats</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

At a game's cutoff the **whole block disappears** until the game has finished (2 hours after tip-off), then it comes back showing the next game. The cutoff is **6 hours before tip-off** for a Monday to Friday game, and **12pm on the Friday before** for a Saturday or Sunday game. After the last game's cutoff the block stays hidden. The first 5 games after the next one are listed, and a **Show all remaining games** button reveals the rest (and folds them away again). The cutoffs and that number are in `data.js` under `gameCountdown`. To start with more showing on one page, add `data-count="8"` to the `<div>`.

### FAQ (one page only)

This embed is different: it isn't a short snippet. The questions and answers are written into the embed itself as plain HTML, so Google and AI search tools (which often don't run scripts) can read them. `hawks.js` then adds the look, the open and close accordion, search and the topic buttons.

Paste the **whole** of [`faq/faq-embed.html`](faq/faq-embed.html) into one Code Embed on the FAQ page, https://www.hawks.com.au/pages/faqs (the address is set as `PAGE` in `scripts/build-faq.mjs`; if the page ever moves, change it there and rebuild). Give the page itself the H1 "Frequently asked questions": the topics in the embed are H2s and the questions H3s. See section 2 for how to update it.

Each question has a link that opens it, from its ID in the spreadsheet: https://www.hawks.com.au/pages/faqs#faq-gd-02 opens "Where do I park?". Use these in EDMs and social replies. Don't renumber IDs once they're live.

### FAQ search box

A "Got a question? / Search our FAQs" box for the Game Day page (or anywhere else). Fans type a question and land on the FAQ page with their search already run, in the same tab. Searching for "prams" opens https://www.hawks.com.au/pages/faqs?q=prams. You can use links like that in EDMs too.

```html
<div data-hawks="faq-search"><a href="https://www.hawks.com.au/pages/faqs">Search our FAQs</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

### On other websites (Lovable and plain HTML pages)

**Plain HTML page:** paste this where the events should appear (white version):

```html
<div data-hawks="hawks-in-business" data-hawks-theme="light"><a href="https://www.hawks.com.au/">Hawks in Business events</a></div>
<script src="https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js" defer></script>
```

**Lovable:** a pasted script tag won't run on a Lovable site. Copy everything in the box below and paste it into Lovable's chat as one message:

````text
Create a new file src/components/HawksEmbed.tsx with exactly this code:

import { useEffect } from "react";

export default function HawksEmbed({ name, fallbackUrl, fallbackText, theme }: { name: string; fallbackUrl: string; fallbackText: string; theme?: string }) {
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js";
    s.defer = true;
    document.body.appendChild(s);
  }, []);
  return (
    <div
      data-hawks={name}
      data-hawks-theme={theme}
      dangerouslySetInnerHTML={{ __html: `<a href="${fallbackUrl}">${fallbackText}</a>` }}
    />
  );
}

Then add it to the page where the Hawks in Business events should appear, exactly like this:

<HawksEmbed name="hawks-in-business" theme="light" fallbackUrl="https://www.hawks.com.au/" fallbackText="Hawks in Business events" />

Import it at the top of that page with: import HawksEmbed from "@/components/HawksEmbed";

Do not restyle it, change its code, or put it inside a dark background. It sets its own colours and loads its content from the script.
````

### White (light) version

Girls in the Game, Newsletter, Top 10, Hawks in Business and the FAQ search box are black by default. For the white version, add `data-hawks-theme="light"` to the placeholder:

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
4. Wait about 10 minutes, then check the Game Day Guide page. No purge needed (see section 3).

### Common edits

| To do this | Change this in `data.js` |
|---|---|
| Add a game preview | That game's `preview:""` becomes `preview:"https://www.hawks.com.au/news/game-preview-..."` |
| Add or remove a Hawks Court Walk | That game's `courtWalk:""` becomes `courtWalk:"https://www.eventbrite.com.au/e/..."` (the teal Court Walk tickets button appears). Set it back to `""` to remove it. The button disappears by itself 4 hours before the Court Walk (the pre-game function time). |
| Give a game its own ticket link | That game's `tickets:""` becomes `tickets:"https://..."`. Leave it `""` to use the default. |
| Change a time | For example `tip:"19:30"`. Use 24-hour Sydney time; daylight saving is handled for you. |
| Change the Fan Engagement Hub link (red panel next to the MVP vote) | `gamesHub` in the `links` section. Set it to `""` to show Hawks trivia instead. |
| Turn on Hawks trivia (only when `gamesHub` is `""`) | `trivia: ""` becomes `trivia: "https://..."` ("Coming soon" becomes a button) |
| Hide a key time everywhere (for example the pre-game function) | Delete that whole line from the `times` list |
| Change a ticket, MVP or venue link | Edit it in the `links` section |
| Change or hide the pre-game function "Buy ticket" link (next game and upcoming games) | `functionTickets` in the `links` section (`""` hides it) |
| Change or hide a small FAQ link ("What's a Court Walk?", "What's included?", "When does it finish?", "compare memberships", "Accessible parking and drop-off") | The `faqLinks` section: put a different question ID from the FAQ spreadsheet (for example `"GD-02"`), or `""` to hide that link |
| Add the next Girls in the Game camp | Add a line to `girlsInTheGame` (see below) |

### Hawks Games cards and the quiz

Everything on the Hawks Games page lives in `data.js` under `gamesPortal`, with a comment block above it explaining each field. Common edits:

- **Change a card's words, button, link or picture:** edit that card's line. Every card's link gets `utm_source`, `utm_medium`, `utm_campaign` and `utm_content` (the card id) added for you, so paste the plain address.
- **Reorder cards:** change `order`. It runs down the whole page, lowest first. Neighbouring cards with the same `layout` sit together, so a wide card with the highest number lands at the bottom, below the small cards.
- **Move a card between the wide rows and the small cards:** change `layout` between `"full"` and `"column"`. Nothing else changes (for example when a card gets a sponsor, add `sponsor` and set `layout:"full"`).
- **Hide a card, or show "Coming soon":** set `status` to `"hidden"` or `"soon"`.
- **Pictures:** upload each screenshot to Webflow Assets, then paste its full https address into `image`. Until `image` is filled in the card shows a plain block.
- **MVP round and opponent** come from the same schedule as the Greater Bank MVP embed (`mvpVote.games`), so updating that schedule updates both. Each game line has a `round` number; keep it filled in.
- **Quiz title, description and countdown** come from the quiz app's current quiz. The address is in `gamesPortal.quizApi` (it belongs to the quiz app, which only allows `https://www.hawks.com.au` to read it). If it is empty or the app is down, the card says "This week's Hawks quiz" and the countdown tile is left out.
- **Analytics:** each click sends a `games_card_click` event to the site's Google Analytics, with `card_id`, `position` and `location` (`card` or `tile`), if Google Analytics is on the page.

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

### Game MVP vote schedule

The `mvpVote` section lists every game of the season, home and away, one line each:

```js
{round:7, date:"2026-10-31", tip:"21:30", opp:"Perth Wildcats", venue:"RAC Arena"},
```

- `tip` is the tip-off in **Sydney time**, even for games in Perth or New Zealand. Voting opens at that time.
- Voting closes at `closeTime` (`"15:00"`), `closeDaysAfter` (`2`) days after the game date. Change those two values to change every game at once.
- If a game moves, change its date or time here **and**, for a home game, in the `games` list too.
- `image` is the square vote graphic.

### Hawks in Business events

Each event is one line in the `hawksInBusiness` section:

```js
{date:"2026-11-26", title:"Hawks in Business Breakfast", details:["Speakers: Coaches"],
 venue:"Sage Hotel", start:"07:30", end:"", price:"$65pp", presenter:"Greater Bank"},
```

- The embed groups events by month and sorts them by date for you.
- `details` are extra lines under the name, such as panel speakers. Use `[]` for none.
- `venue`, `start`, `end` and `price` make one line, for example "Sage Hotel · 7:30am · Tickets $65pp". Use `"TBC"` for anything not known yet, or `""` to leave it out.
- If the day isn't set yet, swap `date:"2027-01-29"` for `month:"2027-01"`. The date block shows "TBC".
- `presenter` shows as "Presented by ...". Use `""` for none.
- An event moves to **Past events** after its `end` time, or at midnight after its date when there's no end time. Events with only a `month` move when that month ends.
- `tickets` at the top is the **Book now** button under the list. It disappears once every event is past.
- The Hawks Court Walk line has `game:8`: its teal **Court Walk tickets** button uses that game's `courtWalk` link from the `games` list.

### Top 10 table

The Top 10 figures are in their own file, **[`top10.js`](top10.js)**. It's only loaded on pages with the Top 10 embed.

- Each row is `["Player", stat, "Date", "Opponent (H or A)", "Result"]`. The stat is a plain number with no quote marks.
- Rows are numbered 1 to 10 for you, in the order they're listed. For a new feat, copy a row, put it in the right place, change it, then delete the last row.
- Every row that equals the top number is highlighted as the record.
- The "Club record" line (`record` and `recordDetail`) and the line under the table (`note`) are edited by hand. Update `note` when the figures change, for example "current to the end of NBL27".
- After committing, the change shows within about 10 minutes. No purge needed.

### FAQ questions and answers

The master copy is the **Hawks fan FAQ tracker** spreadsheet, not a file in this repository. Only rows with Status **Done** are published, and only the ID, Section, Question, Answer and Link columns. Owners, notes and status stay private.

To publish changes:

1. Update the spreadsheet and download it as `.xlsx`.
2. Rebuild: `npm run faq -- "/path/to/Hawks-Fan-FAQ-Tracker.xlsx"` (or give the file to Claude Code and ask it to rebuild the FAQ). It stops with a clear message if a Done row is missing a section, question or answer, has a duplicate ID, contains a dash, or has a link with no link text.
3. Run `npm test`, commit and push.
4. Paste the new `faq/faq-embed.html` into the Code Embed on the FAQ page (replacing all of the old code) and publish the page. **This step is needed for every content change**: the questions live in the embed, not in a file the script loads.

Notes:

- **Related links** show as "More info: WIN Entertainment Centre transport". The text for each link address is in `LINK_TEXT` at the top of `scripts/build-faq.mjs`. To use different text for one question, add a column headed **Link text** to the spreadsheet.
- **The Link cell** takes one web address, an Excel hyperlink (its shown title becomes the link text, without " | The Hawks"), or several links on separate lines, each with a label: `General Public: https://www.ticketmaster.com.au`. Don't put links in the Answer column: fans would see them as plain text.
- **Order on the page** doesn't depend on where rows sit in the sheet: topics always show as Game day, Tickets, Membership, Accessibility, Kids and families, Merch, Corporate, groups and community, then General (a new topic goes last), and questions follow their ID numbers.
- The build adds a missing full stop at the end of an answer, and warns about " - " used as a dash. It doesn't check spelling: proofread new answers before marking them Done.
- Phone numbers (for example 02 4220 2884) and email addresses in answers become tap-to-call and email links automatically.
- Line breaks in an answer become new paragraphs.
- Webflow allows 50,000 characters per Code Embed. The build prints the size and warns from 45,000. Each question takes about 480 characters, so there's room for 100 or more.
- The structured data for Google (`FAQPage`) isn't in the embed: `hawks.js` builds it from the questions on the page. AI tools that don't run scripts read the questions and answers straight from the page's HTML.
- **Search analytics:** the FAQ sends three events to the site's Google Analytics: `search` (what was typed, after a pause), `faq_no_results` (searches with no exact match: the questions the FAQ doesn't answer yet) and `faq_open` (which question was opened, and whether from search, browsing, a link or the browser's find). Email addresses and long numbers are removed from searches first. In GA4: **Reports**, **Realtime** shows them as they happen; for a list of searches, **Explore**, a free form exploration with the dimension **Search term** and the metric **Event count**, filtered to the event name `faq_no_results`.
- [`faq/faq.json`](faq/faq.json) holds the same questions and answers as data, for a future help bot: `https://joelhawks7947.github.io/hawks-embeds/faq/faq.json`

### Formats

- **Dates:** `"2026-10-02"` (year, month, day)
- **Times:** `"19:30"` (24-hour)
- **Links:** must start with `https://`

### If you make a mistake

The embeds are built to cope. A game with a bad date or time is skipped and the other games still show. A broken link is ignored. If the whole file breaks (for example a missing comma), every embed falls back to its plain link rather than showing an error.

To see what went wrong: open the page, open the browser console (in Chrome: right-click, **Inspect**, then **Console**), and look for yellow or red messages starting with `[hawks]`. They say which game and which field is the problem.

GitHub also checks every change automatically and emails you if `data.js` has a problem. The check never stops a change going live. It's a warning only.

---

## 3. How changes go live, and purge links

**No purge needed, for data or code.** The embeds load `hawks-core.js`, `data.js` and `top10.js` from GitHub Pages (https://joelhawks7947.github.io/hawks-embeds/), which updates about a minute after each commit. Visitors pick up any change within about 10 minutes, so allow about 11 minutes from the commit. If GitHub Pages is down or slow, the embeds load the same files from jsDelivr instead.

Only the small loader, `hawks.js`, still comes from jsDelivr. It should never need to change.

The purge links below are a backup only: they refresh jsDelivr's copy, which is used if GitHub Pages is down.

- **`hawks-core.js` (backup):**
  https://purge.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks-core.js
- **`data.js` (backup):**
  https://purge.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/data.js
- **`top10.js` (backup):**
  https://purge.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/top10.js
- **Only if `hawks.js` itself changes (very rare):**
  https://purge.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js

A page of text that includes `"status": "finished"` means it worked. jsDelivr refuses purges for a while after a few in a row (the text then says `"throttled": true`); try again in an hour.

**How quickly people see a change**

- **Any change** (`data.js`, `top10.js`, `hawks-core.js`, including new embeds): everyone within about 10 minutes of GitHub Pages updating, which takes about a minute after the commit.
- **`hawks.js`** is a tiny loader that browsers may keep for up to 7 days. That's why it should never need to change.
- If you still see an old version, try a private window or hard-refresh (Cmd+Shift+R on a Mac, Ctrl+Shift+R on Windows).

---

## 4. Test clock (`hk_now`)

Add `?hk_now=` to any page address with an embed to see it as it would look at another time (Sydney time). Only you see this; it doesn't change the page for anyone else.

| To see | Add to the address |
|---|---|
| One minute before game 1 tips off | `?hk_now=2026-10-02T19:29` |
| Game on (after tip-off) | `?hk_now=2026-10-02T20:00` |
| After the game (2 hours after tip-off), rolled to game 2 | `?hk_now=2026-10-02T21:31` |
| After daylight saving starts | `?hk_now=2026-10-10T12:00` |
| After the last game (season wrap) | `?hk_now=2027-02-05T00:01` |
| Girls in the Game after the 6 October camp | `?hk_now=2026-10-07T09:00` |
| Game MVP vote open (Perth away game) | `?hk_now=2026-10-31T22:00` |
| Game MVP vote closed, next vote shown | `?hk_now=2026-10-14T12:00` |

Seconds work too: `?hk_now=2026-10-02T23:59:50`. If the page address already has a `?`, use `&hk_now=` instead.

---

## 5. Links that open a section

Use these in EDMs, social posts and recaps. Add them to the end of the Game Day Guide address, for example `https://www.hawks.com.au/pages/gameday#game-7`.

| Link | What it does |
|---|---|
| `#game-7` | Opens Upcoming home games and game 7's key times, then scrolls to it. Works for the next game too. After a game has been played, the link just opens the page. |
| `#plan-getting-here` | Opens Plan your night at Getting here |
| `#plan-eat-drink` | Opens Plan your night at Eat and drink |
| `#plan-upgrade` | Opens Plan your night at Upgrade |

---

## 6. Rolling back

If a change breaks something:

1. On GitHub, open the file that changed and click **History** (top right of the file).
2. Find the last version that worked and click its **`<>`** icon ("Browse repository at this point"). Open the same file there, click **Raw**, and copy everything.
3. Go back to the current file, click the pencil, select everything, paste the good version over it, and commit.
4. Wait about 10 minutes. No purge needed.

A developer can do the same with `git revert` on the bad commit.

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
| `hawks.js` | Tiny loader that every embed points at. Loads `hawks-core.js` from GitHub Pages (jsDelivr if Pages fails). **Public address: never rename, and avoid changing it.** |
| `hawks-core.js` | All the embed code. Loads `data.js` from GitHub Pages (jsDelivr if Pages fails), checks it, renders every `data-hawks` placeholder. **Don't rename: the loader depends on it.** |
| `data.js` | Season data and every link |
| `top10.js` | Top 10 single-game feats (loaded only by the Top 10 embed) |
| `faq/` | The FAQ embed to paste (`faq-embed.html`) and the same content as data (`faq.json`). Built from the FAQ tracker by `npm run faq`; don't edit by hand |
| `test/` | Local test pages |
| `tests/` | Automated browser tests (Playwright) |
| `scripts/` | Dash check, data check, FAQ build, local server |
| `reference/` | The original pasted embeds these modules were built from |
| `standalone/` | One-off embeds pasted straight into a single Webflow page, not part of the hosted script (for example the NBL27 2-Game Bundle price cards and the Player Partnerships grid). Copy one as a starting point for the next similar offer |
