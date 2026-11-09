# Q-GANG güvenlik incelemesi — 23.10.2026

## Sonuç ve kapsam

Q-GANG uygulamasında PHP runtime, PHP dosyası veya Composer bağımlılığı bulunmadı. Canlı proje Next.js/Node.js 24.x üzerinde Vercel'de, veritabanı/kimlik/depolama Supabase üzerinde çalışıyor. PHP2Shell için doğrudan uygulama maruziyeti saptanmadı. Sağlayıcıların görünmeyen iç sistemleri ve diğer projeler bu sonucun kapsamında değildir.

Üretim referansı: commit `140475810553c6664cb36d5558cbeaaf66668c71`, deployment `dpl_2bM6DXscEuZUQGgMLjNNHXThgJLc`, READY. Yerel uygulama kaynakları bu sürümle eşleşiyor. İnceleme kaynak kodu, lockfile, 36 API rotası, canlı RLS/grant/trigger/SECURITY DEFINER metadatası, Storage ayarları, HTTP kontrolleri ve sınırlı günlük incelemesini kapsar. Üretime saldırı payloadı gönderilmedi; canlı hesap/veri/yetki değişikliği ve deploy yapılmadı.

## Öncelikli bulgular

| Öncelik | Bulgu | Kanıt ve etki | Düzeltme |
|---|---|---|---|
| P0 | Güncel güvenlik yaması olmayan Next.js/sharp | Next.js 15.5.24, sharp 0.35.4. Üretim bağımlılık taraması kritik Next.js ve yüksek sharp uyarısı veriyor. Image Optimization uç noktası benign PNG isteğine 200 döndürüyor. App Router ve Server Actions kullanılıyor; duyurulan CPU tüketimi/DoS koşulu uygulanıyor. | Next.js en az 15.5.28, sharp en az 0.35.5; lockfile yenileme ve yeniden build/deploy. |
| P1 | Yayın yazma izni, yayımlama iznini veritabanında aşıyor | Canlıda Teğmen için publications.write=true, publications.publish=false. INSERT/UPDATE politikaları yalnız write iznini arıyor; authenticated rolünün status alanına yazma izni var. Tek publication triggerı rozet işlevi. Alınan RLS politikalarıyla izole PostgreSQL testinde publish izni olmadan published kayıt oluşturuldu. | Durum geçişleri ve published INSERT için DB trigger/RPC yetkisi; arayüz ve API dışında doğrudan Data API de engellenmeli. |
| P1 | Üyelik durumunda rütbe hiyerarşisi DB katmanında eksik | community_memberships ALL politikası yalnız members.manage arıyor. API kendi hesabı/Lider/üst rütbe koruması uyguluyor; doğrudan tabloda bu koşul yok. Canlı triggerlar kimlik ve rozet işlerini yapıyor, inactive geçişinde hiyerarşi denetlemiyor. Alınan politikalarla izole testte Kaptan rolü Liderin üyeliğini inactive yapabildi. Bu işlem Lider rolünü ele geçirmek anlamına gelmez; üyelik kaydını bozabilir. | Üyelik INSERT/UPDATE/DELETE hedefini, öz işlemi ve hiyerarşiyi DB'de koruma; kimlik alanlarını da sınırlandırma. |
| P1 | Tasarım ayarında kalıcı HTML/script enjeksiyonu | normalizeDesign URL doğrulaması yalnız başlangıca bakıyor; DesignRuntime URL'yi raw style HTML içinde kullanıyor. Gerçek normalizer ve React renderer ile yerel testte style kapatma işareti yeni script elemanı üretti. Ön koşul design.manage erişimidir. Üretime payload kaydedilmedi. | URL/path allowlist ve bağlama uygun kaçış; raw style HTML içine kullanıcı ayarı koymayı kaldırma. |
| P1 | Askı durumunda genel yetki kesilmesi eksik | private.has_permission, hasPermission ve getPermissions rol/yetki arıyor; is_suspended aramıyor. Bazı doğrudan founder kontrolü yapan RPClerde de aynı eksiklik var. Alınan helper ile izole testte askılı yönetici yetkili sayıldı. Canlıda şu an askılı yönetici sayısı 0. | Merkezi helper ve doğrudan rol kontrollerinde askı reddi; gerektiğinde mevcut oturumların sonlandırılması. |
| P2 | Bildirim türü sahteciliği | notifications INSERT politikası actor_id=auth.uid(), hedef, tür ve uzunluk kontrol ediyor; moderation/badge/announcement türleri için kaynak işlem/yetki kontrolü yapmıyor. API de aynı veriyi kabul ediyor. İzole RLS testinde sıradan üye moderation türü bildirim ekleyebildi. | Kritik bildirimleri doğrulanmış işlemlerden sunucuda üretme; kaynak kayıt/yetki kontrolü ve kötüye kullanım sınırı. |
| P2 | Banner deposunda boyut/MIME sınırı yok | qgang-banners public=true; file_size_limit ve allowed_mime_types null. Profil API'si 6 MiB ve PNG/JPEG/WebP kontrol ediyor, ancak Storage'a doğrudan erişim bu uygulama kontrolünü atlar. Dosya sahipliği/prefix koruması var. | Bucket seviyesinde sınırlar; magic-byte doğrulaması ve gerekiyorsa güvenli yeniden kodlama. Public olma durumu banner gösterimi için normaldir. |
| P2 | Origin/CSRF koruması tutarsız | Gizlilik ve etkinlik uçları sameOrigin kullanıyor. Profil, rütbe, üyelik, bütçe ve bazı yönetim form uçlarında açık Origin/CSRF kontrolü yok. Cookie SameSite davranışı riski daraltabilir; bu incelemede oturumlu gerçek tarayıcı CSRF istismarı denenmedi. | Mutasyon uçlarında ortak Origin/CSRF doğrulaması; Next Server Actions'ın kendi korumalarını Route Handler'lar için yeterli saymama. |
| P2 | Steam hesap bağlamada işlem bağı eksik | Steam check_authentication yanıtı doğrulanıyor, fakat uygulamaya özgü tek kullanımlık state ve beklenen return_to/nonce işlemiyle açık eşleştirme yok. | İmzalı, tek kullanımlık bağlama state'i; nonce tekrar kullanımı ve callback bağlamı kontrolleri. Gerçek hesapla saldırı denenmedi. |
| P2 | Sayfa güvenlik başlıkları eksik | Ana sayfa/login HTTP 200; HSTS var. Ana HTML yanıtlarında CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy ve Permissions-Policy görülmedi. Image optimizer yanıtında ayrı CSP var; bu HTML sayfasını korumuyor. | Önce uygulamayla uyumlu CSP raporlama, ardından enforce; frame-ancestors ve diğer başlıklar. |

