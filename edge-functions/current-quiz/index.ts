// Supabase Edge Function: current-quiz
// Deploy this in the QUIZ project (not this repo's site). It returns the one published quiz:
//   { "title": "...", "description": "...", "closes_at": "2026-11-03T13:40:00Z", "url": "https://quiz.illawarra-hawks.com.au/" }
// The Hawks Games embed (data.js gamesPortal.quizApi) calls it from hawks.com.au.
//
// Set these before deploying (Project Settings, Edge Functions, Secrets). No key is ever sent to the browser.
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (both are provided to Edge Functions automatically)
//
// CHANGE ME: the three names below are placeholders. They must match the quiz project's real
// table and columns. Nothing here has been checked against that project.
const TABLE = "CHANGE_ME_quizzes_table";
const COLS = { title: "title", description: "description", closesAt: "closes_at" };
const PUBLISHED = { column: "CHANGE_ME_status_column", value: "published" };

// Exact origins only, never "*". CHANGE ME: add the Webflow staging address (yoursite.webflow.io) when known.
const ALLOWED_ORIGINS = [
  "https://www.hawks.com.au",
  // "https://CHANGE_ME.webflow.io",
];
const QUIZ_URL = "https://quiz.illawarra-hawks.com.au/";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

function cors(origin: string | null): Record<string, string> {
  const h: Record<string, string> = { "Vary": "Origin" };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Access-Control-Allow-Methods"] = "GET, OPTIONS";
    h["Access-Control-Allow-Headers"] = "content-type";
  }
  return h;
}

Deno.serve(async (req) => {
  const base = cors(req.headers.get("Origin"));
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: base });
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405, headers: base });

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data, error } = await db
    .from(TABLE)
    .select(`${COLS.title}, ${COLS.description}, ${COLS.closesAt}`)
    .eq(PUBLISHED.column, PUBLISHED.value)
    .order(COLS.closesAt, { ascending: true })
    .limit(1)
    .maybeSingle();

  const json = { "Content-Type": "application/json" };
  if (error || !data) {
    // The embed shows "This week's Hawks quiz" and hides the countdown when this fails.
    return new Response(JSON.stringify({ error: "no published quiz" }), { status: error ? 500 : 404, headers: { ...base, ...json, "Cache-Control": "no-store" } });
  }
  const body = { title: data[COLS.title], description: data[COLS.description] ?? "", closes_at: data[COLS.closesAt], url: QUIZ_URL };
  return new Response(JSON.stringify(body), { headers: { ...base, ...json, "Cache-Control": "public, max-age=300" } });
});
