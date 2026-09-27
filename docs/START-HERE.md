# Hawks embeds: moving to Claude Code and GitHub

This package moves the NBL27 gameday embeds from copy-paste code into one hosted GitHub repository. Once it is live, every embed on hawks.com.au (the Gameday page and any News recap) is a short placeholder that loads the same hosted script, so one edit updates everywhere.

## What's in this package

| File | What it is |
|---|---|
| `START-HERE.md` | This guide. Your steps, in order. |
| `CLAUDE.md` | The project brief Claude Code reads automatically. Rules, architecture, behaviours, tests. Goes in the root of the repository. |
| `KICKOFF-PROMPT.md` | The first message to paste into Claude Code. |
| `reference/hawks-gameday-nbl27.html` | The current, working gameday embed (next game, countdown, tickets, upcoming games). The behaviour to match. |
| `reference/hawks-plan-your-night.html` | The current Plan your night embed (closed on load). |
| `reference/hawks-trivia-mvp-slab.html` | The current trivia and MVP slab. |
| `reference/Homes_Games_with_Key_Timings.xlsx` | Your original fixture spreadsheet, for cross-checking the game data. |

## Part 1: Set up (once, about 20 minutes)

1. **GitHub account.** Use your existing `joelhawks7947` account. Make sure two-factor sign-in is on, and that your recovery codes are stored somewhere safe. Whoever can edit this repository can change code on hawks.com.au.
2. **Create the repository** under `joelhawks7947`. Name it `hawks-embeds`. Turn on "Add README" and choose the Node .gitignore. It must be **public**, because jsDelivr only serves files from public GitHub repositories. Nothing secret goes in it: it holds the same code and links that are already visible on the website.
3. **Install Git and Claude Code** on your computer. For Claude Code, follow the official setup guide: https://docs.claude.com/en/docs/claude-code/overview
4. **Clone the repository** to your computer, then copy this package's contents into it: `CLAUDE.md` in the root, and the `reference` folder alongside it. You can leave `START-HERE.md` and `KICKOFF-PROMPT.md` out of the repository, or keep them in a `docs` folder.
5. **Commit and push** that starting point, so the reference files are in the history.

## Part 2: Build (with Claude Code)

1. Open a terminal in the repository folder and start Claude Code.
2. Paste the contents of `KICKOFF-PROMPT.md` as your first message.
3. Claude Code will read `CLAUDE.md`, study the reference embeds, and come back with a spec and task list **before writing code**. Read it. This is the cheapest point to change anything.
4. Approve the plan, then let it work through the tasks. It should build the test page, run the automated checks, and show you results as it goes.
5. Before anything goes near the website, open the local test page in your own browser and click through it: countdown, upcoming games, Plan your night panels, trivia and MVP, on desktop and on your phone.

## Part 3: Go live (staged, one embed at a time)

1. **Push to GitHub.** The live script address will be:
   `https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js`
   (Claude Code will confirm the exact file names.) The owner, `joelhawks7947`, is part of every embed URL, so keep the repository on this account.
2. **Test on a draft first.** Put the new placeholder embeds on a draft page and in an unpublished News item. Leave the current pasted embeds live on the real Gameday page while you compare.
3. **Swap over one embed at a time** on the real page: next game first, then upcoming games, then Plan your night, then trivia and MVP. Check the page after each swap.
4. **Keep the old code** (the `reference` folder) until the new version has run cleanly through at least one game night and one midnight rollover.
5. **Recaps.** Once the page is stable, add the `next-game` placeholder to each new recap. Old recaps can be done any time; they'll always show the current next game.

## Part 4: Your routine after launch

**If nothing changes, you do nothing.** The countdown, rollover, upcoming list and ticket button all run off the date.

When something does change (a preview link, a ticket link, a time):

1. On GitHub, open the game data file (Claude Code will tell you which) and click the pencil icon.
2. Make the change and commit it.
3. Open your purge link (Claude Code will give you the exact one to bookmark) so jsDelivr serves the new version within minutes instead of hours.
4. Check the Gameday page.

**If an edit breaks something:** on GitHub, restore the file to its previous version, commit, and open the purge link again.

## Before launch: things still to confirm

These are carried over from the build so far. They're also listed in `CLAUDE.md`, so Claude Code won't invent answers.

- A quick word with the league about hosting code for their site on GitHub and jsDelivr.
- The News listing URL (or game previews category) for the preview button fallback.
- The Hawks trivia link (shows "Coming soon" until then).
- Bus routes near WIN Entertainment Centre (left out until confirmed).
- "Around 1,200 parking spaces" and "about a 15 minute walk" from Wollongong Station.
- The phone link dials 1300 142 957 (worked out from 1300 1HAWKS). Tap to test.
- The Instagram link `instagram.com/lowercrownquarter`.
- The Flexi link has a capital L (`/FLeximemberships`). Click through once.
- Games 12 and 15: show start set to 5:00pm (the spreadsheet said 5:00am).
- Game 11: pre-game function at 3:30pm with doors at 4:30pm (a one hour gap, every other game is 30 minutes).
- Is the pre-game function public? If it's corporate only, it should come off the key times.
