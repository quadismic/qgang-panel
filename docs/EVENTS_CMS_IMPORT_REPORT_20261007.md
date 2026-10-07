# Wix CMS etkinlik arşivi aktarımı — 7 Ekim 2026

Kullanıcı talimatıyla Q-GANG Wix QEvents koleksiyonu mevcut Supabase etkinlik sistemine işlendi. CMS tüm sayfa sonucu: 27 kayıt, hasNext=false. Silinmiş 6 kayıt dışarıda bırakıldı; 21 tamamlanmış kayıt arşive alındı. Wix kaynağı değiştirilmedi.

Türler: GANG-UP 8, OP-NIGHT 7, BBQ-GANG 3, Q-NITY 1; eski B-DAY & S-DAY etiketi 2 kayıtta korundu. Yalnız tarih bilindiğinden date_only=true ve Europe/Istanbul tarih sınırı kullanıldı; saat/yer uydurulmadı. Kaynak kimlikleri mevcut Wix/QEvents namespace'ini kullanır; source_id tekilliği tekrar aktarımda ek kopyayı önler.

165 tarihsel katılımcı satırından 119'u önceden yönetimce doğrulanmış legacy bağlantısıyla eşleştirildi. 46 satırda hesap bağlantısı yok; tarihsel ad korundu. Sadece isim benzerliğiyle yeni hesap eşleştirmesi yapılmadı.

Tek kaynak etkinliğinde tamamlanmış yoklama vardır: 6 katılım doğrulanmış, bunların 4'ü mevcut doğrulanmış hesapla eşleşmiştir ve mevcut Faaliyetler sorgusuna uygundur. Diğer 159 satır legacy_roster_pending/attended=null olarak kaydedildi. Puan onayı yoklama kabul edilmedi; eski puanlar aktarılmadı. Belirsiz kayıtlar otomatik faaliyet bildirimi üretmez.

İşlem bağlı Supabase yönetim connector'uyla transaction içinde, mevcut importer'ın kayıt/tekillik/kanıt semantiği korunarak yürütüldü. Kullanıcının açık arşiv aktarım talimatı esas alındı; yönetim atfı mevcut Quadismic founder kaydına bağlandı ve kaydın founder olması transaction başında doğrulandı. Üye oturumu/token üretilmedi. Uygulama RPC/RBAC ve RLS değiştirilmedi. Sadece önceden doğrulanmış legacy kimliği mevcutsa user_id yazıldı.

Son kontrol: 21 etkinlik/165 satır; yinelenen kaynak 0, geçersiz kimlik bağlantısı 0, iki tablonun RLS'si etkin. Web deploy veya yeni migration yok; kayıtlar canlı veritabanına işlenmiştir.

Kişisel veri etki kontrolü: mevcut etkinlik arşivinin kullanıcı tarafından istenen tarihsel doldurulmasıdır; yeni veri kategorisi/amaç, sağlayıcı, çerez, saklama kuralı veya başvuru akışı eklenmedi. Mevcut üyelere özel görünürlük ve anonim erişim engeli korunur. Önceki etkinlik sistemi gizlilik taslağının veya sağlayıcı incelemesinin tamamlandığı varsayılmaz; yayımlanmış gizlilik metinleri değiştirilmedi.

## Kullanıcı doğrulaması — 7 Ekim 2026, 19:53 İstanbul

Kullanıcı, eski katılımcı listesini fiilen katılanları kaydetmek için kullandığını açıkça doğruladı ve kaydetme talimatı verdi. Bu doğrulamaya dayanarak yalnız bu Wix/QEvents aktarımındaki attended=null/evidence=legacy_roster_pending olan 159 satır transaction içinde attended=true/evidence=manual olarak güncellendi. Mevcut 6 legacy_rollcall sonucu, hesap bağlantıları ve tarihsel adlar korunmuştur. Bu bir eski yoklama yapıldığı iddiası değildir; kullanıcı tarafından onaylanan tarihsel katılımın yönetim doğrulamasıdır.

Sonuç: 165 katılımın tamamı katıldı; 119'u doğrulanmış hesapla bağlı ve mevcut profil faaliyet sorgusuna uygun, 46'sı hesap eşleştirmesi bekleyen tarihsel adla kayıtlı. Bekleyen yoklama 0. Yeni bildirim gönderilmedi, puan/rol değiştirilmedi, Wix'e yazılmadı. Web deploy gerektirmeyen canlı veri güncellemesi.
