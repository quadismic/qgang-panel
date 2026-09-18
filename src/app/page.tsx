import Link from "next/link";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";
export const dynamic="force-dynamic";
const modules=[
 {href:"/rules",icon:"§",title:"Kurallar",text:"Q-GANG düzeni, ilkeleri ve yürürlükteki kurallar."},
 {href:"/members",icon:"◎",title:"Topluluk",text:"Topluluk üyeleri ve Q-GANG içindeki rolleri."},
 {href:"/announcements",icon:"◈",title:"Duyurular",text:"Yönetim tarafından yayımlanan güncel duyurular."},
 {href:"/penalties",icon:"!",title:"Cezalar",text:"Uyarı ve yaptırım kayıtlarının şeffaf görünümü."},
 {href:"/fund",icon:"₺",title:"Bütçe",text:"Q-GANG bütçesi, gelirler, giderler ve mevcut bakiye."}
];
export default async function Hub(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser();
 return <AppShell right={false}><section className="hubHero"><span className="kicker">Q-GANG · Q-GANG</span><h1>Topluluğun merkezi.</h1><p>Kurallar, üyeler, duyurular, cezalar ve bütçe. Q-GANG'in temel kayıtlarına tek yerden ulaş.</p>{!user&&<Link className="button primary" href="/login">Google ile giriş yap</Link>}</section><section className="hubGrid">{modules.map(m=><Link className="hubCard" href={m.href} key={m.href}><span className="hubIcon">{m.icon}</span><div><h2>{m.title}</h2><p>{m.text}</p></div><em>→</em></Link>)}</section></AppShell>
}