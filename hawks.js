/* ================================================================
   ILLAWARRA HAWKS EMBEDS
   One hosted script for every Hawks embed on hawks.com.au.
   Served by jsDelivr: https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js

   Editors: you do not need to edit this file. Game data and links
   live in data.js, next to this file. See README.md.

   How it works
   - Each embed is a placeholder, e.g. <div data-hawks="next-game">,
     holding a plain fallback link, plus this script tag.
   - This script loads data.js from the same folder, checks it, then
     replaces each placeholder's contents with the rendered module.
   - The script may appear many times on a page. It sets itself up
     once and renders each placeholder once (data-hawks-ready).
   - Test clock: add ?hk_now=2026-10-02T19:29 (Sydney time) to a
     page URL to pretend it is that moment.
   ================================================================ */
(function () {
  "use strict";

  var W = window, D = document;

  /* Second and later copies of the script only look for new placeholders. */
  if (W.__hawksEmbeds) { W.__hawksEmbeds.scan(); return; }

  var H = W.__hawksEmbeds = { modules: {}, instances: [], scan: function () {} };
  var TAG = "[hawks]";
  function warn(msg) { if (W.console) console.warn(TAG + " " + msg); }
  function fail(msg) { if (W.console) console.error(TAG + " " + msg); }

  /* ---------------- Time (Sydney) ---------------- */

  var TZ = "Australia/Sydney";
  var F = new Intl.DateTimeFormat("en-AU", { timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  function parts(ms) {
    var o = {};
    F.formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = +p.value; });
    if (o.hour === 24) o.hour = 0;
    return o;
  }
  /* Sydney wall clock ("2026-10-02", "19:30" or "19:30:05") to UTC milliseconds. */
  function toUtc(date, time) {
    var d = date.split("-").map(Number), t = time.split(":").map(Number);
    var wall = Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1] || 0, t[2] || 0), u = wall;
    for (var i = 0; i < 2; i++) { var p = parts(u); u -= Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - wall; }
    return u;
  }
  function fmt(date, opts) {
    var d = date.split("-").map(Number);
    return new Intl.DateTimeFormat("en-AU", Object.assign({ timeZone: "UTC" }, opts)).format(Date.UTC(d[0], d[1] - 1, d[2], 12));
  }
  function ord(n) { var s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  function nextDay(date) { var d = date.split("-").map(Number); return new Date(Date.UTC(d[0], d[1] - 1, d[2] + 1)).toISOString().slice(0, 10); }

  var U = H.u = {
    toUtc: toUtc,
    time: function (t) { var p = t.split(":").map(Number), h = p[0] % 12 || 12; return h + ":" + ("0" + (p[1] || 0)).slice(-2) + (p[0] < 12 ? "am" : "pm"); },
    longDate: function (date) { return fmt(date, { weekday: "long" }) + " " + ord(+date.slice(8)) + " " + fmt(date, { month: "long" }); },
    dow: function (date) { return fmt(date, { weekday: "short" }); },
    dm: function (date) { return +date.slice(8) + " " + fmt(date, { month: "short" }); },
    tickets: function (g) { return g.tickets || H.data.defaultTickets; }
  };

  /* Test clock: ?hk_now=YYYY-MM-DDTHH:MM (or HH:MM:SS), Sydney time. */
  var offset = 0;
  (function () {
    var m = /[?&]hk_now=([^&#]+)/.exec(location.search);
    if (!m) return;
    var v = decodeURIComponent(m[1]);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(v)) { warn("hk_now ignored: \"" + v + "\" is not YYYY-MM-DDTHH:MM"); return; }
    var s = v.split("T");
    offset = toUtc(s[0], s[1]) - Date.now();
    warn("test clock on: pretending it is " + v + " Sydney time");
  })();
  U.now = function () { return Date.now() + offset; };

  /* ---------------- Small helpers for modules ---------------- */

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]; }); }
  var uidN = 0;
  function uid(stem) { var id; do { id = "hk" + (++uidN) + "-" + stem; } while (D.getElementById(id)); return id; }
  /* External link attributes, or "" when the link is missing (caller hides the element). */
  function ext(url) { return url ? ' href="' + esc(url) + '" target="_blank" rel="noopener noreferrer"' : ""; }
  H.h = { esc: esc, uid: uid, ext: ext };

  /* ---------------- Data validation ---------------- */

  var DATE = /^\d{4}-\d{2}-\d{2}$/, TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
  function realDate(s) {
    if (!DATE.test(s)) return false;
    var d = s.split("-").map(Number), x = new Date(Date.UTC(d[0], d[1] - 1, d[2]));
    return x.getUTCFullYear() === d[0] && x.getUTCMonth() === d[1] - 1 && x.getUTCDate() === d[2];
  }
  function okUrl(v) { return typeof v === "string" && /^https:\/\/[^\s"'<>]+$/.test(v); }

  /* Returns clean data, or null if it is unusable. Bad games are skipped with a warning. */
  function validate(raw) {
    if (!raw || typeof raw !== "object") { fail("data.js did not set window.HAWKS_DATA. Check data.js for a typo (a missing comma or quote mark)."); return null; }
    if (!Array.isArray(raw.games)) { fail("data.js has no games list."); return null; }
    var out = { venue: typeof raw.venue === "string" && raw.venue ? raw.venue : "", links: {}, times: [], games: [] };
    if (!out.venue) warn("venue is empty in data.js");

    if (okUrl(raw.defaultTickets)) out.defaultTickets = raw.defaultTickets;
    else { out.defaultTickets = ""; warn("defaultTickets is missing or not an https:// link; ticket buttons without their own link are hidden"); }

    var L = raw.links && typeof raw.links === "object" ? raw.links : {};
    Object.keys(L).forEach(function (k) {
      var v = L[k];
      if (v === "" || v == null) { out.links[k] = ""; return; }
      if (k === "phone" ? /^tel:\+?\d+$/.test(v) : okUrl(v)) out.links[k] = v;
      else { out.links[k] = ""; warn("links." + k + " ignored: \"" + v + "\" is not a valid " + (k === "phone" ? "tel: link" : "https:// link")); }
    });

    (Array.isArray(raw.times) ? raw.times : []).forEach(function (t, i) {
      if (Array.isArray(t) && typeof t[0] === "string" && typeof t[1] === "string") out.times.push([t[0], t[1]]);
      else warn("times line " + (i + 1) + " skipped: expected [\"key\", \"Label\"]");
    });

    var seen = {};
    raw.games.forEach(function (g, i) {
      var who = g && g.n != null ? "game " + g.n : "game in position " + (i + 1), why = [];
      if (!g || typeof g !== "object") { warn(who + " skipped: not a game line"); return; }
      if (!(typeof g.n === "number" && g.n > 0 && Math.floor(g.n) === g.n)) why.push("n should be a whole number");
      else if (seen[g.n]) why.push("n " + g.n + " is used twice");
      if (!realDate(g.date)) why.push("date \"" + g.date + "\" is not a real YYYY-MM-DD date");
      if (typeof g.opp !== "string" || !g.opp.trim()) why.push("opp (opponent) is empty");
      if (!TIME.test(g.tip)) why.push("tip \"" + g.tip + "\" is not HH:MM");
      ["func", "doors", "show"].forEach(function (k) { if (g[k] && !TIME.test(g[k])) why.push(k + " \"" + g[k] + "\" is not HH:MM"); });
      if (why.length) { warn(who + " skipped: " + why.join("; ")); return; }
      var c = {};
      Object.keys(g).forEach(function (k) { c[k] = g[k]; });
      ["tickets", "preview"].forEach(function (k) {
        if (c[k] && !okUrl(c[k])) { warn("game " + g.n + " " + k + " ignored: not an https:// link"); c[k] = ""; }
        c[k] = c[k] || "";
      });
      ["func", "doors", "show"].forEach(function (k) { c[k] = c[k] || ""; });
      c._tip = toUtc(c.date, c.tip);
      c._end = toUtc(nextDay(c.date), "00:00");
      seen[g.n] = true;
      out.games.push(c);
    });

    var sorted = out.games.slice().sort(function (a, b) { return a._tip - b._tip; });
    if (sorted.some(function (g, i) { return g !== out.games[i]; })) { warn("games are not in date order in data.js; sorting them by tip-off"); out.games = sorted; }
    if (!out.games.length) warn("no valid games in data.js");
    return out;
  }
  H.validate = validate;

  /* ---------------- Shared game state ---------------- */

  /* The active game is the first whose day has not ended (midnight Sydney).
     phase: "countdown" before tip-off, "live" from tip-off to midnight, "wrap" after the season. */
  function state() {
    var now = U.now(), G = H.data.games;
    for (var i = 0; i < G.length; i++) {
      if (G[i]._end > now) return { i: i, game: G[i], now: now, phase: now >= G[i]._tip ? "live" : "countdown" };
    }
    return { i: -1, game: null, now: now, phase: "wrap" };
  }
  H.state = state;

  var last = null, timer = null;
  function tick() {
    var s = state(), changed = !last || s.i !== last.i;
    last = s;
    H.instances.forEach(function (x) {
      if (!x.update) return;
      try { x.update(s, changed); } catch (e) { fail("update failed for " + x.name + ": " + e.message); }
    });
    if (s.phase === "wrap" && timer) { clearInterval(timer); timer = null; }
  }

  /* ---------------- Styles and fonts (once per page) ---------------- */

  var styleEl = null, cssDone = {};
  function addCss(name, css) {
    if (cssDone[name]) return;
    cssDone[name] = true;
    if (!styleEl) { styleEl = D.createElement("style"); styleEl.id = "hawks-embeds-css"; D.head.appendChild(styleEl); }
    styleEl.appendChild(D.createTextNode(css + "\n"));
  }
  function addFonts() {
    if (D.querySelector('link[href*="fonts.googleapis.com"][href*="Anton"]')) return;
    [["preconnect", "https://fonts.googleapis.com"], ["preconnect", "https://fonts.gstatic.com", true],
     ["stylesheet", "https://fonts.googleapis.com/css2?family=Anton&family=Poppins:wght@400;700&display=swap"]].forEach(function (a) {
      var l = D.createElement("link"); l.rel = a[0]; l.href = a[1]; if (a[2]) l.crossOrigin = "anonymous"; D.head.appendChild(l);
    });
  }

  /* ---------------- Rendering placeholders ---------------- */

  var primaries = {};
  /* The primary instance of a module owns the page-level anchors (#game-N, #plan-*).
     It is the one marked data-hawks-primary, otherwise the first on the page. */
  function pickPrimaries() {
    [].forEach.call(D.querySelectorAll("[data-hawks]"), function (el) {
      var n = el.getAttribute("data-hawks");
      if (!primaries[n]) primaries[n] = D.querySelector('[data-hawks="' + n + '"][data-hawks-primary]') || el;
    });
  }

  function scan() {
    if (!H.data) return;
    pickPrimaries();
    var s = state(), added = false;
    [].forEach.call(D.querySelectorAll("[data-hawks]:not([data-hawks-ready])"), function (el) {
      var name = el.getAttribute("data-hawks"), mod = H.modules[name];
      el.setAttribute("data-hawks-ready", "");
      if (!mod) { warn("unknown embed \"" + name + "\"; leaving its fallback link in place"); return; }
      var orig = el.innerHTML;
      try {
        addFonts();
        addCss("_host", ".hk-host{display:block;container-type:inline-size;margin:0;padding:0;}");
        addCss(name, mod.css);
        el.classList.add("hk-host");
        var x = mod.render(el, { primary: primaries[name] === el, state: s, data: H.data }) || {};
        x.name = name; x.el = el; x.primary = primaries[name] === el;
        H.instances.push(x);
        added = true;
      } catch (e) {
        el.innerHTML = orig;
        el.classList.remove("hk-host");
        fail("could not render \"" + name + "\": " + e.message + ". Leaving its fallback link in place.");
      }
    });
    if (added) {
      last = null; tick();
      if (!timer && state().phase !== "wrap") timer = setInterval(tick, 1000);
      route();
    }
  }
  H.scan = scan;

  /* ---------------- Hash links ---------------- */

  function first(name) { for (var i = 0; i < H.instances.length; i++) if (H.instances[i].name === name && H.instances[i].primary) return H.instances[i]; return null; }
  function route() {
    var h = location.hash;
    if (!h) return;
    var m = /^#game-(\d+)$/.exec(h);
    if (m) {
      var n = +m[1], s = state(), up = first("upcoming-games"), ng = first("next-game");
      if (up && up.openGame && up.openGame(n)) return;
      if (s.game && s.game.n === n && ng) ng.el.scrollIntoView({ block: "start" });
      return;
    }
    H.instances.forEach(function (x) { if (x.primary && x.onHash) x.onHash(h); });
  }
  W.addEventListener("hashchange", route);

  /* ================================================================
     MODULES
     Each module: H.modules[name] = { css: "...", render(el, ctx) }.
     render() fills el and returns an instance object with optional
     update(state, gameChanged), onHash(hash) and openGame(n).
     ================================================================ */
  var M = H.modules;

  /* MODULES:START */

  /* Key times list items for a game, shared by next-game and upcoming-games. */
  function keyTimes(g, p) {
    return H.data.times.map(function (t) {
      return g[t[0]] ? '<li><span class="' + p + '__t">' + esc(U.time(g[t[0]])) + '</span><span class="' + p + '__tl">' + esc(t[1]) + "</span></li>" : "";
    }).join("");
  }

  /* ---------------- next-game (.hkng) ----------------
     Next home game, countdown, key times, preview button, ticket panels. */
  M["next-game"] = {
    css: [
      ".hkng{--r:#FF0013;--dr:#BF0000;--k:#000;--w:#FFF;--e:cubic-bezier(0.22,1,0.36,1);box-sizing:border-box;display:block;background:var(--k);color:var(--w);padding:48px 32px;margin:0;border-top:6px solid var(--r);text-align:center;font-family:'Poppins',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.4;scroll-margin-top:120px;}",
      ".hkng *,.hkng *::before,.hkng *::after{box-sizing:border-box;}",
      ".hkng[hidden],.hkng [hidden]{display:none !important;}",
      ".hkng .hkng__inner{max-width:800px;margin:0 auto;}",
      ".hkng .hkng__over{font-weight:700;font-size:12px;line-height:1.3;letter-spacing:0.06em;text-transform:uppercase;color:var(--r);margin:0 0 12px;}",
      ".hkng .hkng__head,.hkng .hkng__num,.hkng .hkng__status,.hkng .hkng__oh{font-family:'Anton',Impact,sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:0.01em;}",
      ".hkng .hkng__head{line-height:0.95;font-size:clamp(28px,4.5cqw,40px);color:var(--w);margin:0 0 10px;padding:0;}",
      ".hkng .hkng__meta{font-size:16px;line-height:1.55;color:#D8D8D8;margin:0 0 28px;}",
      ".hkng .hkng__timer{display:flex;justify-content:center;gap:12px;margin:0;padding:0;list-style:none;}",
      ".hkng .hkng__unit{flex:0 1 112px;min-width:0;padding:16px 4px 12px;border:2px solid rgba(255,255,255,0.2);margin:0;line-height:1;list-style:none;}",
      ".hkng .hkng__num{display:block;font-size:clamp(36px,8cqw,64px);line-height:1;color:var(--w);}",
      ".hkng .hkng__lbl{display:block;font-weight:700;font-size:12px;line-height:1.3;letter-spacing:0.06em;text-transform:uppercase;color:var(--r);margin-top:8px;}",
      ".hkng .hkng__status{font-size:clamp(36px,8cqw,64px);line-height:0.95;color:var(--r);margin:0;}",
      ".hkng .hkng__times{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));list-style:none;margin:28px 0 0;padding:20px 0 0;border-top:2px solid rgba(255,255,255,0.2);gap:16px 8px;}",
      ".hkng .hkng__times li{margin:0;padding:0;line-height:1.2;list-style:none;}",
      ".hkng .hkng__t{display:block;font-weight:700;font-size:20px;line-height:1.2;color:var(--w);}",
      ".hkng .hkng__tl{display:block;font-size:13px;line-height:1.3;color:#D8D8D8;margin-top:4px;}",
      ".hkng .hkng__btn{display:inline-block;background:var(--r);color:var(--w);font-family:'Poppins',Arial,sans-serif;font-weight:700;font-size:16px;line-height:1.2;letter-spacing:0.04em;text-transform:uppercase;text-decoration:none;padding:16px 28px;margin:0;border:2px solid var(--r);border-radius:0;transition:background-color 120ms var(--e),border-color 120ms var(--e),color 120ms var(--e),transform 100ms var(--e);}",
      ".hkng .hkng__btn:link,.hkng .hkng__btn:visited{color:var(--w);text-decoration:none;}",
      ".hkng .hkng__btn:hover{background:var(--dr);border-color:var(--dr);color:var(--w);text-decoration:none;}",
      ".hkng .hkng__btn:active{transform:scale(0.98);}",
      ".hkng .hkng__btn:focus-visible{outline:2px solid var(--w);outline-offset:2px;}",
      ".hkng .hkng__btn--sec,.hkng .hkng__btn--sec:link,.hkng .hkng__btn--sec:visited{background:transparent;border-color:var(--w);color:var(--w);}",
      ".hkng .hkng__btn--sec:hover{background:var(--w);border-color:var(--w);color:var(--k);}",
      ".hkng .hkng__btn--inv,.hkng .hkng__btn--inv:link,.hkng .hkng__btn--inv:visited{background:var(--w);border-color:var(--w);color:var(--k);}",
      ".hkng .hkng__btn--inv:hover{background:var(--k);border-color:var(--k);color:var(--w);}",
      ".hkng .hkng__prev{margin-top:28px;}",
      ".hkng .hkng__tix{display:grid;grid-template-columns:repeat(3,1fr);margin-top:32px;}",
      ".hkng .hkng__opt{display:flex;flex-direction:column;align-items:center;gap:18px;padding:32px 16px;border:2px solid transparent;margin:0;}",
      ".hkng .hkng__opt--r{background:var(--r);}",
      ".hkng .hkng__opt--w{background:var(--w);}",
      ".hkng .hkng__opt--k{background:var(--k);border-color:rgba(255,255,255,0.2);}",
      ".hkng .hkng__oh{font-size:clamp(20px,2.4cqw,24px);line-height:1;margin:0;padding:0;color:var(--w);}",
      ".hkng .hkng__opt--w .hkng__oh{color:var(--k);}",
      ".hkng .hkng__opt--k .hkng__oh{color:var(--r);}",
      ".hkng .hkng__opt--r .hkng__btn:focus-visible{outline-color:var(--w);}",
      ".hkng .hkng__opt--w .hkng__btn:focus-visible{outline-color:var(--k);}",
      ".hkng .hkng__opt--k .hkng__btn--inv:hover{background:var(--r);border-color:var(--r);color:var(--w);}",
      ".hkng .hkng__pk{font-size:15px;line-height:1.5;color:#D8D8D8;margin:24px 0 0;}",
      ".hkng .hkng__pick,.hkng .hkng__pick:link,.hkng .hkng__pick:visited{font-weight:700;color:var(--w);text-decoration:underline;text-underline-offset:3px;}",
      ".hkng .hkng__pick:hover{color:var(--r);text-decoration:underline;}",
      ".hkng .hkng__pick:focus-visible{outline:2px solid var(--w);outline-offset:2px;}",
      "@container (max-width:700px){",
      ".hkng{padding:36px 16px;}",
      ".hkng .hkng__timer{gap:8px;}",
      ".hkng .hkng__unit{padding:12px 2px 10px;}",
      ".hkng .hkng__lbl{font-size:11px;}",
      ".hkng .hkng__tix{grid-template-columns:1fr;}",
      ".hkng .hkng__opt{padding:24px 16px;gap:14px;}",
      ".hkng .hkng__btn{display:block;width:100%;padding:16px 20px;}",
      "}",
      "@media (prefers-reduced-motion:reduce){.hkng .hkng__btn{transition:none;}.hkng .hkng__btn:active{transform:none;}}"
    ].join("\n"),

    render: function (el, ctx) {
      var L = ctx.data.links, hide = function (url) { return url ? "" : " hidden"; };
      el.innerHTML =
        '<section class="hkng" aria-label="Next home game">' +
        '<div class="hkng__inner">' +
        '<p class="hkng__over">Next home game</p>' +
        '<h2 class="hkng__head" data-k="head"></h2>' +
        '<p class="hkng__meta" data-k="meta"></p>' +
        '<ul class="hkng__timer" data-k="timer" role="timer" aria-live="off" aria-label="Time until tip-off" hidden>' +
        '<li class="hkng__unit"><span class="hkng__num" data-k="d">00</span><span class="hkng__lbl">Days</span></li>' +
        '<li class="hkng__unit"><span class="hkng__num" data-k="h">00</span><span class="hkng__lbl">Hours</span></li>' +
        '<li class="hkng__unit"><span class="hkng__num" data-k="m">00</span><span class="hkng__lbl">Mins</span></li>' +
        '<li class="hkng__unit"><span class="hkng__num" data-k="s">00</span><span class="hkng__lbl">Secs</span></li>' +
        "</ul>" +
        '<p class="hkng__status" data-k="status" hidden></p>' +
        '<ul class="hkng__times" data-k="times"></ul>' +
        '<a class="hkng__btn hkng__btn--sec hkng__prev" data-k="prev" href="#" target="_blank" rel="noopener noreferrer" hidden>Read the game preview</a>' +
        '<div data-k="tix">' +
        '<div class="hkng__tix">' +
        '<div class="hkng__opt hkng__opt--r"><h3 class="hkng__oh">Single game ticket</h3>' +
        '<a class="hkng__btn hkng__btn--inv" data-k="single" href="#" target="_blank" rel="noopener noreferrer">Buy tickets</a></div>' +
        '<div class="hkng__opt hkng__opt--w"><h3 class="hkng__oh">3 &amp; 5 game Flexi pack</h3>' +
        '<a class="hkng__btn" data-k="flexi"' + ext(L.flexi) + ' aria-label="Pick your games: 3 and 5 game Flexi pack"' + hide(L.flexi) + '>Pick your games</a></div>' +
        '<div class="hkng__opt hkng__opt--k"><h3 class="hkng__oh">Season membership</h3>' +
        '<a class="hkng__btn hkng__btn--inv" data-k="member"' + ext(L.member) + ' aria-label="Join now: season membership"' + hide(L.member) + '>Join now</a></div>' +
        "</div>" +
        '<p class="hkng__pk"' + hide(L.picker) + '>Not sure which option suits you? <a class="hkng__pick" data-k="picker"' + ext(L.picker) + ">Try our membership picker</a></p>" +
        "</div></div></section>";

      var root = el.firstChild, k = {};
      [].forEach.call(root.querySelectorAll("[data-k]"), function (n) { k[n.getAttribute("data-k")] = n; });
      function pad(n) { return (n < 10 ? "0" : "") + n; }

      function fill(g) {
        k.head.textContent = "Hawks v " + g.opp;
        k.meta.textContent = U.longDate(g.date) + ", " + ctx.data.venue;
        k.times.innerHTML = keyTimes(g, "hkng");
        k.times.hidden = false;
        k.tix.hidden = false;
        var t = U.tickets(g);
        if (t) { k.single.href = t; k.single.hidden = false; } else k.single.hidden = true;
        k.single.setAttribute("aria-label", "Buy tickets: single game, Hawks v " + g.opp);
        if (g.preview) { k.prev.href = g.preview; k.prev.setAttribute("aria-label", "Read the game preview: Hawks v " + g.opp); k.prev.hidden = false; }
        else k.prev.hidden = true;
      }
      function wrap() {
        k.head.textContent = "That's a wrap on the home season";
        k.meta.textContent = "Thanks for every minute of noise, Hawkheads.";
        k.timer.hidden = k.status.hidden = k.times.hidden = k.tix.hidden = k.prev.hidden = true;
      }

      return {
        update: function (s, changed) {
          if (s.phase === "wrap") { if (changed) wrap(); return; }
          if (changed) fill(s.game);
          if (s.phase === "live") { k.timer.hidden = true; k.status.textContent = "Game on"; k.status.hidden = false; return; }
          var n = Math.floor((s.game._tip - s.now) / 1000);
          k.d.textContent = pad(Math.floor(n / 86400)); k.h.textContent = pad(Math.floor(n % 86400 / 3600));
          k.m.textContent = pad(Math.floor(n % 3600 / 60)); k.s.textContent = pad(n % 60);
          k.timer.hidden = false; k.status.hidden = true;
        }
      };
    }
  };

  /* MODULES:END */

  /* ---------------- Load data.js from the same folder ---------------- */

  var me = D.currentScript;
  var base = me && me.src ? me.src.replace(/[^\/?#]*([?#].*)?$/, "") : "";

  function start() {
    var data = validate(W.HAWKS_DATA);
    if (!data) return;
    H.data = data;
    scan();
    if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", scan);
  }

  if (W.HAWKS_DATA) start();
  else if (!base) fail("could not work out where hawks.js was loaded from, so data.js was not loaded");
  else {
    var s = D.createElement("script");
    s.src = base + "data.js";
    s.onload = start;
    s.onerror = function () { fail("could not load " + s.src + ". Embeds are showing their fallback links."); };
    (D.head || D.documentElement).appendChild(s);
  }
})();
