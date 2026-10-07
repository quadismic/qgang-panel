# Q-GANG Canonical UI Spec

Mevcut koddan çıkarılan standart; yeni tasarım dili değildir. Kaynaklar: globals.css, ui-primitives.css, Primitives, Dialog, OverflowMenu, LoadMore ve mevcut ekran bileşenleri.

## Referans düzenler

| Referans | Kanonik kullanım |
|---|---|
| Ana sayfa ve Topluluk | Törensel kimlik, amblem, portre ve bölüm girişi |
| Bütçe | Tarih/kategori/açıklama/tutar hizalı mali kayıtlar |
| Duyurular | Kronolojik defter, kısa özet, açılan tam metin |
| Yayınlar | Editoryal kart ve uzun okuma yüzeyi |
| Kodeks | Hüküm/yönerge/karar için farklı normatif okuma düzenleri |

## Katmanlar ve tokenlar

Kimlik katmanı serif, bronz, kontrollü kırmızı vurgu ve heraldik öğeler kullanır. Operasyonel katman sans-serif, sade yüzey, okunabilir kontroller ve divider kullanır. Her içerik grubu kart değildir; yeni yüzey yalnız görev veya etkileşim sınırında açılır.

| Rol | Mevcut karşılık |
|---|---|
| Display / section / normatif başlık | --qg-display-font; sayfanın mevcut başlık ölçeği |
| UI ve form | --qg-ui-font; kontrol metni 14px, mobilde 16px |
| Metadata | --qg-muted; 12px / 1.5 |
| Body | Mevcut qgProse okuma düzeni |
| Overline | kicker; kısa kategori/kurumsal etiket |
| Temel / yükseltilmiş yüzey | #100c08 / #17100a |
| Divider / kontrol sınırı | #493421 / #6b4d2d |
| Kontrol metni / vurgu / destructive | #dfcdb6 / #c39a67 / #d88775 |
| Kontrol radius / yükseklik | 6px / en az 44px |
| Form alanı / grup aralığı | 8px / 20px |

Bronz normal birincil işlemler içindir. Kırmızı kritik/destructive ve normatif vurguya ayrılır. Durum anlamı yalnız renk ile aktarılmaz. Container genişlikleri ve törensel hero ölçekleri mevcut sayfa bağlamına göre korunur; bütün ekranlar tek genişliğe zorlanmaz.

## Ortak kontroller

Button: primary, secondary, tertiary, destructive. IconButton: erişilebilir ad ve QGIcon. Input/Select/Textarea: aynı sınır, yüzey, focus ve disabled davranışı; label tüketici tarafından sağlanır. Ref aktarımı React 19 ref prop ile korunur.

Badge ve Metadata anlamsal türleri birleştirir; norm türleri NormBadge üzerinden korunur. OverflowMenu seyrek/destructive işlemleri toplar. LoadMore dili: [N] KAYIT DAHA GÖSTER ↓; içerik için label parametresi kullanılabilir.

Dialog: accessible name, showModal ile focus trap ve arka plan kilidi, üst pencere için Escape, kapanışta focus restore. SurfaceLayer, kırpma, Kodeks ve hesap silme aynı davranışı kullanır. Bu paket önceki dialog altyapısını yeniden yazmaz.

EmptyState kısa; ErrorState hatayı boş içerikten ayırır. LoadingState role=status ve reduced-motion desteği kullanır. Ekrana özel iş durumları kendi metinlerini korur.

## Editör yoğunluğu ve mobil

280–500 karakter kısa içerik compact; orta uzunluk standard; uzun yayın editorial. Toolbar dokunma hedefleri 44px. Label içerik rolünü belirtir. Biçimlendirme ve kayıt serileştirmesi değişmez.

760px altında yetkili profil formu tek sütuna geçer; aksiyonlar sarılır, kontrol fontu 16px olur. Uzun tablo kendi bölgesinde kaydırılır, sayfa taşması oluşturmaz. Yerel CSS düzeltmeleri yapılır; geniş !important temizliği yapılmaz.

## Doğrulama sınırı

Bu standardın tüm ekranlara görsel uygunluğu 1440 ve 390px tarayıcı regresyonu ile ayrıca doğrulanmalıdır. Kod incelemesi ölçülmüş kontrast veya tamamlanmış görsel doğrulama değildir.


