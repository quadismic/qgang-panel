import {getViewerProfile} from "@/lib/viewer";
import {hasPermission} from "@/lib/access";
import type {ReactNode} from "react";
import {Nav} from "./Nav";
import {MobileNav} from "./MobileNav";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {SurfaceController} from "./SurfaceController";

export async function AppShell({children,right=false}:{children:ReactNode;right?:boolean}){
 const s=await createClient(),user=await getCurrentUser();
 const moduleAccess=user?Promise.all([hasPermission(user.id,"access.manage"),hasPermission(user.id,"design.manage"),hasPermission(user.id,"members.manage"),hasPermission(user.id,"events.manage"),hasPermission(user.id,"announcements.publish")]):Promise.resolve([false,false,false,false,false]);
 let people:any[]=[],me:any=null,treasury:any=null;
 if(user){
  const [{data:mine},peopleResult]=await Promise.all([
   getViewerProfile(user.id).then(data=>({data})),
   right?s.from("profiles").select("display_name,handle,last_seen_at").neq("id",user.id).order("last_seen_at",{ascending:false}).limit(9):Promise.resolve({data:[]})
  ]);
  me=mine;people=peopleResult.data??[];
 }
 const modulePermissions=await moduleAccess,canManageMembers=modulePermissions[2];
 const canManageSystem=modulePermissions.some(Boolean);
 const navAccess={manage:canManageSystem,canManageMembers};
 const now=Date.now();
 return <div className="appShell"><Nav {...navAccess} identity={me}/><main className="content pageMotion">{children}</main>{right&&<aside className="rail nowRail"><div className="nowHead"><div><span className="kicker">ŞU AN</span><h3>Ateşin çevresinde</h3></div><span className="nowCount">{people.length}</span></div><div className="nowPeople">{people.map((p:any)=>{const seen=p.last_seen_at?now-new Date(p.last_seen_at).getTime():Infinity,active=seen<15*60*1000;return <a href={"/u/"+p.handle} className={"nowPerson "+(active?"isLive":"")} key={p.handle}><span className="nowAvatar">{p.display_name.slice(0,1).toUpperCase()}<i/></span><span className="nowIdentity"><b>{p.display_name}</b><small>{active?"Ocakta":"Yakın zamanda buradaydı"}</small></span><span className="nowArrow">›</span></a>})}{!people.length&&<div className="nowQuiet"><i/> <span><b>Ocak sessiz.</b><small>İlk gelen sen oldun.</small></span></div>}</div><div className="nowFooter"><a href="/topluluk" className="qgAction">Topluluğu gör</a><span>Q-GANG · CANLI DURUM</span></div></aside>}<MobileNav {...navAccess} user={!!user}/><SurfaceController user={!!user} me={me} manage={canManageSystem} treasury={treasury}/></div>;
}
