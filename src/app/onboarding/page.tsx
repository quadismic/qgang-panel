import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "../qgang-4.css";
export const dynamic="force-dynamic";
export default async function Onboarding({searchParams}:{searchParams:Promise<{next?:string;error?:string}>}){
 const db=await createClient();const user=await getCurrentUser();if(!user)redirect("/login?next=/onboarding");
 const {data:p}=await db.from("profiles").select("display_name,handle,onboarding_completed_at").eq("id",user.id).maybeSingle();
 const q=await searchParams;let next=q.next||"/";if(!next.startsWith("/")||next.startsWith("//"))next="/";
 if(p?.onboarding_completed_at)redirect(next);
 return <main className="q4 q4-entry"><div className="q4-wrap"><header className="q4-head"><div><h1>Q-GANG<span className="q4-dot">.</span></h1><p>KLÂN SİCİLİ / 4.0</p></div></header><section className="q4-entrycard"><div className="q4-sectionhead"><h2>ÜYELİK BAŞVURUSU</h2></div><p className="q4-muted">Q-GANG'e katılmak için rumuzunu belirle. Başvurun yönetim onayına gönderilecek.</p>{q.error&&<p className="q4-error">Bilgilerini kontrol et. Rumuz daha önce alınmış olabilir.</p>}<form className="q4-form" action="/api/onboarding" method="post"><input type="hidden" name="next" value={next}/><label>RUMUZ <span>*</span><input name="handle" defaultValue={p?.handle??""} minLength={3} maxLength={24} pattern="[a-z0-9_]+" placeholder="Örn. quadismic" autoComplete="nickname" required/></label><label>İSİM SOYİSİM <small>İSTEĞE BAĞLI</small><input name="display_name" defaultValue={p?.display_name??""} maxLength={60} placeholder="Adın ve soyadın" autoComplete="name"/></label><label>DOĞUM TARİHİ <small>İSTEĞE BAĞLI</small><input name="birth_date" type="date" min="1900-01-01" max={new Date().toISOString().slice(0,10)}/></label><button type="submit">ÜYELİK İSTEĞİ GÖNDER</button></form><p className="q4-entrynote">Başvurun onaylandığında aynı Google hesabınla giriş yapabilirsin.</p></section></div></main>;
}