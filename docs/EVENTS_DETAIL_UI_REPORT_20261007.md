# Etkinlik detayı UI düzeltmesi — 2026-10-07

## Sonuç

- Hero üstünde sola hizalı liste dönüşü; arşiv/tür/tarih/üye filtresi liste bağlantısından detay ve kayıt sonrası dönüşe taşınır. Sadece etkinlik liste yolu ve izin verilen filtre anahtarları kabul edilir.
- Kayıtlı başlık aynen gösterilir. Tür, İstanbul tarih/saat ve tek durum rozeti hero altında; ayrı durum satırı/kutusu ve alt dönüş kaldırılır. Mevcut RPC'nin Katılacağım yanıt sayısı ve bekleme sayısı kompakt satırdadır; doğrulanmış katılım olarak sunulmaz.
- Katılım Arşivi yalnız mevcut doğrulanmış katılımları gösterir. Boş durumda tek kısa mesaj; ortak padding, gereksiz minimum yükseklik yok.
- Dört alt yönetim şeridi kaldırıldı. Düzenle ve Yönetim ⋯ üzerinden mevcut formlar native dialog içinde açılır. events.manage, manage+publish, attendance ve archive koşulları ile işlem onayları korunur. API/RBAC/veri modeli değişmedi.
- Filtre altındaki çift çizgi tek çizgiye indirildi. Mevcut hero görseli / bağımsız Etkinlikler banner ayarı kullanılır.

## Görsel doğrulama

Gerçek Chromium, mevcut Header/Actions/AttendanceArchive bileşenlerini gerçek navbar ve ortak CSS ile kullanan geçici yerel fixture:

| Genişlik | Durumlar | Hero/arşiv kenarları | Boş arşiv |
|---|---|---|---|
| 390px | Yetkili/yetkisiz × boş/dolu, uzun başlık | 20–370px | yaklaşık 87px |
| 1440px | Yetkili/yetkisiz × boş/dolu, uzun başlık | 221.67–1408.33px | 98px |

Ekran görüntüleri gözle incelendi. Başlık ve menü yatay taşmıyor; menü nokta hit testiyle içeriklerin önünde. Üç yönetim dialogu açılır, viewport içinde kalır ve Escape ile kapanır. Görünür kontroller >=44px. Katılmadı kaydı arşive alınmaz. Tarayıcı hatası yok. Fixture rotası test sonunda kaldırılır.

## Kontroller

- test:events: domain, API authorization/confirmation, DB RLS/RSVP/yoklama, paralel okuma, bağımsız detay yetkileri, değişmeyen başlık ve güvenli filtre dönüşü.
- test:events-detail-ui ve test:events-ui: 390/1440px görsel/etkileşim regresyonu; tek ayırıcı ve filtre bağlamlı bağlantılar dahil.
- Typecheck, lint ve production build başarılı. Build mevcut globals.css start/end autoprefixer uyarılarıyla tamamlandı; bu pakette globals.css değişmedi.

## Sınırlar

Ekli referans dosyası çalışma alanında bulunamadığından okunamadı; yazılı düzen esas alındı. Görsel doğrulama yerel fixture üzerindedir; canlı oturumla gerçek kaydı değiştiren yönetim işlemi yapılmadı. Mevcut API/DB davranışı ilgili testlerle doğrulanır. Deploy yapılmadı.

## Veri etki kontrolü

FEATURE_REVIEW.md uygulandı: yeni veri kategorisi, amaç/görünürlük/erişen kişi, sağlayıcı/aktarım, çerez/takip, saklama veya başvuru/düzeltme/silme davranışı değişmedi. Aynı kayıt ve izinler farklı ortak UI içinde sunulur; filtre bağlamı mevcut liste sorgu parametreleridir.