## 6 Ekim düzeltme paketi

- Kodeks üst navigasyonu: oturumlu üye ve üzeri için dört eşit blok; mobil 2×2. Disiplin bağlantısının mevcut guest engeli korunur. PDF ayrı yardımcı aksiyondur.
- Topluluk şeması hero ile aynı tam içerik genişliğini kullanır; tekrar eden üst şerit yoktur. Rütbe başlıklarının çizgileri kısa, lider/vekilharç ve sarılan üye kartları merkezlidir.
- Duyuruların arama/filtre ve açılır yayımlama formu hero altındadır; defter ikinci hero başlığı üretmez.
- Silme dialogu doğrulamada rumuzu kullanır. Beklenen @rumuz ayrı ve kalıcı metindir. Tek baştaki @, dış boşluk ve büyük/küçük harf istemci ve sunucuda aynı normalizasyonu kullanır; iç boşluk ve başka kimlik reddedilir.
- Yayın yorumunda tek Yayınlara dön kontrolü, bronz primary gönderim, dipnot düğmesi/kısayolu ve ortak içerik panelleri vardır. Görsel seçili metnin sonuna eklenir; metni silmez.
- Mali defter PDF yardımcı aksiyonu ayrı açılır kapsam formudur. Tüm hareketler/gelir/gider ve İstanbul tarih aralığı seçilir. Çıktı Kodeks ailesinin koyu kapak, bronz çizgi, serif gövde, açık okuma sayfaları ve künyesini kullanır. Toplamlar kuruş bazında hesaplanır; çıktı kapsam toplamıdır, tam bakiye değildir.
- DİĞER ve Diğer gösterimde Diğer etiketine dönüşür; kayıtların kategori değerleri değişmez. Liste ve PDF 100 kayıtla kesilmez; sayfalı sunucu okuması kullanılır.
- Profil overflow bağlantıları üst üste konumlanmaz; yetkili Üyeyi düzenle, Üyeyi bildir üzerinde gösterilir.
- Navbar aktif durumu ince accent, aktif ikon ve hafif yüzeydir. Nokta markup ve pseudo-elementleri kaldırılır; glow yoktur.


### Topluluk dış hizalama düzeltmesi — 2026-10-06
Hero, işlem düğmeleri, doğum günü bandı ve orgchart `communityPage` kapsayıcısında ortak `.content > *` genişlik ve auto margin sözleşmesini kullanır. Orgchart dış `max-width:100%`, `width:100%` ve `margin-inline:0` override’ları kaldırıldı. Kart/rütbe stilleri ve yetki koşulları değiştirilmedi. Diğer sayfalara yeni kural uygulanmaz.
1440/390px tarayıcı kenar eşitliği ve kart sarılma ölçümü Chromium `socket() failed: Operation not permitted` engeli nedeniyle tamamlanamadı; görsel doğrulama bekliyor. Deploy yapılmadı.


### Mobil yayın yorum editörü — 2026-10-07
Yalnız yayın yorumlarında mobil toolbar temel kalın/italik, madde/numaralı liste, bağlantı, kompakt önizleme ve mevcut ••• menüsünü gösterir. Dipnot, kod, görsel, tablo ve ek biçimler menüde korunur. Grup ayırıcıları kaldırılır; 44px hedefler ve grup sarılması korunur. Tam genişlik bronz gönder düğmesinin altında tek sade dönüş bağlantısı bulunur. Sayaç/bilgi ve form boşlukları kompaktlaştırılır. Masaüstü araçları korunur.
Typecheck, lint, dipnot kısayol/seçim/görsel ekleme ve numaralandırma testleri geçti. 390px gerçek görünüm doğrulaması bu oturumda Chromium yürütülebilir dosyası bulunmadığından tamamlanamadı. Deploy yapılmadı.


