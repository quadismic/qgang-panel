# Q-GANG UI primitives — 6 Ekim 2026

Kapsam: kabul edilen auditin P0 ortak katmanı ve P1 ana sayfa / disiplin / mobil hedefler. Mevcut karanlık, bronz ve serif kimlik korunmuştur. Veri modeli, API sözleşmesi, izinler ve iş kuralları değiştirilmemiştir. Deploy yapılmamıştır.

## Envanter ve konsolidasyon

| Ortak öğe | Bağlanan mevcut kullanımlar | Kalan eski kullanımlar |
| --- | --- | --- |
| Button / IconButton | ConfirmSubmitButton, LoadMore, bütçe işlem menüsü, hesap bağlantısı kaldırma, hesap silme doğrulaması; SurfaceLayer, kırpıcı, Kodeks kapatma | Sayfa formları, editörün özel araç çubuğu, Kodeks mühürleme ve özel okuma butonları |
| Input / Select | Topluluk Kimlikleri, DisiplinRequests, IdentityNameFields, duyuru filtreleri, bütçe seçimi, yayın arama, hesap silme alanı | Kodeks form alanları, MemberPicker, tarih/dosya alanları, diğer yönetim formları |
| Badge | Mevcut NormBadge ortak Badge üzerinden çalışır | Yayın türü, rol, bütçe kategori ve özel durum işaretleri |
| Metadata | Duyuru detay metadata satırı | Profil, yayın, disiplin ve bütçenin alana özgü metadata yapıları |
| OverflowMenu | Bütçe, duyuru, yorum silme; profil raporlama menüsü; yayın stüdyosu silme; hesap bağlantısı kaldırma; üye kalıcı silme; rozet geri alma/düzeltme | Silme dışındaki özel yönetim aksiyonları |
| Dialog / SurfaceLayer | SurfaceLayer adaptörü, ImageCropper, CodexComposer, MemberPurgeControl | İncelenen custom role=dialog kullanımı kalmadı; inline native details okuma alanları modal değildir |
| LoadMore | ProgressiveList, BudgetLedger, AnnouncementsLedger, ProfileActivityList | İncelenen “daha fazla” liste genişletme butonu kalmadı |
| EmptyState | Bütçe, duyuru, profil faaliyetleri | Diğer sayfalardaki alana özgü boş durumlar |
| ErrorState | QGangNotice error adaptörü | Sayfalardaki özel notice / erişim reddi metinleri |

Yeni katman mevcut komponentleri adaptörlerle birleştirir; veri yükleme veya editor mantığı yeniden yazılmamıştır. ActionLevel: primary belirgin bronz yüzey; secondary varsayılan çerçeveli yüzey; tertiary sessiz/şeffaf; destructive kırmızı-kiremit vurgu. Paylaşılan minimum eylem yüksekliği 44 px ve focus-visible halkası vardır.

LoadMore dili `N KAYIT DAHA GÖSTER ↓`; count gösterilecek sonraki grup boyutudur. `label` parametresi içerik türüne göre değişebilir. Önceki ilk grup ve artış miktarları korunmuştur.

Dialog native showModal kullanır: erişilebilir başlık, tarayıcı odak sınırı ve arka plan inert davranışı, Escape, iç içe modal gövde kaydırma kilidi ve tetikleyiciye odak dönüşü. İç içe cancel olayı üst pencereye taşınmaz. Hesap silmenin kullanıcı adı doğrulaması ve API'si korunmuştur.

## Audit kapanışları

- P0 navbar: aktif durumda ince accent, ikon rengi, hafif yüzey; kırmızı nokta ve glow kaldırıldı. Desktop aria-current koruması eklendi.
- P0 dialog: ortak isim / odak sınırı / Escape / background lock / focus restore tamamlandı.
- P0 ortak action seviyeleri ve LoadMore tamamlandı; yukarıdaki tüketiciler konsolide edildi. Tüm uygulamanın eski buton ve alanları bütünüyle taşınmış değildir.
- P0 işlevsel ikonlar: kapatma/overflow, bütçe, yayın kategorileri, kontrol, disiplin ve profil faaliyetleri QGIcon'a taşındı. Heraldik, özel rozet ve amblem katmanı korundu; editörün anlamlı tipografik araçları korunuyor.
- P0 font değişkeni: undefined --font-cinzel yerine mevcut --qg-display-font kullanıldı.
- P1 ana sayfa: misafir yayın sorgusundaki profiles join kaldırıldı; giriş yapanların sorgusu korunur. Mevcut public yayın politikası kullanılır; yeni erişim izni verilmez.
- P1 disiplin sicili: uzun gerekçe kapalı/açılabilir okuma alanına alındı, metadata daha okunur, summary hedefi 44 px.
- P1 mobil: ortak kontroller, overflow/close, yorum araçları ve göstergelerin hedefleri büyütüldü.

1240 !important kullanımı topluca temizlenmedi. Geniş CSS refactor yapılmadı; yeni kurallar ortak katman ve dokunulan bileşenlerle sınırlıdır. Audit sayısal skoru yeniden ölçülmeden yeni skor iddia edilmez; tablo kapanan ve kalan maddeleri ayırır.

## Doğrulama

- Playwright / Chromium: 1440 px desktop ve 390 px mobile. Modal odak sınırı, arka plana programatik odak engeli, nested Escape/kilit, odak dönüşü, overflow Escape, LoadMore grup sayısı, bütçe/duyuru detayları, yatay taşma, kırpıcı, Kodeks oluşturma penceresi, hesap silme penceresi/doğrulaması ve browser error kontrolü geçti. İşlem menüsünün sol kenarda ekran dışına taşması ortak konum düzeltmesiyle giderildi.
- Kodeks üç okuma düzeni, discipline request PostgreSQL izin/iş akışı ve dipnot buton/kısayol testleri geçti. Public Codex görünürlük ve misafir/kimlik minimizasyonu testleri de geçti.
- TypeScript, repository lint ve production build geçti.
- Browser testleri yerel fixture ve sahte Supabase URL kullanır; canlı veriye yazılmaz. Canlı misafir API davranışı deploy öncesi yerel kod/query doğrulamasıyla sınırlıdır.
- Yeni kişisel veri, amaç, saklama veya yetki değişikliği yok; migration gerekmiyor.

## Yayın durumu

Deploy, preview deploy, push ve merge yapılmadı. Yayın için kullanıcı onayı beklenecek.
