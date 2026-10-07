# Q-GANG UI Convergence Report — 2026-10-06

## Kanonik sistem ve kapsam

QG_UI_SPEC.md mevcut başarılı örnekleri ve tokenları belgeler. Koyu törensel kimlik korunur; operasyonel kontroller bronz ortak primitive katmanına yakınlaştırılır. Aşağıdaki route envanteri kaynak dosyalarını gösterir; Türkçe public adresler mevcut rewrite/alias düzenini kullanır. Statüler kod incelemesine dayanır, görsel onay değildir.

| Kaynak route | Durum | Açıklama |
|---|---|---|
| `/account` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/announcements` | Canonical | Kanonik referans pattern; bu sınıflandırma kod temellidir. |
| `/budget` | Canonical | Kanonik referans pattern; bu sınıflandırma kod temellidir. |
| `/campfires/[slug]` | Legacy | Özel kontrol ve durum düzenleri korunuyor; toplu yeniden yazılmadı. |
| `/control/access` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/control/community/[id]` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/control/community` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/control/design` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/control/moderation` | Structural Review Required | Yoğun yönetim akışının bilgi mimarisi ayrı tasarım incelemesi gerektiriyor. |
| `/control` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/control/publications` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/control/system` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/entities/aster` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/gizlilik/cerezler` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/gizlilik` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/gizlilik/saklama` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/gizlilik/verilerim` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/gizlilik/yonetim/metinler` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/gizlilik/yonetim` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/gizlilik/yonetim/saklama` | Structural Review Required | Yoğun yönetim akışının bilgi mimarisi ayrı tasarım incelemesi gerektiriyor. |
| `/login` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/maintenance` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/members` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/onboarding` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/penalties` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/profile/edit` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/profile` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/publications/[slug]` | Canonical | Kanonik referans pattern; bu sınıflandırma kod temellidir. |
| `/publications` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/rozetler` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/rules` | Canonical | Kanonik referans pattern; bu sınıflandırma kod temellidir. |
| `/settings` | Legacy | Özel kontrol ve durum düzenleri korunuyor; toplu yeniden yazılmadı. |
| `/u/[handle]` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |

Kodeksin üç alt görünümü, yayın stüdyosu, topluluk yönetimi/yetkili düzenleme, yorumlar, profil düzenleyici ve ortak dialoglar da bileşen düzeyinde incelendi.

## Uygulanan güvenli değişiklikler

- Primitives: Input/Select ref desteği; Textarea ve LoadingState mevcut stillerle eklendi.
- RichTextEditor: compact/standard/editorial yoğunluğu ve açık accessible label; toolbar 44px, sayaç 12px, ortak yüklenme durumu.
- ProfileEditor/MemberProfileEditor: kısa biyografi, ortak form kontrolleri, yetkili formda responsive grid; Kullanıcı Adı etiketi.
- AnnouncementComposer, CodexComposer, DisciplineComposer/Requests, PublicationStudio/CoverField: ortak form ve aksiyon stilleri, editör etiketleri.
- AccessMatrixEditor: ortak aksiyonlar, aria-pressed, klavyeyle erişilen yatay tablo bölgesi.
- MemberPicker: ortak kontroller, yardımcı durum bağlantısı, hata niteliği; mevcut arama/seçim akışı korunur.
- BirthDateFields, BadgeManagement, DesignEditor, CommunityManagement, CodexCompilation/Workspace, AccountIdentityManager: güvenli kontrol standardizasyonları.
- ASTER, kişisel veri ve gizlilik yönetim ekranları: mevcut veri akışını koruyan ortak kontrol kullanımları.
- Bütçe/duyuru yükleme göstergeleri ortaklaştırıldı. Geniş CSS refactor yapılmadı.

## Korunan referanslar ve kalan sapmalar

Bütçe/duyuru defteri, yayın kartları, Kodeks okuma türleri, Topluluk heraldik portreleri korunur. Eski özel form, notice/durum, metadata, rozet ve editör araçları tamamen kaldırılmadı. Tüm error/empty ekranları zorla aynı metne dönüştürülmedi. Kontrol radius ve renkleri ortaklaştırılırken sayfa container mimarisi korunur.

## Design review required

