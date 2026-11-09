# Q-GANG performans incelemesi — 25.10.2026

Salt okunur inceleme. Uygulama, veritabanı, ayar veya deployment değiştirilmedi.

## Kapsam ve kanıt sınırları

- Üretim deployment: dpl_2bM6DXscEuZUQGgMLjNNHXThgJLc; kaynak 140475810553c6664cb36d5558cbeaaf66668c71. Önceki güvenlik paketi halen yerel dalda; bu incelemede onun yeni kontrolleri canlı yavaşlığın nedeni sayılmadı.
- Canlı sayfalara 3'er anonim GET; statik karşılaştırma, canlı dosya HEAD ve bir Storage Range GET; mevcut kaynak, Supabase performans danışmanı, toplu tablo istatistikleri ve pg_stat_statements incelendi.
- Giriş yapılmış gerçek kullanıcı akışı, Türkiye mobil bağlantısı, tarayıcı CPU/GPU profili, LCP/INP/CLS ölçülmedi. Etkinlik anonim cevabı yetkili listeyi ölçmez (HTTP 200, akış içinde oturum yönlendirmesi olabilir).
- Gözlenen süreler test istemcisinin ağı/proxy/TLS süresini içerir. Statik CSS HIT de 4,717 saniye sürdüğü için 5–8 saniyelik sayfa ölçümleri doğrudan uygulama işlem süresi veya Türkiye kullanıcı deneyimi diye sunulamaz.
- Vercel gözlemlenebilirlik metrik şeması erişildi; toplu sorgu endpointi 400 döndürdü. Üretim p75/p95, cold-start ve CPU payları doğrulanamadı. Süre kazancı yüzdesi uydurulmadı.
- Mevcut ana sayfa, AppShell, etkinlik sayfası ve globals.css üretim kaynak commit'iyle karşılaştırıldı; bu dosyalarda yerel güvenlik dalı farkı yok.

## Öncelikli nedenler ve darboğazlar

