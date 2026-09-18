import Link from "next/link";import {brandTheme} from "@/config/brand-theme";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";
import {roleLabel} from "@/lib/roles";
export const dynamic="force-dynamic";

export default async function Members({searchParams}:{searchParams:Promise<{q?:string}>}){
 const {q=""}=await searchParams; const term=q.trim().slice(0,50); const safe=term.replace(/[%_,()]/g,"");
 const s=await createClient(); let query=s.from("profiles").select("id,display_name,handle,bio,role,avatar_url,last_seen_at,connected_accounts(provider,provider_handle)").order("created_at",{ascending:true}).limit(60);
 if(safe)query=query.or(`handle.ilike.%${safe}%,display_name.ilike.%${safe}%`);
 const {data}=await query; const people=data??[]; const now=Date.now();
 const leadership=people.filter((p:any)=>["founder","admin"].includes(p.role)).length;
 const active=people.filter((p:any)=>p.last_seen_at&&now-new Date(p.last_seen_at).getTime()<15*60*1000).length;
 return <AppShell right={false}>
  <section className="registryHero roomScene" style={{backgroundImage:`linear-gradient(90deg,rgba(4,3,2,.82),rgba(4,3,2,.38) 48%,rgba(4,3,2,.18)),url(${brandTheme.rooms.registry})`}}><h1>Topluluk Sicili</h1><p>Q-GANG kimlikleri, görevleri ve bağlı hesapları. Her isim düzenin yaşayan bir parçasıdır.</p>
   <div><b>{people.length}<small>KAYITLI KİMLİK</small></b><b>{leadership}<small>YÖNETİM</small></b><b>{active}<small>ŞU AN AKTİF</small></b></div>
  </section>
  <form className="registrySearch" action="/members"><span>⌕</span><input name="q" defaultValue={term} maxLength={50} placeholder="İsim veya Q-GANG kimliği ara…"/><button>ARA</button></form>
  <section className="registryLedger"><header><span>ÜYE KAYITLARI</span><b>{term?`“${term}” SONUÇLARI`:"TÜM KİMLİKLER"}</b></header>
   <div className="registryRows">{people.map((p:any)=>{const live=p.last_seen_at&&now-new Date(p.last_seen_at).getTime()<15*60*1000;return <Link href={"/u/"+p.handle} className="registryPerson" key={p.id}>
    <div className="registryAvatar">{p.avatar_url?<img src={p.avatar_url} alt=""/>:<span>{p.display_name.slice(0,1).toUpperCase()}</span>}<i className={live?"live":""}/></div>
    <div className="registryIdentity"><small>@{p.handle}</small><h2>{p.display_name}</h2><p>{p.bio||"Q-GANG üyesi"}</p></div>
    <div className="registryLinks">{(p.connected_accounts??[]).slice(0,3).map((a:any)=><span key={a.provider}>{a.provider.toUpperCase()}</span>)}</div>
    <div className={"registryRank rank-"+p.role}><small>RÜTBE</small><b>{roleLabel(p.role)}</b></div><strong>→</strong>
   </Link>})}{!people.length&&<div className="registryEmpty"><span>∅</span><h2>Kayıt bulunamadı.</h2><p>Arama ölçütünü değiştir.</p></div>}</div>
  </section>
 </AppShell>
}