import {AuthButtons} from "@/components/AuthButtons";
import {createClient} from "@/lib/supabase/server";
import {defaultDesign,normalizeDesign} from "@/lib/design";
import {brandTheme} from "@/config/brand-theme";

export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){
  const s=await createClient();
  const {data}=await s.from("design_settings").select("settings").eq("key","active").maybeSingle();
  const design=normalizeDesign(data?.settings??defaultDesign);
  const q=await searchParams;
  return <main className="login loginV3 loginV4 loginV5">
    <div className="loginMotionBg" aria-hidden="true"/>
    <div className="loginGateShade" aria-hidden="true"/>
    <section className="loginPortal loginPortalV5">
      <header className="loginCrest loginCrestV5">
        <span className="loginEmber" aria-hidden="true"/>
        <img src={brandTheme.emblem} alt="Q-GANG"/>
      </header>
      <h1 className="loginClaimV5">Yerini <em>al.</em></h1>
      <div className="loginDividerV5" aria-hidden="true"><i/><span>◇</span><i/></div>
      <div className="loginCard loginCardV5">
        {q.error&&<div className="qgangInlineError" role="alert"><span>GİRİŞ BAŞARISIZ</span><p>Google oturumu tamamlanamadı. Lütfen yeniden deneyin.</p></div>}
        <AuthButtons/>
      </div>
    </section>
  </main>
}