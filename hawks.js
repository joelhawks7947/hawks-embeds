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
      try {
        addFonts();
        addCss(name, mod.css);
        var x = mod.render(el, { primary: primaries[name] === el, state: s, data: H.data }) || {};
        x.name = name; x.el = el; x.primary = primaries[name] === el;
        H.instances.push(x);
        added = true;
      } catch (e) {
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
