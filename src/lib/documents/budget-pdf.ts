import PDFDocument from "pdfkit";
import path from "node:path";
import {richPlain} from "@/lib/rich-text";
import {budgetCategory,budgetTotals,amountCents,type BudgetRecord,type BudgetScope} from "@/lib/budget";
const money=(cents:number)=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY"}).format(cents/100);
export async function renderBudgetPdf(rows:BudgetRecord[],scope:BudgetScope,createdAt=new Date().toISOString()):Promise<Buffer>{
 const root=process.cwd(),doc=new PDFDocument({font:path.join(root,"assets/fonts/DejaVuSerif.ttf"),size:"A4",margin:54,bufferPages:true,info:{Title:"Q-GANG Mali Defteri",Author:"Q-GANG",CreationDate:new Date(createdAt)}});
 const chunks:Buffer[]=[];const result=new Promise<Buffer>((resolve,reject)=>{doc.on("data",chunk=>chunks.push(chunk));doc.on("end",()=>resolve(Buffer.concat(chunks)));doc.on("error",reject);});
 doc.registerFont("body",path.join(root,"assets/fonts/DejaVuSerif.ttf"));doc.registerFont("head",path.join(root,"assets/fonts/DejaVuSerif-Bold.ttf"));doc.registerFont("meta",path.join(root,"assets/fonts/DejaVuSans.ttf"));
 const width=doc.page.width-108,date=new Date(createdAt).toLocaleString("tr-TR",{timeZone:"Europe/Istanbul"}),totals=budgetTotals(rows),kind=scope.kind==="all"?"Tüm hareketler":scope.kind==="support"?"Gelirler":"Giderler";
 doc.rect(0,0,doc.page.width,doc.page.height).fill("#10100f");doc.rect(32,32,doc.page.width-64,doc.page.height-64).lineWidth(.6).stroke("#aa8556");
 doc.image(path.join(root,"public/brand/qgang-mark.png"),doc.page.width/2-58,130,{fit:[116,116]});doc.font("head").fontSize(34).fillColor("#d3b28c").text("Q-GANG\nMALİ DEFTER",54,320,{align:"center",width});doc.font("meta").fontSize(12).text(kind,54,460,{align:"center",width}).text(date,{align:"center",width});
 doc.addPage();doc.fillColor("#292724").font("head").fontSize(23).text("BELGE KÜNYESİ");doc.moveDown();doc.font("meta").fontSize(10).text("Oluşturulma: "+date).text("Kapsam: "+kind).text("Tarih aralığı: "+(scope.from||"Başlangıç")+" — "+(scope.to||"Oluşturulma anı")).text("Kayıt sayısı: "+rows.length);doc.moveDown();
 doc.font("body").fontSize(11).text("Bu belge seçilen kapsamdaki aktif mali hareketlerin çıktısıdır. Geri alınmış hareketler dahil değildir. Toplamlar yalnızca belge kapsamına aittir. Güncel kayıtlar için Bütçe Defteri'ne başvurunuz.",{width,lineGap:4});doc.moveDown();
 for(const [label,cents] of [["Toplam gelir",totals.income],["Toplam gider",totals.expense],["Net hareket",totals.balance]] as const)doc.font("head").fontSize(12).text(label+": "+money(cents));
 doc.moveDown();doc.font("meta").fontSize(10).text("q-gang.com/butce",{link:"https://q-gang.com/butce"});doc.addPage();doc.font("head").fontSize(23).text("MALİ HAREKETLER");doc.moveDown();
 if(!rows.length)doc.font("body").fontSize(11).text("Seçilen kapsamda kayıt bulunmuyor.");
 for(const [index,row] of rows.entries()){
 if(doc.y>doc.page.height-180)doc.addPage();doc.fillColor("#8a643d").font("meta").fontSize(9).text(`${index+1} · ${new Date(row.created_at).toLocaleString("tr-TR",{timeZone:"Europe/Istanbul"})} · ${budgetCategory(row.category)}`);
 doc.fillColor("#292724").font("head").fontSize(13).text(row.title,{width,lineGap:3});doc.font("meta").fontSize(11).text((row.kind==="support"?"Gelir +":"Gider −")+money(amountCents(row.amount)));if(row.kind==="support")doc.fontSize(9).text(row.is_anonymous?"Destekçi: Anonim":row.supporter_name?"Destekçi: "+row.supporter_name:"Destekçi bilgisi yok");
 doc.moveDown(.5);const description=richPlain(row.description||"");if(description)doc.font("body").fontSize(10).text(description,{width,lineGap:3,paragraphGap:6});doc.moveDown();
 }
 const count=doc.bufferedPageRange().count;for(let page=1;page<count;page++){doc.switchToPage(page);doc.font("meta").fontSize(8).fillColor("#7a6b58").text("Q-GANG · MALİ DEFTER",54,26,{lineBreak:false}).text(String(page+1),doc.page.width-80,doc.page.height-30,{lineBreak:false});}doc.end();return result;
}
