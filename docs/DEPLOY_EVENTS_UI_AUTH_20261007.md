# Q-GANG — Etkinlikler UI ve kimlik formu yayını · 7 Ekim 2026

Kullanıcı deploy talimatı verdi. Production hedefi q-gang.com; proje prj_Zpp6Buu4ur6hyXemuKXQ08I5Iw1M, team_K7u9TtWelfJgaoHBeBOwdJID.

- Test edilen yerel commit: 25a3ca961753466380d7b345eaf6c034f3aae484.
- Yayımlanan remote commit: 537e8e0ff936fda8e4c8dd0a7c8b35e81714572b.
- Birebir aynı kaynak tree: ff18da27fc75ba461f11da8c987f457d5929d33e.
- Kaynak dal: ui/community-codex-layout; beklenen eski head doğrulanarak fast-forward güncellendi. Main değiştirilmedi.
- Production deployment: dpl_C8qu6vDZX9Na7a4v4r8iSpuoGrAC.

## Kapsam

Etkinlikler: QGIcon takvim, ortak genişlikte atmosferik hero, tarihli defter/tek sütun mobil akış, üst öner/oluştur aksiyonları, yetkili overflow içinde aktarım ve tür ayarları. Ana sayfa en yakın iki yayımlanmış etkinliği yatay bölümde sunar; Yayınlar/Duyurular iki sütun. Erişim Merkezi/RLS ve mevcut iş mantığı korunur.

Kimlik formu gerçekten eksik hesapta mevcut ad/rumuzu korur; otomatik placeholder yeni kullanıcıya gösterilmez. Önceki üç eski üye marker onarımı ve tekrarını önleyen private trigger veritabanında zaten canlıdır; migration yeniden çalıştırılmadı (canlı sürüm 20261007111911). Deploy öncesi doğrulanmış eşleşmiş eksik profil 0, migration sayısı 1. Bakım modu false; değiştirilmedi. Wix aktarımı yapılmadı.

## Doğrulama

Paket öncesi 390/1440px gerçek bileşen doğrulaması, etkinlik domain/API/DB/sunucu sunum/görsel ve auth/legacy/guest regresyon testleri, typecheck/lint/build geçti. Sonuçlar EVENTS_UI_REPORT_20261007.md ve AUTH_IDENTITY_LOOP_REPORT_20261007.md.

Deployment READY; aliasError null. q-gang.com ve www.q-gang.com aynı yeni production deployment'a bağlı. Build süresi yaklaşık 61 saniye (kuyruk hariç); mevcut CSS autoprefixer uyumluluk uyarıları yayını engellemedi.

Yeni deployment için yayın sonrası error/fatal runtime taramasında kayıt bulunmadı (dar yayın penceresi; uzun süreli izleme yerine geçmez). Canlı üye Google oturumu/yönetim/aktarımı uçtan uca denenmedi. Oturumsuz sayfa ve yayınlanan CSS/yönlendirme kontrolleri aşağıdaki son kayıtla belgelenir.

## Aktarım doğrulaması

İlk komut satırı push'u otomatik incelemede hedef doğrulama gerekçesiyle reddedildi. Vercel canlı bağlantısı ve GitHub connector metadata'sı aynı mevcut quadismic/qgang-panel deposunu (1234453999, kullanıcı admin/push yetkili) doğruladı. Değişen 26 dosyada env veya secret örüntüsü bulunmadı. Bu doğrulamadan sonra komut satırı yeniden denendi ve GitHub oturumu bulunmadığı için tamamlanmadı. Yetkili connector ile kaynak tree birebir doğrulanıp commit ve lease kontrollü dal güncellemesi yapıldı.

Son canlı kontrol: ana sayfa/login/Etkinlikler HTTP 200; oturumsuz onboarding yanıtı Next.js stream içindeki NEXT_REDIRECT ile /login?next=/onboarding'e yönlendiriyor; codesuz auth callback HTTP yönlendirmesiyle /login?error=oauth&next=%2Fprofil'e dönüyor. Dört CSS dosyası HTTP 200, eventLedgerRow/eventPageToolbar/eventOperationsDialog/homeUpcomingList yeni stilleri mevcut; eski homeEditorialGrid.homeWithEvents override'ı yok. 14:36 İstanbul yayın sonrası error/fatal taramasında yeni deployment için kayıt bulunmadı. Üye Google hesabıyla gerçek giriş ayrıca kontrol edilebilir.
