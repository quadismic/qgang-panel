# Q-GANG güvenlik düzeltme paketi — 23.10.2026

Durum: yerel kaynak ve migration paketi. Canlı veritabanına uygulanmadı, push/deploy yapılmadı. Önceki salt okunur denetim: SECURITY_AUDIT_20261023.md.

## Yapılanlar

- Next.js / eslint-config-next 15.5.28, sharp 0.35.5, sanitize-html 2.18.1 ve source-map-js 1.2.2. Sürüm düşürme veya audit --force kullanılmadı.
- Yayın yayımlama yetkisi DB tetikleyicisinde zorunlu: doğrudan yayımlanmış kayıt oluşturma, yayıma geçiş, yayımdan kaldırma ve yayındaki içeriği değiştirme publish yetkisi ister. Taslak yazma izni korunur.
- Doğrudan üyelik işlemlerinde mevcut canAssign kuralı (Lider/Vekilharç, kendi hesabı ve Lider koruması), kimlik alanlarının değişmezliği; yeni kayıtta tarih/işlemi yapan kişi sunucuda belirlenir. Identity ALWAYS üye numarası, mühür/ERA tetikleyicileri ve yetkili iç işçiler korunur.
- Askıya alma has_permission, sunucu izin yardımcıları, mevcut RLS tablolarına ek kısıtlayıcı politikalar, Storage ve public iş tablolarının yazma tetikleyicilerinde uygulanır. Salt role bakan dört yönetim RPC'sine ek kontrol konur. Gizlilik başvuru tabloları ve yolları bu genel engelden hariçtir.
- Tasarım URL'leri doğrulanır; CSS style içeriğinde HTML kapanışını başlatan karakter ayrıca kodlanır. Depolanmış style/script bağlamı kırılması engellenir.
- Bildirimlere istemciden INSERT ve gövde/kimlik UPDATE kaldırılır; yalnız read_at güncellenebilir. Kullanılmayan serbest bildirim endpointi doğrulanmış kaynak işlemini zorunlu kılar. Mevcut rozet RPC/tetikleyici bildirimleri çalışır.
- Banner bucket 6 MiB ve PNG/JPEG/WebP ile sınırlanır. Kişisel/yetkili profil yüklemeleri dosyayı gerçekten çözümler, piksel sınırı uygular, metadata kaldırarak WebP üretir.
- Middleware tüm değiştirme isteklerinde Origin ve cross-site kontrolü yapar. Server Action ve Route Handler yolları kapsanır.
- Steam bağlantısı oturuma bağlı, 10 dakikalık host-only güvenlik çerezi; state, return_to, endpoint, signed alanları, nonce zamanı ve Steam doğrulaması; timeout ve callback tüketimi.
- nosniff, frame denial, referrer/permissions başlıkları; frame-ancestors/object-src/base-uri CSP uygulanır. Daha sıkı kaynak CSP'si rapor kipindedir; uyum gözlenmeden enforce edilmez.

## Doğrulama

- TypeScript noEmit, ESLint ve Next üretim build: başarılı.
- npm audit --omit=dev: **0 açık**.
- npm run test:security: gerçek TS handler/React çıktısı/görsel decoder ve PGlite üzerinde gerçek migration; yayımlama, üst rütbe/kendi hesabı, kimlik değişmezliği, askıdaki RPC, sahte bildirim, Steam challenge/callback/replay, Origin, style kapanışı testleri.
- Mevcut auth, zengin metin, gizlilik DB/Origin, üye yetki route, etkinlik ve rozet regresyonları geçti.
- Yeni migration mevcut rozet/üyelik dönemi tetikleyicileriyle beraber de test edildi: yetkili tevzih/geri alma ve kaynak bildirimleri korunur. Gerçek kimlik/mühür/privileged-profile tetikleyicileriyle üye açma ve pasifleştirme/yeniden etkinleştirme ayrıca test edilir.
- Yerel HTTP üretim sunucusunda güvenlik başlıkları ve yabancı Origin POST için 403 kontrol edilir. Bu, gerçek rol oturumlarıyla üretim kabul testinin yerine geçmez.

## Kalanlar ve yayın sırası

1. Gizlilik etki notu ve yeni kısa ömürlü Steam güvenlik çerezi açıklaması: docs/privacy/SECURITY_HARDENING_20261023.md. Yayımlanmış metinlere müdahale edilmedi.
2. Migration ve uygulama aynı yayın paketidir. Migration uygulanırken tablo/trigger/policy/function tanımları tekrar karşılaştırılmalı; ardından uygulama yayınlanmalı ve oturumlu rol kabul testleri yapılmalıdır. Bu tur canlı değişiklik yapılmadı.
3. Geliştirme zincirinde braces <=3.0.3 için GHSA-vfj7-8cjw-p6xm devam ediyor (5 paket aynı zincirden etkilenir). Registry'de braces 3.0.3 / micromatch 4.0.8 güncel; yayımlanmış uyumlu düzeltme yok. Çalışan uygulamanın üretim ağacında bulunmaz. Zorunlu Next ESLint sürüm düşürmesi uygulanmadı.
4. Vercel WAF / dağıtık hız sınırlaması, sağlayıcı MFA/kurtarma ve yedekten dönüş testi bu kod paketiyle doğrulanmış sayılmaz. Yeni genel hız sınırlama altyapısı veya takip kaydı eklenmedi. Var olan yorum sınırlamaları korunur.
5. Tam kaynak CSP'si report-only; rapor toplama sağlayıcısı eklenmedi. OAuth, harici görseller ve video akışları gerçek oturumla gözlendikten sonra script/connect/frame allowlist daraltılabilir.
6. Gerçek Lider/Vekilharç/Kaptan/Teğmen/üye hesaplarıyla tarayıcı ve Data API kabul testi yapılmadı; üretim kullanıcılarına dokunulmadı. Kaynak ve SQL regresyonları izole test hesaplarıyla geçer.

Supabase CLI çağrısı harici PostHog telemetrisi nedeniyle otomatik inceleme tarafından durduruldu. Aynı çağrı tekrar denenmedi; oluşmuş migration dosyası normal dosya düzenleme ve yerel PGlite testleriyle tamamlandı. Üretim migration işlemi henüz çalıştırılmadı.
