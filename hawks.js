/* ================================================================
   ILLAWARRA HAWKS EMBEDS: LOADER
   Every embed on hawks.com.au points at this file:
   https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js

   It only loads hawks-core.js (the real code). jsDelivr lets browsers
   keep this file for up to 7 days, so it is kept tiny and should never
   need to change.

   The core comes from GitHub Pages, which updates about a minute after
   every commit with no purge. If Pages fails or takes over 5 seconds,
   it comes from jsDelivr instead. The ?v= value changes every 10
   minutes so browsers re-check; both hosts ignore it for their own
   caches. When this file is loaded from anywhere else (local tests),
   the core comes from the same folder.
   ================================================================ */
(function () {
  var W = window, D = document;
  /* Core already running: look for any new placeholders. */
  if (W.__hawksEmbeds) { W.__hawksEmbeds.scan(); return; }
  /* Core already requested by an earlier copy of this tag: it scans the whole page when it arrives. */
  if (W.__hawksLoader) return;
  var me = D.currentScript;
  if (!me || !me.src) { if (W.console) console.error("[hawks] could not work out where hawks.js was loaded from"); return; }
  W.__hawksLoader = true;
  var base = me.src.replace(/[^\/?#]*([?#].*)?$/, "");
  var hosts = /^https:\/\/cdn\.jsdelivr\.net\/gh\/joelhawks7947\/hawks-embeds@/.test(base) ? ["https://joelhawks7947.github.io/hawks-embeds/", base] : [base];
  var v = "hawks-core.js?v=" + Math.floor(Date.now() / 600000), done = false;
  function attempt(i) {
    var s = D.createElement("script"), moved = false, t;
    function next() {
      if (moved || done) return;
      moved = true; clearTimeout(t);
      if (i + 1 < hosts.length) { if (W.console) console.warn("[hawks] could not load " + s.src + "; trying " + hosts[i + 1]); attempt(i + 1); }
      else { done = true; if (W.console) console.error("[hawks] could not load " + s.src + ". Embeds are showing their fallback links."); }
    }
    s.src = hosts[i] + v;
    s.onload = function () { done = true; clearTimeout(t); };
    s.onerror = next;
    if (i + 1 < hosts.length) t = setTimeout(next, 5000);
    (D.head || D.documentElement).appendChild(s);
  }
  attempt(0);
})();