Moderasyon ve saklama yönetimi yoğun ekranlarının yapısal sadeleşmesi; profil/hesap/settings görev sınırları; tüm token dışı stillerin daha geniş konsolidasyonu. Bu alanlar bu pakette yeniden tasarlanmadı.

## Accessibility ve responsive

Editör label, yardımcı metin, yetki toggle state, tablo klavye erişimi ve mobil 44px hedefler iyileştirildi. Kontrast, bütün durumlar ve tüm küçük özel kontrollerin uygunluğu henüz ölçülmedi. 1440/390px tarayıcı regresyonu bu oturumda Chromium socket() Operation not permitted hatası nedeniyle çalıştırılamadı.

Önceki results.json dosyası 76 deneme içeriyor fakat 44 yönlendirme hatası var; bu dosya başarılı tam site denetimi kanıtı değildir. Önceki konuşmadaki 76 ekranın tamamının geçtiği ifadesi bu kanıtla doğrulanamıyor. Fixture route ile düzeltilecek test harness mevcut; final değişiklikler için yeniden çalıştırılması gerekir.

## İş mantığı

Backend, database, migration, endpoint, yetkilendirme ve veri modeli değişmedi. Form action, alan adları, doğrulama sınırları ve API işlemleri korundu. Yerel test fixture verileri gerçek sistemden bağımsızdır; üretim route'u oluşturulmaz.

## Teknik doğrulama

TypeScript (`tsc --noEmit`), repository lint (`npm run lint`), production build (`npm run build`) ve `git diff --check` geçti.

Geçen testler: rich-text + rich-text-db; auth-onboarding; guest-identity; member-search; discipline-requests; public-codex; public-announcements; community-directory; publication-comments; test:documents (document-db, badge-document-routes, codex-pdf).

Tarayıcı testleri: ui-convergence Chromium socket kısıtı nedeniyle başlayamadı; access-ui varsayılan Playwright browser binary bulunamadığı için başlayamadı. Bunlar başarılı test olarak sayılmadı. UI test harness artık hatalı route/status/overflow/clipping/etiket sonuçlarında başarısız çıkış verir; eski script yalnız sonuç kaydederek başarı izlenimi verebiliyordu. Push, merge ve deploy yapılmadı. Görsel kontrol engeli çözülmeden paket tam doğrulanmış deploy-ready olarak sunulmaz.


## Ek düzeltme paketi — 23:20 talebi

Bu bölüm önceki paketin durumundan ayrıdır. Yeni paket henüz yayımlanmadı.

| Madde | Uygulama | Doğrulama |
|---|---|---|
| Kullanıcı silme | Ortak rumuz normalizasyonu, kalıcı beklenen rumuz, dialog spacing | Client helper ve gerçek POST handler mock testleri; tüm eski auth/yetki/hiyerarşi/tarihçe engelleri |
| Yayın yorumları | Tek dönüş, compact dipnot düğmesi ve Ctrl+Alt+F/KeyF, ortak panel, seçimin sonuna görsel, bronz gönder | Seçim sonu/atıf testleri, numaralandırma ve kayıt roundtrip; tarayıcı görsel kontrolü engelli |
| Topluluk | Tek içerik genişliği, kısa çizgiler, merkez/sarılan kartlar, tekrar şeridi kaldırıldı | CSS/kod incelemesi; 1440/390 tarayıcı kontrolü engelli |
| Duyurular | Hero altı arama/filtre ve yayımlama formu; ikinci başlık yok | Kod incelemesi ve mevcut public erişim testi |
| Kodeks | Dört üst blok, mobil 2×2, bağımsız PDF; misafir Disiplin göremez | Kodeks render testleri ve guest/member dördüncü bağlantı kontrolü |
| Bütçe | Kompakt mobil hero/toolbar, sarılan sıralama, alt navigasyon payı, Diğer gösterimi | Kategori ve mali helper testleri; görsel kontrol engelli |
| Mali PDF | GET /api/budget/pdf; tarih/kind kapsamı; tüm aktif kayıtlar; kuruş toplamları; anonimlik | 1101 satır/3 batch; PDF uzun açıklama/son kayıt/Türkçe/toplamlar; auth/permission/invalid scope/private-no-store |
| Profil menüsü | Yetkili Üyeyi düzenle bağlantısı mevcut ekrana gider; linkler normal akışta | Aynı canManage/canAssign/members.manage koşulları; server kapıları korunur |
| Navbar | Nokta markup/pseudo ve glow kaldırıldı | Kod/CSS incelemesi |
| Yetkili düzenleme | Üye Profilini Kaydet / Topluluk Yönetimine Dön | Kaynak metin ve ortak text-transform:none |

