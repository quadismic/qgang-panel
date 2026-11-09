import assets from "@/lib/performance-assets.json";
type Variant={width:number;src:string;bytes:number};
const variants=assets as Record<string,Variant[]>;
export function presentationImage(source:string,width=960){
 const list=variants[source];
 if(list?.length)return (list.find(v=>v.width>=width)||list[list.length-1]).src;
 return source;
}
export function portraitSources(source:string){
 const list=variants[source];
 if(list?.length)return list.map(v=>`${v.src} ${v.width}w`).join(", ");
 return thumbnail(source,480)!==source?[480,960].map(w=>`${thumbnail(source,w as 480|960)} ${w}w`).join(", "):undefined;
}
// Restrict optimization to this application's existing public image buckets.
// Other URLs keep their previous handling; never proxy arbitrary external URLs.
export function thumbnail(source:string,width:128|256|384|480|960=480){
 if(variants[source])return presentationImage(source,width);
 try{
  const u=new URL(source),host=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL||"https://kttebbvinfmauthmayqp.supabase.co").host;
  if(u.protocol==="https:"&&!u.username&&!u.password&&u.host===host&&/^\/storage\/v1\/object\/public\/(qgang-avatars|qgang-publications|qgang-design)\//.test(u.pathname))return `/_next/image?url=${encodeURIComponent(u.href)}&w=${width}&q=85`;
 }catch{}
 return source;
}
