# Q-GANG hızlandırma paketi — 25.10.2026

Durum: kaynak paketi hazır; push/deploy, canlı veri/ayar veya bölge değişikliği yapılmadı. Dal: performance/speed-package-20261025. Önceki güvenlik paketi üzerine kuruludur; image optimizer yeni izinli kaynakları için Next.js 15.5.28 / sharp 0.35.5 yamaları gereklidir. Eski üretim kaynağına yamalar olmadan tek başına taşınmamalıdır.

## Ölçülen farklar

Aynı paket sürümleriyle ff56e6c tabanı ayrı worktree'de ve yeni kaynak aynı ortamda Next üretim build'iyle karşılaştırıldı. Aşağıdaki First Load JS, Next'in build raporudur; gerçek ağ süresi veya yüzde hızlanma değildir.

| Yüzey | Önce | Sonra | Azalma |
|---|---:|---:|---:|
| Ana sayfa | 205 KB | 115 KB | ~%44 |
| Topluluk | 210 KB | 120 KB | ~%43 |
| Etkinlikler | 209 KB | 120 KB | ~%43 |
| Yayınlar | 209 KB | 119 KB | ~%43 |
| Profil | 208 KB | 117 KB | ~%44 |
| Giriş | 147 KB | 104 KB | ~%29 |
| Kodeks | 212 KB | 211 KB | ~%0,5 |

Ana sayfa layout+page manifestindeki benzersiz JS dosyaları ayrıca gzip ile toplandı: 207.157→116.490 bayt. Bu, tarayıcı ağ kaydının yerine geçmez; ertelenen modüller açıldıklarında yüklenir.

| Görsel grubu | Asıl dosyalar | Yeni sürüm | Azalma |
|---|---:|---:|---:|
| 4 onaylı konsey portresi, 960px | 9.210.414 B | 1.255.940 B | %86,4 |
| Aynı 4 portre, 480px | 9.210.414 B | 413.540 B | %95,5 |
| Lider çerçevesi, 960px | 918.635 B | 153.012 B | %83,3 |
| Kaptan çerçevesi, 960px | 981.522 B | 141.820 B | %85,6 |
| Lider tacı, 480px | 1.025.888 B | 32.474 B | %96,8 |
| Amblem, 480px | 431.272 B | 62.300 B | %85,6 |
| Favicon/amblem, 240px | 431.272 B | 20.134 B | %95,3 |

Tarayıcı, ekran genişliği ve piksel yoğunluğuna göre srcset adayını seçer. Mobilde mutlaka 480px ya da masaüstünde mutlaka 960px indirileceği iddia edilmez. Portreler için asıl çözünürlüğü aşmayan daha büyük adaylar da vardır. Alpha, oran ve aynı artwork korunur; WebP kalite 90 kullanılır. Önce/sonra portre karşılaştırması görsel olarak incelendi; özgün kompozisyon/rütbe geometrisi değiştirilmedi.

## Uygulananlar

- `viewer.ts`: profil, aktif üyelik ve rol izinleri request-local React cache ile ortaklaşır. AppShell, getPermissions ve hasPermission aynı profil/izin okumalarını paylaşır. Farklı kullanıcılar ve istekler paylaşılmaz; askı kontrolü korunur.
- Ana sayfanın ayrı tasarım/profil/üyelik sorguları kaldırıldı. Tasarım, etkinlik ve içerik okumaları paralel başlatılır. Yayınlar sayfası ortak getCurrentUser'ı kullanır. Profil birthday RPC'si diğer bağımsız okumalarla paralelleştirildi; viewer profili paylaşılır. Bütçedeki kullanılmayan ek üyelik sorgusu kaldırıldı.
- Yalnız anonim erişime açık tasarım belgesi 300 saniye cache'lenir; cookie/JWT taşıyan server client cache'e sokulmaz. Yönetimden save/restore/reset sonrası tag invalidation ve mevcut path invalidation çalışır. Bakım modu, üyelik, izin ve kişisel sayfa cache'lenmez.
- Kimlik ve hazine panelleri yalnız açıldıklarında dinamik yüklenir. Kapalı ortak kabuk sanitize/rich-text zincirini ilk render'a taşımaz. Aynı mevcut dialog/erişilebilirlik primitive'i kullanılır.
- Google OAuth SDK'sı etkileşimde yüklenir; güvenli next adresi ve provider akışı korunur. Yükleme/ağ hatasında düğme tekrar kullanılabilir.
- Etkinliklerde 24 kayıt + bir sonraki sayfa işareti için 1 ek kayıt okunur. Tür/tarih/üye filtreleri ve sıralama DB'de sayfalama öncesindedir. Üye filtresi ayrı ilişki alias'ı ile uygulanır; tam katılım ilişkisinden hesaplanan toplam ve kişisel katılım ayrımı korunur. Detaydan dönüşte sayfa/filtre bağlamı korunur. Katılım yanıtları hâlâ yalnız kendi kullanıcı kimliğine göre okunur.
- Kayıt sonrası farklı adrese gidiliyorsa gereksiz push+refresh birleşimi kaldırıldı. Aynı URL'ye dönülüyorsa refresh korunur.
- Public, onaylı artwork için hash'li statik WebP türevleri; portre srcset/sizes; ilk portre high/eager, diğerleri low/lazy. Rütbe çerçevesi/taç, amblem ve favicon boyutları uygun sürümlere bağlandı. Asıllar ve CMS kayıtları korunur.
- Public avatar/kapak/tasarım bucket'larında güvenli boyutlu thumbnail. Image optimizer host/path allowlist ile yalnız mevcut Supabase projesinin ilgili public yollarına açılır; private belgeler ve keyfi dış URL'ler dönüştürülmez. Yeni görsel yüklemelerinde fallback responsive optimizer yolu vardır.
- Hash'li /perf dosyaları immutable bir yıl cache başlığıyla sunulur; statik marka/asset/font istekleri middleware dışında kalır. Dinamik/API/auth yollarının matcher kapsamı korunur.

