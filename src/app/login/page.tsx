import {AuthButtons} from "@/components/AuthButtons";
import {createClient} from "@/lib/supabase/server";
import {defaultDesign,normalizeDesign} from "@/lib/design";

export default async function Login(){
  const s=await createClient(); const {data}=await s.from("design_settings").select("settings").eq("key","active").maybeSingle(); const design=normalizeDesign(data?.settings??defaultDesign);
  return <main className="login loginV3">
    <div className="loginGateShade" aria-hidden="true"/>
    <section className="loginPortal loginPortalV3">
      <header className="loginCrest loginCrestV3">
        <img src={design.emblemSrc} alt="Q-GANG"/>
        <div><strong>Q-GANG</strong><small>DISCIPLINA · UNITAS · POTENTIA</small></div>
      </header>
      <div className="loginCard loginCardV3">
        <span className="kicker">Q-GANG'A GİRİŞ</span>
        <h1>Yerini <em>al.</em></h1>
        <div className="loginRule" aria-hidden="true"><span>◆</span></div>
        <p>Q-GANG'a katılmak veya hesabına erişmek için kimliğini doğrula.</p>
        <AuthButtons/>
      </div>
      <footer className="loginMotto loginMottoV3">DISCIPLINA · UNITAS · POTENTIA</footer>
    </section>
  </main>
}