| # | Bulgu | Kanıt / etkilenen yüzey | Durum ve önem |
|---|---|---|---|
| 1 | Ana sayfa portreleri çok büyük | Canlı HTML'deki 4 PNG: 2.580.793, 2.326.648, 2.194.109 ve 2.108.864 bayt; toplam 9.210.414 bayt. CouncilScene ilkini eager, diğerlerini lazy gösterir. | Boyut kesin; tamamının ilk anda indirildiği iddia edilmez. İlk görünümdeki tek portre bile 2,33 MB. Yüksek öncelik. |
| 2 | Küçük kartlar için büyük avatar/dekorasyon kaynakları | RankPortrait SVG image kullanır; leader-crown.png 1.025.888, captain-frame.png 981.522, leader-frame.png 918.635 bayt. SVG içindeki avatarlar için lazy yükleme yok. | Kod/dosya kesin. Aynı asset her kartta tekrar ağdan iner denmez; tarayıcı aynı URL'yi paylaşabilir. İlk yük ve çözümleme maliyeti yüksek. |
| 3 | Görseller görüntülendiği boyuta göre seçilmiyor | Ana sayfa/yayın kartlarında img src, orgchart'ta SVG image; srcset/sizes ve genel bir dönüştürülmüş thumbnail akışı yok. | Mobilde de büyük kaynak kullanılabilir. Next Image veya eşdeğer güvenli responsive görsel akışı gerekir. |
| 4 | Uygulama ve DB Türkiye'ye uzak | Üretim Vercel hnd1; Supabase ap-northeast-1. İkisi Tokyo. | Konum kesin; Türkiye gecikmesine katkı çıkarımdır, süresi ölçülmedi. Backendler kendi aralarında aynı bölgede; bölge uyuşmazlığı yok. |
| 5 | Kamusal sayfalar da her istekte sunucuda üretiliyor | Ana sayfa, yayınlar, duyurular, Topluluk, Kodeks force-dynamic; canlı HTML Cache-Control private/no-store ve tekrarlı MISS. | Kesin. Kişisel/yetkili veri cache'lenmemeli; kamusal veri ve kabuk ayrı tasarlanabilir. |
| 6 | Her geçişin önünde veritabanına giden middleware var | src/middleware.ts: auth.getUser + system_settings bakım sorgusu; oturumlu durumda ardından profile sorgusu. Kontroller muaf sayfalar belirlenmeden önce başlar. | Kesin ağ bağımlılığı. Login/anonim sayfa dahi bakım ayarı yanıtını bekler. Güvenlik kontrolleri kaldırılmadan maliyet azaltılmalı. |
| 7 | Middleware eşleştirmesi gereğinden geniş | Matcher JS/CSS _next/static ve yaygın görselleri dışlar; woff/woff2/pdf gibi diğer statik public istekler varsayılan olarak kapsama girebilir. | Koddan koşullu maliyet. Gerçekte hangi isteklerin geçtiği request log'uyla ölçülmeli. |
| 8 | Oturum/profil/üyelik/yetki farklı katmanlarda tekrar okunuyor | Middleware, sayfa, AppShell, getPermissions ve hasPermission ayrı akışlar. Publications doğrudan auth.getUser ile cached getCurrentUser akışını beraber kullanır. | Kod kesin. React cache aynı helper'ın aynı render içindeki tekrarını azaltır, middleware ve farklı select akışlarını birleştirmez. |
| 9 | Aynı tasarım ayarı ayrı okunuyor | Root metadata ve DesignRuntime getActiveDesign ile istek içinde ortaklaşır; ana sayfa kendi design_settings sorgusunu ayrıca yapar. Login de ayrı okur. | Kesin yinelenen okuma. React cache istekler arası kalıcı veri cache'i değildir. |
| 10 | Bağımsız işler sıralı bekletiliyor | Ana sayfa: auth → design → içerik sorguları → homeEventData → AppShell. Profil: profil kaydı → birthday RPC → sonraki sorgu grubu. | Kaynak kesin. Gerçek bağımlılığı olmayan dallar paralel başlatılmalı; toplam gecikme tracing ile ölçülmeli. |
| 11 | Etkinlik sekmeleri tam sunucu navigasyonu | EventTabs Link ile URL değiştirir; force-dynamic sayfa tekrar izin ve veri okur. Yalnız sekme görünürlüğünü değiştiren yerel işlem değil. | Kesin. Yetki/filtre bağlamını koruyan veri paylaşımı veya hedefli yeniden sorgulama gerekir. Loading yazısını gizlemek bu işi azaltmaz. |
| 12 | Etkinlik listesi gereğinden fazla veri topluyor | Upcoming/archive fark etmeksizin event_attendance(user_id,attended) join'i, tüm görülebilir öneriler ve kullanıcının tüm yanıtları çekilir; pagination/limit yok. Üye arşiv filtresi kayıtlar geldikten sonra JS'te uygulanır. | Kesin. Bugünkü yaklaşık 22 etkinlik/171 katılım küçük; büyüdükçe etkisi artar. Liste için sayım/exists ve görünür sayfadaki yanıtlar yeterli olabilir. |
| 13 | Kodeks, ayrıntı açılmadan gövdeleri ve tarihçeyi topluyor | rules/page: 1000'e kadar hüküm body; oturumlu kullanıcıya 1000'e kadar revision body ve issuer listesi; CodexWorkspace'e aktarım. Anonim HTML ~151 KB (açılmış veri, sıkıştırılmış ağ ölçümü değil). | Kesin. Geçmiş ve düzenleyici verileri gerektiğinde yüklenebilir. |
| 14 | Gizli yönetim panelleri de hazırlanabiliyor | Etkinlik sayfası yetki varsa create/proposal/archive/settings bileşenlerini sayfa ağacına ekler; gizlemek yüklemeyi ertelemek anlamına gelmez. | Kod kesin; tarayıcıda modül ve render maliyeti ayrıca ölçülmeli. Editör zaten dynamic import kullanıyor; her sayfada bütün editör yükleniyor denmez. |
| 15 | Bazı listeler önce topluca okunup istemcide süzülüyor | Yayınlar 96 kayıt; duyurular 50 tam gövde, arama sonradan richPlain ile; bütçe readBudgetRecords tüm kayıtları 500'lük sıralı batch'lerle okuyup toplam hesaplar. | Kesin tasarım maliyeti; mevcut küçük hacimde tek başına ağır gecikme kanıtı değil. PDF'nin tüm kayıt gereksinimi korunmalı, ekran liste/toplam sorguları ayrılmalı. |
| 16 | Genel CSS yükü büyük ve eski override katmanları birikmiş | Root layout 11 CSS dosyası ~452.265 kaynak bayt. Canlı HTML 4 stylesheet referansı toplam 446.452 bayt açılmış içerik. globals.css tek başına 327.784 kaynak bayt. | Kesin boyut; gzip/Brotli transferiyle karıştırılmamalı. Sayfaya özel stiller ve eski override temizliği gerekir. |
| 17 | Ortak kabuk kapalı yüzeylerin istemci kodunu da getiriyor | AppShell → SurfaceController → RichText ve TreasuryLayer; RichText sanitize/rich-text zinciri istemci ağacına giriyor. Canlı HTML JS referanslarının toplam ham boyutu ~723 KB, buna eski tarayıcı nomodule polyfill'i de dahil. | İçe aktarım kesin; tüm referanslar her tarayıcıda çalışmaz/indirilmez. Kesin modül katkısı için bundle analyzer gerekir. |
| 18 | Bazı işlemler navigasyondan sonra tekrar refresh yapıyor | EventActionForm: başarılı kayıt sonrası router.push + router.refresh. Profilde bazı iç bağlantılar normal a ile tam belge navigasyonu yapar. | Kod kesin; çift isteğin gerçekleşme koşulları network trace ile doğrulanmalı. |
| 19 | Statik marka dosyalarında uzun browser cache ömrü yok | /brand/qgang-emblem.webp GET: public,max-age=0,must-revalidate. Hash'li _next CSS/JS immutable bir yıl. | Kesin; marka dosyası her seferinde bütünüyle iner denmez, koşullu doğrulama olabilir. İçerik hash'i olmadan kör uzun cache uygulanmamalı. |
| 20 | RLS ve indekslerde iyileştirme alanları var | Canlı danışman: 18 auth_rls_initplan WARN; 10 multiple_permissive_policies WARN; 29 indekssiz FK INFO; 12 unused_index INFO. | Yapılandırma bulguları kesin; hepsi bugünkü yavaşlığın etkin nedeni değil. Hot query EXPLAIN ile seçilmeli. Kullanılmayan indeksler körlemesine silinmemeli. |
| 21 | Görsel efektler mobil çizim maliyetini artırabilir | CSS'te blur, backdrop-filter, gölge, banner hareketi ve animasyonlar var. | Olası cihaz darboğazı; çalışan selector ve GPU/long-task profili olmadan kesin sebep veya kazanç yüzdesi verilemez. |

