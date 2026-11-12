import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "../preview.css";
export const dynamic="force-dynamic";
export const metadata={title:"Arşiv · Q-GANG"};
type Params={searchParams:Promise<{q?:string;type?:string}>};
type Item={id:string;title:string;description:string;date:string;type:"Etkinlik"|"Yayın";href:string};
const formatDate=(s:string)=>new Intl.DateTimeFormat("tr-TR",{day:"2-digit",month:"long",year:"numeric",timeZone:"Europe/Istanbul"}).format(new Date(s));
export default async function Archive({searchParams}:Params){
 const {q:raw="",type="all"}=await searchParams;
 const q=raw.trim().slice(0,120);
 const supabase=await createClient();
 const user=await getCurrentUser();
 if(!user)redirect("/login?next=/qgang-3/arsiv");
 const {data:profile}=await supabase.from("profiles").select("onboarding_completed_at,is_suspended").eq("id",user.id).maybeSingle();
 if(!profile?.onboarding_completed_at)redirect("/onboarding?next=/qgang-3/arsiv");
 const {data:membership}=await supabase.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();
 if(!membership||profile.is_suspended)redirect("/qgang-3/basvuru");
 const eventQuery=supabase.from("community_events").select("id,title,description,starts_at,status").in("status",["completed","published"]).lt("starts_at",new Date().toISOString()).order("starts_at",{ascending:false}).limit(100);
 const pubQuery=supabase.from("publications").select("id,title,excerpt,published_at,slug").eq("status","published").order("published_at",{ascending:false}).limit(100);
 const [{data:events},{data:publications}]=await Promise.all([type==="all"||type==="event"?eventQuery:Promise.resolve({data:[]}),type==="all"||type==="publication"?pubQuery:Promise.resolve({data:[]})]);
 const items:Item[]=[
 ...(events??[]).map(e=>({id:e.id,title:e.title,description:e.description??"",date:e.starts_at,type:"Etkinlik" as const,href:"/etkinlikler"})),
 ...(publications??[]).filter(p=>p.published_at).map(p=>({id:p.id,title:p.title,description:p.excerpt??"",date:p.published_at!,type:"Yayın" as const,href:"/yayinlar/"+encodeURIComponent(p.slug)}))
 ].filter(x=>!q||[x.title,x.description,x.type].some(v=>v.toLocaleLowerCase("tr-TR").includes(q.toLocaleLowerCase("tr-TR")))).sort((a,b)=>b.date.localeCompare(a.date));
 return <main className="qg3 qg3-archivepage"><div className="qg3-content"><div className="qg3-archivehead"><Link href="/qgang-3">← Ana sayfa</Link><h1>Arşiv</h1><p>Geçmiş etkinlikler ve yayımlanmış içerikler tek yerde.</p></div><form action="/qgang-3/arsiv" method="get" className="qg3-archivequery"><input name="q" type="search" defaultValue={q} placeholder="Arşivde ara..." aria-label="Arşivde ara"/><select name="type" defaultValue={type} aria-label="Kayıt türü"><option value="all">Tüm kayıtlar</option><option value="event">Etkinlikler</option><option value="publication">Yayınlar</option></select><button type="submit">Ara</button></form><div className="qg3-archiveresults"><p>{items.length} kayıt bulundu</p>{items.map(item=><article className="qg3-archiverow" key={item.type+item.id}><span className="qg3-archivetype">{item.type}</span><div><h2>{item.title}</h2><p>{item.description}</p><time dateTime={item.date}>{formatDate(item.date)}</time></div><Link href={item.href}>Görüntüle →</Link></article>)}{items.length===0&&<div className="qg3-empty">Bu aramaya uygun kayıt bulunamadı.</div>}</div><p className="qg3-archivescope">İcra kararları ve yönetim kayıtları, ilgili kayıt ve erişim altyapısı tamamlandığında bu birleşik aramaya eklenecek. Gizli kayıtlar genel üye arşivinde gösterilmez.</p></div></main>;
}
