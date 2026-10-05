const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict');
const moduleShim={exports:{}};new Function('exports',ts.transpile(fs.readFileSync('src/lib/external-content.ts','utf8'),{module:ts.ModuleKind.CommonJS}))(moduleShim.exports);
const {deferredContent}=moduleShim.exports;
const video='<iframe src="https://www.youtube-nocookie.com/embed/abcdefghijk" title="Video"></iframe>';
assert(!deferredContent(video,new Set()).includes('<iframe'));assert(deferredContent(video,new Set(['https://www.youtube-nocookie.com/embed/abcdefghijk'])).includes('<iframe'));
const image='<img src="https://outside.example/image.jpg" alt="Test">';assert(!deferredContent(image,new Set()).includes('<img'));assert(deferredContent(image,new Set(['https://outside.example/image.jpg'])).includes('<img'));
assert(deferredContent('<img src="/logo.png">',new Set()).includes('<img'));assert(deferredContent('<img src="https://kttebbvinfmauthmayqp.supabase.co/storage/v1/object/public/example.png">',new Set()).includes('<img'));
assert(!deferredContent('<img src="https://q-gang.com.attacker.example/image.jpg">',new Set()).includes('<img'));
console.log('PASS: external images and video have no loading element before activation; trusted media remain immediate; hostname lookalikes are deferred.');
