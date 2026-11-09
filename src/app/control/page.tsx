import {QGIcon,type QGIconName} from "@/components/QGIcon";
import {AppShell} from "@/components/AppShell";
import {getPermissions,allows} from "@/lib/permissions";
import {canModerate} from "@/lib/roles";
import {getViewerProfile} from "@/lib/viewer";
import {redirect} from "next/navigation";
export const dynamic="force-dynamic";
export const metadata={title:"Yönetim Paneli",description:"Q-GANG üyeleri, etkinlikleri ve topluluk düzeni"};
export default async function Control(){
 const {user,permissions}=await getPermissions();
 if(!user)redirect("/login?next=/yonetim");
 const profile=await getViewerProfile(user.id),access=allows(permissions,"access.manage"),design=allows(permissions,"design.manage");
 const discipline=allows(permissions,"discipline.view")&&canModerate(profile?.role);
 const members=allows(permissions,"members.manage"),events=allows(permissions,"events.manage"),announcements=allows(permissions,"announcements.publish"),rules=["founder","admin","moderator"].includes(profile?.role||"");
 if(!access&&!design&&!discipline&&!members&&!events&&!announcements&&!rules)redirect("/");
 const essential=[
  ...(members?[{href:"/topluluk?manage=1",type:"members",icon:"people",title:"Üyeleri Yönet",desc:"Üye profillerini ve topluluk kayıtlarını yönet."}]:[]),
  ...(events?[{href:"/etkinlikler",type:"events",icon:"calendar",title:"Etkinlikleri Yönet",desc:"Oyun gecelerini, buluşmaları ve katılımı düzenle."}]:[]),
  ...(rules?[{href:"/kodeks?manage=1&tab=directives",type:"rules",icon:"rules",title:"Kodeks ve Yönergeler",desc:"Topluluk metinlerini, yönergeleri ve icra kararlarını yönet."}]:[]),
  ...(announcements?[{href:"/duyurular",type:"announcements",icon:"announcements",title:"Duyurular",desc:"Topluluğa yayımlanan duyuruları yönet."}]:[]),
 ];
 const modules=[
  ...(discipline?[{href:"/yonetim/moderasyon",type:"discipline",icon:"discipline",kicker:"TOPLULUK",title:"Disiplin",desc:"Olay kayıtlarını ve kararları yönet."}]:[]),
  ...(access?[{href:"/yonetim/erisim",type:"access",icon:"hierarchy",kicker:"YETKİ MİMARİSİ",title:"Erişim Merkezi",desc:"Rütbelerin sistem yetkilerini güvenli matris üzerinden yönet."},{href:"/yonetim/sistem",type:"system",icon:"control",kicker:"SİSTEM",title:"Sistem Merkezi",desc:"Bakım modunu ve özel bakım erişimlerini yönet."}]:[]),
  ...(design?[{href:"/yonetim/tasarim",type:"design",icon:"image",kicker:"GÖRÜNÜM",title:"Tasarım Merkezi",desc:"Marka, portreler, giriş ve ortak görünüm ayarlarını yönet."}]:[])
 ];
 return <AppShell right={false}><main className="controlDashboard"><section className="controlDashboardHero"><div><span className="kicker">YÖNETİM</span><h1>Yönetim Paneli</h1><p>Üyeler, etkinlikler ve topluluk düzeni için gerekli araçlar.</p></div></section>{essential.length>0&&<section className="controlModules clanAdminModules">{essential.map(m=><a className="controlModuleCard" href={m.href} key={m.href}><div className="controlModuleTop"><span className={"controlModuleIcon controlModuleIcon-"+m.type} aria-hidden="true"><QGIcon name={m.icon as QGIconName}/></span><span className="controlModuleArrow">↗</span></div><div className="controlModuleCopy"><h2>{m.title}</h2><p>{m.desc}</p></div><div className="controlModuleFoot"><span>AÇ</span><b>→</b></div></a>)}</section>}{modules.length>0&&<details className="clanAdvancedAdmin"><summary>Gelişmiş site araçları</summary><section className="controlModules">{modules.map(m=><a className="controlModuleCard" href={m.href} key={m.href}><div className="controlModuleTop"><span className={"controlModuleIcon controlModuleIcon-"+m.type} aria-hidden="true"><QGIcon name={m.icon as QGIconName}/></span><span className="controlModuleArrow">↗</span></div><div className="controlModuleCopy"><span className="kicker">{m.kicker}</span><h2>{m.title}</h2><p>{m.desc}</p></div><div className="controlModuleFoot"><span>AÇ</span><b>→</b></div></a>)}</section></details>}</main></AppShell>;
}
