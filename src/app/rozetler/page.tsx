import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";
import {badgeAcquisition,badgeGroups} from "@/lib/badge-presentation";
export const dynamic="force-dynamic";
export default async function Badges(){
 const s=await createClient();
 const {data,error}=await s.from("badges").select("id,slug,name,description,image_url,icon,active,norm_type,award_mode,rule").order("sort_order");
 const groups=[...badgeGroups,...(data?.some(b=>!badgeGroups.some(g=>g.key===b.norm_type))?[{key:"other",label:"Diğer Nişanlar",threshold:"Katalog kaydı",description:"Mahiyet ve kazanım koşulları ilgili rozet kaydında açıklanır."}]:[])];
 return <AppShell right={false}><main className="badgeCatalogue"><header className="managementHero"><span className="kicker">KURUMSAL HAFIZA</span><h1>Rozet Kataloğu</h1><p>Aidiyet, üretim ve katkının nişanları. Rozetler rütbe, görev veya erişim sağlamaz.</p></header>
 {error?<p role="alert">Rozetler yüklenemedi.</p>:<><nav className="badgeCatalogueNav" aria-label="Rozet türleri">{groups.filter(g=>(data??[]).some(b=>g.key==="other"?!badgeGroups.some(t=>t.key===b.norm_type):b.norm_type===g.key)).map(g=><a className="qgAction" href={"#badges-"+g.key} key={g.key}>{g.label}</a>)}</nav>
 <p className="badgeCatalogueNote">Gruplar kazanım koşullarını gösterir. Üyeler arasında bir üstünlük sırası veya sahiplik sayısına dayalı nadirlik derecesi değildir.</p>
 {groups.map(g=>{const badges=(data??[]).filter(b=>g.key==="other"?!badgeGroups.some(t=>t.key===b.norm_type):b.norm_type===g.key);return badges.length?<section className={"badgeCatalogueGroup badgeCatalogueGroup-"+g.key} id={"badges-"+g.key} key={g.key}><header><div><h2>{g.label}</h2><p>{g.description}</p></div><span className="badgeThreshold">{g.threshold}</span></header><div className="badgeCatalogueGrid">{badges.map(b=>{const acquisition=badgeAcquisition(b);return <article className="badgeCatalogueCard" key={b.id}><header>{b.image_url?<img src={b.image_url} alt="" loading="lazy"/>:<span className="badgeCatalogueIcon" aria-hidden="true">{b.icon||"◆"}</span>}<div><h3>{b.name}</h3><span className="badgeAcquisitionMethod">{acquisition.method}</span></div></header><p className="badgeAcquisitionCondition">{acquisition.condition}</p><details><summary>Mahiyetini incele</summary><p>{b.description}</p></details>{!b.active&&<p className="badgeRetired">Emekli · Yeni kazanımlara kapalı. Önceki kazanımlar korunur.</p>}</article>})}</div></section>:null})}
 {!data?.length&&<p>Henüz kayıtlı rozet yok.</p>}</>}
 </main></AppShell>
}
