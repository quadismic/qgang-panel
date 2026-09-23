import {AppShell} from "@/components/AppShell";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
export const dynamic="force-dynamic";export const metadata={title:"Yönetim",description:"Q-GANG yönetim merkezi"};
export default async function Control(){
 const s=await createClient();const user=await getCurrentUser();
 if(!user)redirect("/login?next=/control");
 const {data:p}=await s.from("profiles").select("role").eq("id",user.id).maybeSingle();
 if(!p||!["founder","admin"].includes(p.role))redirect("/");
 const [{count:users},{count:reports}]=await Promise.all([
  s.from("profiles").select("*",{count:"exact",head:true}),
  s.from("reports").select("*",{count:"exact",head:true}).in("status",["open","reviewing"])
 ]);
 return <AppShell right={false}>
  <section className="utilityHero"><span className="kicker">Q-GANG · YÖNETİM MERKEZİ</span><h1>Topluluğun işletim sistemi.</h1><p>Üyelik, erişim ve görünüm araçlarını tek merkezden yönet.</p></section>
  <div className="stats"><div><span>Üye Sayısı</span><b>{users??0}</b></div><div><span>Aktif Bildirimler</span><b>{reports??0}</b></div></div>
  <div className="controlGrid">
   <a className="controlCard" href="/control/community"><span className="kicker">KİMLİK & ROLLER</span><h2>Üyelik Merkezi</h2><p>Lider, Vekilharç, Kaptan, Teğmen ve Üye yetkilerini yönet.</p></a>
   <a className="controlCard" href="/control/access"><span className="kicker">YETKİ MİMARİSİ</span><h2>Erişim Merkezi</h2><p>Rütbelerin özellik ve yönetim yetkilerini canlı matris üzerinden kontrol et.</p></a>
   <a className="controlCard" href="/control/design"><span className="kicker">GÖRÜNÜM</span><h2>Tasarım Merkezi</h2><p>Marka, Karargâh, giriş ve temel tasarım değişkenlerini canlı önizlemeyle yönet.</p></a>
  </div>
 </AppShell>
}