## Bağımlılıklar ve PHP2Shell ayrımı

Üretim taraması: **4 paket** — 1 kritik, 2 yüksek, 1 orta. Bu sayılar doğrulanmış saldırı veya birbirinden bağımsız açık sayısı değildir; sharp ve Next.js aynı alt kütüphane riskine işaret ediyor.

- Next.js 15.5.24: güncel eşik 15.5.28. Image Optimization RCE duyurusu glibc Linux/upstream görüntü işleme koşuluna bağlı. Uygulamada next/image bileşeni ve remotePatterns/dangerouslyAllowSVG ayarı bulunmadı; varsayılanlar bazı saldırı yollarını daraltıyor. Canlı RCE istismarı kanıtlanmadı. Server Actions DoS duyurusu kullanılan mimariye uygulanıyor.
- sharp 0.35.4 → en az 0.35.5.
- sanitize-html 2.17.7 → en az 2.18.0. Mevcut tag/scheme allowlist'i script, SVG ve meta gibi yüzeyleri daraltıyor; buna rağmen etkilenen sürüm güncellenmeli. Her advisory için uygulama üzerinde XSS istismarı kanıtlanmış değildir.
- source-map-js 1.2.1 → en az 1.2.2. Bilinen DoS uyarısı var; kullanıcıdan gelen source map işleme yolu bulunmadığı için runtime erişilebilirliği gösterilmedi.

Geliştirme bağımlılıkları dahil tarama: 9 paket (1 kritik, 7 yüksek, 1 orta). Ek zincir braces → micromatch → fast-glob → Next ESLint eklentisi/yapılandırması. Araç npm audit fix için eski bir major sürüme dönmeyi öneriyor; **force ile otomatik düzeltme uygulanmamalı**. Lint zinciri uyumlu yama/override değerlendirmesiyle güncellenmeli.

PHP2Shell, PHP'nin CVE-2026-109618 ve CVE-2026-109619 açıklarıdır. PHP proje duyurusu PHP web runtime'larını kapsar. Q-GANG'de saptanan Next/sharp sorunları bunlardan farklıdır.

## Geçen kontroller

- Canlı public tabloların tamamında RLS açık; announcement_feed görünümü security_invoker=true.
- Doğum tarihi gün/ay/yıl sütunlarına authenticated doğrudan SELECT izni yok; gizli doğum bilgisi ayrı erişim sınırında.
- profiles ayrıcalıklı alan triggerı rol yükseltme/self privilege ve rol hiyerarşisini koruyor. Üyelik durumu tablosu için yukarıdaki ayrı eksiklik geçerli.
- Oturumsuz profil, rütbe, üye düzenleme/silme, yetki matrisi ve bildirim istekleri 401 veya giriş yönlendirmesi alıyor. Foreign Origin ile etkinlik/gizlilik uçları 403 dönüyor.
- Google callback doğrulanmış kullanıcıyı alıyor; authNext harici/şema bağımsız yönlendirmeleri reddediyor. Genel oturum doğrulaması auth.getUser kullanıyor.
- RichText görüntüleme temizleyiciden geçiyor; bağlantı/video allowlist'i ve escaping testleri geçiyor. Bu, yeni sanitizer advisorylerinin hepsini kapsayan bir test değildir.
- PDF görsel fetch'i kendi Supabase publications deposu, HTTPS, redirect reddi, süre/boyut ve MIME sınırlarıyla kısıtlı.
- Belgeler bucketı private; avatar, tasarım ve yayın bucketlarında MIME/boyut sınırları var. Banner istisnası yukarıda.
- Kaynaklarda service_role kullanımı, eşleşen özel anahtar/token veya service_role JWT sızıntısı bulunmadı. Bu tarama tüm geçmiş git nesneleri ve bütün olası sır türleri için kapsamlı secret scanner değildir.
- Hassas dosya yollarına benign GET kontrolleri 404 döndü. Uygulama kaynaklarında shell/exec/eval ile istek verisi çalıştıran yol bulunmadı.
- Mevcut auth, callback, onboarding, topluluk onarımı, guest, gizlilik DB/origin, üye yetki API ve rich-text testleri geçti.

