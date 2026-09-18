import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {brandTheme} from "@/config/brand-theme";
import "./onboarding.css";

export const dynamic="force-dynamic";

export default async function Onboarding({searchParams}:{searchParams:Promise<{next?:string;error?:string}>}){
 const s=await createClient();
 const {data:{user}}=await s.auth.getUser();
 if(!user)redirect("/login?next=/onboarding");
 const {data:p}=await s.from("profiles").select("display_name,avatar_url,onboarding_completed_at,qgang_era,qgang_seal").eq("id",user.id).maybeSingle();
 const q=await searchParams;
 let next=q.next||"/";
 if(!next.startsWith("/")||next.startsWith("//"))next="/";
 if(p?.onboarding_completed_at)redirect(next);
 const suggested=p?.display_name==="QUAD"?"QUAD":"";
 return <main className="identityGate">
   <div className="identityGateBg"/>
   <section className="identityGateCard">
    <div className="identityGateCrest"><img src={brandTheme.emblem} alt="Q-GANG"/></div>
    <small>Q-GANG · KİMLİK KAYDI</small>
    <h1>Kimliğini oluştur.</h1>
    <p>Burada gerçek adın değil, Q-GANG içinde taşıyacağın isim görünür. Mührün kimliğin oluşturulduğunda sistem tarafından verilir.</p>
    {q.error&&<div className="identityGateError">{q.error==="taken"?"Bu isim başka bir kimliğe ait.":q.error==="birth"?"Doğum tarihini kontrol et.":"İsim 3–20 karakter olmalı; harf, rakam ve alt çizgi kullanabilirsin."}</div>}
    <form action="/api/onboarding" method="post">
      <input type="hidden" name="next" value={next}/>
      <label><span>NICK</span><input name="nick" defaultValue={suggested} minLength={3} maxLength={20} pattern="[A-Za-z0-9_]+" autoComplete="off" placeholder="QUAD" required/><em>Kimlik plakanda büyük harfle görünür.</em></label>
      <label><span>DOĞUM TARİHİ</span><input name="birth_date" type="date" min="1900-01-01" max={new Date().toISOString().slice(0,10)} required/><em>Gizlidir; topluluk profilinde yayınlanmaz.</em></label>
      <div className="identityGatePreview">
       <div>{p?.avatar_url?<img src={p.avatar_url} alt="" referrerPolicy="no-referrer"/>:<span>Q</span>}</div>
       <section><small>Q-GANG MÜHRÜ</small><b>{p?.qgang_seal?((p.qgang_era??1)+" · "+p.qgang_seal):"I · ••••"}</b><em>Mühür değiştirilemez.</em></section>
      </div>
      <button className="identityGateSubmit">KİMLİĞİNİ OLUŞTUR</button>
    </form>
   </section>
 </main>
}