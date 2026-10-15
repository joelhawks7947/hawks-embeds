/* ================================================================
   ILLAWARRA HAWKS EMBEDS: SEASON DATA AND LINKS (NBL27)

   This is the only file you normally edit. Every embed on
   hawks.com.au reads it, so one change here updates every page.

   HOW TO EDIT ON GITHUB.COM
   1. Click the pencil icon at the top right of this file.
   2. Change the text INSIDE the quote marks only. Keep the quote
      marks, commas and brackets exactly as they are.
   3. Click "Commit changes".
   4. Wait about 10 minutes. The embeds read this file from GitHub
      Pages, which updates by itself, so no purge is needed.

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

    /* The FAQ page. The FAQ search box sends fans here with their search (?q=...),
       and the "?" links in the game day embeds open answers on it. */
    faqPage: "https://www.hawks.com.au/pages/faqs",

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

  /* HAWKS IN BUSINESS
     One line per event. The embed groups them by month, in date order. Past
     events stay in the list but turn grey: from the end time if there is one,
     otherwise from midnight after the event's date.
     tickets:   the "Book now" button under the list ("" hides it)
     date:      "2026-10-14"; if the day isn't set yet, leave date out and use
                month:"2027-01" instead (shows as "TBC" in that month)
     title:     the event name
     details:   extra lines under the venue and time line, e.g. ["Panel: ..."]; [] for none
     venue, start, end, price:
                shown on one line, e.g. "Sage Hotel · 7:30am · Tickets $65pp".
                start and end are 24-hour Sydney time ("12:30"); end can be "".
                Use "TBC" for any of venue, start or price that isn't known yet;
                "" leaves it out completely.
     presenter: shown as "Presented by ..."; "" for none
     game:      for the Hawks Court Walk only: the home game number (games list
                below). The teal "Court Walk tickets" button uses that game's
                courtWalk link. Leave it out for every other event. */
  hawksInBusiness: {
    tickets: "https://hawks-corporate-hospitality.lovable.app/",
    events: [
      {date:"2026-10-14", title:"Hawks in Business Lessons in Leadership Luncheon",
       details:["Panel: Terry Egger, Justin Tatum, Chuck Harmison, Paul Jurgens"],
       venue:"City Beach Function Centre", start:"12:30", end:"", price:"$170pp", presenter:"Greater Bank"},
      {date:"2026-11-05", title:"Hawks in Business Wine + Watch Party", details:[],
       venue:"Concepts by Gavin Hepper", start:"18:00", end:"", price:"$70pp", presenter:"Concepts by Gavin Hepper"},
      {date:"2026-11-26", title:"Hawks in Business Breakfast", details:[],
       venue:"Sage Hotel", start:"07:30", end:"", price:"$65pp", presenter:"Greater Bank"},
      {date:"2026-12-04", title:"Hawks in Business Long Table Christmas Lunch", details:["Four courses with paired wines"],
       venue:"Wollongong Golf Club, New Wine Dining Room", start:"13:00", end:"16:30", price:"$200pp", presenter:""},
      {date:"2026-12-10", title:"Hawks Court Walk", details:["Hawks v Tasmania JackJumpers", "Match ticket not included"],
       venue:"WIN Entertainment Centre", start:"18:00", end:"", price:"$50pp", presenter:"", game:8},
      {date:"2027-01-29", title:"Hawks in Business & Hawks Alumni Golf Day", details:[],
       venue:"Wollongong Golf Club", start:"07:30", end:"", price:"", presenter:""},
      {date:"2027-02-07", title:"Hawks in Business Summer Sundowner", details:[],
       venue:"TBC", start:"TBC", end:"", price:"TBC", presenter:""},
      {month:"2027-02", title:"Illawarra Hawks MVP Presentation Dinner", details:[],
       venue:"Sage Hotel", start:"TBC", end:"", price:"TBC", presenter:"Sage Hotel"},
    ]
  },

  /* GREATER BANK GAME MVP VOTE
     Every game, home and away. Voting opens at tip-off and closes at
     closeTime (Sydney time) closeDaysAfter days after the game date, so a
     Saturday game closes at 3pm on Monday. While voting is open the embed
     shows "Voting open now" and a "Vote now" button; otherwise it shows
     "View past winners" (same link: links.mvpVote).
     tip: tip-off in 24-hour SYDNEY time, even for games in Perth or New Zealand.
     image: the square vote graphic shown beside the button. */
  mvpVote: {
    image: "https://cdn.prod.website-files.com/689d0b8adfdc2e5ca8e5a610/6ab2493948d4bd882a387a13_MVP%20Vote_1080x1080.png",
    closeDaysAfter: 2,
    closeTime: "15:00",
    games: [
      {round:1, date:"2026-09-20", tip:"15:00", opp:"New Zealand Breakers",         venue:"Spark Arena"},
      {round:2, date:"2026-09-25", tip:"19:30", opp:"Brisbane Bullets",             venue:"Brisbane Entertainment Centre"},
      {round:2, date:"2026-09-27", tip:"18:00", opp:"Sydney Kings",                 venue:"Qudos Bank Arena"},
      {round:3, date:"2026-10-02", tip:"19:30", opp:"Adelaide 36ers",               venue:"WIN Entertainment Centre"},
      {round:3, date:"2026-10-04", tip:"15:00", opp:"South East Melbourne Phoenix", venue:"John Cain Arena"},
      {round:4, date:"2026-10-09", tip:"19:30", opp:"Tasmania JackJumpers",         venue:"WIN Entertainment Centre"},
      {round:4, date:"2026-10-11", tip:"17:00", opp:"Cairns Taipans",               venue:"WIN Entertainment Centre"},
      {round:5, date:"2026-10-18", tip:"17:00", opp:"Melbourne United",             venue:"John Cain Arena"},
      {round:6, date:"2026-10-22", tip:"19:30", opp:"Sydney Kings",                 venue:"WIN Entertainment Centre"},
      {round:6, date:"2026-10-24", tip:"17:30", opp:"Brisbane Bullets",             venue:"WIN Entertainment Centre"},
      {round:7, date:"2026-10-31", tip:"21:30", opp:"Perth Wildcats",               venue:"RAC Arena"},
      {round:8, date:"2026-11-05", tip:"19:30", opp:"Cairns Taipans",               venue:"Cairns Convention Centre"},
      {round:8, date:"2026-11-07", tip:"17:30", opp:"Adelaide 36ers",               venue:"Adelaide Entertainment Centre"},
      {round:9, date:"2026-11-11", tip:"19:30", opp:"South East Melbourne Phoenix", venue:"State Basketball Centre"},
      {round:9, date:"2026-11-14", tip:"21:30", opp:"Perth Wildcats",               venue:"RAC Arena"},
      {round:10, date:"2026-11-19", tip:"19:30", opp:"Adelaide 36ers",               venue:"WIN Entertainment Centre"},
      {round:10, date:"2026-11-21", tip:"17:30", opp:"Tasmania JackJumpers",         venue:"MyState Bank Arena"},
      {round:11, date:"2026-12-04", tip:"19:30", opp:"Sydney Kings",                 venue:"WIN Entertainment Centre"},
      {round:12, date:"2026-12-10", tip:"19:30", opp:"Tasmania JackJumpers",         venue:"WIN Entertainment Centre"},
      {round:13, date:"2026-12-20", tip:"15:00", opp:"Melbourne United",             venue:"WIN Entertainment Centre"},
      {round:14, date:"2026-12-25", tip:"19:30", opp:"Sydney Kings",                 venue:"Qudos Bank Arena"},
      {round:14, date:"2026-12-27", tip:"15:00", opp:"New Zealand Breakers",         venue:"WIN Entertainment Centre"},
      {round:15, date:"2026-12-31", tip:"17:30", opp:"South East Melbourne Phoenix", venue:"WIN Entertainment Centre"},
      {round:15, date:"2027-01-02", tip:"17:30", opp:"Cairns Taipans",               venue:"WIN Entertainment Centre"},
      {round:16, date:"2027-01-06", tip:"19:30", opp:"Perth Wildcats",               venue:"WIN Entertainment Centre"},
      {round:16, date:"2027-01-08", tip:"17:30", opp:"New Zealand Breakers",         venue:"Spark Arena"},
      {round:17, date:"2027-01-17", tip:"17:00", opp:"Brisbane Bullets",             venue:"RAC Arena"},
      {round:18, date:"2027-01-20", tip:"19:30", opp:"New Zealand Breakers",         venue:"WIN Entertainment Centre"},
      {round:18, date:"2027-01-23", tip:"17:30", opp:"Adelaide 36ers",               venue:"Adelaide Entertainment Centre"},
      {round:19, date:"2027-01-27", tip:"17:30", opp:"Tasmania JackJumpers",         venue:"MyState Bank Arena"},
      {round:19, date:"2027-01-30", tip:"17:30", opp:"Perth Wildcats",               venue:"WIN Entertainment Centre"},
      {round:20, date:"2027-02-04", tip:"19:30", opp:"Brisbane Bullets",             venue:"WIN Entertainment Centre"},
      {round:21, date:"2027-02-13", tip:"17:30", opp:"Melbourne United",             venue:"John Cain Arena"},
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
