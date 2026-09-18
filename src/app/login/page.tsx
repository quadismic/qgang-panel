import {AuthButtons} from "@/components/AuthButtons";
import {createClient} from "@/lib/supabase/server";
import {defaultDesign,normalizeDesign} from "@/lib/design";

export default async function Login(){
  const s=await createClient();
  const {data}=await s.from("design_settings").select("settings").eq("key","active").maybeSingle();
  const design=normalizeDesign(data?.settings??defaultDesign);
  return <main className="login loginV3 loginV4 loginV5">
    <div className="loginMotionBg" aria-hidden="true"/>
    <div className="loginGateShade" aria-hidden="true"/>
    <section className="loginPortal loginPortalV5">
      <header className="loginCrest loginCrestV5">
        <span className="loginEmber" aria-hidden="true"/>
        <img src={design.emblemSrc} alt="Q-GANG"/>
      </header>
      <h1 className="loginClaimV5">Yerini <em>al.</em></h1>
      <div className="loginDividerV5" aria-hidden="true"><i/><span>◇</span><i/></div>
      <div className="loginCard loginCardV5">
        <AuthButtons/>
      </div>
    </section>
  </main>
}