Yeni backend eklemesi PDF GET endpointidir; mevcut endpointlerin sözleşmesi korunur. Silme endpointinde yalnız rumuz girdi normalizasyonu değişir; yetkilendirme değişmez. Bütçe liste sorgusundaki 100 satır sınırı kaldırılıp PDF ile ortak sayfalı, deterministik sıralı okuma kullanılır. Database/schema/migration yok; kategori kayıtları birleştirilmez. Görünürlük/anonimlik korunur.

PDF isteği oluşturma anını üst tarih sınırı kullanır; sunucu çıktı dosyasını kaydetmez. Bu dosya değişmez bir veritabanı snapshot arşivi değildir. Aydınlatma varsayılan taslağı ve kategori özeti indirilebilir çıktı açıklamasıyla güncellendi; mevcut DB taslağı/yayımlanmış belgeye yazılmadı. İlgili etki kaydı docs/privacy/BUDGET_PDF_REVIEW_20261006.md.

Son doğrulama: TypeScript, tüm depo lint’i, production build ve git diff --check geçti. test-purge-confirmation, test-budget-pdf, test-footnote-shortcut, test-footnote-editor, test:rich-text, test-codex-layout, test-publication-comments, test-public-announcements ve test-guest-identity geçti. Chromium yine socket() Operation not permitted nedeniyle açılamadı. Bu nedenle 1440/390 görsel kontrolü ve görsel panelin gerçek tarayıcıdaki davranışı onaylanmış değildir. Sorunu tekrar oluşturamayan ortamda kesin görsel çözüm iddiası yoktur.


### Topluluk dış hizalama düzeltmesi — 2026-10-06
Hero, işlem düğmeleri, doğum günü bandı ve orgchart `communityPage` kapsayıcısında ortak `.content > *` genişlik ve auto margin sözleşmesini kullanır. Orgchart dış `max-width:100%`, `width:100%` ve `margin-inline:0` override’ları kaldırıldı. Kart/rütbe stilleri ve yetki koşulları değiştirilmedi. Diğer sayfalara yeni kural uygulanmaz.
1440/390px tarayıcı kenar eşitliği ve kart sarılma ölçümü Chromium `socket() failed: Operation not permitted` engeli nedeniyle tamamlanamadı; görsel doğrulama bekliyor. Deploy yapılmadı.

Bu düzeltmede `npx tsc --noEmit`, `npm run lint`, `npm run build` ve `git diff --check` geçti. Build mevcut autoprefixer start/end uyumluluk uyarılarıyla tamamlandı.


### Mobil yayın yorum editörü — 2026-10-07
Yalnız yayın yorumlarında mobil toolbar temel kalın/italik, madde/numaralı liste, bağlantı, kompakt önizleme ve mevcut ••• menüsünü gösterir. Dipnot, kod, görsel, tablo ve ek biçimler menüde korunur. Grup ayırıcıları kaldırılır; 44px hedefler ve grup sarılması korunur. Tam genişlik bronz gönder düğmesinin altında tek sade dönüş bağlantısı bulunur. Sayaç/bilgi ve form boşlukları kompaktlaştırılır. Masaüstü araçları korunur.
Typecheck, lint, dipnot kısayol/seçim/görsel ekleme ve numaralandırma testleri geçti. 390px gerçek görünüm doğrulaması bu oturumda Chromium yürütülebilir dosyası bulunmadığından tamamlanamadı. Deploy yapılmadı.

Production build ve zengin metin kayıt/yeniden açma, dipnot roundtrip ve medya kalıcılık testleri de geçti.


