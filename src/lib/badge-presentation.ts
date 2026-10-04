type BadgeRule = { kind?: string; until?: string; count?: number; days?: number };
export const badgeGroups = [
  {key:"historical",label:"Tarihsel Nişanlar",threshold:"Dönemle sınırlı",description:"Belirli bir döneme aidiyet; başarı veya hizmet ödülü değildir."},
  {key:"achievement",label:"Kazanım Nişanları",threshold:"Kayıtlı kazanım",description:"Yayın üretimi ve yönetimce tanınan kıdem."},
  {key:"discretionary",label:"Takdir Nişanları",threshold:"Özel katkı",description:"Olağanın ötesindeki somut katkının gerekçeli takdiri."},
  {key:"high_honor",label:"Yüksek Onur Nişanı",threshold:"Olağanüstü hizmet",description:"Kategoriler üstü hizmetin en yüksek kurumsal takdiri; yalnız LİDER verir."},
] as const;
export function badgeAcquisition(b:{slug:string;norm_type:string;award_mode?:string;rule?:BadgeRule|null}){
 if(b.slug==="ilk-halka" && b.rule?.kind==="member-login-cutoff"){
  const date=new Date((b.rule.until||"2027-01-01")+"T00:00:00Z");date.setUTCDate(date.getUTCDate()-1);
  return {method:"Otomatik tanıma",condition:`Topluluk üyeliği ve Türkiye saatiyle ${date.toLocaleDateString("tr-TR",{timeZone:"UTC"})} sonuna kadar platforma giriş.`};
 }
 if(b.slug==="kidem-nisani")return {method:"Yönetimce tanıma",condition:"Güvenilir üyelik ve kıdem kayıtları üzerinden gerekçeli değerlendirme."};
 if(b.slug==="muellif")return {method:"Otomatik kazanım",condition:`Topluluk üyesi olarak en az ${b.rule?.count||1} yayımlanmış eser. Taslaklar sayılmaz.`};
 if(b.norm_type==="high_honor")return {method:"Yalnız LİDER",condition:"Kapsamı, sürekliliği ve etkisiyle olağanüstü, kategoriler üstü hizmet; gerekçeli atama."};
 if(b.norm_type==="discretionary")return {method:"LİDER / VEKİLHARÇ",condition:"Rozetin mahiyetine uygun somut, özel katkı; gerekçeli atama. Sayısal eşikle kazanılmaz."};
 return {method:b.award_mode==="automatic"?"Otomatik kazanım":"Kayıtlara dayalı tanıma",condition:"Katalogda belirtilen mahiyet ve kayıtlı kazanım koşulları esas alınır."};
}
