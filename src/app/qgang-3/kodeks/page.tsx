import Link from "next/link";
import "../preview.css";
export const metadata={title:"Kodeks"};
export default function Codex(){return <main className="qg3"><div className="qg3-content"><p><Link href="/">← Ana sayfa</Link></p><h1>Q-GANG KODEKSİ</h1><p>Topluluğun temel ilkeleri</p><div className="qg3-archiveresults">{[
["Topluluk","Q-GANG dijital oyunları ortak faaliyet olarak benimseyen bağımsız ve gönüllü bir topluluktur. Saygı, aidiyet ve dayanışma esastır."],
["Üyelik","Üyelik adaylık ve kabul yoluyla kazanılır. Düşük etkinlik tek başına yaptırım nedeni değildir."],
["Yönetim","Rütbeler LİDER, VEKİLHARÇ, KAPTAN, TEĞMEN ve ÜYE olarak sıralanır. Yönetim yetkileri Kodeks ve icra kararları çerçevesinde kullanılır."],
["Normatif düzen","Topluluğun düzeni Kodeks, yönergeler ve numaralandırılmış icra kararlarıyla belirlenir."],
["Faaliyetler ve mali işler","Resmî etkinlikleri KAPTAN ve üzeri rütbeler düzenler. Zorunlu aidat yoktur. Bütçe LİDER tarafından yönetilir."],
["Disiplin","Uyarı, kınama, geçici yararlanamama, rütbe düşürme veya görevden alma ve üyelikten çıkarma yaptırımları uygulanabilir. Savunma ve itiraz hakları korunur."],
["Geçiş","Geçmiş kayıtlar arşivlenir ve kazanılmış haklar korunur."]
].map(([title,body],i)=><article className="qg3-archiverow" key={title}><span className="qg3-archivetype">{i+1}</span><div><h2>{title}</h2><p>{body}</p></div></article>)}</div><p>Bu sayfa Kodeks'in sadeleştirilmiş özetidir; bağlayıcı tam metnin yerini almaz.</p></div></main>}