"use client";
import Link from "next/link";
import {RichText} from "./RichText";
import {SurfaceLayer} from "./SurfaceLayer";
import {QGIcon} from "./QGIcon";
type Me={display_name?:string|null;handle?:string|null;bio?:string|null;avatar_url?:string|null;role?:string|null}|null;
export function IdentityLayer({user,me,manage,onClose}:{user:boolean;me:Me;manage:boolean;onClose:()=>void}){
 const initial=(me?.display_name||me?.handle||"Q").slice(0,1).toUpperCase();
 return <SurfaceLayer open onClose={onClose} kicker="KİMLİK" title={user?(me?.display_name||"Q-GANG kimliğin"):"Ateşe katıl"}><div className="identitySurface"><span className="identitySurfaceAvatar">{me?.avatar_url?<img src={me.avatar_url} alt="" referrerPolicy="no-referrer"/>:initial}</span>{user?<><div className="identitySurfaceCopy"><b>@{me?.handle||"kimlik"}</b><RichText value={me?.bio||"Q-GANG kimliğin, bağların ve oyun hesapların burada birleşir."}/></div><div className="identitySurfaceActions"><Link href="/profile" onClick={onClose}><QGIcon name="identity"/> Profilimi aç</Link><Link href="/account" onClick={onClose} className="qgAction">Hesap merkezi</Link>{manage&&<Link href="/yonetim" onClick={onClose} className="qgAction"><QGIcon name="control"/> Yönetim Merkezi</Link>}</div></>:<div className="identitySurfaceActions"><Link href="/login" onClick={onClose} className="qgAction">Giriş yap</Link></div>}</div></SurfaceLayer>;
}
