# Kickoff prompt for Claude Code

Paste everything below the line as your first message in Claude Code, from inside the `hawks-embeds` repository folder.

---

We're turning the Illawarra Hawks gameday embeds into one hosted script served from this repository through jsDelivr, so every embed on the club's league-managed Webflow site (the Game Day Guide page and News recaps) becomes a small placeholder that updates from one place.

Please:

1. Read `CLAUDE.md` in full. It has the rules, the constraints of the league's Webflow setup, the architecture, the design system, the public contracts, the test list and the open items. The absolute rules (no em dashes, no fabricated facts) apply to everything you write, including commit messages.
2. Study the three working embeds in `reference/`. They are the source of truth for look, copy and behaviour. The game data is in Section 1 of `reference/hawks-gameday-nbl27.html`; cross-check it against `reference/Homes_Games_with_Key_Timings.xlsx` and tell me about any differences beyond the corrections already listed in `CLAUDE.md`.
3. **Before writing any code**, give me:
   - a short spec: file layout, how the data file is loaded, how a non-developer edits it on github.com with no local build, how modules register and render, how multiple instances and duplicate script tags are handled
   - your recommendation on runtime data loading versus a single hand-maintained file versus an automatic GitHub Action build, with trade-offs
   - an ordered task list with a verification step for each task
   - any questions, especially where `CLAUDE.md` lists an open item you need answered to proceed
4. Wait for my approval, then build task by task. After each module, run the relevant tests and show me the results. Commit in small steps.
5. When everything passes, update `README.md` for a non-developer: the embed snippet for each module, where the data file is and how to edit it, the exact jsDelivr purge URLs to bookmark, the `hk_now` test clock, and how to roll back.

Don't push to `main` until I've reviewed the local test page myself.
