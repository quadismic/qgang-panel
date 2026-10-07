# Q-GANG düzeltme paketi üretim yayını — 2026-10-06

- Kullanıcı son mesajıyla üretim yayınını yetkilendirdi.
- Test edilen yerel commit: `06ef6ff7752752a4cd20da08934312bcc557a10a`.
- GitHub release commit: `0ac3350a85c9b18d4c9cdb649b3b2fbf70369597`.
- Her iki commit için birebir kaynak tree: `12e31c48b562de350f9bfbeb55f347803fa830bd`.
- Branch: `ui/community-codex-layout`; main değiştirilmedi.
- Vercel production deployment: `dpl_26pk7AEwqRfT8ccK7XUBGxGeWV59`, READY.
- `q-gang.com` ve `www.q-gang.com` aliasları bağlandı; aliasError null.
- Ana sayfa ve login HTTP 200. Dört canlı CSS dosyası HTTP 200; `d6f256395083e5fd.css` yeni purgeExpected, budgetPdf ve announcementPageTools stillerini içeriyor.
- Bakım modu açık bırakıldı. Canlı anonim `/api/budget/pdf` isteği bakım HTML sayfasına yönlendirildi; bu kontrol endpoint yetkilerini canlı doğrulamış sayılmaz. Yerel 401/403/400/200 ve PDF içerik testleri paket raporunda kayıtlıdır.
- Veritabanı migration veya canlı veri düzenlemesi yapılmadı.
- Typecheck, lint, temiz production build ve ilgili davranış testleri yayın öncesi geçti; ayrıntılar UI_CONVERGENCE_REPORT_20261006.md içinde.
- 1440/390 görsel tarayıcı doğrulaması Chromium socket izin engeli nedeniyle tamamlanamadı; yayın başarılı olsa da bu sınırlama devam ediyor.