## Veritabanı açısından ne gördük?

pg_stat_user_tables tahmini canlı satırları: profiles 23, memberships 21, publications 12, regulations 71, community_events 22, event_attendance 171. Bunlar kesin muhasebe sayımı değildir.

Mevcut kümülatif pg_stat_statements örnekleri: aktif üye RPC ortalama 8,91 ms; doğum günü RPC 7,43 ms; ana sayfa announcement_feed 4,17 ms; üyelik status sorgusu 1,63 ms. API ve ağ süresi bunlara dahil değildir. İstatistiklerin reset zamanı/tur aralığı doğrulanmadı. Kaldırılmış modülün eski istatistikleri güncel darboğaz diye raporlanmadı. En ağır metadata/timezone/backup sorguları site sayfası sorgusu sayılmadı.

Bulgular mevcut tabloların aşırı büyüklüğünü ana sebep olarak desteklemiyor. CPU/IO plan sınırı veya cold start ana sebep diye de doğrulanmış değil.

## Ölçümde yapılan önemli düzeltme

Storage HEAD cevaplarında private,no-cache görüldü. Aynı canlı portrede Range GET 206, Content-Range bytes 0-0/2326648 ve Cache-Control public,max-age=3600 döndürdü. Bu nedenle Storage'ın hiç cache'lenmediği sonucu çıkarılmadı. Diğer portrelerin boyutları Content-Length kanıtıdır; başlıklarının GET ile aynı olduğu varsayılmadı.

## Öncelik önerisi

1. Büyük PNG portre ve rütbe dekorasyonlarını kimlik/şeffaflık korunarak uygun boyutta WebP/AVIF varyantlarına dönüştür; thumbnail/srcset/sizes ve doğru öncelik kullan.
2. Ortak viewer context ile istek içindeki auth/profil/üyelik/yetki tekrarlarını birleştir; bağımsız sorguları paralelleştir; bakım ve kamusal tasarım ayarının güvenli cache stratejisini belirle.
3. Kamusal sayfa/veri cache'ini kişisel ve RBAC verisinden ayır. Kullanıcıya özel HTML'yi ortak CDN cache'ine koyma.
4. Etkinlik liste sorgularını sadeleştir; tarihçe/yönetim/düzenleyici verilerini açıldığında yükle; liste için pagination/aggregate uygula.
5. Gerekli CSS/JS'yi sayfaya göre böl; double navigation/refresh'i kaldır; kanıtlanan hot SQL politikası/indekslerini iyileştir.
6. Sonra Türkiye'den oturumlu 390px/1440px gerçek tarayıcı ölçümü yap. İki backend beraber Avrupa bölgesi seçeneğini ölçerek değerlendir; yalnız Vercel'i taşıyıp DB'yi Tokyo'da bırakmak yeni uzak sorgu maliyeti yaratabilir. Bölge/veri aktarımı değişikliği ayrı etki incelemesi gerektirir.

Hiçbir değişiklik/deploy uygulanmadı. Bu rapor erişilebilen neden ve riskleri toplar; gerçek kullanıcı ölçümleri ve üretim tracing olmadan olası bütün nedenlerin dışlandığı iddia edilmez.
