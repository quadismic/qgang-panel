# Q-GANG production yayını — Etkinlik detayı, 2026-10-07

- URL: https://q-gang.com
- Hedef: production; Next.js; READY, aliasError null.
- Deployment: dpl_DrSj42MTu5Hv4YnhnmSdjMMvhcDB.
- Remote commit: 73537a5b7f91dcebc7eee0121385e78864ec5a82.
- Test edilen yerel commit: 0102de0.
- Birebir aynı kaynak tree: ac660b94adef3b9bd7e58d08d7d1cf17ad12021d.
- Kaynak dal ui/community-codex-layout beklenen eski head kontrolüyle fast-forward güncellendi. Main değişmedi. Proje/team ve sabit commit doğrulandı.
- Build yaklaşık 71 saniye (kuyruk hariç). q-gang.com ve www.q-gang.com yeni deployment'a bağlı.

Etkinlik detayında gerçek başlık/tek tarih-durum satırı, üst dönüş ve filtre bağlamı, kompakt katılım arşivi, üst yönetim menüsü/native dialog, 44px mobil hedefler ve tek liste ayırıcı yayımlandı. Bekleyen Etkinlikler banner ayarı, sekmelerde Yükleniyor metninin kaldırılması ve Kodeks tarih footer ortalaması da pakete dahildir. Yetki/veri modeli/API değişmedi; migration veya veri yazımı yapılmadı.

390/1440px yerel gerçek Chromium, boş/dolu/uzun başlık/yetki varyasyonları, event domain/API/DB/sunum testleri, lint, typecheck ve build geçti. Ayrıntılar EVENTS_DETAIL_UI_REPORT_20261007.md.

Yayın sonrası ana sayfa, Etkinlikler ve Kodeks HTTP 200 döndü. Dört CSS dosyası HTTP 200; yeni eventDetailHero/eventDetailActions/eventAttendancePanel ve ortalanmış Kodeks footer stilleri mevcut; eventTabPending stili yok. Oturumsuz canlı kontrol, gerçek üye oturumuyla yönetim işlemi testi yerine geçmez. Yeni deployment'a özel dar yayın penceresindeki error/fatal runtime taramasında kayıt bulunmadı; uzun süreli hata garantisi değildir.
