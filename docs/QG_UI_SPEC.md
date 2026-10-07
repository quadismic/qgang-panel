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
