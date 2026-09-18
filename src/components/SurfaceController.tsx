"use client";
import Link from "next/link";
import {useCallback,useEffect,useState} from "react";
import {SurfaceLayer} from "./SurfaceLayer";
import {LiveSearch} from "./LiveSearch";
import {QGIcon} from "./QGIcon";
import {TreasuryLayer} from "./TreasuryLayer";
type Me={display_name?:string|null;handle?:string|null;bio?:string|null;avatar_url?:string|null;role?:string|null}|null;
type Treasury={balance:number;support:number;expense:number;adjust:number;transactions:any[];contributors:{name:string;amount:number}[]}|null;
export function SurfaceController({user,me,manage=false,treasury=null}:{user:boolean;me:Me;manage?:boolean;treasury?:Treasury}){
 const[layer,setLayer]=useState<"discover"|"identity"|"treasury"|null>(null),close=useCallback(()=>setLayer(null),[]);
 useEffect(()=>{const discover=()=>setLayer("discover"),identity=()=>setLayer("identity"),treasuryOpen=()=>setLayer("treasury");window.addEventListener("qgang:discover",discover);window.addEventListener("qgang:identity",identity);window.addEventListener("qgang:treasury",treasuryOpen);return()=>{window.removeEventListener("qgang:discover",discover);window.removeEventListener("qgang:identity",identity);window.removeEventListener("qgang:treasury",treasuryOpen)}},[]);
 const initial=(me?.display_name||me?.handle||"Q").slice(0,1).toUpperCase();
 return <><SurfaceLayer open={layer==="discover"} onClose={close} kicker="KEŞFET" title="Ateşini bul." wide><div className="surfaceIntro">Oyunu, oyuncuyu veya Kamp Ateşi'ni ara. Q-GANG seni bulunduğun yerden koparmadan çevreni açar.</div><LiveSearch onNavigate={close}/><div className="surfaceDeepLink"><Link href="/search" onClick={close}>Tam Keşfet görünümü →</Link></div></SurfaceLayer><SurfaceLayer open={layer==="identity"} onClose={close} kicker="KİMLİK" title={user?(me?.display_name||"Q-GANG kimliğin"):"Ateşe katıl"}><div className="identitySurface"><span className="identitySurfaceAvatar">{me?.avatar_url?<img src={me.avatar_url} alt="" referrerPolicy="no-referrer"/>:initial}</span>{user?<><div className="identitySurfaceCopy"><b>@{me?.handle||"kimlik"}</b><p>{me?.bio||"Q-GANG kimliğin, bağların ve oyun hesapların burada birleşir."}</p></div><div className="identitySurfaceActions"><Link href="/profile" onClick={close}><QGIcon name="identity"/> Profilimi aç</Link><Link href="/account" onClick={close}>Hesap merkezi →</Link>{manage&&<Link href="/control" onClick={close}>Q-Control →</Link>}</div></>:<div className="identitySurfaceActions"><Link href="/login" onClick={close}>Giriş yap →</Link></div>}</div></SurfaceLayer><TreasuryLayer open={layer==="treasury"} onClose={close} initial={treasury}/></>
}