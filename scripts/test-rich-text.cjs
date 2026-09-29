const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");
const path = require("node:path");
const filename = path.resolve("src/lib/rich-text.ts");
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const m = new Module(filename, module);
m.filename = filename;
m.paths = module.paths;
m._compile(compiled, filename);
const {
  RICH_PREFIX: P,
  richHtml,
  richPlain,
  cleanHtml,
  safeHref,
  normalizeRich,
  validRich,
} = m.exports;
assert.equal(
  richHtml("<b>eski düz yazı</b>"),
  "<" + "p>&lt;b&gt;eski düz yazı&lt;/b&gt;</p>",
);
assert.equal(
  richPlain(P + "<p><strong>Kalın</strong> &amp; &#x1F600;&nbsp;metin</p>"),
  "Kalın & 😀\u00a0metin",
);
assert.equal(richPlain(P + "<p>bir<br>iki</p><p>üç</p>"), "bir\niki\nüç");
for (const bad of [
  "javascript:alert(1)",
  "data:text/html,evil",
  "//evil.test",
  "/\\evil.test",
  "vbscript:evil",
])
  assert.equal(safeHref(bad), "");
assert.equal(safeHref("/rules"), "/rules");
assert.equal(safeHref("https://example.org/a"), "https://example.org/a");
const dirty =
  '<p style="text-align:center;color:red" onclick="evil()"><strong>Güvenli</strong><script>alert(1)</script><img src=x onerror=evil()><a href="javascript:evil()">bağ</a><iframe src="https://evil.test"></iframe></p>';
const sanitized = cleanHtml(dirty);
assert(!/script|onclick|onerror|iframe|javascript:|color:red/.test(sanitized));
assert(sanitized.includes("text-align:center"));
assert(sanitized.includes("<strong>Güvenli</strong>"));
assert(
  cleanHtml('<a href="https://example.org">Bağ</a>').includes(
    'rel="noopener noreferrer"',
  ),
);
const saved = normalizeRich(P + dirty);
assert.equal(normalizeRich(saved), saved);
assert.equal(richHtml(saved), sanitized);
assert(validRich(P + "<p><strong>" + "a".repeat(280) + "</strong></p>", 280));
assert(!validRich(P + "<p>" + "a".repeat(281) + "</p>", 280));
assert(!validRich(P + "<p><br></p>", 500, 1));
assert(!validRich(normalizeRich("a".repeat(250001)), 50000));
assert(
  cleanHtml(
    "<table><tbody><tr><td><p><em>Hücre</em></p></td></tr></tbody></table>",
  ).includes("<em>Hücre</em>"),
);
console.log(
  "PASS: legacy content, formatting, entity decoding, links, XSS, limits and save/reopen serialization.",
);
