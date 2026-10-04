import {AppShell} from "@/components/AppShell";
import {getPermissions,allows} from "@/lib/permissions";
import {redirect} from "next/navigation";
export const dynamic="force-dynamic";
export const metadata={title:"Yönetim",description:"Q-GANG sistem ve ortak ayarlar"};
export default async function Control(){
 const {user,permissions}=await getPermissions();
 if(!user)redirect("/login?next=/yonetim");
 const access=allows(permissions,"access.manage"),design=allows(permissions,"design.manage");
 if(!access&&!design)redirect("/");
 const modules=[
  ...(access?[{href:"/yonetim/erisim",type:"access",icon:"⌘",kicker:"YETKİ MİMARİSİ",title:"Erişim Merkezi",desc:"Rütbelerin sistem yetkilerini güvenli matris üzerinden yönet."},{href:"/yonetim/sistem",type:"system",icon:"◉",kicker:"SİSTEM",title:"Sistem Merkezi",desc:"Bakım modunu ve özel bakım erişimlerini yönet."}]:[]),
  ...(design?[{href:"/yonetim/tasarim",type:"design",icon:"✦",kicker:"GÖRÜNÜM",title:"Tasarım Merkezi",desc:"Marka, portreler, giriş ve ortak görünüm ayarlarını yönet."}]:[])
 ];
 return <AppShell right={false}><main className="controlDashboard"><section className="controlDashboardHero"><div><span className="kicker">YÖNETİM MERKEZİ</span><h1>Sistem ve Ayarlar</h1><p>Site genelindeki erişim, bakım ve görünüm ayarları. İçerik ve üye işlemleri ilgili sekmelerde yer alır.</p></div></section><section className="controlDashboardBar"><div><span>ERİŞİLEBİLİR MODÜL</span><b>{modules.length}</b></div></section><section className="controlModules">{modules.map(m=><a className="controlModuleCard" href={m.href} key={m.href}><div className="controlModuleTop"><span className={"controlModuleIcon controlModuleIcon-"+m.type} aria-hidden="true">{m.icon}</span><span className="controlModuleArrow">↗</span></div><div className="controlModuleCopy"><span className="kicker">{m.kicker}</span><h2>{m.title}</h2><p>{m.desc}</p></div><div className="controlModuleFoot"><span>MERKEZİ AÇ</span><b>→</b></div></a>)}</section></main></AppShell>;
}