### Topluluk / Profil / Disiplin — 2026-10-07
- Topluluk üye kartları yalnız <=760px breakpointte tek sütun ve kullanılabilir tam genişlik; masaüstü kart kuralları korunur.
- Profil işlemleri native auto popover top layer kullanır. Escape/dış tıklama ve odak davranışı tarayıcıya aittir; fixed panel ölçümü viewport içine sınırlandırılır. Hero, avatar stacking context veya overflow sınırları paneli kapatamaz.
- Yetkili üye editöründe kişisel form sonrası Üyelik ve Yetki / Rozetler bölümleri. Mevcut rol, üyelik ve rozet API/RPC denetimleri yeniden kullanılır; server component ayrıca members.manage, founder/admin ve hedef hiyerarşisini denetler. Kendine/üstüne rütbe ve üyelik işlemi açılmaz; yalnız aktif üyeye rol ve rozet tevzihi. Rol/üyelik ve rozet geri alma için açık checkbox onayı. Mevcut upload formu değişmedi.
- Disiplin hero CTA kaldırıldı. Denetim kutuları → karar defteri → gömülü şikâyet/itiraz başvuruları → yetkili kayıt formu sırası uygulanır. Başvurular details içinde aynı sayfada açılır. Profil bildirimi hedef seçimini ve başvuru anchor’ını korur. Misafir kapısı, own-decision/finality/issuer itiraz kuralları ve staff issue kapıları korunur.
- Typecheck, lint ve production build geçti. test-member-authority-ui, test-member-authority-routes, test-discipline-requests ve test-badges-db geçti. React incelemesi: hooks koşulsuz, panel native erişilebilir popover, sorgular session/RLS ile, bağımsız sorgular paralel.
- 390/1440px gerçek görünüm, yatay taşma ve hit-test doğrulaması tamamlanamadı. Yerel Chromium yok; Playwright kurulumu bozuk/eksik zip indirmesiyle başarısız. Top layer mimarisi görsel test sonucu olarak sunulmaz.
- Veritabanı migration, yeni veri amacı/izin veya deploy yok.

## Etkinlik sistemi geliştirme eki — 2026-10-07

Ortak primitive'lerle Etkinlikler liste/arşiv/detay, öneri ve yönetim formları, ana sayfa yaklaşan etkinlik alanı/üçüncü sütun, yönetim 7 günlük uyarısı ve profil katılım faaliyeti eklendi. Erişim Merkezi'ne yedi ayrı etkinlik yetkisi ve varsayılanları bağlandı; sunucu/RLS/RPC ayrımları uygulandı. Arşiv önizleme ve açık onaylı tekrarsız aktarım, tarihsel kimlik eşleştirmesi, ayrı yoklama ve kapasite kuyruğu bulunur.

Kaynak incelemesi: Wix QEvents 27 kayıt, 6 silinmiş, 21 tamamlanmış; 165 katılımcı kaydında 119 doğrulanmış eski kimlik bağlantısı, 46 eşleşme bekleyen kayıt. 6 açık yoklama katılımı, 159 yoklama doğrulaması bekleyen kayıt. Puanlar yeniden işlenmez; iki eski tür etiketi korunur. Canlı aktarım yapılmadı.

Ayrıntılar: `docs/EVENTS_IMPLEMENTATION_20261007.md`; veri/metin incelemesi: `docs/privacy/EVENTS_REVIEW_20261007.md`. Gerçek 390/1440px görsel doğrulama tarayıcı indirmesi bozuk ZIP döndürdüğü için tamamlanmadı. Migration ve deploy uygulanmadı; mevcut Kodeks yayımları değiştirilmedi.

Etkinlik eki doğrulaması: typecheck, lint, build; event domain/API/PostgreSQL testleri; mevcut üye yetki API ve disiplin başvuru regresyon testleri geçti. Build önceki CSS satırlarında autoprefixer uyarıları içeriyor.

## 2026-10-07 — Kodeks kök neden ve deploy hazırlığı

Gerçek 390px testinde dialog 390px iken drawer yalnız 255.14px idi. Dialog içindeki erişilebilirlik başlığı `.sr-only` sınıfının stil tanımı bulunmadığından flex sütunu olarak alan tüketiyordu. Yalnız Kodeks dialog’undaki bu başlık görsel akıştan çıkarıldı; erişilebilir adı korundu. Mobil dış sınırlar/tek sütun/safe-area payı açıkça tanımlandı. Son ölçüm: dialog/drawer 390px, taşma 0; 1440px’de dialog 1120px, taşma 0. Gerçek editör yükleme, başlık alanı, 44px kapatma, Escape ve yeniden açma geçti.

