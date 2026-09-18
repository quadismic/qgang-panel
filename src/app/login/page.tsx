import {AuthButtons} from "@/components/AuthButtons";
import {brandTheme} from "@/config/brand-theme";

export default function Login(){
  return <main className="login loginV2">
    <div className="loginAtmosphere" aria-hidden="true"><i/><i/><i/></div>
    <div className="loginMonument" aria-hidden="true">
      <img src={brandTheme.mark} alt=""/>
    </div>
    <section className="loginPortal">
      <header className="loginCrest">
        <img src={brandTheme.mark} alt="Q-GANG"/>
        <div><strong>Q-GANG</strong><small>DISCIPLINA · UNITAS · POTENTIA</small></div>
      </header>
      <div className="loginCard loginCardV2">
        <span className="kicker">ATEŞE HOŞ GELDİN</span>
        <h1>Tek kimlik.<br/><em>Tüm Q-GANG.</em></h1>
        <div className="loginRule" aria-hidden="true"><span>◆</span></div>
        <p>Google veya Discord ile güvenli biçimde giriş yap. Aynı doğrulanmış e-posta otomatik olarak tek Q-GANG hesabında birleşir; diğer kimliklerini Hesap Merkezi'nden bağlayabilirsin.</p>
        <AuthButtons/>
        <div className="loginIdentity">
          <span><b>◇</b>TEK HESAP</span><span><b>♜</b>TOPLULUK</span><span><b>✦</b>OYUN KİMLİĞİ</span>
        </div>
        <small>Steam, Q-GANG'e girdikten sonra oyun kimliği olarak bağlanır ve Birlikte Oyna akışında kullanılır.</small>
      </div>
      <footer className="loginMotto">“Düzen, özgürlüğün yegâne teminatıdır.”</footer>
    </section>
    <div className="loginSideMotto loginSideLeft">DISCIPLINA</div>
    <div className="loginSideMotto loginSideRight">UNITAS · POTENTIA</div>
  </main>
}