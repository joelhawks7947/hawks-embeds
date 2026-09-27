/* ================================================================
   ILLAWARRA HAWKS EMBEDS: SEASON DATA AND LINKS (NBL27)

   This is the only file you normally edit. Every embed on
   hawks.com.au reads it, so one change here updates every page.

   HOW TO EDIT ON GITHUB.COM
   1. Click the pencil icon at the top right of this file.
   2. Change the text INSIDE the quote marks only. Keep the quote
      marks, commas and brackets exactly as they are.
   3. Click "Commit changes".
   4. Open the purge link for data.js (see README.md) so the change
      shows within minutes instead of hours.

   FORMATS
   - Dates:  "2026-10-02"  (year-month-day)
   - Times:  "19:30"       (24-hour Sydney time; AEST/AEDT is automatic)
   - Links:  must start with https://
   - Leave a value as "" (empty quotes) to use the default or hide it.

   IF SOMETHING IS WRONG
   A game with a bad date or time is skipped (the others still show)
   and a warning appears in the browser console. If this whole file
   breaks, every embed falls back to its plain link. To undo a change,
   see "Rolling back" in README.md.
   ================================================================ */

window.HAWKS_DATA = {

  venue: "WIN Entertainment Centre",

  /* Used for any game whose own "tickets" link is left as "" */
  defaultTickets: "https://www.ticketmaster.com.au/illawarra-hawks-tickets/artist/1055493",

  links: {
    /* Ticket options under the next game */
    flexi:  "https://am.ticketmaster.com/thehawks/FLeximemberships",
    member: "https://am.ticketmaster.com/thehawks/",
    picker: "https://hawks-membership-picker.lovable.app/",

    /* Hawks trivia: leave "" to show "Coming soon" */
    trivia: "",

    /* Game MVP vote */
    mvpVote:  "https://hawks-mvp-vote.lovable.app/",
    mvpImage: "https://cdn.prod.website-files.com/689d0b8adfdc2e5ca8e5a604/6ab73bbbf4abbf2c6fdda107_MVP%20Vote_1080x1080_.jpg",

    /* Plan your night */
    map:         "https://maps.app.goo.gl/s4uVZdA6nZJxCpTA8",
    transport:   "https://www.wsec.com.au/transport",
    instagram:   "https://www.instagram.com/lowercrownquarter/",
    hospitality: "https://hawks-corporate-hospitality.lovable.app/",
    phone:       "tel:1300142957",

    /* Where the game preview button goes when a game has no preview yet */
    newsListing: "https://www.hawks.com.au/news",

    /* The Game Day Guide page */
    gameDayGuide: "https://www.hawks.com.au/pages/gameday"
  },

  /* Key times shown for every game, in display order.
     Delete a whole line to hide that time everywhere. */
  times: [
    ["func",  "Pre-game function"],
    ["doors", "Main doors open"],
    ["show",  "Show starts"],
    ["tip",   "Tip-off"]
  ],

  /* One line per home game, in date order.
     tickets: "" uses defaultTickets above.
     preview: paste the News game preview link once it is published. */
  games: [
    {n:1,  date:"2026-10-02", opp:"Adelaide 36ers",               func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"", preview:""},
    {n:2,  date:"2026-10-09", opp:"Tasmania JackJumpers",         func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"", preview:""},
    {n:3,  date:"2026-10-11", opp:"Cairns Taipans",               func:"15:30", doors:"16:00", show:"16:30", tip:"17:00", tickets:"", preview:""},
    {n:4,  date:"2026-10-22", opp:"Sydney Kings",                 func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"", preview:""},
    {n:5,  date:"2026-10-24", opp:"Brisbane Bullets",             func:"16:00", doors:"16:30", show:"17:00", tip:"17:30", tickets:"", preview:""},
    {n:6,  date:"2026-11-19", opp:"Adelaide 36ers",               func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"", preview:""},
    {n:7,  date:"2026-12-04", opp:"Sydney Kings",                 func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"", preview:""},
    {n:8,  date:"2026-12-10", opp:"Tasmania JackJumpers",         func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"", preview:""},
    {n:9,  date:"2026-12-20", opp:"Melbourne United",             func:"13:30", doors:"14:00", show:"14:30", tip:"15:00", tickets:"", preview:""},
    {n:10, date:"2026-12-27", opp:"New Zealand Breakers",         func:"13:30", doors:"14:00", show:"14:30", tip:"15:00", tickets:"", preview:""},
    {n:11, date:"2026-12-31", opp:"South East Melbourne Phoenix", func:"15:30", doors:"16:30", show:"17:00", tip:"17:30", tickets:"", preview:""},
    {n:12, date:"2027-01-02", opp:"Cairns Taipans",               func:"16:00", doors:"16:30", show:"17:00", tip:"17:30", tickets:"", preview:""},
    {n:13, date:"2027-01-06", opp:"Perth Wildcats",               func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"", preview:""},
    {n:14, date:"2027-01-20", opp:"New Zealand Breakers",         func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"", preview:""},
    {n:15, date:"2027-01-30", opp:"Perth Wildcats",               func:"16:00", doors:"16:30", show:"17:00", tip:"17:30", tickets:"", preview:""},
    {n:16, date:"2027-02-04", opp:"Brisbane Bullets",             func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"", preview:""},
  ]

};
