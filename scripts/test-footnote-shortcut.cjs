const fs=require('fs'),vm=require('vm'),ts=require('typescript'),React=require('react'),assert=require('node:assert/strict');
let cursor=0,slots=[],options,inserted;
const hooks={...React,useId:()=> 'test-editor',useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v}];},useRef(initial){const i=cursor++;if(!(i in slots))slots[i]={current:initial};return slots[i];},useMemo:fn=>fn(),useEffect:()=>{}};
const state={selection:{from:2,to:8},doc:{nodeAt:()=>null}};
const chain={focus(){return this},insertContentAt(pos,node){inserted={pos,node};return this},run(){return true}};
const editor={state,isActive:()=>false,chain:()=>chain,commands:{focus(){}}};
const m={exports:{}};const code=ts.transpileModule(fs.readFileSync('src/components/RichTextEditorImpl.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(name=>{
 if(name==='react')return hooks;
 if(name==='@tiptap/react')return {useEditor:input=>{options=input;return editor},EditorContent:()=>null};
 if(name==='@/lib/supabase/client')return {createClient(){throw Error('unexpected network')}};
 if(name==='./RichText')return {RichText:()=>null};
 if(name==='./ContentBlocks')return {};
 if(name==='./Footnote')return {};
 if(name==='@/lib/rich-text')return {RICH_PREFIX:'<!--qgang-rich:v1-->',richHtml:v=>v,richPlain:v=>v,safeHref:v=>/^https:\/\//.test(v)?v:null};
 return require(name);
},m,m.exports);
const render=props=>{cursor=0;return m.exports.RichTextEditor(props)};
function find(node,predicate){if(!node)return null;if(Array.isArray(node)){for(const item of node){const found=find(item,predicate);if(found)return found;}return null;}if(typeof node!=='object')return null;if(predicate(node))return node;return find(node.props?.children,predicate);}
let tree=render({footnotes:true});let prevented=false;
assert.equal(options.editorProps.handleKeyDown({state},{key:'f',ctrlKey:true,altKey:true,preventDefault(){prevented=true}}),true);assert(prevented);
tree=render({footnotes:true});let textarea=find(tree,n=>n.type==='textarea'&&n.props.placeholder?.includes('Yazar'));assert(textarea);textarea.props.onChange({target:{value:'Kaynak, 2026, s. 12'}});
tree=render({footnotes:true});find(tree,n=>n.type==='button'&&n.props.children==='Dipnotu kaydet').props.onClick();assert.equal(inserted.pos,8);assert.equal(inserted.node.attrs.note,'Kaynak, 2026, s. 12');assert.equal(state.selection.from,2);
slots=[];tree=render({footnotes:true});find(tree,n=>n.type==='button'&&n.props.title==='Dipnot ekle (Ctrl+Alt+F)').props.onClick();tree=render({footnotes:true});assert(find(tree,n=>n.props?.['aria-label']==='Dipnot düzenle'));
slots=[];render({footnotes:false});assert.equal(options.editorProps.handleKeyDown({state},{key:'f',ctrlKey:true,altKey:true}),false);
slots=[];tree=render({compact:true});assert(find(tree,n=>n.props?.['aria-label']==='Temel biçimlendirme'));assert(find(tree,n=>n.props?.['aria-label']==='Başlıklar'));assert(find(tree,n=>n.props?.title==='Görsel ekle'));assert(find(tree,n=>n.props?.['aria-label']==='Diğer biçimlendirme seçenekleri'));assert(!find(tree,n=>n.props?.title==='Dipnot ekle (Ctrl+Alt+F)'));
console.log('PASS button/shortcut equivalence, captured selection end without replacing text, note data, shortcut scope and grouped compact toolbar');
