export const privacyKinds={access:"Verilerime erişim",correction:"Kayıt düzeltme",closure:"Hesap kapatma",erasure:"Silme / anonimleştirme"} as const;
export const privacyStatuses={pending:"Alındı",reviewing:"İnceleniyor",resolved:"Sonuçlandırıldı",rejected:"Reddedildi"} as const;
export function sameOrigin(request:Request){
 const url=new URL(request.url),host=request.headers.get("host")||url.host;
 const protocol=request.headers.get("x-forwarded-proto")?.split(",")[0].trim()||url.protocol.slice(0,-1);
 return ["http","https"].includes(protocol)&&request.headers.get("origin")===`${protocol}://${host}`;
}
