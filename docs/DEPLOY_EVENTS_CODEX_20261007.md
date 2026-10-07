# Q-GANG production yayını — 7 Ekim 2026

Kullanıcının “Deploy” talimatıyla paket production’a yayımlandı.

- URL: https://q-gang.com
- Hedef: production; Q-GANG projesi `prj_Zpp6Buu4ur6hyXemuKXQ08I5Iw1M`.
- Deployment: `dpl_3QqSunavXspuVzBLE6PyFSdHLU8g`, READY, aliasError null.
- Remote commit: `85e561c2cd3e63263d31558fa45852bf48315b83`.
- Test edilen yerel commit: `e2f68d116194052389d49f7e61a0131cbabcca4d`.
- Birebir aynı kaynak tree: `b16dbc5daca6bd8bf82027177a63150db7acea7e`.
- `ui/community-codex-layout` dalı beklenen remote head kontrolüyle fast-forward güncellendi; main değiştirilmedi. Git push'un oluşturduğu preview'den ayrı, sabit commit'ten production build alındı.
- Kapsam: önceki Topluluk/Profil/Disiplin yönetim düzeltmeleri, etkinlik sistemi ve Erişim Merkezi izinleri, Kodeks dialog ve üç tarihsel karar başlığı düzeltmesi.

## Veritabanı

Supabase `kttebbvinfmauthmayqp` projesinde `event_foundation` (canlı sürüm `20261007030914`) ve `codex_historical_decision_titles` (`20261007030925`) başarıyla uygulandı. Yerel migration dosyalarının tarihleri farklıdır; tekrar uygulamadan önce isim ve canlı migration geçmişi karşılaştırılmalıdır.

Etkinlik türleri GANG-UP / OP-NIGHT / BBQ-GANG / Q-NITY sırasıyla doğrulandı. Etkinlik/öneri/yanıt/yoklama tablolarında RLS etkin. Henüz etkinlik kaydı yok; Wix arşivine yazılmadı/aktarım yapılmadı.

Üç kararın başlığı güncellendi. Migration her kaydın diğer tüm sütunlarını ve tarihsel revizyon/kaynak duyurularını karşılaştırarak işlem içinde doğruladı. Son kontrolde revision 1 ve eski updated_at/published_at değerleri aynı; revision trigger yeniden etkin. Eski PDF snapshot’larına dokunulmadı.

Bakım modunun mevcut canlı değeri `enabled:false` idi; değiştirilmedi. Önceki hazırlık notundaki “bakım açık” varsayımı güncel canlı durumu anlatmıyordu.

## Yayın sonrası doğrulama

- Ana sayfa/login/Topluluk/Kodeks/Etkinlikler: HTTP 200. Oturumsuz 200 yanıtı, yetkili ekranların tam akış testi değildir.
- Dört canlı CSS dosyası HTTP 200. Kodeks dialog kapsamlı gizli başlık düzeltmesi ve eventUpcomingGrid kuralları canlı çıktıda mevcut.
- Same-origin oturumsuz POST: `/api/events` 401, `/api/events/archive` 403. Kayıt/aktarım oluşturulmadı.
- Gerçek canlı Chromium Topluluk QA: 390px’de sayfa taşması yok, hero/orgchart kenarları 20–370px ve 16 kart tek sütun. 1440px’de her iki bölümün kenarları 221.67–1408.33px; yatay taşma yok. Mobil ekran görüntüsü görsel incelendi, rumuz/kullanıcı adı/rütbe okunabilir.
- Yerel gerçek 390/1440px Kodeks editörü ve etkinlik bileşenleri QA ile typecheck/lint/build, etkinlik RLS/RPC/domain/route, Kodeks/başlık migration/belge/PDF ve üye yönetimi/Disiplin testleri geçti.
- Deployment’a özel kısa error/fatal log taramasında kayıt bulunmadı; kısa gözlem penceresi gelecekte hata olmayacağını garanti etmez.

## Devam eden işler

Wix arşiv aktarımı/eksik kimlik ve yoklama incelemesi yapılmadı. Gizlilik aydınlatma ve saklama metni taslağı yayımlanmadı; hukuki sebep/saklama ölçütü ve sağlayıcı incelemesinin tamamlandığı varsayılmaz. Yetkili oturumla Profil/Disiplin/etkinlik oluşturma-yayımlama-yoklama uçtan uca canlı QA bu oturumda yapılmadı. Bunlar deployment’ın READY olmasından ayrı kontrol başlıklarıdır.