## Doğrulama

- Typecheck, ESLint ve Next üretim build: başarılı. Mevcut baseline CSS autoprefixer/webpack cache uyarıları derlemeyi engellemedi.
- `test:performance`: gerçek kaynak fonksiyonlarıyla tek profil/üyelik/izin okuması, kullanıcı/istek izolasyonu, suspension, public-only cache ve gerçek saveDesign invalidation, tüm WebP dosyalarının decode/boyut denetimi; private/harici URL korunması; gerçek Next matcher; OAuth SDK'nın ilk render'da yüklenmemesi ve güvenli dönüş adresi.
- Etkinlik sunum testinde 25 sonuç→24 kayıt, sayfa 1/2 aralığı, DB üye/attended filtresi ve dönüş bağlamı; mevcut paralellik ve bağımsız yetki testleri geçti.
- Auth, güvenlik migration/rol/üyelik/rozet, üye yetki UI/route, topluluk directory, etkinlik domain/API/DB, belge/PDF, bütçe PDF, zengin metin ve gizlilik DB regresyonları geçti.
- Yerel üretim HTTP: ana sayfa 200, giriş 200, hash'li asset 200 + immutable başlığı, yabancı Origin POST 403. İzinli remote image optimizer gerçek public kaynaktan 480px WebP üretti: 200, 90.090 bayt.
- Canlı anon etkinlik denemesi 42501 permission denied döndürdü; bunu oturumlu liste kabul testi olarak saymıyoruz. Üretim kullanıcılarıyla işlem yapılmadı.
- Gerçek 390/1440px tarayıcı kabul testi tamamlanmadı: ortamda Chromium yoktu ve resmi Playwright indirmesi geçersiz/bozuk arşiv döndürdü. Portre dosyalarının görsel karşılaştırması, sayfa ekran görüntüsü testi yerine geçmez.

## Paket dışında kalanlar

- Bölge taşıması yapılmadı. Vercel/Supabase Tokyo olarak kalır; tek taraflı taşıma veya ücret/plan değişikliği yoktur.
- Kodeks tarihçesini açıldığında yükleme, bütçe toplamlarını ayrı aggregate ile okuma, büyük CSS/override temizliği ve kanıtlanan hot RLS/indeks düzenlemesi ayrı aşama gerektirir. Etkinlik önerileri ve kişisel RSVP listesi bu pakette ayrı sayfalanmadı. Bütün performans audit maddeleri kapandı denmez.
- Kamusal HTML'nin tamamı CDN cache'ine alınmadı. Kişisel/yetkili HTML'de veri sızıntısı yaratacak ortak cache uygulanmadı.
- İlk image optimizer dönüşümü kaynak indirme/işleme maliyeti taşır. Varyantlar cache'e girdikten sonra tekrar kullanılır. Yeni tasarım kaydı dışarıdan doğrudan DB ile değiştirilirse cache en çok TTL kadar eski kalabilir; uygulama save/restore/reset akışı anında invalidation yapar.
- Türkiye gerçek kullanıcı LCP/INP/TTFB ölçümü ve oturumlu tarayıcı kabulü yapılmadan “site şu kadar kat hızlandı” sonucu çıkarılamaz.

Veri etki notu: `privacy/PERFORMANCE_PACKAGE_20261025.md`. Kullanıcı verisi, kurum kararları, ERA veya erişim yetkileri değiştirilmedi. Dal, önceki güvenlik paketi migration'ını da taşır; dağıtımda onun yayın koşulları ayrıca gözetilmelidir. Bu tur migration uygulanmadı ve deploy yapılmadı.
