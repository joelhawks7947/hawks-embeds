/* ================================================================
   ILLAWARRA HAWKS EMBEDS: CORE
   All the embed code. Loaded by hawks.js (the small loader every embed
   points at), from the same folder, with a ?v= value that changes every
   10 minutes so browsers pick up code changes quickly.
   After changing this file, purge:
   https://purge.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks-core.js

   Editors: you do not need to edit this file. Game data and links
   live in data.js, next to this file. See README.md.

   How it works
   - Each embed is a placeholder, e.g. <div data-hawks="next-game">,
     holding a plain fallback link, plus the hawks.js script tag.
   - This script loads data.js from the same folder, checks it, then
     replaces each placeholder's contents with the rendered module.
   - The script tag may appear many times on a page. This sets itself
     up once and renders each placeholder once (data-hawks-ready).
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
  /* Links to other hawks.com.au pages open in the same tab; everything else opens in a new tab. */
  function isHawks(url) { return /^https:\/\/(www\.)?hawks\.com\.au([\/?#]|$)/i.test(url); }
  function ext(url) { return url ? ' href="' + esc(url) + '"' + (isHawks(url) ? "" : ' target="_blank" rel="noopener noreferrer"') : ""; }
  /* The same rule for a link element that's already on the page. */
  function setLink(a, url) {
    a.href = url;
    if (isHawks(url)) { a.removeAttribute("target"); a.removeAttribute("rel"); }
    else { a.target = "_blank"; a.rel = "noopener noreferrer"; }
  }
  H.h = { esc: esc, uid: uid, ext: ext, setLink: setLink, isHawks: isHawks };

  /* A game's preview link, or "" if this page IS that preview (so we never link a
     reader to the article they're reading). Ignores www., trailing slashes, ?query and #hash. */
  function pageKey(url) {
    var a = D.createElement("a");
    a.href = url;
    return a.hostname.replace(/^www\./, "").toLowerCase() + a.pathname.replace(/\/+$/, "").toLowerCase();
  }
  function previewFor(g) {
    return g.preview && pageKey(g.preview) !== pageKey(location.href) ? g.preview : "";
  }
  H.previewFor = previewFor;

  /* ---------------- Data validation ---------------- */

  var CW_HOURS_BEFORE = 4;
  /* Hours after tip-off when a game counts as finished. Change this one number to adjust. */
  var GAME_HOURS = 2;
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
      ["tickets", "preview", "courtWalk"].forEach(function (k) {
        if (c[k] && !okUrl(c[k])) { warn("game " + g.n + " " + k + " ignored: not an https:// link"); c[k] = ""; }
        c[k] = c[k] || "";
      });
      ["func", "doors", "show"].forEach(function (k) { c[k] = c[k] || ""; });
      c._tip = toUtc(c.date, c.tip);
      /* A game is over (and everything rolls to the next game) GAME_HOURS after tip-off. */
      c._end = c._tip + GAME_HOURS * 3600000;
      /* Court Walk tickets come off sale 4 hours before the Court Walk, which starts at the
         pre-game function time (or tip-off if a game has no function time). */
      c._cwOff = toUtc(c.date, c.func || c.tip) - CW_HOURS_BEFORE * 3600000;
      seen[g.n] = true;
      out.games.push(c);
    });

    var sorted = out.games.slice().sort(function (a, b) { return a._tip - b._tip; });
    if (sorted.some(function (g, i) { return g !== out.games[i]; })) { warn("games are not in date order in data.js; sorting them by tip-off"); out.games = sorted; }
    if (!out.games.length) warn("no valid games in data.js");
    out.girlsInTheGame = { camps: camps(raw.girlsInTheGame) };
    return out;
  }
  H.validate = validate;

  /* Girls in the Game camps. A camp stays up until 6 hours after its start time. */
  var CAMP_HOURS = 6;
  function camps(raw) {
    var list = raw && Array.isArray(raw.camps) ? raw.camps : [];
    if (raw && !Array.isArray(raw.camps)) warn("girlsInTheGame has no camps list");
    var out = [];
    list.forEach(function (c, i) {
      var who = "Girls in the Game camp " + (i + 1), why = [];
      if (!c || typeof c !== "object") { warn(who + " skipped: not a camp line"); return; }
      if (!realDate(c.date)) why.push("date \"" + c.date + "\" is not a real YYYY-MM-DD date");
      if (!TIME.test(c.time)) why.push("time \"" + c.time + "\" is not HH:MM");
      if (typeof c.venue !== "string" || !c.venue.trim()) why.push("venue is empty");
      if (c.rego && !okUrl(c.rego)) why.push("rego is not an https:// link");
      if (why.length) { warn(who + " skipped: " + why.join("; ")); return; }
      out.push({ date: c.date, time: c.time, venue: c.venue.trim(), rego: c.rego || "",
        details: typeof c.details === "string" ? c.details.trim() : "",
        _end: toUtc(c.date, c.time) + CAMP_HOURS * 3600000 });
    });
    return out.sort(function (a, b) { return a._end - b._end; });
  }

  /* ---------------- Shared game state ---------------- */

  /* The active game is the first that hasn't finished (2 hours after tip-off, GAME_HOURS).
     phase: "countdown" before tip-off, "live" from tip-off until then, "wrap" after the season. */
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
      var name = el.getAttribute("data-hawks"), mod = H.modules[name], extra;
      if (mod && mod.extra) {
        /* This module has its own data file: load it the first time it's needed, render when it arrives. */
        extra = loadExtra(mod.extra);
        if (extra === LOADING) return;
      }
      el.setAttribute("data-hawks-ready", "");
      if (!mod) { warn("unknown embed \"" + name + "\"; leaving its fallback link in place. Check the spelling in the placeholder."); return; }
      if (mod.extra && !extra) return;
      var orig = el.innerHTML;
      try {
        addFonts();
        addCss("_host", ".hk-host{display:block;container-type:inline-size;margin:0;padding:0;}");
        addCss(mod.cssKey || name, mod.css);
        el.classList.add("hk-host");
        var x = mod.render(el, { primary: primaries[name] === el, state: s, data: H.data, extra: extra, theme: el.getAttribute("data-hawks-theme") === "light" ? "light" : "dark" }) || {};
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
      if (!timer) timer = setInterval(tick, 1000);
      route();
    }
  }
  H.scan = scan;

  /* Module data files (for example top10.js), loaded only on pages that use that module.
     Returns LOADING while the file is on its way, the checked data once it has arrived,
     or null if it failed (the placeholder then keeps its fallback link). */
  var LOADING = {}, extras = {};
  function loadExtra(spec) {
    var f = spec.file;
    if (f in extras) return extras[f];
    extras[f] = LOADING;
    var s = D.createElement("script");
    s.src = base + f + "?v=" + Math.floor(Date.now() / 600000);
    s.onload = function () {
      var raw = W[spec.global];
      if (!raw) fail(f + " did not set window." + spec.global + ". Check " + f + " for a typo (a missing comma or quote mark).");
      extras[f] = raw ? spec.validate(raw) : null;
      scan();
    };
    s.onerror = function () { fail("could not load " + s.src + ". Those embeds are showing their fallback links."); extras[f] = null; scan(); };
    (D.head || D.documentElement).appendChild(s);
    return LOADING;
  }

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
  /* A game's Court Walk link while it's still on sale, otherwise "". */
  function courtWalkFor(g, now) { return g.courtWalk && now < g._cwOff ? g.courtWalk : ""; }
  function courtWalkLabel(g) { return "Court Walk tickets: Hawks v " + g.opp + ", " + U.longDate(g.date); }

  /* Pre-game function tickets (links.functionTickets, the club's Eventbrite page):
     a "Buy ticket" link under that time, or null if there's no link. */
  function fnTickets(g, cls) {
    var fn = H.data.links.functionTickets;
    return fn ? { func: '<a class="' + cls + '"' + ext(fn) + ' aria-label="Buy ticket: pre-game function, Hawks v ' + esc(g.opp) + '">Buy ticket</a>' } : null;
  }

  /* extra (optional): HTML to add under a time's label, keyed by time field, e.g. { func: "<a ...>" }. */
  function keyTimes(g, p, extra) {
    return H.data.times.map(function (t) {
      return g[t[0]] ? '<li><span class="' + p + '__t">' + esc(U.time(g[t[0]])) + '</span><span class="' + p + '__tl">' + esc(t[1]) + "</span>" + ((extra && extra[t[0]]) || "") + "</li>" : "";
    }).join("");
  }

  /* ---------------- next-game (.hkng) ----------------
     Next home game, preview link (once set), countdown, key times, ticket panels. */
  M["next-game"] = {
    css: [
      ".hkng{--r:#FF0013;--dr:#BF0000;--k:#000;--w:#FFF;--t:#4FC3BE;--e:cubic-bezier(0.22,1,0.36,1);box-sizing:border-box;display:block;background:var(--k);color:var(--w);padding:48px 32px;margin:0;border-top:6px solid var(--r);text-align:center;font-family:'Poppins',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.4;scroll-margin-top:120px;}",
      ".hkng *,.hkng *::before,.hkng *::after{box-sizing:border-box;}",
      ".hkng[hidden],.hkng [hidden]{display:none !important;}",
      ".hkng .hkng__inner{max-width:800px;margin:0 auto;}",
      ".hkng .hkng__over{font-weight:700;font-size:12px;line-height:1.3;letter-spacing:0.06em;text-transform:uppercase;color:var(--r);margin:0 0 12px;}",
      ".hkng .hkng__head,.hkng .hkng__num,.hkng .hkng__status,.hkng .hkng__oh{font-family:'Anton',Impact,sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:0.01em;}",
      ".hkng .hkng__head{line-height:0.95;font-size:clamp(28px,4.5cqw,40px);color:var(--w);margin:0 0 10px;padding:0;}",
      ".hkng .hkng__meta{font-size:16px;line-height:1.55;color:#D8D8D8;margin:0 0 28px;}",
      ".hkng .hkng__meta--tight{margin-bottom:8px;}",
      ".hkng .hkng__pv{font-size:16px;line-height:1.5;margin:0 0 28px;}",
      ".hkng .hkng__pvl,.hkng .hkng__pvl:link,.hkng .hkng__pvl:visited{font-weight:700;color:var(--w);text-decoration:underline;text-underline-offset:3px;}",
      ".hkng .hkng__pvl:hover{color:var(--r);text-decoration:underline;}",
      ".hkng .hkng__pvl:focus-visible{outline:2px solid var(--w);outline-offset:2px;}",
      ".hkng .hkng__timer{display:flex;justify-content:center;gap:12px;margin:0;padding:0;list-style:none;}",
      ".hkng .hkng__unit{flex:0 1 112px;min-width:0;padding:16px 4px 12px;border:2px solid rgba(255,255,255,0.2);margin:0;line-height:1;list-style:none;}",
      ".hkng .hkng__num{display:block;font-size:clamp(36px,8cqw,64px);line-height:1;color:var(--w);}",
      ".hkng .hkng__lbl{display:block;font-weight:700;font-size:12px;line-height:1.3;letter-spacing:0.06em;text-transform:uppercase;color:var(--r);margin-top:8px;}",
      ".hkng .hkng__status{font-size:clamp(36px,8cqw,64px);line-height:0.95;color:var(--r);margin:0;}",
      ".hkng .hkng__times{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));list-style:none;margin:28px 0 0;padding:20px 0 0;border-top:2px solid rgba(255,255,255,0.2);gap:16px 8px;}",
      ".hkng .hkng__times li{margin:0;padding:0;line-height:1.2;list-style:none;}",
      ".hkng .hkng__t{display:block;font-weight:700;font-size:20px;line-height:1.2;color:var(--w);}",
      ".hkng .hkng__tl{display:block;font-size:13px;line-height:1.3;color:#D8D8D8;margin-top:4px;}",
      ".hkng .hkng__tbuy,.hkng .hkng__tbuy:link,.hkng .hkng__tbuy:visited{display:inline-block;margin-top:6px;font-weight:700;font-size:13px;line-height:1.3;color:var(--w);text-decoration:underline;text-underline-offset:3px;}",
      ".hkng .hkng__tbuy:hover{color:var(--r);text-decoration:underline;}",
      ".hkng .hkng__tbuy:focus-visible{outline:2px solid var(--w);outline-offset:2px;}",
      ".hkng .hkng__btn{display:inline-block;background:var(--r);color:var(--w);font-family:'Poppins',Arial,sans-serif;font-weight:700;font-size:16px;line-height:1.2;letter-spacing:0.04em;text-transform:uppercase;text-decoration:none;padding:16px 28px;margin:0;border:2px solid var(--r);border-radius:0;transition:background-color 120ms var(--e),border-color 120ms var(--e),color 120ms var(--e),transform 100ms var(--e);}",
      ".hkng .hkng__btn:link,.hkng .hkng__btn:visited{color:var(--w);text-decoration:none;}",
      ".hkng .hkng__btn:hover{background:var(--dr);border-color:var(--dr);color:var(--w);text-decoration:none;}",
      ".hkng .hkng__btn:active{transform:scale(0.98);}",
      ".hkng .hkng__btn:focus-visible{outline:2px solid var(--w);outline-offset:2px;}",
      ".hkng .hkng__btn--inv,.hkng .hkng__btn--inv:link,.hkng .hkng__btn--inv:visited{background:var(--w);border-color:var(--w);color:var(--k);}",
      ".hkng .hkng__btn--inv:hover{background:var(--k);border-color:var(--k);color:var(--w);}",
      /* Court Walk: teal with black text (white on teal fails contrast); hover goes white. */
      ".hkng .hkng__cw{margin:28px 0 0;}",
      ".hkng .hkng__btn--cw,.hkng .hkng__btn--cw:link,.hkng .hkng__btn--cw:visited{background:var(--t);border-color:var(--t);color:var(--k);}",
      ".hkng .hkng__btn--cw:hover{background:var(--w);border-color:var(--w);color:var(--k);}",
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
        '<p class="hkng__pv" data-k="pv" hidden><a class="hkng__pvl" data-k="prev" href="#"></a></p>' +
        '<ul class="hkng__timer" data-k="timer" role="timer" aria-live="off" aria-label="Time until tip-off" hidden>' +
        '<li class="hkng__unit"><span class="hkng__num" data-k="d">00</span><span class="hkng__lbl">Days</span></li>' +
        '<li class="hkng__unit"><span class="hkng__num" data-k="h">00</span><span class="hkng__lbl">Hours</span></li>' +
        '<li class="hkng__unit"><span class="hkng__num" data-k="m">00</span><span class="hkng__lbl">Mins</span></li>' +
        '<li class="hkng__unit"><span class="hkng__num" data-k="s">00</span><span class="hkng__lbl">Secs</span></li>' +
        "</ul>" +
        '<p class="hkng__status" data-k="status" hidden></p>' +
        '<ul class="hkng__times" data-k="times"></ul>' +
        '<div class="hkng__cw" data-k="cw" hidden><a class="hkng__btn hkng__btn--cw" data-k="cwa" href="#">Court Walk tickets</a></div>' +
        '<div data-k="tix">' +
        '<div class="hkng__tix">' +
        '<div class="hkng__opt hkng__opt--r"><h3 class="hkng__oh">Single game ticket</h3>' +
        '<a class="hkng__btn hkng__btn--inv" data-k="single" href="#">Buy tickets</a></div>' +
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
        k.times.innerHTML = keyTimes(g, "hkng", fnTickets(g, "hkng__tbuy"));
        k.times.hidden = false;
        k.tix.hidden = false;
        var t = U.tickets(g);
        if (t) { setLink(k.single, t); k.single.hidden = false; } else k.single.hidden = true;
        k.single.setAttribute("aria-label", "Buy tickets: single game, Hawks v " + g.opp);
        /* Preview link under the date, only once a preview is set in data.js. */
        var pv = previewFor(g);
        if (pv) { setLink(k.prev, pv); k.prev.textContent = "Read the Hawks v " + g.opp + " preview"; k.pv.hidden = false; }
        else k.pv.hidden = true;
        k.meta.classList.toggle("hkng__meta--tight", !!pv);
      }
      function wrap() {
        k.head.textContent = "That's a wrap on the home season";
        k.meta.textContent = "Thanks for every minute of noise, Hawkheads.";
        k.timer.hidden = k.status.hidden = k.times.hidden = k.tix.hidden = k.pv.hidden = k.cw.hidden = true;
        k.meta.classList.remove("hkng__meta--tight");
      }

      return {
        update: function (s, changed) {
          if (s.phase === "wrap") { if (changed) wrap(); return; }
          if (changed) fill(s.game);
          /* Court Walk button: checked every tick, so it goes 4 hours before the Court Walk. */
          var cw = courtWalkFor(s.game, s.now);
          if (cw && k.cwa.getAttribute("href") !== cw) { setLink(k.cwa, cw); k.cwa.setAttribute("aria-label", courtWalkLabel(s.game)); }
          k.cw.hidden = !cw;
          if (s.phase === "live") { k.timer.hidden = true; k.status.textContent = "Game on"; k.status.hidden = false; return; }
          var n = Math.floor((s.game._tip - s.now) / 1000);
          k.d.textContent = pad(Math.floor(n / 86400)); k.h.textContent = pad(Math.floor(n % 86400 / 3600));
          k.m.textContent = pad(Math.floor(n % 3600 / 60)); k.s.textContent = pad(n % 60);
          k.timer.hidden = false; k.status.hidden = true;
        }
      };
    }
  };


  /* ---------------- upcoming-games (.hksl) ----------------
     Collapsed list of home games from the next game onwards (the next game stays until
     2 hours after its tip-off), each with tickets and key times. */
  M["upcoming-games"] = {
    css: [
      ".hksl{--r:#FF0013;--dr:#BF0000;--k:#000000;--w:#FFFFFF;--t:#4FC3BE;--e:cubic-bezier(0.22,1,0.36,1);box-sizing:border-box;display:block;background:var(--w);color:var(--k);padding:32px;margin:0;border-top:6px solid var(--k);font-family:'Poppins',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.4;text-align:left;}",
      ".hksl *,.hksl *::before,.hksl *::after{box-sizing:border-box;}",
      ".hksl .hksl__inner{max-width:880px;margin:0 auto;}",
      ".hksl[hidden],.hksl [hidden]{display:none !important;}",
      ".hksl .hksl__h{margin:0;padding:0;font-size:inherit;line-height:inherit;font-weight:400;}",
      ".hksl .hksl__bar{display:flex;align-items:center;gap:16px;width:100%;margin:0;padding:18px 20px;background:var(--w);color:var(--k);border:2px solid var(--k);border-radius:0;cursor:pointer;text-align:left;font-family:'Poppins',Arial,sans-serif;font-size:16px;line-height:1.2;transition:background-color 120ms var(--e),color 120ms var(--e);}",
      ".hksl .hksl__bar:hover,.hksl .hksl__bar[aria-expanded=\"true\"]{background:var(--k);color:var(--w);}",
      ".hksl .hksl__bar:focus-visible{outline:2px solid var(--k);outline-offset:2px;}",
      ".hksl .hksl__bt{flex:1 1 auto;font-family:'Anton',Impact,sans-serif;font-weight:400;font-size:clamp(20px,2.6cqw,26px);line-height:1;text-transform:uppercase;letter-spacing:0.01em;}",
      ".hksl .hksl__bc{flex:0 0 auto;font-weight:700;font-size:13px;line-height:1.3;letter-spacing:0.06em;text-transform:uppercase;color:var(--r);}",
      ".hksl .hksl__ic{flex:0 0 auto;position:relative;width:16px;height:16px;}",
      ".hksl .hksl__ic::before,.hksl .hksl__ic::after{content:\"\";position:absolute;background:currentColor;left:0;top:7px;width:16px;height:2px;transition:transform 120ms var(--e);}",
      ".hksl .hksl__ic::after{transform:rotate(90deg);}",
      ".hksl .hksl__bar[aria-expanded=\"true\"] .hksl__ic::after{transform:rotate(0deg);}",
      ".hksl .hksl__list{list-style:none;margin:0;padding:0;border:2px solid var(--k);border-top:0;}",
      ".hksl .hksl__row{margin:0;padding:0 20px;border-bottom:1px solid #CFCFCF;scroll-margin-top:120px;list-style:none;line-height:1.4;}",
      ".hksl .hksl__row:last-child{border-bottom:0;}",
      ".hksl .hksl__main{display:grid;grid-template-columns:76px 1fr auto;gap:20px;align-items:center;padding:14px 0;}",
      ".hksl .hksl__date{border:2px solid var(--k);padding:6px 4px;text-align:center;}",
      ".hksl .hksl__dow{display:block;font-weight:700;font-size:12px;line-height:1.3;letter-spacing:0.06em;text-transform:uppercase;color:var(--r);}",
      ".hksl .hksl__dm{display:block;font-family:'Anton',Impact,sans-serif;font-weight:400;font-size:20px;line-height:1;text-transform:uppercase;color:var(--k);margin-top:2px;white-space:nowrap;}",
      ".hksl .hksl__opp{font-family:'Anton',Impact,sans-serif;font-weight:400;font-size:clamp(18px,2.2cqw,22px);line-height:1;text-transform:uppercase;color:var(--k);margin:0;}",
      ".hksl .hksl__info .hksl__meta{font-size:14px;line-height:1.4;color:#373737;margin:4px 0 0;}",
      ".hksl .hksl__acts{display:flex;gap:8px;}",
      ".hksl .hksl__btn{display:inline-block;background:var(--r);color:var(--w);font-family:'Poppins',Arial,sans-serif;font-weight:700;font-size:14px;line-height:1.2;letter-spacing:0.04em;text-transform:uppercase;text-decoration:none;text-align:center;padding:12px 18px;margin:0;border:2px solid var(--r);border-radius:0;cursor:pointer;transition:background-color 120ms var(--e),border-color 120ms var(--e),color 120ms var(--e),transform 100ms var(--e);}",
      ".hksl .hksl__btn:link,.hksl .hksl__btn:visited{color:var(--w);text-decoration:none;}",
      ".hksl .hksl__btn:hover{background:var(--dr);border-color:var(--dr);color:var(--w);text-decoration:none;}",
      ".hksl .hksl__btn:active{transform:scale(0.98);}",
      ".hksl .hksl__btn:focus-visible{outline:2px solid var(--k);outline-offset:2px;}",
      ".hksl .hksl__btn--sec,.hksl .hksl__btn--sec:link,.hksl .hksl__btn--sec:visited{background:transparent;border-color:var(--k);color:var(--k);}",
      ".hksl .hksl__btn--sec:hover,.hksl .hksl__btn--sec[aria-expanded=\"true\"]{background:var(--k);border-color:var(--k);color:var(--w);}",
      /* Court Walk: teal with black text (white on teal fails contrast); hover inverts to black.
         After the general button rules so it wins the colour tie. */
      ".hksl .hksl__btn--cw,.hksl .hksl__btn--cw:link,.hksl .hksl__btn--cw:visited{background:var(--t);border-color:var(--t);color:var(--k);}",
      ".hksl .hksl__btn--cw:hover{background:var(--k);border-color:var(--k);color:var(--t);}",
      ".hksl .hksl__panel{padding:0 0 18px 96px;}",
      ".hksl .hksl__times{display:flex;flex-wrap:wrap;gap:12px 32px;list-style:none;margin:0;padding:0;}",
      ".hksl .hksl__times li{margin:0;padding:0;list-style:none;line-height:1.2;}",
      ".hksl .hksl__t{display:block;font-weight:700;font-size:18px;line-height:1.2;color:var(--k);}",
      ".hksl .hksl__tl{display:block;font-size:13px;line-height:1.3;color:#373737;margin-top:2px;}",
      ".hksl .hksl__tbuy,.hksl .hksl__tbuy:link,.hksl .hksl__tbuy:visited{display:inline-block;margin-top:6px;font-weight:700;font-size:13px;line-height:1.3;color:var(--k);text-decoration:underline;text-underline-offset:3px;}",
      ".hksl .hksl__tbuy:hover{color:var(--dr);text-decoration:underline;}",
      ".hksl .hksl__tbuy:focus-visible{outline:2px solid var(--k);outline-offset:2px;}",
      ".hksl .hksl__panel .hksl__btn{margin-top:16px;}",
      /* Rows with a Court Walk have three buttons: below 860px they move under the game,
         Tickets and Key times side by side, Court Walk full width underneath. */
      "@container (max-width:860px){",
      ".hksl .hksl__row--cw .hksl__acts{grid-column:1 / -1;display:grid;grid-template-columns:1fr 1fr;gap:8px;}",
      ".hksl .hksl__row--cw .hksl__btn--cw{grid-column:1 / -1;order:3;}",
      "}",
      "@container (max-width:600px){",
      ".hksl{padding:24px 16px;}",
      ".hksl .hksl__bar{padding:16px;gap:12px;}",
      ".hksl .hksl__row{padding:0 14px;}",
      ".hksl .hksl__main{grid-template-columns:72px 1fr;gap:12px 14px;}",
      ".hksl .hksl__dm{font-size:18px;}",
      ".hksl .hksl__acts{grid-column:1 / -1;}",
      ".hksl .hksl__acts .hksl__btn{flex:1 1 0;}",
      ".hksl .hksl__panel{padding:0 0 18px;}",
      ".hksl .hksl__times{display:grid;grid-template-columns:1fr 1fr;gap:12px 16px;}",
      "}",
      "@media (prefers-reduced-motion:reduce){.hksl .hksl__btn,.hksl .hksl__bar,.hksl .hksl__ic::before,.hksl .hksl__ic::after{transition:none;}.hksl .hksl__btn:active{transform:none;}}"
    ].join("\n"),

    render: function (el, ctx) {
      var listId = uid("upcoming");
      el.innerHTML =
        '<section class="hksl" hidden><div class="hksl__inner">' +
        '<h2 class="hksl__h"><button class="hksl__bar" type="button" aria-expanded="false" aria-controls="' + listId + '">' +
        '<span class="hksl__bt">Upcoming home games</span><span class="hksl__bc"></span><span class="hksl__ic" aria-hidden="true"></span>' +
        '</button></h2><ul class="hksl__list" id="' + listId + '" hidden></ul></div></section>';
      var root = el.firstChild, bar = root.querySelector(".hksl__bar"), list = root.querySelector(".hksl__list");

      function toggle(btn, panel, open) { btn.setAttribute("aria-expanded", String(open)); panel.hidden = !open; }
      bar.addEventListener("click", function () { toggle(bar, list, bar.getAttribute("aria-expanded") !== "true"); });

      function row(g) {
        var rowId = ctx.primary ? "game-" + g.n : uid("game-" + g.n), pid = ctx.primary ? "game-" + g.n + "-times" : uid("game-" + g.n + "-times");
        var t = U.tickets(g);
        var li = D.createElement("li");
        var cw = courtWalkFor(g, U.now());
        li.className = "hksl__row" + (cw ? " hksl__row--cw" : ""); li.id = rowId; li.setAttribute("data-n", g.n);
        li.innerHTML =
          '<div class="hksl__main">' +
          '<div class="hksl__date"><span class="hksl__dow">' + esc(U.dow(g.date)) + '</span><span class="hksl__dm">' + esc(U.dm(g.date)) + "</span></div>" +
          '<div class="hksl__info"><p class="hksl__opp">v ' + esc(g.opp) + '</p><p class="hksl__meta">Game ' + g.n + ", " + esc(U.time(g.tip)) + " tip-off</p></div>" +
          '<div class="hksl__acts">' +
          (t ? '<a class="hksl__btn"' + ext(t) + ' aria-label="Tickets for Hawks v ' + esc(g.opp) + ", " + esc(U.longDate(g.date)) + '">Tickets</a>' : "") +
          (cw ? '<a class="hksl__btn hksl__btn--cw" data-off="' + g._cwOff + '"' + ext(cw) + ' aria-label="' + esc(courtWalkLabel(g)) + '">Court Walk tickets</a>' : "") +
          '<button class="hksl__btn hksl__btn--sec" type="button" aria-expanded="false" aria-controls="' + pid + '" aria-label="Key times for Hawks v ' + esc(g.opp) + '">Key times</button>' +
          "</div></div>" +
          '<div class="hksl__panel" id="' + pid + '" hidden><ul class="hksl__times">' + keyTimes(g, "hksl", fnTickets(g, "hksl__tbuy")) + "</ul>" +
          (previewFor(g) ? '<a class="hksl__btn hksl__btn--sec"' + ext(previewFor(g)) + ' aria-label="Read the game preview: Hawks v ' + esc(g.opp) + '">Read the game preview</a>' : "") +
          "</div>";
        var tog = li.querySelector("button"), panel = li.querySelector(".hksl__panel");
        tog.addEventListener("click", function () { toggle(tog, panel, tog.getAttribute("aria-expanded") !== "true"); });
        return li;
      }

      function build(s) {
        var games = s.i < 0 ? [] : H.data.games.slice(s.i);
        list.innerHTML = "";
        toggle(bar, list, false);
        root.hidden = !games.length;
        if (!games.length) return;
        root.querySelector(".hksl__bc").textContent = games.length + (games.length === 1 ? " game" : " games");
        games.forEach(function (g) { list.appendChild(row(g)); });
      }

      return {
        update: function (s, changed) {
          if (changed) build(s);
          /* The next game can be on today: its Court Walk button goes 4 hours before the Court Walk. */
          [].forEach.call(list.querySelectorAll(".hksl__btn--cw:not([hidden])"), function (a) {
            if (s.now >= +a.getAttribute("data-off")) a.hidden = true;
          });
        },
        openGame: function (n) {
          var li = list.querySelector('[data-n="' + n + '"]');
          if (!li || root.hidden) return false;
          toggle(bar, list, true);
          var b = li.querySelector("button[aria-expanded]");
          toggle(b, li.querySelector(".hksl__panel"), true);
          li.scrollIntoView({ block: "start" });
          return true;
        }
      };
    }
  };


  /* ---------------- plan-your-night (.hkpn) ----------------
     Three disclosure toggles, all closed on load, one open at a time.
     Copy is approved club copy from the reference embed. Links come from data.js. */
  M["plan-your-night"] = {
    css: [
      ".hkpn{--r:#FF0013;--dr:#BF0000;--k:#000;--w:#FFF;--g:#373737;--e:cubic-bezier(0.22,1,0.36,1);box-sizing:border-box;display:block;background:var(--w);color:var(--k);padding:48px 32px;margin:0;border-top:6px solid var(--k);font-family:'Poppins',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;text-align:left;scroll-margin-top:120px;}",
      ".hkpn *,.hkpn *::before,.hkpn *::after{box-sizing:border-box;}",
      ".hkpn[hidden],.hkpn [hidden]{display:none !important;}",
      ".hkpn .hkpn__inner{max-width:880px;margin:0 auto;}",
      ".hkpn .hkpn__top{text-align:center;margin:0 0 28px;}",
      ".hkpn .hkpn__hint{font-size:15px;line-height:1.5;color:var(--g);margin:10px 0 0;}",
      ".hkpn .hkpn__over{font-weight:700;font-size:12px;line-height:1.3;letter-spacing:0.06em;text-transform:uppercase;color:var(--r);margin:0 0 12px;}",
      ".hkpn .hkpn__head,.hkpn .hkpn__h3,.hkpn .hkpn__card-h{font-family:'Anton',Impact,sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:0.01em;color:var(--k);padding:0;}",
      ".hkpn .hkpn__head{line-height:0.95;font-size:clamp(28px,4.5cqw,40px);margin:0;}",
      ".hkpn .hkpn__tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin:0;padding:0;}",
      ".hkpn .hkpn__tab{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;margin:0;padding:16px 12px;background:var(--w);color:var(--k);border:2px solid var(--k);border-left-width:0;border-radius:0;cursor:pointer;font-family:'Poppins',Arial,sans-serif;font-weight:700;font-size:14px;line-height:1.2;letter-spacing:0.04em;text-transform:uppercase;text-align:center;transition:background-color 120ms var(--e),color 120ms var(--e);}",
      ".hkpn .hkpn__ic{flex:0 0 auto;position:relative;width:12px;height:12px;}",
      ".hkpn .hkpn__ic::before,.hkpn .hkpn__ic::after{content:\"\";position:absolute;left:0;top:5px;width:12px;height:2px;background:currentColor;transition:transform 120ms var(--e);}",
      ".hkpn .hkpn__ic::after{transform:rotate(90deg);}",
      ".hkpn .hkpn__tab[aria-expanded=\"true\"] .hkpn__ic::after{transform:rotate(0deg);}",
      ".hkpn .hkpn__tab:first-child{border-left-width:2px;}",
      ".hkpn .hkpn__tab:hover{background:#EDEDED;}",
      ".hkpn .hkpn__tab[aria-expanded=\"true\"]{background:var(--k);color:var(--w);}",
      ".hkpn .hkpn__tab:focus-visible{outline:2px solid var(--r);outline-offset:2px;position:relative;z-index:1;}",
      ".hkpn .hkpn__panel{border:2px solid var(--k);border-top:0;padding:32px;margin:0;scroll-margin-top:120px;}",
      ".hkpn .hkpn__lead{font-size:16px;line-height:1.55;color:var(--g);margin:0 0 24px;}",
      ".hkpn .hkpn__cols{display:grid;grid-template-columns:1fr 1fr;gap:32px;}",
      ".hkpn .hkpn__h3{font-size:22px;line-height:1;margin:0 0 12px;}",
      ".hkpn .hkpn__h3--gap{margin-top:28px;}",
      ".hkpn .hkpn__p{font-size:15px;line-height:1.55;color:var(--g);margin:0 0 12px;}",
      ".hkpn .hkpn__p--gap{margin-top:12px;}",
      ".hkpn .hkpn__label{font-weight:700;font-size:12px;line-height:1.3;letter-spacing:0.06em;text-transform:uppercase;color:var(--r);margin:16px 0 6px;}",
      ".hkpn .hkpn__list{list-style:none;margin:0;padding:0;}",
      ".hkpn .hkpn__list li{font-size:15px;line-height:1.45;color:var(--g);margin:0;padding:6px 0;border-bottom:1px solid #E2E2E2;list-style:none;}",
      ".hkpn .hkpn__list li:last-child{border-bottom:0;}",
      ".hkpn .hkpn__cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:0 0 24px;}",
      ".hkpn .hkpn__card{border-top:4px solid var(--r);background:#F4F4F4;padding:20px;margin:0;}",
      ".hkpn .hkpn__card-h{font-size:20px;line-height:1;margin:0 0 10px;}",
      ".hkpn .hkpn__card p{font-size:15px;line-height:1.55;color:var(--g);margin:0;}",
      ".hkpn .hkpn__extra{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:0 0 24px;}",
      ".hkpn .hkpn__btns{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px;}",
      ".hkpn .hkpn__btn{display:inline-block;background:var(--r);color:var(--w);font-family:'Poppins',Arial,sans-serif;font-weight:700;font-size:14px;line-height:1.2;letter-spacing:0.04em;text-transform:uppercase;text-decoration:none;text-align:center;padding:14px 22px;margin:0;border:2px solid var(--r);border-radius:0;transition:background-color 120ms var(--e),border-color 120ms var(--e),color 120ms var(--e),transform 100ms var(--e);}",
      ".hkpn .hkpn__btn:link,.hkpn .hkpn__btn:visited{color:var(--w);text-decoration:none;}",
      ".hkpn .hkpn__btn:hover{background:var(--dr);border-color:var(--dr);color:var(--w);text-decoration:none;}",
      ".hkpn .hkpn__btn:active{transform:scale(0.98);}",
      ".hkpn .hkpn__btn:focus-visible{outline:2px solid var(--k);outline-offset:2px;}",
      ".hkpn .hkpn__btn--sec,.hkpn .hkpn__btn--sec:link,.hkpn .hkpn__btn--sec:visited{background:transparent;border-color:var(--k);color:var(--k);}",
      ".hkpn .hkpn__btn--sec:hover{background:var(--k);border-color:var(--k);color:var(--w);}",
      "@container (max-width:700px){",
      ".hkpn{padding:36px 16px;}",
      ".hkpn .hkpn__tab{padding:14px 6px;font-size:12px;letter-spacing:0.02em;}",
      ".hkpn .hkpn__panel{padding:24px 16px;}",
      ".hkpn .hkpn__cols,.hkpn .hkpn__cards,.hkpn .hkpn__extra{grid-template-columns:1fr;}",
      ".hkpn .hkpn__cols{gap:28px;}",
      ".hkpn .hkpn__btn{display:block;width:100%;}",
      "}",
      "@media (prefers-reduced-motion:reduce){.hkpn .hkpn__btn,.hkpn .hkpn__tab,.hkpn .hkpn__ic::before,.hkpn .hkpn__ic::after{transition:none;}.hkpn .hkpn__btn:active{transform:none;}}"
    ].join("\n"),

    render: function (el, ctx) {
      var L = ctx.data.links;
      var names = ["plan-getting-here", "plan-eat-drink", "plan-upgrade"];
      var pid = names.map(function (n) { return ctx.primary ? n : uid(n); });
      var tid = names.map(function (n) { return uid(n + "-tab"); });
      var headId = uid("plan-head");
      function btn(url, cls, text) { return url ? '<a class="hkpn__btn' + (cls ? " " + cls : "") + '"' + ext(url) + ">" + text + "</a>" : ""; }
      function tel(url, text) { return url ? '<a class="hkpn__btn hkpn__btn--sec" href="' + esc(url) + '">' + text + "</a>" : ""; }
      function tab(i, text) {
        return '<button class="hkpn__tab" type="button" id="' + tid[i] + '" aria-controls="' + pid[i] + '" aria-expanded="false"><span>' + text + '</span><span class="hkpn__ic" aria-hidden="true"></span></button>';
      }
      function panel(i, body) { return '<div class="hkpn__panel" id="' + pid[i] + '" aria-labelledby="' + tid[i] + '" role="region" hidden>' + body + "</div>"; }

      el.innerHTML =
        '<section class="hkpn" aria-labelledby="' + headId + '"><div class="hkpn__inner">' +
        '<div class="hkpn__top"><p class="hkpn__over">Before you arrive</p><h2 class="hkpn__head" id="' + headId + '">Plan your night</h2><p class="hkpn__hint">Choose what you need.</p></div>' +
        '<div class="hkpn__tabs">' + tab(0, "Getting here") + tab(1, "Eat and drink") + tab(2, "Upgrade") + "</div>" +

        panel(0,
          '<p class="hkpn__lead">WIN Entertainment Centre sits in the Lower Crown Quarter, right in the Wollongong CBD. Give yourself extra time on game night.</p>' +
          '<div class="hkpn__cols"><div>' +
          '<h3 class="hkpn__h3">Driving and parking</h3>' +
          '<p class="hkpn__p">Take the M1 Princes Motorway into Wollongong. There are around 1,200 parking spaces within a short walk of the venue, and special event rates apply at some car parks.</p>' +
          '<p class="hkpn__label">Closest to the venue</p>' +
          '<ul class="hkpn__list"><li>Stewart Street car parks</li><li>Salvation Army car park</li><li>St Francis Xavier Cathedral, limited spaces</li><li>Woolworths car park, Burelli Street</li></ul>' +
          '<p class="hkpn__label">In the city centre</p>' +
          '<ul class="hkpn__list"><li>Market Street</li><li>Wollongong Central</li><li>Crown Central, north and south</li><li>Wollongong Station car park</li></ul>' +
          '<p class="hkpn__p hkpn__p--gap">Parking on the street? Check the signs before you walk away.</p>' +
          "</div><div>" +
          '<h3 class="hkpn__h3">Train and bus</h3>' +
          '<p class="hkpn__p">Wollongong Station is about a 15 minute walk from the venue. Check train times before you head out.</p>' +
          '<p class="hkpn__p">Several bus routes stop near WIN Entertainment Centre. Check the Transport for NSW timetable for your route.</p>' +
          '<h3 class="hkpn__h3 hkpn__h3--gap">Taxis and drop-off</h3>' +
          '<p class="hkpn__p">The venue has taxi ranks and a drop-off zone. Find the details on the venue\'s transport page.</p>' +
          "</div></div>" +
          '<div class="hkpn__btns">' + btn(L.map, "", "Open in Google Maps") + btn(L.transport, "hkpn__btn--sec", "Full venue transport info") + "</div>") +

        panel(1,
          '<p class="hkpn__lead">Game night starts long before tip-off. Everything sits inside the Lower Crown Quarter, with the ocean at the end of the street and food and drinks a few minutes from your seat.</p>' +
          '<div class="hkpn__cards">' +
          '<div class="hkpn__card"><h3 class="hkpn__card-h">Families</h3><p>Family-friendly spots for a quick dinner sit a short walk from the venue. Eat early, get in before tip-off and keep an eye out for Tomahawk.</p></div>' +
          '<div class="hkpn__card"><h3 class="hkpn__card-h">Mates</h3><p>Plenty of pubs, bars and places to eat sit within walking distance of the doors. Grab a feed and a drink with your crew, then walk straight in.</p></div>' +
          '<div class="hkpn__card"><h3 class="hkpn__card-h">Date night</h3><p>The Lower Crown Quarter has plenty of spots for dinner and a drink before the game. Pick your place, then walk to the venue together.</p></div>' +
          "</div>" +
          '<div class="hkpn__extra">' +
          '<div><h3 class="hkpn__h3">Inside the venue</h3><p class="hkpn__p">Bars and canteens run throughout WIN Entertainment Centre. Grab food early, because queues build the closer it gets to tip-off.</p></div>' +
          '<div><h3 class="hkpn__h3">After the final buzzer</h3><p class="hkpn__p">The Quarter stays open after the game. Celebrating a win or arguing about the fourth quarter, the bars are a short walk from the doors.</p></div>' +
          "</div>" +
          '<div class="hkpn__btns">' + btn(L.instagram, "", "Explore Lower Crown Quarter") + "</div>") +

        panel(2,
          '<p class="hkpn__lead">If the night is worth marking, upgrade it. A Corporate Box or a Hollywood seat turns a game into an occasion, and both work as well for a client as they do for a birthday.</p>' +
          '<p class="hkpn__p">Entertaining people you want to impress? This is the version of game night that does it.</p>' +
          '<p class="hkpn__p">Want to talk it through? Call the club office on 1300 1HAWKS and we\'ll get you sorted.</p>' +
          '<div class="hkpn__btns">' + btn(L.hospitality, "", "Explore hospitality") + tel(L.phone, "Call 1300 1HAWKS") + "</div>") +

        "</div></section>";

      var root = el.firstChild;
      var tabs = [].slice.call(root.querySelectorAll(".hkpn__tab"));
      var panels = [].slice.call(root.querySelectorAll(".hkpn__panel"));
      function show(i) {
        tabs.forEach(function (b, j) { b.setAttribute("aria-expanded", String(j === i)); panels[j].hidden = j !== i; });
      }
      tabs.forEach(function (b, i) {
        b.addEventListener("click", function () { show(b.getAttribute("aria-expanded") === "true" ? -1 : i); });
      });

      return {
        onHash: function (h) {
          var i = pid.indexOf(h.slice(1));
          if (i < 0) return;
          show(i);
          root.scrollIntoView({ block: "start" });
        }
      };
    }
  };


  /* ---------------- trivia-mvp (.hkpv) ----------------
     Two-panel slab: red panel (Fan Engagement Hub, or Hawks trivia) and Game MVP vote (black).
     Stays on after the season. With links.gamesHub set, the red panel says "Your move,
     Hawkheads" with a "Visit the Fan Engagement Hub" button; without it, Hawks trivia shows "Coming soon"
     until links.trivia is set. */
  M["trivia-mvp"] = {
    css: [
      ".hkpv{--r:#FF0013;--dr:#BF0000;--k:#000;--w:#FFF;--e:cubic-bezier(0.22,1,0.36,1);box-sizing:border-box;display:grid;grid-template-columns:1fr 1fr;margin:0;padding:0;font-family:'Poppins',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.4;text-align:center;}",
      ".hkpv *,.hkpv *::before,.hkpv *::after{box-sizing:border-box;}",
      ".hkpv[hidden],.hkpv [hidden]{display:none !important;}",
      ".hkpv .hkpv__panel{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:56px 32px;margin:0;}",
      ".hkpv .hkpv__panel--k{background:var(--k);color:var(--w);border-top:6px solid var(--r);}",
      ".hkpv .hkpv__panel--r{background:var(--r);color:var(--w);border-top:6px solid var(--k);}",
      ".hkpv .hkpv__head{font-family:'Anton',Impact,sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:0.01em;line-height:0.95;font-size:clamp(36px,5cqw,56px);color:var(--w);margin:0;padding:0;}",
      ".hkpv .hkpv__img{display:block;width:100%;max-width:320px;height:auto;aspect-ratio:1 / 1;margin:0;border:0;}",
      ".hkpv .hkpv__btn{display:inline-block;font-family:'Poppins',Arial,sans-serif;font-weight:700;font-size:16px;line-height:1.2;letter-spacing:0.04em;text-transform:uppercase;text-decoration:none;padding:16px 28px;margin:0;border:2px solid var(--w);border-radius:0;background:var(--w);color:var(--k);transition:background-color 120ms var(--e),border-color 120ms var(--e),color 120ms var(--e),transform 100ms var(--e);}",
      ".hkpv a.hkpv__btn:link,.hkpv a.hkpv__btn:visited{color:var(--k);text-decoration:none;}",
      ".hkpv a.hkpv__btn:hover{background:var(--k);border-color:var(--k);color:var(--w);text-decoration:none;}",
      ".hkpv .hkpv__panel--k a.hkpv__btn:hover{background:var(--r);border-color:var(--r);color:var(--w);}",
      ".hkpv a.hkpv__btn:active{transform:scale(0.98);}",
      ".hkpv a.hkpv__btn:focus-visible{outline:2px solid var(--w);outline-offset:2px;}",
      /* Black on red: white text on Hawks red is 3.99:1, below AA for 16px text. */
      /* Long button text wraps into even lines on phones. */
      ".hkpv .hkpv__btn{text-wrap:balance;}",
      ".hkpv .hkpv__soon{background:transparent;border-color:var(--k);color:var(--k);cursor:default;}",
      "@container (max-width:700px){",
      ".hkpv{grid-template-columns:1fr;}",
      ".hkpv .hkpv__panel{padding:40px 16px;gap:20px;}",
      ".hkpv .hkpv__btn{display:block;width:100%;max-width:320px;}",
      "}",
      "@media (prefers-reduced-motion:reduce){.hkpv .hkpv__btn{transition:none;}.hkpv a.hkpv__btn:active{transform:none;}}"
    ].join("\n"),

    render: function (el, ctx) {
      var L = ctx.data.links;
      el.innerHTML =
        '<section class="hkpv" aria-label="' + (L.gamesHub ? "Fan Engagement Hub" : "Hawks trivia") + ' and Game MVP vote">' +
        '<div class="hkpv__panel hkpv__panel--r hkpv__trivia">' +
        (L.gamesHub
          ? '<h2 class="hkpv__head">Your move, Hawkheads</h2><a class="hkpv__btn"' + ext(L.gamesHub) + ">Visit the Fan Engagement&nbsp;Hub</a>"
          : '<h2 class="hkpv__head">Hawks trivia</h2>' +
            (L.trivia ? '<a class="hkpv__btn"' + ext(L.trivia) + ">Test your knowledge</a>" : '<span class="hkpv__btn hkpv__soon">Coming soon</span>')) +
        "</div>" +
        '<div class="hkpv__panel hkpv__panel--k hkpv__mvp">' +
        (L.mvpImage ? '<img class="hkpv__img" src="' + esc(L.mvpImage) + '" width="1080" height="1080" loading="lazy" alt="Vote for your Greater Bank Game MVP">' : "") +
        (L.mvpVote ? '<a class="hkpv__btn"' + ext(L.mvpVote) + ">Place your vote</a>" : "") +
        "</div></section>";
      return {};
    }
  };


  /* ---------------- game-preview (.hkgp) ----------------
     One button for the active game's preview. With no preview yet it links to
     the News listing instead. Hidden after the season. */
  M["game-preview"] = {
    css: [
      ".hkgp{--r:#FF0013;--dr:#BF0000;--k:#000;--w:#FFF;--e:cubic-bezier(0.22,1,0.36,1);box-sizing:border-box;display:block;margin:0;padding:0;font-family:'Poppins',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.4;text-align:center;}",
      ".hkgp *,.hkgp *::before,.hkgp *::after{box-sizing:border-box;}",
      ".hkgp[hidden],.hkgp [hidden]{display:none !important;}",
      ".hkgp .hkgp__btn{display:inline-block;background:var(--r);color:var(--w);font-family:'Poppins',Arial,sans-serif;font-weight:700;font-size:16px;line-height:1.2;letter-spacing:0.04em;text-transform:uppercase;text-decoration:none;text-align:center;padding:16px 28px;margin:0;border:2px solid var(--r);border-radius:0;transition:background-color 120ms var(--e),border-color 120ms var(--e),color 120ms var(--e),transform 100ms var(--e);}",
      ".hkgp .hkgp__btn:link,.hkgp .hkgp__btn:visited{color:var(--w);text-decoration:none;}",
      ".hkgp .hkgp__btn:hover{background:var(--dr);border-color:var(--dr);color:var(--w);text-decoration:none;}",
      ".hkgp .hkgp__btn:active{transform:scale(0.98);}",
      ".hkgp .hkgp__btn:focus-visible{outline:2px solid var(--k);outline-offset:2px;}",
      "@container (max-width:600px){.hkgp .hkgp__btn{display:block;width:100%;padding:16px 20px;}}",
      "@media (prefers-reduced-motion:reduce){.hkgp .hkgp__btn{transition:none;}.hkgp .hkgp__btn:active{transform:none;}}"
    ].join("\n"),

    render: function (el, ctx) {
      el.innerHTML = '<div class="hkgp" hidden><a class="hkgp__btn" href="#"></a></div>';
      var root = el.firstChild, a = root.firstChild, news = ctx.data.links.newsListing;
      return {
        update: function (s, changed) {
          if (!changed) return;
          var g = s.game;
          if (g && previewFor(g)) { setLink(a, previewFor(g)); a.textContent = "Read the Hawks v " + g.opp + " preview"; root.hidden = false; }
          else if (g && news) { setLink(a, news); a.textContent = "Read the latest Hawks news"; root.hidden = false; }
          else root.hidden = true;
        }
      };
    }
  };


  /* ---------------- CTA block (.hkscta), shared by girls-in-the-game and newsletter ----------------
     Dark by default; data-hawks-theme="light" on the placeholder gives the white version. */
  var CTA_CSS = [
    ".hkscta{--r:#FF0013;--dr:#BF0000;--k:#000000;--w:#FFFFFF;--e:cubic-bezier(0.22,1,0.36,1);box-sizing:border-box;display:block;background:var(--k);color:var(--w);padding:48px 32px;margin:0;border-top:6px solid var(--r);text-align:center;font-family:'Poppins',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;}",
    ".hkscta *,.hkscta *::before,.hkscta *::after{box-sizing:border-box;}",
    ".hkscta[hidden],.hkscta [hidden]{display:none !important;}",
    ".hkscta .hkscta__inner{max-width:640px;margin:0 auto;}",
    ".hkscta .hkscta__overline{font-family:'Poppins',Arial,sans-serif;font-weight:700;font-size:12px;line-height:1.3;letter-spacing:0.06em;text-transform:uppercase;color:var(--r);margin:0 0 12px;}",
    ".hkscta .hkscta__heading{font-family:'Anton',Impact,sans-serif;font-weight:400;text-transform:uppercase;line-height:0.95;letter-spacing:0.01em;font-size:clamp(28px,4.5cqw,40px);color:var(--w);margin:0 0 14px;padding:0;}",
    ".hkscta .hkscta__body{font-size:16px;line-height:1.55;color:#D8D8D8;margin:0 0 28px;}",
    ".hkscta .hkscta__buttons{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;}",
    ".hkscta .hkscta__button{display:inline-block;background:var(--r);color:var(--w);font-family:'Poppins',Arial,sans-serif;font-weight:700;font-size:17px;line-height:1.2;letter-spacing:0.04em;text-transform:uppercase;text-decoration:none;padding:18px 32px;margin:0;border:2px solid var(--r);border-radius:0;transition:background-color 120ms var(--e),border-color 120ms var(--e),color 120ms var(--e),transform 100ms var(--e);}",
    ".hkscta .hkscta__button:link,.hkscta .hkscta__button:visited{color:var(--w);text-decoration:none;}",
    ".hkscta .hkscta__button:hover{background:var(--dr);border-color:var(--dr);color:var(--w);text-decoration:none;}",
    ".hkscta .hkscta__button:active{transform:scale(0.98);}",
    ".hkscta .hkscta__button:focus-visible{outline:2px solid var(--r);outline-offset:2px;}",
    ".hkscta .hkscta__button--secondary{background:transparent;border-color:var(--w);color:var(--w);}",
    ".hkscta .hkscta__button--secondary:link,.hkscta .hkscta__button--secondary:visited{color:var(--w);}",
    ".hkscta .hkscta__button--secondary:hover{background:var(--w);border-color:var(--w);color:var(--k);}",
    ".hkscta.hkscta--light{background:var(--w);color:var(--k);border-top-color:var(--k);}",
    ".hkscta.hkscta--light .hkscta__heading{color:var(--k);}",
    ".hkscta.hkscta--light .hkscta__body{color:#373737;}",
    ".hkscta.hkscta--light .hkscta__button--secondary,.hkscta.hkscta--light .hkscta__button--secondary:link,.hkscta.hkscta--light .hkscta__button--secondary:visited{border-color:var(--k);color:var(--k);}",
    ".hkscta.hkscta--light .hkscta__button--secondary:hover{background:var(--k);border-color:var(--k);color:var(--w);}",
    ".hkscta.hkscta--light .hkscta__button:focus-visible{outline-color:var(--k);}",
    "@container (max-width:600px){",
    ".hkscta{padding:36px 20px;}",
    ".hkscta .hkscta__buttons{gap:12px;}",
    ".hkscta .hkscta__button{display:block;width:100%;padding:18px 20px;font-size:17px;}",
    "}",
    "@media (prefers-reduced-motion:reduce){.hkscta .hkscta__button{transition:none;}.hkscta .hkscta__button:active{transform:none;}}"
  ].join("\n");

  /* Builds the CTA shell and returns its parts for the module to fill. */
  function ctaShell(el, ctx, overline, heading) {
    el.innerHTML =
      '<section class="hkscta' + (ctx.theme === "light" ? " hkscta--light" : "") + '"><div class="hkscta__inner">' +
      '<p class="hkscta__overline">' + esc(overline) + '</p><h2 class="hkscta__heading">' + esc(heading) + "</h2>" +
      '<p class="hkscta__body"></p><div class="hkscta__buttons"></div></div></section>';
    var root = el.firstChild;
    return { root: root, body: root.querySelector(".hkscta__body"), buttons: root.querySelector(".hkscta__buttons") };
  }
  function ctaButton(url, text, secondary) {
    return url ? '<a class="hkscta__button' + (secondary ? " hkscta__button--secondary" : "") + '"' + ext(url) + ">" + esc(text) + "</a>" : "";
  }

  /* ---------------- girls-in-the-game ----------------
     Next camp from data.js (girlsInTheGame.camps). A camp stays up until 6 hours
     after its start; with no camp to show, a "check back" line and the mailing list. */
  M["girls-in-the-game"] = {
    cssKey: "hkscta",
    css: CTA_CSS,
    render: function (el, ctx) {
      var c = ctaShell(el, ctx, "Girls in the Game", "Get her on the court"), shown;
      function nextCamp(now) {
        var list = H.data.girlsInTheGame.camps;
        for (var i = 0; i < list.length; i++) if (list[i]._end > now) return list[i];
        return null;
      }
      return {
        update: function (s) {
          var camp = nextCamp(s.now);
          if (camp === shown && shown !== undefined) return;
          shown = camp;
          if (camp) {
            c.body.textContent = U.longDate(camp.date) + ", " + U.time(camp.time) + " at " + camp.venue + "." + (camp.details ? " " + camp.details : "");
            c.buttons.innerHTML = ctaButton(camp.rego, "Register now") + ctaButton(H.data.links.newsletter, "Join the mailing list", true);
          } else {
            c.body.textContent = "Check back later in the term for dates for the next camp.";
            /* On its own, the mailing list is the main action, so it becomes the solid red button. */
            c.buttons.innerHTML = ctaButton(H.data.links.newsletter, "Join the mailing list");
          }
          var reg = c.buttons.querySelector("a:not(.hkscta__button--secondary)");
          if (reg && camp) reg.setAttribute("aria-label", "Register now: Girls in the Game, " + U.longDate(camp.date));
        }
      };
    }
  };

  /* ---------------- newsletter ----------------
     Fixed copy; the mailing list link comes from data.js (links.newsletter). */
  M["newsletter"] = {
    cssKey: "hkscta",
    css: CTA_CSS,
    render: function (el, ctx) {
      var c = ctaShell(el, ctx, "Hawks Newsletter", "Be the first to know");
      c.body.textContent = "Team news, ticket releases and game day updates, straight from us to your inbox. Sign up in seconds and stay in the loop all season.";
      c.buttons.innerHTML = ctaButton(H.data.links.newsletter, "Join the mailing list");
      return {};
    }
  };


  /* ---------------- top-10 (.hksfeats) ----------------
     All-time top 10 single-game feats, one table per stat. Data in top10.js,
     loaded only on pages with this embed. Every row that equals the record is highlighted. */
  function checkTop10(raw) {
    var out = { note: typeof raw.note === "string" ? raw.note : "", categories: [] };
    (Array.isArray(raw.categories) ? raw.categories : []).forEach(function (c, i) {
      var who = "top10.js category " + (c && c.tab ? "\"" + c.tab + "\"" : i + 1);
      if (!c || typeof c.tab !== "string" || typeof c.label !== "string" || !Array.isArray(c.rows)) { warn(who + " skipped: needs tab, label and rows"); return; }
      var rows = [];
      c.rows.forEach(function (r, j) {
        if (Array.isArray(r) && r.length === 5 && typeof r[0] === "string" && r[0].trim() && typeof r[1] === "number" && isFinite(r[1]) &&
            typeof r[2] === "string" && typeof r[3] === "string" && typeof r[4] === "string") rows.push(r);
        else warn(who + " row " + (j + 1) + " skipped: expected [\"Player\", number, \"Date\", \"Opponent\", \"Result\"]");
      });
      if (!rows.length) { warn(who + " skipped: no valid rows"); return; }
      out.categories.push({ tab: c.tab, label: c.label, record: String(c.record || ""), recordDetail: String(c.recordDetail || ""), rows: rows });
    });
    if (!out.categories.length) { fail("top10.js has no valid categories"); return null; }
    return out;
  }

  M["top-10"] = {
    extra: { file: "top10.js", global: "HAWKS_TOP10", validate: checkTop10 },
    css: [
      ".hksfeats{--r:#FF0013;--k:#000000;--w:#FFFFFF;--row:#111111;--row-alt:#0A0A0A;--line:#222222;--muted:#9A9A9A;--body:#D8D8D8;--strong:#FFFFFF;--e:cubic-bezier(0.22,1,0.36,1);box-sizing:border-box;display:block;background:var(--k);color:var(--w);padding:48px 32px;margin:0;border-top:6px solid var(--r);font-family:'Poppins',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.4;text-align:left;}",
      ".hksfeats *,.hksfeats *::before,.hksfeats *::after{box-sizing:border-box;}",
      ".hksfeats[hidden],.hksfeats [hidden]{display:none !important;}",
      ".hksfeats.hksfeats--light{background:var(--w);color:var(--k);border-top-color:var(--k);--row:#F5F5F5;--row-alt:#FFFFFF;--line:#E2E2E2;--muted:#6B6B6B;--body:#373737;--strong:#000000;}",
      ".hksfeats .hksfeats__inner{max-width:860px;margin:0 auto;}",
      ".hksfeats .hksfeats__overline{font-weight:700;font-size:12px;line-height:1.3;letter-spacing:0.06em;text-transform:uppercase;color:var(--r);margin:0 0 12px;text-align:center;}",
      ".hksfeats .hksfeats__heading{font-family:'Anton',Impact,sans-serif;font-weight:400;text-transform:uppercase;line-height:0.95;letter-spacing:0.01em;font-size:clamp(28px,4.5cqw,40px);color:var(--strong);margin:0 0 14px;padding:0;text-align:center;}",
      ".hksfeats .hksfeats__intro{font-size:15px;line-height:1.55;color:var(--body);margin:0 auto 28px;max-width:560px;text-align:center;}",
      ".hksfeats .hksfeats__tabs{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin:0 0 24px;padding:0;}",
      ".hksfeats .hksfeats__tab{font-family:'Poppins',Arial,sans-serif;font-weight:700;font-size:13px;line-height:1.2;letter-spacing:0.05em;text-transform:uppercase;color:var(--strong);background:transparent;border:2px solid var(--line);border-radius:0;padding:10px 16px;margin:0;cursor:pointer;transition:background-color 120ms var(--e),border-color 120ms var(--e),color 120ms var(--e),transform 100ms var(--e);}",
      ".hksfeats .hksfeats__tab:hover{border-color:var(--r);}",
      ".hksfeats .hksfeats__tab:active{transform:scale(0.98);}",
      ".hksfeats .hksfeats__tab:focus-visible{outline:2px solid var(--r);outline-offset:2px;}",
      ".hksfeats .hksfeats__tab[aria-pressed=\"true\"]{background:var(--r);border-color:var(--r);color:var(--w);}",
      ".hksfeats .hksfeats__record{display:flex;align-items:baseline;justify-content:center;gap:14px;flex-wrap:wrap;border:2px solid var(--r);padding:16px 20px;margin:0 0 20px;}",
      ".hksfeats .hksfeats__record-label{font-weight:700;font-size:11px;line-height:1.3;letter-spacing:0.08em;text-transform:uppercase;color:var(--r);}",
      ".hksfeats .hksfeats__record-stat{font-family:'Anton',Impact,sans-serif;font-size:clamp(22px,3.2cqw,30px);text-transform:uppercase;line-height:1;color:var(--strong);}",
      ".hksfeats .hksfeats__record-detail{font-size:13px;line-height:1.4;color:var(--muted);}",
      ".hksfeats .hksfeats__tablewrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:0;}",
      ".hksfeats .hksfeats__table{width:100%;border-collapse:collapse;font-size:14px;line-height:1.4;margin:0;background:transparent;border:0;}",
      ".hksfeats .hksfeats__caption{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;}",
      ".hksfeats .hksfeats__table th{font-weight:700;font-size:11px;line-height:1.3;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);text-align:left;padding:10px 12px;border:0;border-bottom:2px solid var(--r);white-space:nowrap;background:transparent;}",
      ".hksfeats .hksfeats__table td{font-size:14px;line-height:1.4;padding:12px;border:0;border-bottom:1px solid var(--line);color:var(--body);white-space:nowrap;text-align:left;}",
      ".hksfeats .hksfeats__table tbody tr:nth-child(odd){background:var(--row);}",
      ".hksfeats .hksfeats__table tbody tr:nth-child(even){background:var(--row-alt);}",
      ".hksfeats .hksfeats__table .hksfeats__rank{font-family:'Anton',Impact,sans-serif;font-size:18px;line-height:1.2;color:var(--muted);width:44px;text-align:center;}",
      ".hksfeats .hksfeats__table .hksfeats__player{font-weight:700;color:var(--strong);}",
      ".hksfeats .hksfeats__table .hksfeats__stat{font-family:'Anton',Impact,sans-serif;font-size:18px;line-height:1.2;color:var(--strong);letter-spacing:0.02em;}",
      /* Record rows: a red left edge and full-strength text (no dark red background). */
      ".hksfeats .hksfeats__table tr.hksfeats__row--record td{color:var(--strong);}",
      ".hksfeats .hksfeats__table tr.hksfeats__row--record td:first-child{box-shadow:inset 4px 0 0 var(--r);}",
      ".hksfeats .hksfeats__note{font-size:13px;line-height:1.5;color:var(--muted);margin:18px 0 0;text-align:center;}",
      "@container (max-width:600px){",
      ".hksfeats{padding:36px 16px;}",
      ".hksfeats .hksfeats__table th.hksfeats__col--extra,.hksfeats .hksfeats__table td.hksfeats__col--extra{display:none;}",
      ".hksfeats .hksfeats__table td,.hksfeats .hksfeats__table th{padding:10px 8px;}",
      "}",
      /* Small phones: tighter cells, and long names wrap so the table fits without sideways scrolling. */
      "@container (max-width:420px){",
      ".hksfeats .hksfeats__table td,.hksfeats .hksfeats__table th{padding:9px 5px;}",
      ".hksfeats .hksfeats__table td{font-size:13px;}",
      ".hksfeats .hksfeats__table .hksfeats__rank{width:26px;font-size:16px;}",
      ".hksfeats .hksfeats__table .hksfeats__stat{font-size:16px;}",
      ".hksfeats .hksfeats__table .hksfeats__player{white-space:normal;min-width:72px;}",
      "}",
      "@media (prefers-reduced-motion:reduce){.hksfeats .hksfeats__tab{transition:none;}.hksfeats .hksfeats__tab:active{transform:none;}}"
    ].join("\n"),

    render: function (el, ctx) {
      var T = ctx.extra, groupId = uid("top10-cats");
      el.innerHTML =
        '<section class="hksfeats' + (ctx.theme === "light" ? " hksfeats--light" : "") + '"><div class="hksfeats__inner">' +
        '<p class="hksfeats__overline">Hawks History</p>' +
        '<h2 class="hksfeats__heading">All-Time Top 10 Single-Game Feats</h2>' +
        '<p class="hksfeats__intro">The biggest individual performances in Hawks history - every game since 1979, one table per stat. Pick a category.</p>' +
        '<div class="hksfeats__tabs" role="group" aria-label="Stat categories" id="' + groupId + '">' +
        T.categories.map(function (c, i) { return '<button class="hksfeats__tab" type="button" aria-pressed="' + (i === 0) + '" data-i="' + i + '">' + esc(c.tab) + "</button>"; }).join("") +
        "</div>" +
        '<div class="hksfeats__record" aria-live="polite"><span class="hksfeats__record-label">Club record</span><span class="hksfeats__record-stat"></span><span class="hksfeats__record-detail"></span></div>' +
        '<div class="hksfeats__tablewrap"><table class="hksfeats__table"><caption class="hksfeats__caption"></caption><thead><tr>' +
        '<th scope="col">#</th><th scope="col">Player</th><th scope="col" class="hksfeats__statcol"></th><th scope="col">Date</th>' +
        '<th scope="col" class="hksfeats__col--extra">Opponent</th><th scope="col" class="hksfeats__col--extra">Result</th>' +
        "</tr></thead><tbody></tbody></table></div>" +
        (T.note ? '<p class="hksfeats__note">' + esc(T.note) + "</p>" : "") +
        "</div></section>";
      var root = el.firstChild, q = function (c) { return root.querySelector(c); };
      var tabs = [].slice.call(root.querySelectorAll(".hksfeats__tab"));

      function show(i) {
        var c = T.categories[i], top = c.rows[0][1];
        tabs.forEach(function (b, j) { b.setAttribute("aria-pressed", String(j === i)); });
        q(".hksfeats__record-stat").textContent = c.record;
        q(".hksfeats__record-detail").textContent = c.recordDetail;
        q(".hksfeats__record").hidden = !c.record;
        q(".hksfeats__caption").textContent = "Top 10 single-game feats: " + c.tab;
        q(".hksfeats__statcol").textContent = c.label;
        q("tbody").innerHTML = c.rows.map(function (r, n) {
          return "<tr" + (r[1] === top ? ' class="hksfeats__row--record"' : "") + ">" +
            '<td class="hksfeats__rank">' + (n + 1) + '</td><td class="hksfeats__player">' + esc(r[0]) + '</td><td class="hksfeats__stat">' + r[1] + "</td>" +
            "<td>" + esc(r[2]) + '</td><td class="hksfeats__col--extra">' + esc(r[3]) + '</td><td class="hksfeats__col--extra">' + esc(r[4]) + "</td></tr>";
        }).join("");
      }
      tabs.forEach(function (b, i) { b.addEventListener("click", function () { show(i); }); });
      show(0);
      return {};
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
    /* jsDelivr tells browsers to keep files for up to 7 days. The ?v= value changes every
       10 minutes so browsers re-check data.js; jsDelivr ignores it, so its cache and purge still apply. */
    s.src = base + "data.js?v=" + Math.floor(Date.now() / 600000);
    s.onload = start;
    s.onerror = function () { fail("could not load " + s.src + ". Embeds are showing their fallback links."); };
    (D.head || D.documentElement).appendChild(s);
  }
})();