## Supabase uyarılarının yorumu

İki RLS-no-policy bilgisi legacy_members ve private.badge_site_logins için. Doğrudan erişimi kapalı tutup kontrollü RPC kullanılması nedeniyle tek başına açıklık sayılmaz.

7 anonim ve 55 authenticated SECURITY DEFINER çağrılabilirliği uyarısı var. Çağrılabilirlik otomatik olarak yetki açığı demek değildir. Public roster ve yayımlanmış gizlilik okumaları amaçlıdır. legacy eşleştirme ve maintenance fonksiyonları gövdelerinde izin kontrol ediyor. Buna karşılık merkezi helper'ın askı reddi eksikliği ve tablo politikalarının işlem ayrımı ayrıca giderilmelidir. Bütün fonksiyon gövdeleri metadata olarak alındı; her biri bütün olası parametre birleşimleriyle uçtan uca test edilmedi.

Leaked Password Protection kapalı. Görünen giriş Google OAuth olduğu için yerel parola girişine göre önceliği düşüktür. Supabase'de doğrulanmış MFA faktörü 0; Google hesabının kendi MFA durumu bu veriyle belirlenemez.

## Doğrulama ve sınırlar

Canlıdan alınan policy/helper metinleriyle izole PGlite PostgreSQL modelinde yayımlama ayrımı, üyelik hiyerarşisi, askı ve bildirim sınırları yeniden üretildi. Model ilgili politikaları kapsar; bütün uygulama veritabanının kopyası değildir. Gerçek trigger gövdeleri ayrıca okundu. Tasarım enjeksiyonu gerçek normalizer ve React statik render çıktısıyla yerelde doğrulandı. Canlıda RCE/DoS veya hesap bağlama saldırısı çalıştırılmadı.

Vercel son 24 saat runtime hata taraması boş döndü. Supabase günlüklerine erişim ve kaynak hacimleri görüldü; generic status alanları beklenen yapıda olmadığı için bu çıktıdan saldırı sayısı çıkarılmadı. Bu kontroller geçmişte ihlal yaşanmadığını kanıtlamaz.

Vercel active firewall config çağrısı 404 Seawall Config not found döndü. Özel WAF/rate limit yapılandırması doğrulanamadı; bundan platform DDoS korumasının kapalı olduğu sonucu çıkmaz. Uygulamada genel API hız sınırı bulunmadı; bazı yorum işlemlerinde özel limit var. Harici log drain yok. Google MFA, GitHub/Vercel hesap MFA'sı, recovery ayarları, DB ağ/SSL zorlaması ve yedekten geri dönüş tatbikatı mevcut araçlarla doğrulanmadı.

## Düzeltme sırası

1. Next/sharp/sanitizer/source-map ve lint bağımlılık yamaları; lockfile, testler ve build.
2. DB seviyesinde publication publish ayrımı, üyelik hiyerarşisi, askı reddi ve bildirim kaynağı kontrolleri.
3. Tasarım HTML bağlamı düzeltmesi ve regresyon testi; banner bucket/magic-byte sınırları.
4. Ortak Origin kontrolü, Steam bağlama state'i, güvenlik başlıkları ve işlem bazlı hız sınırlaması.
5. Gerçek rol oturumlarıyla doğrudan Data API/arayüz/API regresyonu; WAF ve hesap kurtarma/MFA/backup doğrulaması.

Bu turda yalnız inceleme ve raporlama yapıldı. Bulgular henüz kapatılmadı; canlı sürümde değişiklik yok.

## Birincil kaynaklar

- PHP: https://www.php.net/archive/2026.php
- Next Image Optimization: https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw
- Next Server Actions DoS: https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r
- sanitize-html: https://github.com/advisories/GHSA-x3q4-9hxx-gx8m
- source-map-js: https://github.com/advisories/GHSA-68fv-2mgg-jv7q
- Supabase linter: https://supabase.com/docs/guides/database/database-linter
- Vercel Firewall: https://vercel.com/docs/vercel-firewall

## Düzeltme paketi takibi

23.10.2026 tarihli kaynak düzeltmeleri, testler ve kalan yayın koşulları `SECURITY_FIX_PACKAGE_20261023.md` dosyasındadır. Bu ilk denetim anının bulguları değiştirilmedi; canlıya uygulanmış oldukları varsayılmamalıdır.
