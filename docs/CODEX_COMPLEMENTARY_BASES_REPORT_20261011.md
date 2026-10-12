# Yönergede asli ve tamamlayıcı dayanaklar

Mevcut basis_rule_id/basis_revision asli dayanak olarak korunur. Yeni complementary_bases alanı varsayılan boş diziyle eklenir; geçmiş kayıtların numarası/başlığı değişmez. Yönergelerde yürürlükteki kurallardan çoklu tamamlayıcı dayanak seçilir. Seçimler sürümüyle kaydedilir, detay/PDF/ilişkiler/geçmişte gösterilir. Yayımlanmış yönergenin asli dayanağı sunucuda ve DB trigger ile sabittir. Yayımlanmamış taslakta asli dayanak değişirse numara yeni dayanağa göre yeniden üretilir; bu senaryo DB testinde doğrulandı.

DB güvenliği: duplicate/asli ile çakışma/kendine atıf/yanlış tür/geçersiz veya eski sürüm reddedilir. Referans verilen tamamlayıcı hüküm silinemez. Güncelliğini kaybeden tamamlayıcı dayanak yönergeyi incelemeye taşır; ilgili icra/disiplin işlemlerinde DB düzeyinde reddedilir. Önceki yetki/RLS kontrolleri korundu. Yeni kişisel veri, alıcı, takip, amaç veya saklama değişikliği yok.

Doğrulama: PGlite mevcut Kodeks ve tarihsel kayıt testleriyle birlikte yeni DB migration, asli dayanak sabitliği, bölüm türetme, duplicate/çakışma, silme koruması, geçmiş snapshot ve eski sürüm reddini geçti. Sunucu bölüm testi, disiplin rota testi ve PDF testi başarılı. Typecheck/lint/build başarılı. Tarayıcıda görsel doğrulama yapılmadı.

Deploy yapılmadı. Migration canlı veritabanına uygulanmadı; frontend deployment öncesi uygulanması gerekir. Canlıya yeni tür ve bu migration ile birlikte çıkılmalıdır.
