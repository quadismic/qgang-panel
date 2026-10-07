# Q-GANG — Etkinlikler UI doğrulaması · 2026-10-07

## Sonuç

Etkinlikler ortak AppShell genişliğinde atmosferik hero ve tarihli defter listesine geçti. Hero yalnız kimlik/açıklama taşır. Sekmeler ve mevcut izinlerle öner/oluştur üst araç alanında; tarihsel aktarım ve tür/sıralama yetkili overflow menüsündedir. Formlar ortak Dialog ve kontrollerle açılır. Navbar QGIcon outline takvim kullanır; konum ve aktif durum korunur. Mevcut `/brand/rooms/registry.webp` kullanıldı; yeni görsel eksiği yok.

Ana sayfa: içerikle büyüyen yatay Yaklaşan Etkinlik alanı, en yakın iki yayımlanmış ve bitişi geçmemiş kayıt. Yer/oyun ve İstanbul tarih/saat bilgisi, tür, başlık ve detay bağlantısı. Boş durum kısa arşiv bağlantısı içerir. Son Etkinlikler üçüncü sütunu ve artık kullanılmayan üç sütun CSS override'ları kaldırıldı. Yayınlar/Duyurular iki eşit sütundur; mobilde alt alta akar.

## Korunan davranışlar

- events.view/propose/manage/archive/settings mevcut izinleri; sabit rütbe şartı eklenmedi. Her yönetim aksiyonu bağımsız izinle server component'te bağlanır. API/RPC/RLS değişmedi.
- Ana sayfa events.view kontrolü yanında event_types RLS görünürlüğünü izler. Erişim yoksa boş etkinlik alanı da gösterilmez.
- GANG-UP / OP-NIGHT / BBQ-GANG / Q-NITY başlangıç sırası; ad/sıra ayarı mevcut sunucu akışını kullanır.
- Kendi RSVP yanıtı yalnız viewer kimliğiyle sorgulanır; katılım bildirimi ve gerçek yoklama ayrı anlamlarda gösterilir.
- Tarih aralığı ve katılımcı filtresi yalnız arşiv; tür filtresi her görünümde. Tarih hassasiyeti ve eski tür etiketi korunur.
- Öneri inceleme/taslağa dönüştürme ve aktarım önizleme/açık onay/kimlik eşleştirme korunur. Canlı aktarım yapılmadı.

## Doğrulama

Gerçek Chromium 153 + Playwright, gerçek bileşenleri kullanan geçici yerel Next route'u:

| Kontrol | 390px | 1440px |
|---|---|---|
| Üye/yetkili × dolu/boş | Geçti | Geçti |
| Hero / liste aynı kenarlar | 20–370px | 221.67–1408.33px |
| Defter satırı | Tek sütun | Tarih / içerik / işlem |
| Yayınlar / Duyurular | Tek sütun | İki sütun |
| Uzun başlık/yer, yatay taşma | Taşma yok | Taşma yok |
| Üst aksiyonlar ve form hedefleri | ≥44px | ≥44px |
| Dialog / Escape / hata sonrası metin | Geçti | Geçti |
| Arşiv tarih alanları | Geçti | Geçti |

Sunucu sunum testi gerçek sayfa ve homeEventData fonksiyonlarını çalıştırır: erişim reddinde sorgu yok; bağımsız aksiyon izinleri; yayımlanmış/en yakın iki kayıt; RLS boş tür sonucunda görünmezlik; arşive özgü tarih koşulları; kendi RSVP sorgusu. Etkinlik domain/API/PostgreSQL testleri üyelik, anonim/pasif erişim, öneri sahipliği, durum yetkileri, açık onay, yoklama, RSVP gizliliği ve kapasite kuyruğunu kapsar.

`npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run test:events` ve `npm run test:events-ui` geçti. Build, mevcut globals.css satırlarındaki autoprefixer start/end uyumluluk uyarılarını içeriyor; derleme engeli yok. Geçici QA route'u temizlendi.

## Kapsam ve sınırlar

Yerel görsel fixture gerçek bileşen/CSS kullanır; canlı kimlik doğrulamalı oluşturma/yayımlama/aktarımı uçtan uca test yerine geçmez. Üretim verisi değiştirilmedi; migration, push ve deploy yapılmadı. Diğer sayfaların stilleri değiştirilmedi; ortak ikon ailesine yalnız takvim eklendi.

FEATURE_REVIEW altı sorusu: yeni veri kategorisi, amaç/erişim, sağlayıcı/aktarım, çerez/takip, saklama veya başvuru hakkı değişikliği yok. Kendi mevcut RSVP'nin mevcut yetkili yüzeyde sunumu ve aynı görünür kayıtların daha küçük ana sayfa özeti. Önceki etkinlik sisteminin ayrı gizlilik incelemesi/taslağı bu UI çalışmasıyla yayımlanmış sayılmaz.
