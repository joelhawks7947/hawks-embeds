/* ================================================================
   ILLAWARRA HAWKS EMBEDS: LOADER
   Every embed on hawks.com.au points at this file:
   https://cdn.jsdelivr.net/gh/joelhawks7947/hawks-embeds@main/hawks.js

   It only loads hawks-core.js (the real code) from the same folder.
   jsDelivr lets browsers keep this file for up to 7 days, so it is kept
   tiny and should never need to change. hawks-core.js is requested with
   a ?v= value that changes every 10 minutes, so code changes reach
   everyone soon after a purge. jsDelivr ignores the ?v= value, so its
   own cache and the purge links still work.
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
  var s = D.createElement("script");
  s.src = me.src.replace(/[^\/?#]*([?#].*)?$/, "") + "hawks-core.js?v=" + Math.floor(Date.now() / 600000);
  s.onerror = function () { if (W.console) console.error("[hawks] could not load " + s.src + ". Embeds are showing their fallback links."); };
  (D.head || D.documentElement).appendChild(s);
})();
