# Q-GANG — yayın hazırlığı kaydı

**Güncel durum:** Kullanıcının sonraki Deploy talimatıyla yayın tamamlandı. Production sonucu ve kalan işler: `DEPLOY_EVENTS_CODEX_20261007.md`. Aşağıdaki metin yayın öncesi durumu kaydeder.

Production deploy, GitHub push ve canlı migration yapılmadı. Yerel paket incelemeye hazır; aşağıdaki canlı kontroller bitmeden yayına hazır olduğu varsayılmaz.

## Kapsam

- `c397258`: mobil Topluluk tek sütun; profil yönetim katmanı/üyelik-rol-rozet yönetimi; gömülü Disiplin başvuruları.
- `9d885a8`: etkinlikler, Erişim Merkezi izinleri, ana sayfa yaklaşan/son etkinlikler, 7 günlük yönetim uyarıları, katılım arşivi ve Wix aktarım inceleme akışı.
- Bu hazırlık: Kodeks dialog kök neden düzeltmesi; başlık biçimi yönlendirmesi; yalnız üç tarihsel icra kararının başlığını değiştiren bekleyen migration.

## Yayın sırası — henüz çalıştırılmadı

1. Onaylanacak exact commit/tree ve mevcut remote dal başını yeniden doğrula. Hedef Q-GANG Vercel projesi `prj_Zpp6Buu4ur6hyXemuKXQ08I5Iw1M`; Supabase projesi `kttebbvinfmauthmayqp`. Bakım ayarını koru.
2. Etkinlik gizlilik/erişim/saklama taslağını mevcut inceleme akışında tamamla. Kaynak: docs/privacy/EVENTS_REVIEW_20261007.md ve AGENTS.md / FEATURE_REVIEW.md. Mevcut yayımlanmış metni doğrudan değiştirme.
3. Pending migration listesini canlı geçmişle karşılaştır. Sıra: `20261007021216_event_foundation.sql`, ardından `20261007023442_codex_historical_decision_titles.sql`. Test ortamında uygula ve yetkili/üye/misafir erişimini doğrula. Tarihsel başlık düzeltmesi yönetici migration işlemidir; normal üye oturumu üzerinden çalıştırılmaz.
4. Yetki profilleriyle etkinlik oluşturma/öneri/yayımlama/yoklama/arşiv eşleştirmesini uçtan uca kontrol et. Wix kayıtları yalnız önizlendi: 21 uygun etkinlik, 46 eşleşmemiş katılım satırı, 159 yoklama incelemesi. Eşleştirme/yoklama uydurma; ayrı onaylı aktarım akışını kullan.
5. Canlı değişiklik için ayrı onay sonrası migration → veritabanı doğrulaması → sabit commit’ten production build → kontrol edilen build’i yayınlama. Başlıklar dışındaki tüm değerler için migration kendi assertion’larını çalıştırır. Eski PDF snapshot’larına dokunulmaz.
6. Auth/yetki, dört etkinlik türü sırası, 7 günlük uyarı, katılım faaliyeti ve 390/1440px tam sayfa kontrollerini yayın sonrası tekrarla. Domain/alias ve deployment error loglarını doğrula.

## Yerel doğrulama

- Typecheck/lint/build, Kodeks layout/route/DB ve belge/PDF testleri geçti.
- Etkinlik domain/route/RLS/RPC testleri geçti.
- Gerçek Chromium fixture QA: Kodeks editörü ve etkinlik kartları/ana sayfa sütunları/öneri formu 390/1440px’de geçti. Kodeks mobil drawer 390px; desktop dialog 1120px; yatay taşma yok. Escape/yeniden açma ve reddedilen öneride alan koruma geçti.
- Tarayıcı: `QG_BROWSER_PATH` ile yerel executable kullanılabilir; script’ler yalnız geçici QA route’ları oluşturur, gerçek bileşenleri render eder ve temizler. Supabase bağlantısı QA sırasında yerel sahte endpoint’tir. Görsel çıktı `/tmp/qgang-*.png`; kişisel kaynak/ham arşiv/secret dosyaları Git’e eklenmez.
- Build sırasında mevcut eski CSS `end` değerleri autoprefixer uyarısı verebilir; hata değildir.

## Kalan engeller

- Canlı migration ve Wix aktarımı uygulanmadı; başlıklar canlıda hâlâ eski değerlerdedir.
- Etkinlik gizlilik metni incelemesi ve canlı/test ortamında auth ile tam akış QA tamamlanmadı.
- Topluluk/Profil/Disiplin önceki değişikliklerinin gerçek tam sayfa 390/1440px regresyon kontrolü yayın öncesi yapılmalı.
- Production deploy için ayrı talimat beklenir. Otomatik yayını tetikleyebilecek push yapılmadı.
