# Q-GANG etkinlik sistemi — geliştirme kaydı

Yerel geliştirme; canlı veritabanına migration uygulanmadı, deploy yapılmadı. Kodeks hükmü kullanıcı tarafından manuel eklenecek; Kodeks içeriği değiştirilmedi.

## Davranış

- Türler: GANG-UP / OP-NIGHT / BBQ-GANG / Q-NITY. Türlerin sabit kimlikleri değişmez; ad/açıklama/sıra yetkiyle düzenlenebilir.
- Erişim Merkezi: görüntüleme, öneri, düzenleme, yayımlama/iptal, yoklama, arşiv aktarımı/eşleştirme, tür ayarları. Varsayılanlar: üye öneri; Kaptan+ yönetim/yayın/yoklama; Lider/Vekilharç arşiv/ayarlar. Sunucu ve veritabanında izinler uygulanır.
- Etkinlikler: yaklaşanlar/arşiv, tür ve tarih filtreleri, üye kimliği filtresi; öneri gönderme ve inceleme; taslak oluşturma/düzenleme; açık onayla durum değişikliği ve yoklama. Tarih/saat Türkiye saatinde.
- RSVP ayrı kayıttır; gerçek katılım sayılmaz. Sınırlı kapasitede tarih/kimlik sıralı bekleme kuyruğu; yer açılınca sıradaki kişi listeye geçer. Diğer üyelerin RSVP kimlikleri sıradan üyeye gösterilmez.
- Ana sayfa: varsa yaklaşan etkinlik alanı, Son Yayınlar/Duyurular/Son Etkinlikler üç sütun; mobil tek sütun.
- Yönetim: yaklaşan 7 günlük etkinlik uyarıları, BUGÜN işareti, düzenleyen/kapasite; tamamlanma bekleyenler ayrı alan.
- Faaliyetler: yalnız tamamlanmış etkinliğin doğrulanmış gerçek katılımı. Tarih etkinlik tarihidir; RSVP ve aktarım tarihi kullanılmaz.
- Gizlilik: kişinin kendi çıktısı, tarihsel rumuzların hesap silinmesinde anonimleşmesi, kısıtlı işlem izi ve metin taslağı.

## Wix incelemesi — 7 Ekim 2026

Kaynak: Q-GANG sitesi `QEvents` koleksiyonu. Koleksiyon alan tanımı eski ve eksik; gerçek kayıtlarda ek `durum`, `deleted`, `yoklamaJson`, `yoklamaTamamlandi`, katılım yanıtı ve puan alanları vardır. Alan tanımı tek başına aktarım için yeterli değildir.

| Önizleme ölçütü | Sonuç |
|---|---:|
| Toplam kayıt | 27 |
| Silinmiş; aktarım dışında | 6 |
| Tamamlanmış, aktarılabilir kayıt | 21 |
| Dört tür dışında eski tür etiketi | 2 |
| Katılımcı kayıtları | 165 |
| Önceden doğrulanmış tarihsel kimlikle bağlanabilir | 119 |
| Henüz hesap eşleşmesi olmayan katılımcı kayıtları | 46 |
| Açık eski yoklamada katıldığı doğrulanmış | 6 |
| Yoklama incelemesi bekleyen | 159 |

Bunlar benzersiz kişi sayıları değildir; etkinlik-katılımcı kayıtlarıdır. Ad benzerliği otomatik kimlik eşleştirmesi yapmaz. Eski B-DAY & S-DAY etiketi korunur; GANG-UP'a otomatik dönüştürülmez. Puan onayı gerçek yoklama yerine geçirilmez, eski puanlar yeniden dağıtılmaz. Aktarım kaynak kimliği tekrarı engeller. Üye bağlantısı daha sonra açık onayla yapılabilir.

Önizleme dosyası `{ "events": [{ "id": "kaynak-kimligi", "type": "OP-NIGHT", "date": "2026-01-01", "status": "puan_onaylandi", "names": "ÖrnekRumuz", "attendance": "{}", "attendanceConfirmed": false, "deleted": false }] }` biçimindedir. Yetkili dosyayı Tarihsel Etkinlik Aktarımı alanında önizler; yalnız uygun kayıtlar açık onayla aktarılır.

## Doğrulama / kalan işler

- `npx tsc --noEmit`, `npm run lint`, `npm run build`: geçti. Build, mevcut CSS satırlarının `end` değerleri için autoprefixer uyarıları verdi; yeni etkinlik toolbar değerinde `flex-end` kullanıldı.
- PostgreSQL RLS/RPC, durum yetkisi, RSVP gizliliği/kuyruğu, tarihsel aktarım tekrarsızlığı, kimlik yetkisi, kendi veri çıktısı ve anonimleştirme testleri geçti (`npm run test:events`). Üye yetki API ve disiplin başvuru regresyon testleri de geçti.
- Gerçek 390/1440px tarayıcı doğrulaması **tamamlanmadı**. Playwright çalıştırılabilir dosyası yok; kurulum indirmesi bozuk/0 MiB ZIP döndürerek başarısız oldu. CSS/derleme gerçek görsel doğrulama yerine sayılmaz.
- Canlıya almadan migration'ın hedef/staging veritabanında uygulanması, gerçek oturumlarla UI/RLS uçtan uca doğrulaması, gizlilik metni/saklama taslağının kurumsal incelemesi ve tarihsel önizlemenin yönetimce kontrolü gerekir.

## Sonraki gerçek tarayıcı doğrulaması

Alternatif Chromium kurulumu ile `test:events-ui` 390/1440px’de geçti. Gerçek UpcomingEvents/RecentEvents/EventForm bileşenleri örnek veri ile render edildi: yatay taşma yok; mobil tek sütun, masaüstü üç ana sayfa sütunu/iki form sütunu; 44px hedefler. Reddedilen öneri gönderimi metni koruyor. Önceki indirme engeli bu bileşen QA için kaldırıldı. Canlı auth ve veri aktarımı uçtan uca doğrulanmadı; migration/aktarım henüz uygulanmadı.
