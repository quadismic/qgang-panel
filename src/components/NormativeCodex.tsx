import Image from "next/image";
import Link from "next/link";
import {brandTheme} from "@/config/brand-theme";
import {QGIcon,type QGIconName} from "@/components/QGIcon";
import {RichText} from "@/components/RichText";
import {isEffective} from "@/lib/codex";
import {richPlain} from "@/lib/rich-text";
import {textPreview} from "@/lib/text-preview";

export type NormativeTab="primary"|"directives"|"decisions";
export type NormativeDocument={
 id:string;title:string;body:string|null;number:string|null;status:string|null;
 published_at:string|null;effective_at:string|null;
};
const tabs:{id:NormativeTab;label:string;icon:QGIconName}[]=[
 {id:"primary",label:"Kodeks",icon:"rules"},
 {id:"directives",label:"Yönergeler",icon:"document"},
 {id:"decisions",label:"İcra Kararları",icon:"discipline"},
];
const tabHref=(tab:NormativeTab)=>tab==="primary"?"/kodeks":`/kodeks?tab=${tab}`;
const dateFormat=new Intl.DateTimeFormat("tr-TR",{dateStyle:"long",timeZone:"Europe/Istanbul"});
function DateLabel({value}:{value:string|null}){
 return value?<time dateTime={value}>{dateFormat.format(new Date(value))}</time>:<>—</>;
}
function NoteRef({number}:{number:number}){
 return <sup><a id={`kodeks-atif-${number}`} href={`#kodeks-dipnot-${number}`} aria-label={`Dipnot ${number}`}>{number}</a></sup>;
}
function CodexText(){
 return <>
  <header className="normativeHeading">
   <Image src={brandTheme.mark} width={64} height={64} alt=""/>
   <div><span className="kicker">Normatif Düzen</span><h1>Q-GANG Kodeksi</h1></div>
  </header>
  <ol className="normativeParagraphs" role="list">
   <li><p>Q-GANG (resmî adıyla “Q-GANG GAMING COMMUNITY”), dijital oyunlar etrafında bir araya gelen bağımsız ve gönüllü bir oyun topluluğudur. Topluluğun amacı, üyelerinin birlikte vakit geçirmesi, dostluk ve dayanışma ilişkileri kurması ve ortak ilgi alanlarını paylaşması olarak özetlenebilir.</p></li>
   <li><p>Q-GANG’in idare ve temsili LİDER’e aittir. Bu çerçevede LİDER, topluluğa ilişkin her türlü düzenlemeyi<NoteRef number={1}/> yapabilir, karar alabilir<NoteRef number={2}/>, görev ve yetki verebilir, verdiği yetkileri sınırlandırabilir veya geri alabilir.</p></li>
   <li><p>Kodeks, Q-GANG’in en üst yazılı düzenlemesidir. Yönergeler ve İcra Kararları Kodeks’e aykırı olamaz.</p></li>
  </ol>
  <section className="normativeNotes" aria-labelledby="kodeks-dipnotlar">
   <h2 id="kodeks-dipnotlar">Dipnotlar</h2>
   <ol>
    <li id="kodeks-dipnot-1" tabIndex={-1}><strong>Yönerge:</strong> Topluluğun işleyişine ilişkin genel kuralları ifade eder. <a href="#kodeks-atif-1" aria-label="Birinci dipnotun atfına dön">↩</a></li>
    <li id="kodeks-dipnot-2" tabIndex={-1}><strong>İcra Kararı:</strong> Belirli kişi, olay ve işlemler hakkında alınan gerekçeli kararları ifade eder. <a href="#kodeks-atif-2" aria-label="İkinci dipnotun atfına dön">↩</a></li>
   </ol>
  </section>
 </>;
}
export function NormativeCodex({tab,documents,selected,error,canManage}:{tab:NormativeTab;documents:NormativeDocument[];selected?:NormativeDocument;error:boolean;canManage:boolean}){
 const decisions=tab==="decisions";
 const heading=tabs.find(item=>item.id===tab)!.label;
 return <section className="normativeCodex" aria-label="Normatif Düzen">
  <nav className="normativeNav" aria-label="Kodeks bölümleri">
   {tabs.map(item=><Link key={item.id} href={tabHref(item.id)} aria-current={tab===item.id?"page":undefined}><QGIcon name={item.icon}/>{item.label}</Link>)}
  </nav>
  <div className="normativeReader">
   {tab==="primary"?<CodexText/>:<>
    <header className="normativeHeading"><div><span className="kicker">Normatif Düzen</span><h1>{heading}</h1></div></header>
    {error?<p role="alert">Belgeler yüklenemedi. Lütfen tekrar dene.</p>:selected?<article className="normativeDocument">
     <Link className="normativeBack" href={tabHref(tab)}>← Listeye dön</Link>
     <h2>{selected.title}</h2>
     <DocumentInfo document={selected} decisions={decisions}/>
     {selected.body&&<RichText value={selected.body}/>}
    </article>:documents.length?<ul className="normativeDocuments">
     {documents.map(document=><li key={document.id}><article>
      <Link className="normativeDocumentLink" href={`${tabHref(tab)}&rule=${encodeURIComponent(document.id)}`}>{document.title}</Link>
      {!decisions&&document.body&&<p>{textPreview(richPlain(document.body),180)}</p>}
      <DocumentInfo document={document} decisions={decisions}/>
     </article></li>)}
    </ul>:<p className="normativeEmpty">Henüz yayımlanmış {decisions?"icra kararı":"yönerge"} yok.</p>}
   </>}
   {canManage&&<footer className="normativeManagement"><Link href={`/kodeks?manage=1&tab=${tab==="primary"?"directives":tab}`}>Belge yönetimi</Link></footer>}
  </div>
 </section>;
}
function DocumentInfo({document,decisions}:{document:NormativeDocument;decisions:boolean}){
 const effective=isEffective(document);
 return <dl className="normativeInfo">
  {decisions&&<><div><dt>Nitelik</dt><dd>İdarî karar</dd></div><div><dt>Karar No</dt><dd>{document.number||"—"}</dd></div><div><dt>Karar Tarihi</dt><dd><DateLabel value={document.published_at}/></dd></div></>}
  <div><dt>Yürürlük</dt><dd>{effective?"Yürürlükte":"Yürürlükte değil"}{!decisions&&document.effective_at&&<> · <DateLabel value={document.effective_at}/></>}</dd></div>
 </dl>;
}