Üç tarihsel kararın tek kaynak alanı `public.regulations.title`; duyuru akışı bu kaynaktan görünümle üretilir. Normal UPDATE revizyon/değişiklik tarihini yeniler. Bekleyen `20261007023442_codex_historical_decision_titles.sql`, tablo kilidi altında yalnız başlıkları değiştirir, revision trigger’ını işlem içinde geçici durdurup geri açar; kimlik/numara doğrulaması çalışmaya devam eder. Her diğer sütunun ve eski duyuru/revizyonların aynı kalması SQL içinde doğrulanır. Beklenmeyen kayıt/başlık veya yan etki tüm işlemi geri alır. Eski PDF snapshot’ları değiştirilmez. Canlı veritabanında uygulanmadı.

Başlıklar: İK-2026-001 → Renovich · Vekilharçlığa Atama; İK-2026-002 → JUSTilknur & Gaspare · Statü Düzenlemesi; İK-2026-003 → Schizo · Teğmenliğe Atama. İçerikteki Emir ifadeleri korunur. Yeni kararlarda biçim önerisi eklendi; otomatik metin değiştirme yok.

Etkinliklerin ana sayfa/öneri bileşenleri de gerçek 390/1440px tarayıcı testinde doğrulandı; taşma yok, mobil tek sütun/masaüstü planlanan sütunlar ve 44px kontroller. Reddedilen gönderim alanları koruyor. Önceki tarayıcı kurulumu engeli alternatif yerel Chromium ile aşıldı. Fixture’lar gerçek bileşenleri kullanır; canlı auth/yönetim/import uçtan uca QA ayrı kalır.

Kişisel veri etki kontrolü: bu Kodeks düzeltmesinde yeni kategori/amaç/alıcı/sağlayıcı/çerez/saklama/erişim değişikliği yok; altı FEATURE_REVIEW sorusu olumsuz. Etkinlik paketinin ayrı gizlilik taslağı ve inceleme ihtiyacı devam eder. Production deploy veya migration yapılmadı. Yayın planı: DEPLOY_READINESS_20261007.md.

## 2026-10-07 — Etkinlikler sunum güncellemesi

Önceki üç sütunlu etkinlik ana sayfası sözleşmesi değiştirildi: en yakın iki yayımlanmış kayıt yatay Yaklaşan Etkinlik alanında; Yayınlar/Duyurular iki sütun. Tarihli defter, ortak genişlikte mevcut asset'li hero, üst öner/oluştur aksiyonları ve izinli ••• aktarım/ayar menüsü uygulandı. Mobil tek sütun ve 44px hedefler; tarih filtresi yalnız arşiv. İş mantığı, Erişim Merkezi ve RLS korunur. 390/1440px gerçek bileşen testleri, uzun başlık, tam/boş ve üye/yetkili varyasyonlarında hizalama/taşma/dialog doğrulamasını kapsar. Ayrıntılar: EVENTS_UI_REPORT_20261007.md. Deploy yok.

Son kontroller: typecheck/lint/build ve etkinlik domain/API/DB/sunucu sunum/görsel testleri geçti. Mevcut CSS autoprefixer uyarıları build'i engellemiyor. Canlı auth/aktarım uçtan uca doğrulaması bu yerel çalışma kapsamında yapılmadı.

## 2026-10-07 — Eşleşmiş üyelerde giriş/kimlik oluşturma döngüsü

Google girişi başarılı iken doğrulanmış üç legacy hesabın `onboarding_completed_at` alanı boş kalmıştı. Bilgileri tamamlanmış ve aktif üyeliği yönetimce doğrulanmış bu üç hesabın marker'ı canlıda onarıldı; sonraki legacy link işlemlerine private invoker trigger eklendi. Yeni/eksik hesap onboarding akışında kalır. Rol, üyelik, özel bilgi ve legacy bağlantıları önce/sonra aynı; eşleşmiş eksik profil 0. Auth/DB/guest testleri, typecheck/lint/build geçti. Yerel onboarding formu mevcut isim/rumuzu korur; web deploy yapılmadı. Ayrıntılar AUTH_IDENTITY_LOOP_REPORT_20261007.md.
