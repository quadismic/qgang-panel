import PDFDocument from "pdfkit";
import path from "node:path";
import {richPlain} from "@/lib/rich-text";
import type {CodexRule} from "@/lib/codex";
export type Compilation={id:string;created_at:string;snapshot:CodexRule[];include_decisions:boolean};
export async function renderCodex(compilation:Compilation):Promise<Buffer>{
 const doc=new PDFDocument({size:"A4",margin:54,bufferPages:true,info:{Title:"Q-GANG Kodeksi",Author:"Q-GANG",CreationDate:new Date(compilation.created_at),Subject:compilation.id}});
 const chunks:Buffer[]=[];const result=new Promise<Buffer>((resolve,reject)=>{doc.on("data",chunk=>chunks.push(chunk));doc.on("end",()=>resolve(Buffer.concat(chunks)));doc.on("error",reject)});
 const root=process.cwd();doc.registerFont("body",path.join(root,"assets/fonts/DejaVuSerif.ttf"));doc.registerFont("head",path.join(root,"assets/fonts/DejaVuSerif-Bold.ttf"));doc.registerFont("meta",path.join(root,"assets/fonts/DejaVuSans.ttf"));
 const width=doc.page.width-108,date=new Date(compilation.created_at).toLocaleString("tr-TR",{timeZone:"Europe/Istanbul"});
 doc.rect(0,0,doc.page.width,doc.page.height).fill("#10100f");doc.rect(32,32,doc.page.width-64,doc.page.height-64).lineWidth(.6).stroke("#aa8556");
 doc.image(path.join(root,"public/brand/qgang-mark.png"),doc.page.width/2-58,130,{fit:[116,116]});doc.fillColor("#d3b28c").font("head").fontSize(36).text("Q-GANG\nKODEKS",54,320,{align:"center",width});doc.font("meta").fontSize(12).text("Yürürlükteki Derlenmiş Metin",54,460,{align:"center",width}).text(date+" itibarıyla",{align:"center",width});
 doc.addPage();doc.fillColor("#292724").font("head").fontSize(23).text("İÇİNDEKİLER");doc.moveDown();
 const toc:{id:string;page:number;y:number}[]=[],starts=new Map<string,number>(),pageRules=new Map<number,{title:string;start:number}>();
 const ordered=[...compilation.snapshot.filter(r=>r.kind!=="KARAR"),...compilation.snapshot.filter(r=>r.kind==="KARAR")];
 for(const r of ordered){doc.font("meta").fontSize(10);const label=(r.kind==="KARAR"?"EK I · ":"§ ")+r.number+"  "+r.title;if(doc.y+doc.heightOfString(label,{width:width-35})+12>doc.page.height-54)doc.addPage();toc.push({id:r.id,page:doc.bufferedPageRange().count-1,y:doc.y});doc.fillColor("#493e32").text(label,{goTo:r.id,paragraphGap:6,width:width-35});}
 doc.addPage();doc.font("head").fontSize(19).text("BELGE KÜNYESİ");doc.moveDown();doc.font("meta").fontSize(10).text("Derleme Kimliği: QG-KDX-"+compilation.id).text("Derleme zamanı: "+date).text("Kapsam: "+(compilation.include_decisions?"Kodeks ve icra kararları eki":"Yürürlükteki kodeks"));doc.moveDown();doc.font("body").fontSize(11).text("Bu belge oluşturulduğu tarih itibarıyla yürürlükte bulunan hükümlerin derlemesidir. Güncel metin için Q-GANG Kodeksi'ne başvurunuz.",{width});doc.moveDown();doc.font("meta").text("Güncel Kodeks: q-gang.com/kodeks",{link:"https://q-gang.com/kodeks"});
 const sections=new Map<string,PDFKit.PDFOutline>();let decisions=false,previousSection="";
 for(const r of ordered){
 if(r.kind==="KARAR"&&!decisions){doc.addPage();doc.font("head").fontSize(25).fillColor("#8a643d").text("EK I\nİCRA KARARLARI");doc.font("meta").fontSize(11).text("Kodeks metninin parçası değildir.");decisions=true;}
 const currentSection=r.kind==="KARAR"?"EK I":r.section_number||"Kodeks";
 if(previousSection!==currentSection||doc.y>doc.page.height-240)doc.addPage();else doc.moveDown(2);
 previousSection=currentSection;const start=doc.bufferedPageRange().count-1;starts.set(r.id,start);doc.addNamedDestination(r.id,"XYZ",null,doc.y,null);
 const key=r.kind==="KARAR"?"EK I":r.section_number||"Kodeks";let section=sections.get(key);if(!section){section=doc.outline.addItem(key==="EK I"?"EK I · İcra Kararları":"Bölüm § "+key,{expanded:true});sections.set(key,section);}section.addItem("§ "+r.number+" · "+r.title);
 const color=r.kind==="KURAL"?"#a64d43":r.kind==="İLKE"?"#9b8031":r.kind==="YÖNERGE"?"#456d92":"#79664e";
 doc.font("meta").fontSize(9).fillColor(color).text((r.kind==="KURAL"?"● ":r.kind==="İLKE"?"◆ ":"■ ")+(r.kind==="KARAR"?"İCRA KARARI":r.kind));doc.moveDown(.7);doc.font("head").fontSize(20).fillColor("#242320").text("§ "+r.number+" — "+r.title,{width});doc.moveDown(.5);
 const format=(d:string|null)=>d?new Date(d).toLocaleDateString("tr-TR",{timeZone:"Europe/Istanbul"}):"—";
 doc.font("meta").fontSize(8).fillColor("#6f6960").text("Yürürlük: "+format(r.effective_at)+" · Son değişiklik: "+format(r.updated_at)+" · Sürüm: "+r.revision,{width});
 const basis=ordered.find(x=>x.id===r.basis_rule_id);if(basis)doc.text("Dayanak: § "+basis.number,{goTo:basis.id});if(r.kind==="KARAR")doc.text("Durum: "+(r.status==="yururlukten_kaldirildi"?"Yürürlükten kaldırıldı":"Yayımlanmış karar"));doc.moveDown(1.5);
 doc.font("body").fontSize(11).fillColor("#252420").text(richPlain((r.body||"").replace(/<\/t[dh]>/gi," | ")),{width,align:"left",lineGap:4,paragraphGap:8});
 const last=doc.bufferedPageRange().count-1;for(let page=start;page<=last;page++)pageRules.set(page,{title:"§ "+r.number+" · "+r.title,start});
 }
 for(const row of toc){doc.switchToPage(row.page);doc.font("meta").fontSize(9).fillColor("#493e32").text(String((starts.get(row.id)??0)+1),doc.page.width-83,row.y,{width:29,align:"right",lineBreak:false,goTo:row.id});}
 const count=doc.bufferedPageRange().count;
 for(let page=1;page<count;page++){doc.switchToPage(page);doc.font("meta").fontSize(8).fillColor("#7a6b58").text("Q-GANG · KODEKS",54,26,{lineBreak:false});const rule=pageRules.get(page);if(rule)doc.text(rule.title+(page>rule.start?" — devam":""),210,26,{width:doc.page.width-264,align:"right",lineBreak:false,ellipsis:true});doc.text(String(page+1),doc.page.width-80,doc.page.height-30,{lineBreak:false});}
 doc.end();return result;
}
