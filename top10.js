/* ================================================================
   ILLAWARRA HAWKS EMBEDS: ALL-TIME TOP 10 SINGLE-GAME FEATS

   Used only by the Top 10 embed (data-hawks="top-10"), and only
   loaded on pages that have it.

   HOW TO EDIT ON GITHUB.COM
   1. Click the pencil icon at the top right of this file.
   2. Change text INSIDE the quote marks. Keep the quote marks, commas
      and brackets exactly as they are.
   3. Click "Commit changes", then open the top10.js purge link in
      README.md.

   ROWS
   Each row is: ["Player", stat, "Date", "Opponent (H or A)", "Result"]
   - Rows are shown in the order listed, and numbered 1 to 10 for you.
   - A new feat: copy a row, put it in the right place, change it,
     then delete the last row so there are still 10.
   - Every row that equals the top stat is highlighted as the record.
   - record and recordDetail are the "Club record" line above the
     table. Update them by hand if the record changes.
   - Stats are plain numbers (no quote marks).
   ================================================================ */

window.HAWKS_TOP10 = {

  /* The line under the table */
  note: "Single-game performances, all competitions, current to the end of NBL26.",

  categories: [
    { key:"points", tab:"Points", label:"PTS",
      record:"54 Points",
      recordDetail:"Norman Taylor · 18 May 1990 v Spectres",
      rows: [
        ["Norman Taylor", 54, "18 May 1990", "Spectres (H)", "Won by 5"],
        ["Learando Drake", 49, "18 Aug 1985", "Spectres (A)", "Lost by 30"],
        ["Norman Taylor", 49, "1 Jul 1989", "Falcons (A)", "Won by 9"],
        ["Clayton Ritter", 46, "28 Feb 1998", "Cannons (H)", "Won by 10"],
        ["Michael Jones", 46, "24 Apr 1983", "Giants (A)", "Lost by 17"],
        ["Learando Drake", 45, "13 Jul 1985", "Supersonics (A)", "Won by 19"],
        ["Marlon Redmond", 45, "30 Mar 1984", "Wildcats (H)", "Won by 4"],
        ["Patric Fairs", 43, "20 Jul 1991", "Saints (H)", "Lost by 4"],
        ["Michael Jones", 43, "7 May 1983", "Falcons (H)", "Lost by 5"],
        ["CJ Bruton", 43, "27 Feb 1999", "Bullets (A)", "Won by 8"],
      ]},

    { key:"rebounds", tab:"Rebounds", label:"REB",
      record:"23 Rebounds",
      recordDetail:"Ray Borner · 9 May 1987 v Westars",
      rows: [
        ["Ray Borner", 23, "9 May 1987", "Westars (A)", "Won by 5"],
        ["Marcus Timmons", 22, "4 May 1996", "Falcons (H)", "Won by 9"],
        ["Chuck Harmison", 22, "3 Jul 1993", "Crocodiles (A)", "Won by 17"],
        ["Benjamin Knight", 21, "9 Jan 2004", "Razorbacks (H)", "Lost by 4"],
        ["Andrew Ogilvy", 21, "12 Oct 2018", "United (H)", "Lost by 1"],
        ["Melvin Thomas", 21, "19 Jun 1992", "Supercats (H)", "Won by 26"],
        ["Tony Rampton", 21, "14 Oct 2005", "36ers (A)", "Lost by 10"],
        ["Marlon Redmond", 20, "16 Jun 1984", "36ers (H)", "Won by 38"],
        ["Norman Taylor", 20, "26 May 1990", "Falcons (H)", "Won by 21"],
        ["Marcus Timmons", 20, "22 Jun 1996", "Kings (A)", "Lost by 22"],
      ]},

    { key:"threes", tab:"3PM", label:"3PM",
      record:"10 Threes",
      recordDetail:"Charles Thomas · 29 Dec 2001 v Kings",
      rows: [
        ["Charles Thomas", 10, "29 Dec 2001", "Kings (H)", "Won by 10"],
        ["Rotnei Clarke", 9, "31 Dec 2013", "Tigers (H)", "Lost by 10"],
        ["Mat Campbell", 9, "10 Dec 2005", "Crocodiles (A)", "Won by 10"],
        ["CJ Bruton", 8, "20 Nov 1999", "Razorbacks (A)", "Won by 12"],
        ["CJ Bruton", 8, "7 Jan 2000", "Tigers (H)", "Lost by 18"],
        ["Patric Fairs", 8, "27 Jul 1991", "Tigers (H)", "Lost by 28"],
        ["Patric Fairs", 8, "20 Jul 1991", "Saints (H)", "Lost by 4"],
        ["Oscar Forman", 8, "21 Mar 2014", "Kings (H)", "Won by 13"],
        ["Harry Froling", 8, "24 Jan 2022", "36ers (H)", "Won by 11"],
        ["Tyler Harvey", 8, "29 Mar 2021", "Bullets (H)", "Won by 24"],
      ]},

    { key:"assists", tab:"Assists", label:"AST",
      record:"18 Assists",
      recordDetail:"Gordie McLeod · 5 Sep 1987 v Giants & 12 Sep 1987 v Saints",
      rows: [
        ["Gordie McLeod", 18, "5 Sep 1987", "Giants (H)", "Won by 4"],
        ["Gordie McLeod", 18, "12 Sep 1987", "Saints (A)", "Won by 3"],
        ["Gordie McLeod", 17, "2 Aug 1985", "Devils (H)", "Won by 26"],
        ["Andre La Fleur", 16, "6 Sep 1996", "36ers (H)", "Won by 19"],
        ["Gordie McLeod", 16, "11 Mar 1984", "Bearcats (H)", "Won by 21"],
        ["Gordie McLeod", 15, "14 Apr 1985", "Supersonics (H)", "Lost by 4"],
        ["Greg Hubbard", 15, "30 Aug 1991", "Supercats (H)", "Won by 15"],
        ["Gordie McLeod", 15, "17 Aug 1985", "Devils (A)", "Won by 2"],
        ["Gordie McLeod", 14, "22 Jun 1984", "Falcons (A)", "Lost by 7"],
        ["Gordie McLeod", 14, "26 Apr 1985", "Wildcats (H)", "Lost by 4"],
      ]},

    { key:"blocks", tab:"Blocks", label:"BLK",
      record:"7 Blocks",
      recordDetail:"Don Bickett (1986), equalled by Melvin Thomas (×2, 1992) & Larry Davidson (2010)",
      rows: [
        ["Don Bickett", 7, "12 Jul 1986", "Bullets (A)", "Won by 6"],
        ["Melvin Thomas", 7, "23 May 1992", "Supercats (A)", "Won by 20"],
        ["Melvin Thomas", 7, "14 Aug 1992", "Tigers (H)", "Lost by 7"],
        ["Larry Davidson", 7, "19 Feb 2010", "Crocodiles (H)", "Won by 19"],
        ["Cortez Groves", 6, "4 Feb 2006", "Razorbacks (H)", "Won by 1"],
        ["David McGuire", 6, "23 Mar 1984", "Bears (A)", "Lost by 6"],
        ["Learando Drake", 6, "18 Aug 1985", "Spectres (A)", "Lost by 30"],
        ["Darnell Mee", 6, "4 Dec 2004", "Kings (A)", "Lost by 10"],
        ["Melvin Thomas", 6, "17 Sep 1994", "Falcons (H)", "Won by 2"],
        ["Ray Borner", 6, "27 Sep 1986", "Supersonics (H)", "Won by 8"],
      ]},

    { key:"steals", tab:"Steals", label:"STL",
      record:"9 Steals",
      recordDetail:"Elliot Hatcher · 13 Mar 1998 v Tigers",
      rows: [
        ["Elliot Hatcher", 9, "13 Mar 1998", "Tigers (H)", "Won by 12"],
        ["Gordie McLeod", 8, "17 Mar 1984", "Tigers (H)", "Lost by 1"],
        ["Terry Johnson", 7, "18 May 1996", "Devils (H)", "Lost by 3"],
        ["Alphonse Hammond", 7, "9 May 1986", "Wildcats (A)", "Won by 12"],
        ["Gordie McLeod", 7, "31 May 1985", "Giants (H)", "Won by 3"],
        ["Elliot Hatcher", 7, "28 Mar 1998", "Cannons (H)", "Lost by 5"],
        ["Matt Garrison", 7, "17 Mar 2001", "Cannons (H)", "Won by 35"],
        ["Doug Overton", 7, "28 Aug 1992", "Giants (H)", "Won by 18"],
        ["Alphonse Hammond", 7, "31 May 1986", "Supercats (H)", "Won by 31"],
        ["Butch Hays", 7, "18 Jun 1993", "Supercats (A)", "Won by 5"],
      ]}
  ]

};
