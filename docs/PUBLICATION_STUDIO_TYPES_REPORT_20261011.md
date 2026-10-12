# Yayın Stüdyosu — 11.10.2026

- Sinema türü, filtre ve rozet eklendi; bakır-turuncu #E58B57, istenen büyük/küçük harf yazımı korunur.
- Stüdyo yalnız Taslak / Yayında sunar; sunucu eski veya bilinmeyen yayımlanmamış durumları Taslak olarak normalleştirir. Yayımlama yetkisi değişmedi.
- Ana sayfa, liste ve detay ortak tür tanımını kullanır. Sinema türündeki YouTube bağlantıları türü değiştirmez.
- Migration yeni türü veritabanına ekler, eski Fikir/Araştırma/Video Hazırlığı durumlarını Taslak'a dönüştürür; diğer kayıt alanlarını karşılaştırarak veri değişikliğini engeller. Eski durum constraint'i mevcut deployment ile uyumluluk için korunur.

Doğrulama: typecheck, lint ve production build başarılı. PGlite regresyon testi başlık yazımı, iki durum, video bağlantısı ile tür korunması, migration veri bütünlüğü ve geçersiz tür reddini doğruladı. Tarayıcıda görsel doğrulama yapılmadı.

Kişisel veri etki kontrolü: yeni kişisel veri, görünürlük/amaç/erişim değişikliği, sağlayıcı, takip, saklama veya kullanıcı hakları değişikliği yok. Mevcut RLS ve sunucu yetki kontrolleri korundu.

Deploy yapılmadı. Migration hazırdır; canlı veritabanına henüz uygulanmadı. Yeni türün canlı kayıt işlemi için deployment öncesinde uygulanmalıdır.

## Son düzenleme

Tür listesi Düşünce, Oyun, Teknoloji, Video, Araştırma, Sinema olarak güncellendi. Canlı veritabanında İnceleme kayıtları sorgulandı: 0 kayıt; içerik taşıma gerekmedi. İnceleme izin listesinden çıkarılır; migration sonradan oluşmuş İnceleme kayıtları varsa otomatik taşıma yerine durur. Sinema kapsamı stüdyoda açıklanır. Bu düzenleme de henüz deploy edilmedi; migration canlıya uygulanmadı.
