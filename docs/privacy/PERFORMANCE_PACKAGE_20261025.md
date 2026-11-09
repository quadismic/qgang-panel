# Hızlandırma paketi — veri etki incelemesi, 25.10.2026

- Kullanıcı profili, aktif üyelik ve yetkiler yalnız aynı sunucu isteği içinde birleştirilir. Kullanıcı kimliği cache anahtarındadır; istekler arasında veya kullanıcılar arasında kişisel veri önbelleği yoktur. Askıya alma ve yetki kontrolleri korunur.
- İstekler arası 300 saniyelik cache yalnız anonim erişime zaten açık tasarım ayarını okur. Cookie/JWT taşıyan istemci kullanılmaz. Yönetimde kaydetme/geri alma/sıfırlama başarılı olduğunda cache etiketi geçersizleşir. Bakım modu ve erişim matrisi bu cache'e alınmaz.
- Mevcut kamusal, onaylı konsey çizimleri, amblem ve rütbe dekorasyonlarının küçük WebP türevleri uygulamanın mevcut barındırma sağlayıcısında sunulur. CMS asılları silinmez/değiştirilmez. İçerik özeti taşıyan dosya adlarıyla sürümleme yapılır; bu türevlerin tarayıcı cache ömrü bir yıldır.
- Mevcut public avatar/yayın/tasarım bucket'larının thumbnail dönüşümleri mevcut Vercel görsel önbelleğini kullanır. Private belge bucket'ları ve keyfi dış URL'ler bu akışa alınmaz. Kaynak görünürlüğü genişletilmez. Kaynak silme/değiştirme süreçlerinde türev dosya ve CDN önbelleği de değerlendirilmelidir; kaynak silmenin bütün önbellekleri anında temizlediği varsayılmaz.
- Yeni sağlayıcı, kullanıcı kaydı, çerez, izleme/analiz sistemi veya üyelik/rütbe işlemi eklenmez. Mevcut sağlayıcıların sözleşme ve hukuki uygunluğu bu teknik çalışma ile onaylanmaz. Ülke/bölge taşıması yapılmaz.
- Etkinlik listesi 24 kayıtla sayfalanır; bütün kayıtlar sayfa bağlantılarıyla erişilebilir. Katılım yanıtı ile doğrulanmış katılım ayrımı ve RLS korunur. PDF tüm kayıt ve doğru toplam davranışı değiştirilmez.

## Mevcut aydınlatma / dış içerik metni için inceleme taslağı

“Kamusal görsellerin cihazınıza uygun boyutta ve daha hızlı gösterilmesi için mevcut barındırma altyapımız üzerinde sıkıştırılmış veya küçük sürümler ve teknik önbellekler kullanılabilir. Bu işlem, özel kayıtları kamusal hale getirmez. İçerik güncelleme ve silme taleplerinde ilgili türevler ve önbellekler de değerlendirilir.”

Yayımlanmış gizlilik metinleri bu paket tarafından değiştirilmez. Mevcut metinle karşılaştırma ve varsa gerekli taslak uyarlaması yayın değerlendirmesinde yapılır; uygulamaya yeni gizlilik yayın engeli eklenmez.