### Topluluk / Profil / Disiplin — 2026-10-07
- Topluluk üye kartları yalnız <=760px breakpointte tek sütun ve kullanılabilir tam genişlik; masaüstü kart kuralları korunur.
- Profil işlemleri native auto popover top layer kullanır. Escape/dış tıklama ve odak davranışı tarayıcıya aittir; fixed panel ölçümü viewport içine sınırlandırılır. Hero, avatar stacking context veya overflow sınırları paneli kapatamaz.
- Yetkili üye editöründe kişisel form sonrası Üyelik ve Yetki / Rozetler bölümleri. Mevcut rol, üyelik ve rozet API/RPC denetimleri yeniden kullanılır; server component ayrıca members.manage, founder/admin ve hedef hiyerarşisini denetler. Kendine/üstüne rütbe ve üyelik işlemi açılmaz; yalnız aktif üyeye rol ve rozet tevzihi. Rol/üyelik ve rozet geri alma için açık checkbox onayı. Mevcut upload formu değişmedi.
- Disiplin hero CTA kaldırıldı. Denetim kutuları → karar defteri → gömülü şikâyet/itiraz başvuruları → yetkili kayıt formu sırası uygulanır. Başvurular details içinde aynı sayfada açılır. Profil bildirimi hedef seçimini ve başvuru anchor’ını korur. Misafir kapısı, own-decision/finality/issuer itiraz kuralları ve staff issue kapıları korunur.
- Typecheck, lint ve production build geçti. test-member-authority-ui, test-member-authority-routes, test-discipline-requests ve test-badges-db geçti. React incelemesi: hooks koşulsuz, panel native erişilebilir popover, sorgular session/RLS ile, bağımsız sorgular paralel.
- 390/1440px gerçek görünüm, yatay taşma ve hit-test doğrulaması tamamlanamadı. Yerel Chromium yok; Playwright kurulumu bozuk/eksik zip indirmesiyle başarısız. Top layer mimarisi görsel test sonucu olarak sunulmaz.
- Veritabanı migration, yeni veri amacı/izin veya deploy yok.

## Etkinlikler — 2026-10-07 geliştirme eki

- Ortak AppShell içerik genişliği, managementHero/managementPanel yüzeyleri ve bronze primary primitive'leri kullanılır.
- Menü yalnız etkinlik görüntüleme yetkisi ve topluluk erişimi olan kişide görünür. Etkinlikler: Yaklaşan Etkinlikler / Etkinlik Arşivi.
- Türlerin başlangıç sırası GANG-UP, OP-NIGHT, BBQ-GANG, Q-NITY; sabit kimlikler korunur, ad/açıklama/sıra yetkili ayarıdır.
- Ana sayfa: Yayınlar/Duyuruların üzerinde içerikle büyüyen yatay Yaklaşan Etkinlik alanı; en yakın 1–2 yayımlanmış kayıt. Alt akış iki eşit sütun; 1000px altında tek sütun. Üçüncü Son Etkinlikler sütunu ve carousel yok. Etkinlikler mobilde alt alta akar; 44px hedefler korunur.
- Etkinlik hero'su ortak içerik genişliğinde mevcut sicil salonu asset'iyle kimlik/açıklama taşır; operasyon hero dışında. Yaklaşan/Arşiv sekmelerinin yanında mevcut izinlerle öner/oluştur; tarihsel aktarım ve tür/sıralama yetkili ••• menüsünde. Ortak native Dialog ve form kontrolleri kullanılır. Kritik durum/yoklama/eşleştirme/aktarımı açık onay gerektirir.
- Form bağlantı/yetki hataları alanları silmeden form içinde gösterilir. Katılım yanıtı gerçek yoklama değildir; kapasite dolduğunda bekleme sırası ayrı gösterilir.
- Tarihsel kayıtlar tarih hassasiyetini korur: yalnız tarihi bilinen etkinliğe saat uydurulmaz. Bilinmeyen eski türün etiketi saklanır. Eşleşmeyen rumuz ve doğrulanmamış katılım Faaliyetler'e eklenmez.
- Faaliyetler yalnız tamamlanmış etkinlikte doğrulanmış katılımı etkinlik tarihiyle gösterir; Katılım Arşivi bağlantısı üye filtresini açar.
- Topluluk yönetimi: doğum günü alanından sonra 7 günlük etkinlik uyarıları, BUGÜN etiketi ve ayrı tamamlanma bekleyenler listesi.
- 390/1440px gerçek tarayıcı QA henüz tamamlanmamıştır; kurulum engeli geliştirme raporunda kayıtlıdır.

## Kodeks dialog ve başlık standardı — 2026-10-07

