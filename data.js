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
    /* "Buy ticket" link under "Pre-game function" in the next game's key times.
       Our Eventbrite page lists every function for the season. Leave "" to hide the link. */
    functionTickets: "https://www.eventbrite.com.au/o/illawarra-hawks-56775142353",

    /* Ticket options under the next game */
    flexi:  "https://am.ticketmaster.com/thehawks/FLeximemberships",
    member: "https://am.ticketmaster.com/thehawks/",
    picker: "https://hawks-membership-picker.lovable.app/",

    /* Fan Engagement Hub: the red panel next to the MVP vote says "Your move, Hawkheads"
       with a "Visit the Fan Engagement Hub" button to this link. Leave "" to show Hawks trivia instead. */
    gamesHub: "https://hawks-fan-engagement-hub.lovable.app/",

    /* Hawks trivia (only used when gamesHub is ""): leave "" to show "Coming soon" */
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
    gameDayGuide: "https://www.hawks.com.au/pages/gameday",

    /* Hawks mailing list (Newsletter and Girls in the Game embeds) */
    newsletter: "https://mailchi.mp/hawks/illawarra-hawks-newsletter"
  },

  /* GIRLS IN THE GAME
     One line per camp. The embed shows the next camp until 6 hours after it
     starts, then the next one. With no camp to show, it says to check back
     later in the term. You can add future camps ahead of time.
     time:    start time, 24-hour Sydney time
     venue:   shown after "at", e.g. "... 1:30pm at Illawarra Sports Stadium in Berkeley."
     rego:    registration link (Eventbrite)
     details: the sentence after the date line (length, ages); "" to leave it out */
  girlsInTheGame: {
    camps: [
      {date:"2026-10-06", time:"13:30", venue:"Illawarra Sports Stadium in Berkeley",
       rego:"https://www.eventbrite.com.au/e/illawarra-hawks-girls-in-the-game-tickets-1995414633885",
       details:"Two hours of basketball and teamwork with our crew, for girls aged 5 to 12."},
    ]
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
     preview: paste the News game preview link once it is published.
     courtWalk: the Eventbrite link for that game's Hawks Court Walk. A teal
       "Court Walk tickets" button shows for games with a link, until 4 hours
       before the Court Walk starts (the pre-game function time). "" = no button. */
  games: [
    {n:1,  date:"2026-10-02", opp:"Adelaide 36ers",               func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-02-10-2026/event/130064FDD1FC7914", preview:"https://www.hawks.com.au/news/game-preview-hawks-vs-adelaide-36ers-rd3-nbl27", courtWalk:""},
    {n:2,  date:"2026-10-09", opp:"Tasmania JackJumpers",         func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-09-10-2026/event/130064FE8BBF264B", preview:"", courtWalk:""},
    {n:3,  date:"2026-10-11", opp:"Cairns Taipans",               func:"15:30", doors:"16:00", show:"16:30", tip:"17:00", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-11-10-2026/event/130064FE93812C34", preview:"", courtWalk:""},
    {n:4,  date:"2026-10-22", opp:"Sydney Kings",                 func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-22-10-2026/event/130064FE911C2A64", preview:"", courtWalk:"https://www.eventbrite.com.au/e/hawks-court-walk-thursday-22-october-tickets-2001420620954"},
    {n:5,  date:"2026-10-24", opp:"Brisbane Bullets",             func:"16:00", doors:"16:30", show:"17:00", tip:"17:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-24-10-2026/event/130064FE93CA2C53", preview:"", courtWalk:"https://www.eventbrite.com.au/e/hawks-court-walk-saturday-24-october-tickets-2001420752347"},
    {n:6,  date:"2026-11-19", opp:"Adelaide 36ers",               func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-19-11-2026/event/130064FE93F02C68", preview:"", courtWalk:""},
    {n:7,  date:"2026-12-04", opp:"Sydney Kings",                 func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-04-12-2026/event/130064FE91A12AF3", preview:"", courtWalk:""},
    {n:8,  date:"2026-12-10", opp:"Tasmania JackJumpers",         func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-10-12-2026/event/130064FE943B2CA3", preview:"", courtWalk:"https://www.eventbrite.com.au/e/hawks-court-walk-thursday-10-december-tickets-2001420777422"},
    {n:9,  date:"2026-12-20", opp:"Melbourne United",             func:"13:30", doors:"14:00", show:"14:30", tip:"15:00", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-20-12-2026/event/130064FE924D2B56", preview:"", courtWalk:"https://www.eventbrite.com.au/e/hawk-court-walk-sunday-20-december-tickets-2001420831584"},
    {n:10, date:"2026-12-27", opp:"New Zealand Breakers",         func:"13:30", doors:"14:00", show:"14:30", tip:"15:00", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-27-12-2026/event/130064FE924E2B58", preview:"", courtWalk:""},
    {n:11, date:"2026-12-31", opp:"South East Melbourne Phoenix", func:"15:30", doors:"16:30", show:"17:00", tip:"17:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-31-12-2026/event/130064FE92A32BA4", preview:"", courtWalk:""},
    {n:12, date:"2027-01-02", opp:"Cairns Taipans",               func:"16:00", doors:"16:30", show:"17:00", tip:"17:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-02-01-2027/event/130064FE92A32BA7", preview:"", courtWalk:"https://www.eventbrite.com.au/e/hawks-court-walk-saturday-2-january-tickets-2001969164663"},
    {n:13, date:"2027-01-06", opp:"Perth Wildcats",               func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-06-01-2027/event/130064FE930D2BC4", preview:"", courtWalk:"https://www.eventbrite.com.au/e/hawks-court-walk-wednesday-6-january-tickets-2001421994061"},
    {n:14, date:"2027-01-20", opp:"New Zealand Breakers",         func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-20-01-2027/event/130064FE94712CCE", preview:"", courtWalk:"https://www.eventbrite.com.au/e/hawks-court-walk-wednesday-20-january-tickets-2001422262865"},
    {n:15, date:"2027-01-30", opp:"Perth Wildcats",               func:"16:00", doors:"16:30", show:"17:00", tip:"17:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-30-01-2027/event/130064FE933B2BF7", preview:"", courtWalk:"https://www.eventbrite.com.au/e/hawks-court-walk-saturday-30-january-tickets-2001422789440"},
    {n:16, date:"2027-02-04", opp:"Brisbane Bullets",             func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-04-02-2027/event/130064FE94922D10", preview:"", courtWalk:""},
  ]

};
