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
    /* Season membership: "" hides the Season membership panel and the "Not sure which option
       suits you?" line under the next game. Paste the link back when NBL28 memberships open
       (it was https://am.ticketmaster.com/thehawks/). */
    member: "",
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
    /* The enquiry form on the hospitality site (it has a Hollywood seat dropdown) */
    hospitalityContact: "https://hawks-corporate-hospitality.lovable.app/#contact",
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

  /* Small links in the game day embeds that open one answer on the FAQ page.
     Use the question ID from the FAQ spreadsheet, for example "TK-10".
     Leave "" to hide that link. */
  faqLinks: {
    courtWalk:   "TK-10",   /* "What's a Court Walk?" with the Court Walk tickets button */
    preGame:     "TK-11",   /* "What's included?" under Buy ticket for the pre-game function */
    finish:      "GD-11",   /* "When does it finish?" under Tip-off in the key times */
    memberships: "MB-01",   /* "or compare memberships" after the membership picker link */
    accessible:  "AC-03"    /* "Accessible parking and drop-off" in Plan your night, Getting here */
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

  /* GAME COUNTDOWN (data-hawks="game-countdown": the countdown and game list with no ticket links,
     for the premium seating page). At a game's cutoff the whole block is hidden until the game
     ends (2 hours after tip-off), then it shows the next game.
     weekdayHours: for a Monday to Friday game, hours before tip-off
     weekendTime:  for a Saturday or Sunday game, this time (24-hour, Sydney) on the Friday before
     count:        how many games to list after the next game; the rest sit behind a
                   "Show all remaining games" button (a page can override it with
                   data-count="8" on its placeholder) */
  gameCountdown: {weekdayHours: 6, weekendTime: "12:00", count: 5},

  /* OFFER LANDING PAGES (data-hawks="offer" data-offer="flexi" and so on)
     One entry per page. The embed shows the image, headline, copy and button,
     and some pages add a list underneath.
     overline:  small line above the headline
     heading:   the headline
     note:      optional second line of copy under the main copy ("" for none)
     body:      the main copy
     button:    button text; link: where it goes. link is either a full https://
                address or the name of a link above (for example "flexi") or
                "defaultTickets". "" hides the button.
     image:     the 4x5 picture (a full https:// address, uploaded to Webflow Assets)
     alt:       a short description of the picture for screen readers
     video:     the 11 character YouTube video ID (from youtube.com/shorts/<ID>);
                "" for no video. Plays only when the picture's play button is clicked.
     videoUrl:  an https:// link to an MP4 video, 4x5 shape (for example 720 x 900), no sound,
                a few MB. It replaces the picture with a muted looping video (pause/play
                button bottom right); the picture is the fallback, and clicking it opens it
                full screen on black. When set, it is used instead of video. "" for none.
     listHeading: only for "court-walk" and "vip-function", the line above the list. */
  offers: {
    "flexi": {
      overline:"3 and 5 game packages", heading:"More Hawks, your way 🏀", note:"",
      body:"Choose a 3-game or 5-game Flexi Membership and lock in your next game day at the WIN Entertainment Centre.",
      button:"Explore Flexi Memberships 🎟️", link:"flexi",
      image:"https://cdn.prod.website-files.com/689d0b8adfdc2e5ca8e5a604/6ad579860211ce1645a91468_Flexi%20Memberships_4x5.jpg",
      alt:"The opening tip-off at a Hawks home game under the big scoreboard", video:""
    },
    "family": {
      overline:"Family of 4 for $99", heading:"Make game day a family day ❤️", note:"Available for every home game. Tickets are through Ticketmaster.",
      body:"Bring the whole family to the Hawks for just $99 with our Family of 4 package.",
      button:"Get your family tickets now 🎟️", link:"defaultTickets",
      image:"https://cdn.prod.website-files.com/689d0b8adfdc2e5ca8e5a604/6ad5798cc34497c2eb3b4e05_GP%20Sales%201_4x5.jpg",
      alt:"A Hawks player dunks while teammates celebrate", video:""
    },
    "tickets-from-30": {
      overline:"Tickets from $30", heading:"Grab a mate and get to a Hawks game 🔴⚫", note:"",
      body:"There's nothing like experiencing the action live. Get your tickets from just $30 and be part of it.",
      button:"Get tickets now 🎟️", link:"defaultTickets",
      image:"https://cdn.prod.website-files.com/689d0b8adfdc2e5ca8e5a604/6ad5798c2e57b218a807bad6_GP%20Sales%202_4x5.jpg",
      alt:"Two Hawks players high five as they run out", video:""
    },
    "courtside": {
      overline:"Premium courtside seats", heading:"Get closer to the action.", note:"Choose Hollywood seats from the dropdown on the enquiry form.",
      body:"Experience Hawks basketball from premium courtside seats, where you're right on the edge of every play.",
      button:"Secure your courtside seats now 🏀", link:"hospitalityContact",
      image:"https://cdn.prod.website-files.com/689d0b8adfdc2e5ca8e5a604/6ad57992c677397c9b2f569a_Premium%20Seating_4x5.jpg",
      alt:"A fan cheers from a courtside seat at the edge of the court", video:""
    },
    "vip-function": {
      overline:"VIP pre-game function", heading:"Your game night starts before tip-off.", note:"",
      body:"Enjoy food, drinks and guest speakers at our VIP Pre-Game Function before taking in the action live.",
      button:"Secure your place in the VIP experience 🥂", link:"functionTickets",
      image:"https://cdn.prod.website-files.com/689d0b8adfdc2e5ca8e5a604/6ad57980b3e3cd3cf9f3590d_Pre-Game%20Function_4x5.jpg",
      alt:"Guests at a table in the VIP pre-game function", video:"", videoUrl:"https://video.illawarra-hawks.com.au/Pre-GameFunction_4x5.mp4",
      listHeading:"Pre-game function times"
    },
    "court-walk": {
      overline:"Warm-up Court Walk", heading:"Ever wondered what it's like to step onto the court before a game?", note:"",
      body:"Get a closer look at the action with our Warm-Up Court Walk experience and see game day from a different perspective.",
      button:"", link:"",
      image:"https://cdn.prod.website-files.com/689d0b8adfdc2e5ca8e5a604/6ad579802e57b218a807b921_Court%20Walk_4x5.jpg",
      alt:"Fans on the court during warm-ups holding a We Rise Together sign", video:"", videoUrl:"https://video.illawarra-hawks.com.au/CourtWalk_4x5.mp4",
      listHeading:"Book your Court Walk now 🏀"
    }
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
       before the Court Walk starts (the pre-game function time). "" = no button.
     functionTickets: the Eventbrite link for that game's pre-game function. The VIP
       function page shows a Buy ticket button for it, and lists the game until the
       function starts. Leave it out or "" and that game uses links.functionTickets. */
  games: [
    {n:1,  date:"2026-10-02", opp:"Adelaide 36ers",               func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-02-10-2026/event/130064FDD1FC7914", preview:"https://www.hawks.com.au/news/game-preview-hawks-vs-adelaide-36ers-rd3-nbl27", courtWalk:""},
    {n:2,  date:"2026-10-09", opp:"Tasmania JackJumpers",         func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-09-10-2026/event/130064FE8BBF264B", preview:"", courtWalk:""},
    {n:3,  date:"2026-10-11", opp:"Cairns Taipans",               func:"15:30", doors:"16:00", show:"16:30", tip:"17:00", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-11-10-2026/event/130064FE93812C34", preview:"", courtWalk:""},
    {n:4,  date:"2026-10-22", opp:"Sydney Kings",                 func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-22-10-2026/event/130064FE911C2A64", preview:"", courtWalk:"https://www.eventbrite.com.au/e/hawks-court-walk-thursday-22-october-tickets-2001420620954", functionTickets:"https://www.eventbrite.com.au/e/illawarra-hawks-v-sydney-kings-pre-game-function-tickets-2003327674001"},
    {n:5,  date:"2026-10-24", opp:"Brisbane Bullets",             func:"16:00", doors:"16:30", show:"17:00", tip:"17:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-24-10-2026/event/130064FE93CA2C53", preview:"https://www.hawks.com.au/news/game-preview-hawks-vs-brisbane-bullets-rd6-nbl27", courtWalk:"https://www.eventbrite.com.au/e/hawks-court-walk-saturday-24-october-tickets-2001420752347", functionTickets:"https://www.eventbrite.com.au/e/illawarra-hawks-v-brisbane-bullets-pre-game-function-tickets-2000231309692"},
    {n:6,  date:"2026-11-19", opp:"Adelaide 36ers",               func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-19-11-2026/event/130064FE93F02C68", preview:"", courtWalk:"", functionTickets:"https://www.eventbrite.com.au/e/illawarra-hawks-v-adelaide-36ers-pre-game-function-tickets-2000231345800"},
    {n:7,  date:"2026-12-04", opp:"Sydney Kings",                 func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-04-12-2026/event/130064FE91A12AF3", preview:"", courtWalk:"", functionTickets:"https://www.eventbrite.com.au/e/illawarra-hawks-v-sydney-kings-pre-game-function-tickets-2000231509289"},
    {n:8,  date:"2026-12-10", opp:"Tasmania JackJumpers",         func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-10-12-2026/event/130064FE943B2CA3", preview:"", courtWalk:"https://www.eventbrite.com.au/e/hawks-court-walk-thursday-10-december-tickets-2001420777422", functionTickets:"https://www.eventbrite.com.au/e/illawarra-hawks-v-tasmania-jumpjackers-pre-game-function-tickets-2000231622628"},
    {n:9,  date:"2026-12-20", opp:"Melbourne United",             func:"13:30", doors:"14:00", show:"14:30", tip:"15:00", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-20-12-2026/event/130064FE924D2B56", preview:"", courtWalk:"https://www.eventbrite.com.au/e/hawk-court-walk-sunday-20-december-tickets-2001420831584", functionTickets:"https://www.eventbrite.com.au/e/illawarra-hawks-v-melbourne-united-pre-game-function-tickets-2000231662748"},
    {n:10, date:"2026-12-27", opp:"New Zealand Breakers",         func:"13:30", doors:"14:00", show:"14:30", tip:"15:00", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-27-12-2026/event/130064FE924E2B58", preview:"", courtWalk:"", functionTickets:"https://www.eventbrite.com.au/e/illawarra-hawks-v-nz-breakers-pre-game-function-tickets-2000231880399"},
    {n:11, date:"2026-12-31", opp:"South East Melbourne Phoenix", func:"15:30", doors:"16:30", show:"17:00", tip:"17:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-31-12-2026/event/130064FE92A32BA4", preview:"", courtWalk:"", functionTickets:"https://www.eventbrite.com.au/e/illawarra-hawks-v-se-melbourne-phoenix-pre-game-function-tickets-2000231942585"},
    {n:12, date:"2027-01-02", opp:"Cairns Taipans",               func:"16:00", doors:"16:30", show:"17:00", tip:"17:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-02-01-2027/event/130064FE92A32BA7", preview:"", courtWalk:"https://www.eventbrite.com.au/e/hawks-court-walk-saturday-2-january-tickets-2001969164663", functionTickets:"https://www.eventbrite.com.au/e/illawarra-hawks-v-carins-taipans-pre-game-function-tickets-2000232075984"},
    {n:13, date:"2027-01-06", opp:"Perth Wildcats",               func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-06-01-2027/event/130064FE930D2BC4", preview:"", courtWalk:"https://www.eventbrite.com.au/e/hawks-court-walk-wednesday-6-january-tickets-2001421994061", functionTickets:"https://www.eventbrite.com.au/e/illawarra-hawks-v-perth-wildcats-pre-game-function-tickets-2000232113095"},
    {n:14, date:"2027-01-20", opp:"New Zealand Breakers",         func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-20-01-2027/event/130064FE94712CCE", preview:"", courtWalk:"https://www.eventbrite.com.au/e/hawks-court-walk-wednesday-20-january-tickets-2001422262865", functionTickets:"https://www.eventbrite.com.au/e/illawarra-hawks-v-nz-breakers-pre-game-function-tickets-2000232149203"},
    {n:15, date:"2027-01-30", opp:"Perth Wildcats",               func:"16:00", doors:"16:30", show:"17:00", tip:"17:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-30-01-2027/event/130064FE933B2BF7", preview:"", courtWalk:"https://www.eventbrite.com.au/e/hawks-court-walk-saturday-30-january-tickets-2001422789440", functionTickets:"https://www.eventbrite.com.au/e/illawarra-hawks-v-perth-wildcats-pre-game-function-tickets-2000232236464"},
    {n:16, date:"2027-02-04", opp:"Brisbane Bullets",             func:"18:00", doors:"18:30", show:"19:00", tip:"19:30", tickets:"https://www.ticketmaster.com.au/202627-hungry-jacks-nbl-season-illawarra-wollongong-04-02-2027/event/130064FE94922D10", preview:"", courtWalk:"", functionTickets:"https://www.eventbrite.com.au/e/illawarra-hawks-v-brisbane-bullets-pre-game-function-tickets-2000232267557"},
  ],

  /* ---------------------------------------------------------------
     HAWKS GAMES PAGE (data-hawks="games", hawks.com.au/pages/engagement)
     One entry in cards per game. To change a card, edit its line here.
       id        short name with no spaces (used in links and analytics). Do not change once live.
       kind      "grid", "quiz", "mvp" or "bracket" for the cards that feed the "On now" tiles.
                 Leave it out for any other card. The mvp card also needs the
                 mvpVote schedule above; the quiz card needs quizApi below.
       layout    "full" = wide row with the picture beside the words
                 "column" = one of the three small cards under "More Hawks games"
                 Moving a card between the two is just changing this word.
       order     lowest number shows first, down the whole page. Neighbouring cards with the same
                 layout sit together, so to put a wide card at the bottom give it the highest number
       status    "live" shows it. "soon" shows it with "Coming soon" and no link.
                 "hidden" leaves it off the page.
       theme     "dark" gives a full row a black panel (optional)
       kicker    small line above the title: the red line on a wide row, or Daily / Weekly / Ongoing on a small card
       badge     small black label with a red dot (optional)
       sponsor   "Presented by ..." line (optional)
       body      main text
       meta      small grey line (optional)
       ctaLabel  the red button
       url       the game's own address. The UTM tags are added for you.
       image     the picture, a full https:// address (Webflow assets). "" shows a plain block.
       alt       what the picture shows, for screen readers
       imagePos  which part of the picture stays in view, like "center 20%" (optional)
     Words in {curly brackets} are filled in by the page:
       mvp:  {round} and {game} (for example "Round 3" and "Hawks v Adelaide 36ers").
             While a vote is open the badge/meta/ctaLabel are used; between votes the
             badgeClosed/metaClosed/ctaLabelClosed ones are used.
       bracket: {title} and {closes} (for example "Friday 6th November, 12:00pm") come from the bracket app, in metaLive.
                When no bracket is open, or the bracket app can't be reached, the plain meta line is used.
       quiz: {title} is this week's quiz name from the quiz app. If the quiz app can't be
             reached, bodyFallback is used and the quiz tile is left out.
     --------------------------------------------------------------- */
  gamesPortal: {
    heading: "Hawks Games",
    intro: "Play, vote and have your say. Some games reset every day, some every home game, and some are always open.",
    moreHeading: "More Hawks games",
    moreSub: "Daily, weekly and all season long.",
    /* The quiz app's current quiz (title, description, closes_at). Empty = the quiz card shows its fallback text and no quiz tile. */
    quizApi: "https://quiz.illawarra-hawks.com.au/api/public/current-quiz",
    /* The bracket app's featured bracket (title, opens_at, closes_at). Empty = the Pecking Order card keeps its own meta line and there is no Pecking Order tile. */
    bracketApi: "https://bracket.illawarra-hawks.com.au/api/public/current-bracket",
    utm: { source: "hawks.com.au", medium: "referral", campaign: "engagement-page" },
    cards: [
      {id:"membership-finder", layout:"full", order:6, status:"live", theme:"dark",
        kicker:"Memberships for the NBL27 season", title:"Membership Finder",
        body:"Answer a few quick questions and we'll match you with the Hawks membership that suits how you follow the club.",
        ctaLabel:"Find my membership", url:"https://hawks-membership-picker.lovable.app/",
        image:"https://video.illawarra-hawks.com.au/image/membership.jpg", alt:"Membership Finder question screen", imagePos:"center 45%"},
      {id:"greater-bank-mvp", kind:"mvp", layout:"full", order:1, status:"live",
        badge:"Voting open", badgeClosed:"Voting opens at tip-off", title:"Greater Bank MVP", sponsor:"Presented by Greater Bank",
        body:"Pick your standout Hawk after every game.",
        meta:"Now voting: {round}, {game}.", metaClosed:"Next vote: {game}.",
        ctaLabel:"Vote now", ctaLabelClosed:"See past winners", url:"https://hawks-mvp-vote.lovable.app/",
        image:"https://video.illawarra-hawks.com.au/image/mvp.jpg", alt:"Greater Bank MVP voting screen", imagePos:"center 20%"},
      {id:"cmg-midcourt-mayhem", layout:"full", order:2, status:"live",
        badge:"Entries open", title:"CMG Midcourt Mayhem", sponsor:"Presented by CMG",
        body:"Four shots, 30 seconds, one run. Choose your shooter type and register for your shot at a home game.",
        meta:"One fan is drawn about 48 hours before each home game.",
        ctaLabel:"Enter the draw", url:"https://cmg-midcourt-mayhem.lovable.app/",
        image:"https://video.illawarra-hawks.com.au/image/mayhem.jpg", alt:"CMG Midcourt Mayhem entry screen", imagePos:"center 35%"},
      {id:"hawks-grid", kind:"grid", layout:"column", order:3, status:"live",
        kicker:"Daily", title:"Hawks Grid",
        body:"Fill the grid with Hawks players who fit both categories. Nine guesses, each player once.",
        meta:"A new grid every night at midnight.",
        ctaLabel:"Play", url:"https://grid.illawarra-hawks.com.au/",
        image:"https://video.illawarra-hawks.com.au/image/grid.png", alt:"Hawks Grid game screen", imagePos:"center top"},
      {id:"hawks-trivia", kind:"quiz", layout:"column", order:4, status:"live",
        kicker:"Weekly", title:"Hawks Trivia",
        body:"This week: {title}", bodyFallback:"This week's Hawks quiz",
        meta:"Sign in with a magic link to go in the prize draw.",
        ctaLabel:"Start quiz", url:"https://quiz.illawarra-hawks.com.au/",
        image:"https://video.illawarra-hawks.com.au/image/trivia.jpg", alt:"Hawks Trivia quiz screen", imagePos:"center 62%"},
      {id:"hawks-pecking-order", kind:"bracket", layout:"column", order:5, status:"live",
        kicker:"Ongoing", title:"Pecking Order",
        body:"Settle Hawks debates bracket by bracket. Pick your favourites and crown the winners.",
        meta:"Featured: best uniform, 1979 to 2008.", metaLive:"Now voting: {title}. Closes {closes}.",
        ctaLabel:"Vote", url:"https://bracket.illawarra-hawks.com.au/",
        image:"https://video.illawarra-hawks.com.au/image/pecking.jpg", alt:"Hawks Pecking Order bracket home screen", imagePos:"center 25%"}
    ]
  }

};