- Kodeks dialog’unun ekran okuyucu başlığı görsel yerleşime katılmaz. Mobilde dialog/drawer viewport genişliğini birlikte kullanır; tek sütun, safe-area alt payı ve 44px kapatma/alan hedefleri. Masaüstünde sağa bağlı 1120px panel korunur. Düzeltme yalnız Kodeks dialog’una kapsamlıdır.
- İcra kararı başlığı: `Kişi/Konu · İşlem`. Karar türü ayrı gösterildiği için başlığa “Karar/Emir” eklenmez. Bu bir editoryal yönlendirmedir; metin otomatik dönüştürülmez ve mevcut kayıt/yetki kuralları değişmez.
- 390/1440px gerçek Chromium bileşen testi: mobil dialog ve drawer 390px, masaüstü dialog 1120px; yatay taşma yok. Kapatma ve Escape sonrası scroll kilidi kaldırılır.
- Etkinlik ana sayfa kartları/öneri formu gerçek Chromium’da 390/1440px doğrulandı: mobil tek sütun, masaüstü üç ana sayfa sütunu ve iki form sütunu; 44px hedefler. Bu yerel fixture doğrulaması, canlı kimlik doğrulamalı uçtan uca kontrol yerine geçmez.


## Etkinlikler UI güncellemesi — 2026-10-07

- Navbar aynı konum ve sade aktif durumla QGIcon outline takvim kullanır.
- Tarihli defter satırı: tarih / tür, başlık, yer veya oyun ve İstanbul saat bilgisi / mevcut durum, kendi katılım yanıtı veya yoklama ve detay. <=760px tek sütun; uzun başlık/yer taşmadan sarılır. Yalnız tarihi bilinen kayda saat eklenmez.
- Tür filtresi her görünümde; tarih aralığı ve katılımcı filtresi yalnız arşivde. Tür kimlikleri, başlangıç sırası ve yetkilinin sıralama ayarı korunur.
- Ana sayfa sorgusu yalnız yayımlanmış, bitişi geçmemiş en yakın iki etkinliği getirir. events.view ve mevcut RLS görünürlüğü korunur; görünür boş durumda kısa bilgi/arşiv bağlantısı. Erişimi olmayana boş blok da gösterilmez.
- 390/1440px gerçek Chromium: tam/boş, üye/yetkili, uzun başlık, aynı hero/liste kenarı, 44px kontroller, dialog/Escape ve hata sonrası form değerlerinin korunması doğrulandı. Gerçek bileşenlerle yerel fixture; canlı kimlik doğrulamalı yönetim/aktarımı uçtan uca kapsamaz. Sonuçlar EVENTS_UI_REPORT_20261007.md içinde.

## Etkinlik sekmesi performansı — 2026-10-07

- Etkinlik türleri, kayıtlar, öneriler ve kendi katılım yanıtları mevcut izin kontrolünden sonra paralel yüklenir. Katılımcı profil sorgusu yalnız arşiv filtresinde çalışır.
- Sekmeler bekleyen sunucu geçişini erişilebilir “Yükleniyor…” metniyle bildirir; mevcut defter geçiş tamamlanana kadar görünür kalır. Yetkiler ve filtre davranışı korunur; kullanıcıya özel sonuçlara paylaşılan cache eklenmez.
- Regresyon ve ölçüm sınırları EVENTS_PERFORMANCE_REPORT_20261007.md içinde.

## Kodeks başlık alanı — 2026-10-07

- Hüküm formunda Bölüm, Tür ve Başlık masaüstünde üç eşit sütun kullanır; eski dört sütunlu şablon kaldırılmıştır. Mevcut mobil tek sütun düzeni korunur.
- Başlık altındaki Kişi/Konu · İşlem yönlendirme metni kaldırılmıştır; mevcut placeholder ve kayıt davranışı korunur.

## İcra kararı formu sadeleştirmesi — 2026-10-07

- İcra kararında Tür ve Bölüm görünür kontrolleri kaldırılır; tür sabittir ve bölüm seçilen dayanağın bölümünden alınır. Diğer hüküm türlerinin seçim akışı korunur.
- Başlık, Dayanak Hüküm ve Uygulama Kapsamı öncesinde aynı tam genişlik alan biçimini kullanır. Placeholder: Arşivleme kolaylığı için "Kişi/Konu · İşlem" başlık biçimini kullan.
- Kodeks yayımlama/düzenleme paneli dışına tıklamak paneli kapatmaz. Sağ üst kapatma ve Escape korunur; diğer dialogların dış tıklama davranışı değişmez.
