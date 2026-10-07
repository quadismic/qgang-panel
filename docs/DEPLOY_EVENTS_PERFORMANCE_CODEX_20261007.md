# Q-GANG üretim yayını — 7 Ekim 2026

Kullanıcının deploy talimatıyla etkinlik sekmesi performansı ve Kodeks formu değişiklikleri production'a yayımlandı.

- URL: https://q-gang.com
- Deployment: dpl_BTrALHB526WGm7ywJhvgWMZeRxvd; READY, aliasError null.
- Remote commit: c629ff453fdf7d2fc456b6e57d21b70bc12b74b3.
- Test edilen yerel commit: 8a1c8c9728a0e0809188577138b8a82d7be4fc7b.
- Birebir aynı kaynak tree: 6f7f6b012e118c0cc1189c67b852770966f58699.
- Q-GANG proje/team doğrulandı; kaynak dalı beklenen remote head kontrolüyle fast-forward güncellendi. main değişmedi. Sabit commit ile production build başarılı; build yaklaşık 55 saniye.
- Etkinlik bağımsız okumaları paralel; arşiv dışı gereksiz üye sorgusu yok; sekmelerde pending geri bildirimi.
- İcra kararında Tür/Bölüm kontrolleri kaldırıldı; bölüm dayanak kaydından, Başlık tam genişlikte ve Dayanak/Uygulama Kapsamı öncesinde. Başlık önerisi placeholder içinde. Kodeks paneli dış tıklamayla kapanmaz; kapatma/Escape korunur.
- Typecheck, lint, production build ve etkinlik domain/API/DB/sunum/concurrency testleri geçti. Güncellenmiş Kodeks tarayıcı testi bu son değişiklik için yeniden çalıştırılmadı; gerçek oturumlu canlı akış ve etkinlik geçiş milisaniyesi ölçülmedi.
- Dağıtıma özel kısa error/fatal log taramasında kayıt yok. Bu kısa gözlem, sonraki kullanımda hata olmayacağını garanti etmez.
- Yeni migration, veritabanı/veri veya permission değişikliği yok.

Yayın sonrası ana sayfa, Etkinlikler ve Kodeks HTTP 200 döndü. Oturumsuz yanıt kontrolü, üye oturumlu form ve sekme geçişinin uçtan uca testi yerine geçmez.
