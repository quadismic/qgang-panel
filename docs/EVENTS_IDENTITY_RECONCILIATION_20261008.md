# Sonradan doğrulanan üye kimliği / etkinlik arşivi — 2026-10-08

Eski üye kimliği mevcut yetkili link_legacy_member RPC'si ile doğrulandığında geçmiş etkinlik kayıtlarını hesaba bağlayan adım eksikti. private şemadaki security invoker yardımcı ve legacy_members trigger'ı eklendi. Mevcut members.manage/hiyerarşi/açık kimlik kanıtı kontrolleri değiştirilmedi. Yardımcılar anon/authenticated tarafından doğrudan çağrılamaz; mevcut yetkili RPC bağlamında çalışır.

Kimlik claimed_by, claimed_at ve verified_by ile doğrulanmış olmalıdır. Eşleştirme yalnız eski rumuzun lower(trim(...)) karşılığıyla yapılır; güncel profil adıyla tahmin yapılmaz. Normalize edilmiş mükerrer kimlik, aynı rumuzun başka hesaba bağlı katılımı, aynı etkinlikte mükerrer eski kayıt veya mevcut hedef hesabın katılımı varsa çakışan kayıtlar atlanır; veriler birleştirilmez. Eşzamanlı unique çatışması kimlik doğrulamasını bozmaz.

Sadece user_id değişir. Katıldı/katılmadı/bekleyen yanıt, tarihsel ad, kanıt, yoklama doğrulayıcısı/tarihi, kaynak anahtarı korunur. Mevcut event audit yalnız user_id değişimini kaydeder. RSVP yoklamaya dönüştürülmez. Katılımı true olan ve mevcut erişim koşullarını sağlayan tamamlanmış etkinlikler profil aktivitelerinde görünür.

## Canlı sonuç

- Supabase projesi: kttebbvinfmauthmayqp; migration 20261008082950_verified_legacy_event_links.
- Mevcut doğrulanmış kimlikler için geri düzeltme uygulandı: HanlyX'in 7 tarihsel katılımı hesabına bağlandı.
- Toplam katılım sayısı 165 olarak kaldı. Eşleşmemiş kayıt 46 → 39.
- user_id dışındaki tüm katılım alanlarının önce/sonra aggregate hash'i aynı: 9c600cd652b736e9aaa660192adb8128. Migration içinde de aynı alanlar karşılaştırıldı; beklenmeyen değişiklikte transaction iptal edilir.
- Yeni iki private fonksiyon security invoker, anon/authenticated EXECUTE false. Trigger canlıdır.
- Önce/sonra security advisor bulgu sayıları aynı; yeni bulgu yok. Mevcut genel uyarılar bu düzeltmede değiştirilmedi: https://supabase.com/docs/guides/database/database-linter
- Web uygulaması/UI değişmedi; yeni Vercel deploy gerekmedi ve yapılmadı.

## Kontroller

Etkinlik domain/API/DB/sunum, auth/onboarding/eski üye/guest regresyonları, typecheck ve lint geçti. DB testi doğrudan ayrıcalıklı UPDATE yanında gerçek mevcut link_legacy_member RPC'sini çalıştırarak trigger entegrasyonunu ve yetkisiz çağrı reddini doğrular. Geç katılım bağlama, mevcut doğrulamalı kayıtların backfill'i, null/false değerlerin korunması, tekrar çağrı, mükerrer rumuz/kayıt, başka hesabın kaydı ve mevcut hedef katılımıyla çakışmalar test edildi.

## Kişisel veri etkisi

FEATURE_REVIEW uygulandı: yeni veri kategorisi, sağlayıcı, çerez, saklama veya izin eklenmedi. Mevcut tarihsel kayıt, doğrulanmış kimlikle mevcut arşiv/profil amacı kapsamında bağlanır. Bağlama sonrası mevcut profil etkinlik görünürlüğü çalışır; mevcut erişim ve export/silme kuralları korunur. Henüz doğrulanmamış 39 kayıt otomatik tahminle bağlanmaz. Tekil etkinlik yönetimi eşleştirmesi ayrı mevcut işlem olarak kalır; eski kimliğin genel doğrulamasının yerine geçmez.
