# Üyelik değerlendirme modülünün kaldırılması — 21.10.2026

Liderin tam kaldırma talebiyle modül ekranları, Topluluk bağlantısı, API, Erişim Merkezi izinleri, dışa aktarım ve saklama entegrasyonları kaldırıldı. Mevcut üye yönetimi, rütbe, ERA, etkinlik ve disiplin işlevleri korunur. Kodeks hükümleri değiştirilmedi.

Canlı ön kontrol: 2026/I değerlendirme aşamasında, 2026/II taslak; 25 değerlendirme, sıfır görüşme/karar. Kaldırma migrationı sekiz private tabloyu ve kayıtlarını, modüle özgü fonksiyon ve izinleri kaldırır. Kişisel değerlendirmelerin yeni kopyası/yedeği oluşturulmaz. Önceki permission setter ve saklama snapshot fonksiyonları/grantları yerlerine geri taşınır. Genel saklama ayarlarını kaydetme fonksiyonu modül öncesi davranışa döner.

Gizlilik: modül açıklamaları tam eşleşmeyle taslaklardan çıkarılır. Yalnız modül açıklaması içeren yayınların aktif işaretçisi geri çekilir; yayımlanmış sürümler değişmeden tarihçede korunur. Karışık, beklenmeyen bir metin bulunursa migration durur. Genel işlem kaydı kişisel kanaat içermez.

Test: dolu PGlite PostgreSQL veritabanında kaldırma; tablo/fonksiyon/yetki/ayar temizliği; profillerin/rütbelerin değişmemesi; gizlilik sürümlerinin değişmemesi; RPC yokluğu; anonim yetki reddi; eski saklama snapshot ve permission setter işlevlerinin geri dönmesi. Mevcut gizlilik DB/origin regresyonları ve lint geçti. Derleme/typecheck ve canlı sonuçlar yayına alma kaydında tamamlanır.

Eski migration dosyası uygulanmış geçmişi temsil ettiği için korunur; yeni migration kaldırmayı kaydeder. Geliştirme/yayım raporları geçmiş kayıt olarak tutulur; çalışır modül kodu içermez. Test fixtureı yalnız kaldırma regresyonu için kullanılır.
