# Q-GANG production yayını — 12.10.2026

- URL: https://q-gang.com
- Hedef: production; Next.js; READY, aliasError null.
- Deployment: dpl_FEnwCzVecXUCEaX2eLqrExZXKzdf.
- Remote commit: fd215e08a19a070b34dc0bcf645099e6a0a2b653.
- Test edilen yerel commit: a064900374e19223086a59598d87b0350088baea.
- Birebir aynı kaynak tree: d40a7e2277b587d03977a396afdbf348766664ee.
- Q-GANG proje/team doğrulandı. Kaynak dal ui/community-codex-layout beklenen eski head kontrolüyle fast-forward güncellendi; main değiştirilmedi.
- Production build yaklaşık 81 saniyede tamamlandı; q-gang.com ve www.q-gang.com alias'ları yeni sürüme bağlı.

## İçerik

Yayın türleri: Düşünce / Oyun / Teknoloji / Video / Araştırma / Sinema. İnceleme kaldırıldı; canlıda bu türde kayıt yoktu. Sinema film/dizi kapsamındadır ve bakır-turuncu #E58B57 kullanır. Stüdyo durumları Taslak / Yayında; yayımlama yetkisi korundu.

Yönergede bölüm seçimi kaldırıldı; bölüm sunucuda doğrulanmış asli dayanağa bağlanır. Asli dayanak tek ve zorunlu; tamamlayıcı dayanaklar çoklu, isteğe bağlı, sürümlüdür. Detay, ilişkiler, PDF ve geçmişte gösterilir. Yayımlanmış asli dayanak değişmez; taslakta değişirse numara yeni dayanağa göre yeniden üretilir. Dayanak güncelliği disiplin/icra işlemlerinde DB tarafında kontrol edilir.

Önceki etkinlik kimlik uzlaştırma migration'ı zaten canlıdaydı; dosyası bu kaynak yayınına dahil edildi, yeniden uygulanmadı.

## Veritabanı

Uygulanan remote migration'lar:
- 20261012075239 publication_cinema_and_two_states
- 20261012075246 publication_remove_review
- 20261012075251 directive_complementary_bases

Canlıda 6 yayın, 69 Kodeks kaydı vardı. Yayınların status hariç kontrol toplamı 44fa091e9a0b11efa17d7bbf24e02ee4; Kodeks kayıtlarının yeni complementary_bases alanı hariç kontrol toplamı 1244cc36f1340fc5da474d5844206952. Migration sonrasında ikisi de aynı. Mevcut tüm complementary_bases dizileri boş; geçmiş kayıtların numarası, başlığı ve içeriği korunmuş. İlgili tabloların RLS'si etkin. Yeni trigger fonksiyonları anon/authenticated tarafından doğrudan çalıştırılamıyor; salt-okuma yardımcı fonksiyon security invoker ve RLS üzerinden çalışıyor.

Security advisor taraması yeni fonksiyonlara ilişkin bulgu göstermedi. Mevcut public RPC/security-definer ve leaked-password ayar bildirimleri bu paketin kapsamı dışında bırakıldı; toplu izin değişikliği yapılmadı. Referans: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable ve https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.

## Doğrulama

Geliştirmede typecheck, lint, build, PDF ve ilgili rota testleri geçti. Deploy öncesi yayın türleri, Kodeks bölüm aksiyonu ve kapsamlı PGlite Kodeks testi yeniden geçti.

Yayın sonrası /, /yayinlar, /kodeks ve /etkinlikler HTTP 200. Yayınlar HTML'inde Sinema filtresi mevcut, İncelemeler filtresi yok; bakır rozet ve tamamlayıcı dayanak CSS'i sunuluyor. Kodeks yükleme hatası yok. Yeni deployment'a özel 10 dakikalık dar error/fatal log taramasında kayıt bulunmadı; bu uzun süreli hata garantisi değildir.

Oturumlu yönetim formunda canlı kayıt değiştiren test ve tarayıcıda 390/1440px görsel doğrulama yapılmadı. Bu sınır, yerel işlev/DB testlerinden ayrıdır.
