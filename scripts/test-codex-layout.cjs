const fs=require('fs'),vm=require('vm'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),assert=require('node:assert/strict');
const cache={};
function load(file){if(cache[file])return cache[file].exports;const m={exports:{}};cache[file]=m;const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(name=>{
if(name==='@/components/RichText')return {RichText:({value})=>React.createElement('div',null,value)};
if(name==='@/components/CodexComposer')return {CodexComposer:()=>null};
if(name==='@/components/CodexCompilation')return {CodexCompilation:()=>null};
if(name.startsWith('@/'))return load('src/'+name.slice(2)+(name.includes('components/')?'.tsx':'.ts'));
if(name.startsWith('.')){const base=require('path').resolve(require('path').dirname(file),name);return load(base+(fs.existsSync(base+'.tsx')?'.tsx':'.ts'));}
return require(name);},m,m.exports);return m.exports;}
const {CodexWorkspace}=load('src/components/CodexWorkspace.tsx');
const base={body:'<p>Metin &amp; açıklama</p>',section_number:'03',status:'yururlukte',revision:1,effective_at:null,updated_at:null,created_by:null,basis_rule_id:null,basis_revision:null};
const rules=[{...base,id:'rule',kind:'KURAL',number:'03.12',title:'Temel kural',published_at:'2026-09-01'}, {...base,id:'old',kind:'KARAR',number:'03.12/01',title:'Eski karar',published_at:'2026-10-01'}, {...base,id:'new',kind:'KARAR',number:'03.12/02',title:'Yeni karar',published_at:'2026-10-06'}, {...base,id:'directive',kind:'YÖNERGE',number:'03.12/03',title:'Uzun yönerge başlığı',published_at:'2026-10-02',basis_rule_id:'rule'}];
const render=props=>renderToStaticMarkup(React.createElement(CodexWorkspace,{rules,sections:[{number:'03',title:'YÖNETİM'}],heroImage:'',issuers:[],revisions:[],action:async()=>{},...props}));
let html=render({initialTab:'decisions'});assert(html.includes('codexLayout-decisions'));assert(html.indexOf('Yeni karar')<html.indexOf('Eski karar'));assert(!html.includes('codexV3Section'));assert(!html.includes('Listeye dön'));
html=render({initialTab:'directives'});assert(html.includes('§ 03.12/03'));assert(html.includes('DAYANAK § 03.12'));assert(!html.includes('codexV3Section'));
html=render({initialRule:'directive'});assert(html.includes('codexLayout-directives hasSelection'));assert(html.includes('Listeye dön'));assert(html.includes('DAYANAK § 03.12 — Temel kural'));
html=render({initialTab:'primary'});assert(html.includes('codexV3Section'));assert(!html.includes('codexDocumentList'));assert.equal((html.match(/aria-pressed=/g)||[]).length,3);
console.log('PASS Codex: three modes, newest-first decisions, standalone document lists, long provision number, basis link, deep-linked reader and back control');
