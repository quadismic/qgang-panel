"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useRef,useState} from "react";
import {QGIcon,type QGIconName} from "@/components/QGIcon";
type Item=readonly [string,QGIconName,string];
const content:Item[]=[["/","headquarters","Ana Sayfa"],["/kodeks","rules","Kodeks"],["/duyurular","announcements","Duyurular"],["/yayinlar","document","Yayınlar"]];
const aliases:Record<string,string>={"/profil":"/profile","/yonetim":"/control","/kodeks":"/rules","/duyurular":"/announcements","/yayinlar":"/publications","/topluluk":"/members","/disiplin":"/penalties","/butce":"/budget"};
export function MobileNavClient({user=false,manage=false,canViewBudget=false,canViewDiscipline=false,canViewEvents=false}:{user?:boolean;canViewEvents?:boolean;manage?:boolean;canViewBudget?:boolean;canViewDiscipline?:boolean}){
 const path=usePathname(),track=useRef<HTMLDivElement>(null);
 const groups:Item[][]=[content,[...(canViewEvents?[["/etkinlikler","community","Etkinlikler"] as Item]:[]),["/topluluk","community","Topluluk"],...(canViewDiscipline?[["/disiplin","discipline","Disiplin"] as Item]:[]),...(canViewBudget?[["/butce","treasury","Bütçe"] as Item]:[]),...(manage?[["/yonetim","control","Yönetim"] as Item]:[]),[user?"/profil":"/login","identity",user?"Profil":"Giriş"]]];
 const active=(href:string)=>href==="/"?path==="/":path.startsWith(href)||!!(aliases[href]&&path.startsWith(aliases[href]));
 const selected=Math.max(0,groups.findIndex(group=>group.some(([href])=>active(href))));
 const [page,setPage]=useState(selected);
 useEffect(()=>{const el=track.current;if(el){el.scrollLeft=selected*el.clientWidth;setPage(selected);}},[selected,path]);
 return <nav className="mobileNav hubMobile pagedMobileNav" aria-label="Q-GANG mobil menü"><div className="mobileNavTrack" ref={track} onScroll={event=>{const el=event.currentTarget;if(el.clientWidth)setPage(Math.round(el.scrollLeft/el.clientWidth));}}>{groups.map((group,index)=><div className="mobileNavPage" key={index} role="group" aria-label={index===0?"İçerik":"Topluluk ve hesap"} style={{gridTemplateColumns:`repeat(${group.length},minmax(0,1fr))`}}>{group.map(([href,icon,label])=><Link key={href} href={href} className={active(href)?"active":""} aria-current={active(href)?"page":undefined}><i><QGIcon name={icon}/></i><span>{label}</span></Link>)}</div>)}</div><div className="mobileNavIndicators">{groups.map((_,index)=><button type="button" key={index} aria-label={`${index+1}. menü grubunu göster`} aria-pressed={page===index} className={page===index?"active":""} onClick={()=>{const el=track.current;if(el)el.scrollTo({left:index*el.clientWidth,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});}}><span/></button>)}</div></nav>;
}
