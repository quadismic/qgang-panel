import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "../qgang-4.css";
export const dynamic="force-dynamic";
export default async function Onboarding({searchParams}:{searchParams:Promise<{next?:string;error?:string}>}){
 const db=await createClient();const user=await getCurrentUser();if(!user)redirect("/login?next=/onboarding");
 const {data:p}=await db.from("profiles").select("display_name,handle,onboarding_completed_at").eq("id",user.id).maybeSingle();
 const q=await searchParams;let next=q.next||"/";if(!next.startsWith("/")||next.startsWith("//"))next="/";
 if(p?.onboarding_completed_at)redirect(next);
 return <main className="q4"><div className="q4-wrap"><header className="q4-head"><div><h1>Q-GANG<span className="q4-dot">.</span></h1><p>KLÂN SİCİLİ / 4.0</p></div></header><section className="q4-section"><div className="q4-sectionhead"><h2>KİMLİK KAYDI</h2></div><p className="q4-muted">Üyelik yönetim onayına tabidir.</p>{q.error&&<p className="q4-muted">Bilgileri kontrol ederek yeniden deneyin.</p>}<form className="q4-form" action="/api/onboarding" method="post" encType="multipart/form-data"><input type="hidden" name="next" value={next}/><label>İSİM SOYİSİM<input name="display_name" defaultValue={p?.display_name??""} minLength={2} maxLength={60} required/></label><label>RUMUZ<input name="handle" defaultValue={p?.handle??""} minLength={3} maxLength={24} pattern="[a-z0-9_]+" required/></label><label>DOĞUM TARİHİ<input name="birth_date" type="date" min="1900-01-01" max={new Date().toISOString().slice(0,10)} required/></label><label>PROFİL RESMİ (İSTEĞE BAĞLI)<input name="avatar" type="file" accept="image/png,image/jpeg,image/webp"/></label><button type="submit">KAYDI TAMAMLA</button></form></section></div></main>;
}