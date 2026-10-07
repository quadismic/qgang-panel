export const EVENT_TYPES = [
 {id:"gang-up",name:"GANG-UP",description:"Fiziksel buluşma ve bir araya gelme etkinliği."},
 {id:"op-night",name:"OP-NIGHT",description:"Oyun veya aktivite gecesi."},
 {id:"bbq-gang",name:"BBQ-GANG",description:"Özel mangal etkinliği."},
 {id:"q-nity",name:"Q-NITY",description:"Özel tatil etkinliği."}
] as const;
export function eventDate(date:string,dateOnly=false) {
 return new Date(date).toLocaleString("tr-TR",{timeZone:"Europe/Istanbul",day:"numeric",month:"long",year:"numeric",...(!dateOnly?{hour:"2-digit",minute:"2-digit"}: {})});
}
export function istanbulInput(value:string) {
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))return null;
 const date=new Date(value+":00+03:00");
 if(!Number.isFinite(date.getTime()))return null;
 // Reject normalized impossible calendar dates such as 30 February.
 if(new Date(date.getTime()+3*3600000).toISOString().slice(0,16)!==value)return null;
 return date.toISOString();
}
export function eventInput(date:string) {return new Date(new Date(date).getTime()+3*3600000).toISOString().slice(0,16);}
export function eventDays(date:string,now=new Date()) {
 const day=(d:Date)=>Date.UTC(...d.toLocaleDateString("en-CA",{timeZone:"Europe/Istanbul"}).split("-").map(Number).map((v,i)=>i===1?v-1:v) as [number,number,number]);
 return Math.round((day(new Date(date))-day(now))/86400000);
}

export function eventCover(url:string|null|undefined) {
 if(!url)return null;
 try {const image=new URL(url),origin=process.env.NEXT_PUBLIC_SUPABASE_URL;if(origin&&image.origin===new URL(origin).origin&&image.pathname.startsWith("/storage/v1/object/public/"))return image.href;}catch{}
 return null;
}
