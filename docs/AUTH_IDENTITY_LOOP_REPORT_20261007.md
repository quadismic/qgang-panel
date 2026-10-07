# Q-GANG — giriş sonrası kimlik oluşturma döngüsü · 7 Ekim 2026

## Kök neden ve etkilenen hesaplar

Kullanıcı son hedefi Kimlik oluşturma ekranı olarak netleştirdi. İncelenen 7 Ekim 14:03–14:09 İstanbul girişlerinde Supabase Google/PKCE kod değişimi başarılı (token HTTP 200). Tekrar giriş yapan son hesabın mevcut `member` rütbesi, aktif topluluk üyeliği ve yönetimce doğrulanmış legacy eşleşmesi bulunuyor; `onboarding_completed_at` boş. Rütbe, OAuth oturumu ve platform kimlik kurulumu ayrı durumlar.

Canlıda 17 profil: 16 topluluk üyesi/yönetici ve 1 guest. Üyelerden üçünde geçerli isim/rumuz, mevcut özel doğum tarihi ve doğrulanmış eski üyelik bağlantısı olmasına rağmen tamamlanma işareti yok. Hepsi eşleşmiş eski hesaplar. Giriş callback'i, middleware, onboarding ve profil sayfası bu işareti kontrol ettiği için aynı hesap tekrar kimlik oluşturma ekranına gider. `link_legacy_member` üyelik/rütbe/doğum bilgisini taşıyor, bu işareti tamamlamıyordu.

Yeni veya eksik hesapta bir kez kimlik oluşturma ekranının açılması beklenir; mevcut onboarding RPC'si başarıyla tamamlandığında işaret yazılır. Yalnız rütbe verilmesi, isim benzerliği ya da aynı e-posta iddiası kimlik kurulumunu atlatmaz. Farklı Google hesabından giren kullanıcı otomatik olarak başka üyenin kimliğine bağlanmaz.

Ana sayfadaki “KİMLİĞİNİ DOĞRULA” yalnız oturum yokluğuna bağlıdır. Tamamen anonim ana sayfaya dönme, incelenen tamamlanma işareti sorunundan ayrı bir oturum belirtisidir; bu rapor tüm anonim dönüşlerin nedeninin çözüldüğünü iddia etmez. Kullanıcının netleştirdiği onboarding yönlendirmesi onarıldı.

## Düzeltme

Yerel migration: `20261007111530_verified_legacy_onboarding_completion.sql`.
Canlı uygulama: `verified_legacy_onboarding_completion`, sürüm `20261007111911` (14:19 İstanbul).

- Yalnız gerçek auth hesabı, aktif üyelik, `claimed_at` + `verified_by` ile yönetimce doğrulanmış eski eşleşme, geçerli özel doğum tarihi ve geçerli/otomatik placeholder olmayan platform kimliği birlikte varsa eksik marker eski doğrulama tarihiyle tamamlanır.
- Mevcut tamamlanma tarihleri korunur. Üç profil onarıldı; eşleşmiş eksik profil sayısı 3 → 0. Yeni/eksik guest onboarding'de kaldı.
- Legacy doğrulama sonrasında private trigger aynı kontrolü çalıştırır; sonraki yönetim eşleştirmelerinde hata tekrarlanmaz. İsim/e-posta üzerinden otomatik eşleştirme veya yeni rütbe şartı yok.
- Yardımcı fonksiyonlar `SECURITY INVOKER`, kapalı private schema, PUBLIC/anon/authenticated doğrudan çalıştırma yetkileri iptal. Mevcut legacy RPC authorization/hiyerarşi korunur.
- İdempotent backfill profil kilidi ve marker dışındaki alanların aynı kalmasını doğrulayan transaction kontrolü içerir; yan etkide işlem geri alınır.
- Yerel onboarding formu, gerçekten eksik kimlikte mevcut görünen adı ve özelleştirilmiş rumuzu başlangıç değeri olarak korur. Otomatik placeholder yeni kullanıcıya gerçek kimlik gibi gösterilmez. Bu küçük UI iyileştirmesi henüz web deploy edilmedi.

## Doğrulama

`npm run test:auth`: gerçek callback yönlendirmeleri, middleware no-self-redirect, yenilenmiş cookie'nin yönlendirmede korunması, güvenli next, maintenance kapısı; gerçek PostgreSQL/PGlite eski eşleşme + backfill + sonraki link RPC/trigger; tam/eksik kimlik, eksik doğum tarihi, placeholder, rütbe/üyelikle tek başına bypass yapılmaması, idempotence ve private helper erişim reddi; guest OAuth profil/RLS testleri geçti.

Typecheck, lint, production build geçti. Canlı sonrası sorgu: eşleşmiş eksik profil 0, toplam eksik 1; helper'ın anon/authenticated EXECUTE yetkileri false. Profilin marker dışındaki bütün sütunlarının, üyeliklerin, özel verilerin ve legacy bağlantılarının önce/sonra toplu checksum'ları aynı. Supabase güvenlik advisor bulguları önce/sonra aynı; yeni bulgu yok.

Üye Google hesaplarına giriş yapılmadı veya oturum üretilmedi. Canlı veritabanı koşulu ve yerel gerçek route/DB testleri doğrulandı; üyenin kendi tarayıcısında Google dönüşü ayrıca tekrar denenebilir. Web deploy/push yapılmadı; önceki Etkinlikler UI commit'i de yerel durumda kalır.

## Veri etki kontrolü

FEATURE_REVIEW altı sorusu olumsuz: yeni veri kategorisi/amaç, alıcı/sağlayıcı, çerez/takip veya saklama/başvuru değişikliği yok. Mevcut doğrulanmış kimlik kurulum durumu uzlaştırılır; doğum bilgisi aynı private kayıtta kalır. Marker rıza beyanı olarak kullanılmaz. RLS/rol/permission ve yayımlanmış gizlilik metinleri değiştirilmedi.
