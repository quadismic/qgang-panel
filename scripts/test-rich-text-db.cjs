const { PGlite } = require("@electric-sql/pglite");
const fs = require("node:fs");
const assert = require("node:assert/strict");
(async () => {
  const db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create role service_role;create table profiles(bio text);create table profile_comments(body text);create table fund_transactions(description text);create table reports(reason text);create table posts(body text);create table comments(body text);create table moderation_actions(reason text);create table moderation_appeals(body text);create table publications(body text,excerpt text);`,
  );
  await db.exec(
    fs.readFileSync(
      "supabase/migrations/20260929074842_rich_text_content_limits.sql",
      "utf8",
    ),
  );
  for (const [input, n] of [
    ["old plain", 9],
    ["<!--qgang-rich:v1--><p><strong>Test</strong> &amp; bağ</p>", 10],
    ["<!--qgang-rich:v1--><p>bir<br>iki</p><p>üç</p>", 10],
  ]) {
    const r = await db.query("select public.qg_content_length($1) n", [input]);
    assert.equal(r.rows[0].n, n);
  }
  await db.query("insert into profiles values ($1)", [
    "<!--qgang-rich:v1--><p><strong>" + "a".repeat(280) + "</strong></p>",
  ]);
  await assert.rejects(() =>
    db.query("insert into profiles values ($1)", [
      "<!--qgang-rich:v1--><p>" + "a".repeat(281) + "</p>",
    ]),
  );
  await assert.rejects(() =>
    db.query("insert into moderation_appeals values ($1)", [
      "<!--qgang-rich:v1--><p>abc</p>",
    ]),
  );
  await db.exec("drop table posts; drop table comments;");
  await db.exec(
    fs.readFileSync(
      "supabase/migrations/20260929074842_rich_text_content_limits.sql",
      "utf8",
    ),
  );
  console.log(
    "PASS: migration applies with and without legacy feed tables; text counts and constraints.",
  );
  await db.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
