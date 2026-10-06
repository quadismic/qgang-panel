const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");
const path = require("node:path");
const filename = path.resolve("src/lib/rich-text.ts");
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
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
// Editorial media must survive save/reopen while arbitrary embeds stay blocked.
const media = P+'<figure data-width="text"><img src="https://example.org/picture.png" alt="Örnek"/><figcaption>Açıklama</figcaption></figure><aside data-tone="warning"><p>Uyarı</p></aside><div data-divider="true">Bölüm</div><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" title="Video"></iframe>';
const savedMedia = normalizeRich(media);
assert.equal(normalizeRich(savedMedia),savedMedia);
assert(richHtml(savedMedia).includes('<figure'));
assert(richHtml(savedMedia).includes('data-tone="warning"'));
assert(richHtml(savedMedia).includes('youtube-nocookie.com/embed/dQw4w9WgXcQ'));
assert(!cleanHtml('<iframe src="https://evil.test/embed/anything"></iframe>').includes('<iframe'));
assert(!cleanHtml('<img src="data:image/svg+xml,evil" onerror="evil()"/>').includes('<img'));
assert.equal(m.exports.videoEmbed('https://youtu.be/dQw4w9WgXcQ'),'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
assert.equal(m.exports.videoEmbed('https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ'),'');
assert.equal(m.exports.mediaUrl('https://user:secret@example.org/a'),'');
console.log('PASS: media persistence, callouts, dividers and restricted video embeds.');
const blocks=m.exports.documentBlocks(P+'<p>Önce</p><figure><img src="https://example.org/a.png" alt="Resim"/><figcaption>Görsel açıklaması</figcaption></figure><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" title="Tanıtım"></iframe><p>Sonra</p>');
assert.deepEqual(blocks.map(b=>[b.kind,b.text]),[['text','Önce'],['image','Görsel açıklaması'],['video','Tanıtım'],['text','Sonra']]);
console.log('PASS: PDF media/text order and descriptions.');
const {footnoteHtml}=m.exports;
const footnotes = normalizeRich(P+'<p>Bir<sup data-footnote="true" data-note="Kaynak &quot;eser&quot; &lt;script&gt;" data-source="https://example.com">9</sup> iki<sup data-footnote="true" data-note="İkinci" data-source="javascript:alert(1)">42</sup></p>');
assert(footnotes.includes('data-note='));
assert.equal(normalizeRich(footnotes),footnotes);
const rendered=footnoteHtml(richHtml(footnotes),'test');
assert(rendered.includes('href="#test-note-1"'));
assert(rendered.includes('href="#test-ref-2"'));
assert(rendered.includes('Kaynak &quot;eser&quot; &lt;script&gt;'));
assert(!rendered.includes('javascript:'));
assert(!rendered.includes('>42<'));
assert.equal(footnoteHtml(richHtml(P+'<p>Not yok</p>'),'test'),'<p>Not yok</p>');
assert(!footnoteHtml(richHtml(P+'<p>Bir</p>'),'test').includes('qgFootnotes'));
console.log('Footnote roundtrip, numbering, navigation and escaping passed');
