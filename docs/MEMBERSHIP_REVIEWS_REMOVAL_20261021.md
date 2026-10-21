# Üyelik değerlendirme modülünün kaldırılması — 21.10.2026

Liderin tam kaldırma talebiyle modül ekranları, Topluluk bağlantısı, API, Erişim Merkezi izinleri, dışa aktarım ve saklama entegrasyonları kaldırıldı. Mevcut üye yönetimi, rütbe, ERA, etkinlik ve disiplin işlevleri korunur. Kodeks hükümleri değiştirilmedi.

Canlı ön kontrol: 2026/I değerlendirme aşamasında, 2026/II taslak; 25 değerlendirme, sıfır görüşme/karar. Kaldırma migrationı sekiz private tabloyu ve kayıtlarını, modüle özgü fonksiyon ve izinleri kaldırır. Kişisel değerlendirmelerin yeni kopyası/yedeği oluşturulmaz. Önceki permission setter ve saklama snapshot fonksiyonları/grantları yerlerine geri taşınır. Genel saklama ayarlarını kaydetme fonksiyonu modül öncesi davranışa döner.

Gizlilik: modül açıklamaları tam eşleşmeyle taslaklardan çıkarılır. Yalnız modül açıklaması içeren yayınların aktif işaretçisi geri çekilir; yayımlanmış sürümler değişmeden tarihçede korunur. Karışık, beklenmeyen bir metin bulunursa migration durur. Genel işlem kaydı kişisel kanaat içermez.

Test: dolu PGlite PostgreSQL veritabanında kaldırma; tablo/fonksiyon/yetki/ayar temizliği; profillerin/rütbelerin değişmemesi; gizlilik sürümlerinin değişmemesi; RPC yokluğu; anonim yetki reddi; eski saklama snapshot ve permission setter işlevlerinin geri dönmesi. Mevcut gizlilik DB/origin regresyonları ve lint geçti. Derleme/typecheck ve canlı sonuçlar yayına alma kaydında tamamlanır.

Eski migration dosyası uygulanmış geçmişi temsil ettiği için korunur; yeni migration kaldırmayı kaydeder. Geliştirme/yayım raporları geçmiş kayıt olarak tutulur; çalışır modül kodu içermez. Test fixtureı yalnız kaldırma regresyonu için kullanılır.

## Canlı kaldırma sonucu
21.10.2026: üretim READY, https://q-gang.com. Commit 140475810553c6664cb36d5558cbeaaf66668c71; Vercel dpl_2bM6DXscEuZUQGgMLjNNHXThgJLc. Üretim build süresi yaklaşık 79 saniye (öncesinde kuyruk beklemesi). Canlı migration 20261021113633 remove_membership_reviews; yerel kaynak dosyası 20261021112736_remove_membership_reviews.sql.

Typecheck, lint, build, kaldırma regresyonu ve mevcut gizlilik DB/origin testleri geçti. Uygulama kaynakları modül öncesi 19e4dc6 ile aynı; yalnız tarihçe raporundaki boş satır dışında test edilen yerel sürümle yayımlanan sürüm aynıdır.

Canlıda modül tablosu=0, fonksiyon=0, izin=0; reviews_months kaldırıldı. Diğer 162 yetki, 21 profil ve 71 Kodeks kaydı korundu. Gizlilik sürüm sayısı 3 olarak korundu; modül açıklamalarının aktif yayın işaretçileri kaldırıldı, taslakları boşaltıldı. Çerez taslağının hash değeri değişmedi. Eski saklama snapshotı çalışıyor, anonim permission setter erişimi kapalı.

HTTP kontrolleri: ana sayfa/Topluluk/Gizlilik 200; modül ekranı ve API 404. Son bir saatte runtime hata kümesi bulunmadı; kısa tarama uzun dönem gözlem garantisi değildir. Önceki yayında harici drain yoktu. Canlı yönetici tarayıcısında işlem yapılmadı; yetki ve silme sınırları SQL/PGlite ve kaynak karşılaştırmasıyla doğrulandı.

Dönem/kanaat kişisel verileri için ek yedek veya yeni bir arşiv oluşturulmadı. Eski gizlilik yayım sürümleri ve schema migration geçmişi çalışma modülünün parçası değil, değiştirilmeyen tarihçedir. Veritabanı temizliği sonrası eski modüllü uygulamaya rollback yapılmamalı; yeniden kurulum ayrı talep gerektirir.

