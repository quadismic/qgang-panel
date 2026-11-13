import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {savePublication} from "./actions";
import "../karargah.css";
export const dynamic="force-dynamic";
export const metadata={title:"Yayın Yönetimi · Q-GANG"};
type Props={searchParams:Promise<{edit?:string}>};
export default async function PublicationManagement({searchParams}:Props){
 const {edit}=await searchParams;
 const user=await getCurrentUser();if(!user)redirect("/login?next=/qgang-3/yonetim/yayinlar");
 const db=await createClient();
 const {data:p}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).maybeSingle();
 const {data:m}=await db.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();
 if(!m||p?.is_suspended||!["founder","admin","creator"].includes(p?.role??""))redirect("/qgang-3");
 const {data:publications}=await db.from("publications").select("id,title,slug,status,content_type,created_at,author_id").order("updated_at",{ascending:false}).limit(60);
 const {data:selected}=edit?await db.from("publications").select("id,title,slug,excerpt,body,status,content_type,author_id").eq("id",edit).maybeSingle():{data:null};
 const canEdit=!!selected&&(selected.author_id===user.id||["founder","admin"].includes(p.role));
 const drafts=(publications??[]).filter(x=>x.status!=="published").length;
 return <main className="qg-hq"><div className="qg-hq-shell"><header><Link href="/qgang-3/yonetim">← KARARGÂH</Link><span>YAYINLAR</span></header><h1>YAYIN YÖNETİMİ</h1><p>{drafts} yayımlanmamış · {(publications??[]).length} içerik</p><section className="qg-hq-panel"><h2>{canEdit?"YAYINI DÜZENLE":"YENİ YAYIN"}</h2><form action={savePublication} className="qg-sanction-form"><input type="hidden" name="id" value={canEdit?selected!.id:""}/><label>BAŞLIK<input name="title" required maxLength={180} defaultValue={canEdit?selected!.title:""}/></label><label>URL KISALTMA (SLUG)<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={canEdit?selected!.slug:""}/></label><label>KATEGORİ<select name="type" defaultValue={canEdit?selected!.content_type:"thought"}>{[["thought","Düşünce"],["game","Oyun"],["technology","Teknoloji"],["video","Video"],["research","Araştırma"],["cinema","Sinema"]].map(([id,name])=><option value={id} key={id}>{name}</option>)}</select></label><label>ÖZET<textarea name="excerpt" maxLength={500} defaultValue={canEdit?selected!.excerpt??"":""}/></label><label>İÇERİK<textarea name="body" rows={12} required maxLength={50000} defaultValue={canEdit?selected!.body:""}/></label><label>DURUM<select name="status" defaultValue={canEdit?selected!.status==="published"?"published":"draft":"draft"}><option value="draft">Taslak</option><option value="published">Yayında</option></select></label><button type="submit">KAYDET</button>{edit&&<Link href="/qgang-3/yonetim/yayinlar">Yeni yayına dön</Link>}</form></section><section className="qg-hq-panel" style={{marginTop:18}}><h2>SON İÇERİKLER</h2>{publications?.length?publications.map(x=><article key={x.id} className="qg-hq-entry"><div><strong>{x.title}</strong><span>{x.status}</span></div><p>{x.content_type} · {new Date(x.created_at).toLocaleDateString("tr-TR")}</p><small>{x.author_id===user.id||["founder","admin"].includes(p.role)?<Link href={"?edit="+x.id}>Düzenle / Yayımla / Taslağa al</Link>:<span>Yalnızca kendi yayınlarını düzenleyebilirsin</span>}</small></article>):<p>Yayın kaydı bulunamadı.</p>}</section></div></main>;
}