# Yeni özellik için kişisel veri etki kontrolü

Her yeni özellikte veya mevcut akış değişikliğinde şu sorular yanıtlanır:

1. Yeni veri veya yeni veri kategorisi işleniyor mu?
2. Mevcut verinin amacı, hukuki sebebi, görünürlüğü veya erişen kişiler değişiyor mu?
3. Yeni sağlayıcı/alıcı ya da yurt dışı aktarım oluşuyor mu?
4. Yeni çerez, dış görsel/video veya takip aracı geliyor mu?
5. Saklama başlangıcı, süresi, silme veya uyuşmazlık bekletmesi değişiyor mu?
6. Kullanıcının başvuru/düzeltme/silme seçenekleri etkileniyor mu?

Etkilenen metinler Gizlilik > Yönetim > Metinler ve Düzen ekranında taslak olarak güncellenir. Değişiklik gerekçesinde özellik ve etki açıklanır. LİDER altı inceleme alanını kontrol ederek yeni sürüm yayımlar. Taslaklar kamusal sayfayı değiştirmez; önceki yayımlar korunur. Taslak sürüm numarası eşzamanlı düzenlemede eski metinle üzerine yazmayı engeller.

Yeni özellik için bu sorulara olumlu yanıt çıktığında, uyumlu metin ve teknik erişim düzeni tamamlanmadan özellik canlıya alınmamalıdır. Kod her özelliğin hukuki etkisini otomatik anlayamaz; inceleme geliştirme sürecinin parçasıdır.

İletişim adresleri ve saklama ölçütleri panelden değişir. Panel, metin yayımlandıktan sonra ayar değişikliği olduğunda yeniden inceleme uyarısı verir. Ayar değiştirmek, sağlayıcı sözleşmesini değiştirmez veya veriyi kendiliğinden imha etmez.


## 21.10.2026 — Üyelik değerlendirmesi modülünün kaldırılması
Liderin tam kaldırma talebiyle tüm dönem/kapsam/değerlendirme/görüşme/karar tabloları ve modül RPCleri kaldırılır. Yeni sağlayıcı veya takip yoktur. Modüle özgü saklama ayarı, dışa aktarım ve inceleme bağlantıları kaldırılır. Mevcut kişisel veri başvuru/dışa aktarım ve saklama altyapısı korunur. Modül açıklamaları mevcut taslaklardan tam eşleşmeyle çıkarılır. Yalnız modül açıklamasından oluşan mevcut yayınların aktif işaretçisi kaldırılır; önceki yayımlanmış sürümler değiştirilmeden tarihçede korunur. Karışık içerikli bir yayın görülürse migration durur; ilgisiz metin silinmez. Kişisel değerlendirmelerin kopyası veya yeni bir arşivi oluşturulmaz. Kaldırma işlemi kişisel kanaat içermeyen genel gizlilik yönetim kaydıyla izlenir.

## 09.11.2026 — Klan sitesi gezinme sadeleştirmesi

1. Yeni veri kategorisi veya kişisel veri kaynağı eklenmiyor. Üye listesi ve profil kayıtları aynı servis/RPC'lerden okunuyor.
2. Ana sayfadan yayın akışı, Üyeler sayfasından doğum günü şeridi ve profil görünümünden rozet paneli kaldırılıyor. Bu görünürlük/işleme yüzeyini azaltır; kayıtlar, profil doğum günü görünürlük tercihi, saklama, üye profil sayfası ve yetki kapıları değişmez. Gizlilik sayfasındaki doğum bilgisi açıklaması geçerliliğini korur.
3. Yeni sağlayıcı veya aktarım yok.
4. Yeni çerez, takip veya üçüncü taraf medya eklenmiyor.
5. Saklama ve silme kuralları değişmiyor.
6. Veri sahibi başvuru, düzeltme, dışa aktarma ve silme akışları değişmiyor.

Teknik doğrulama: üyeler listesi `members.view` üzerinden, üye yönetimi `members.manage` üzerinden kalır; etkinlik görünürlüğü ve yönetimi kendi server-side izinleriyle, profil doğum bilgisi mevcut tercih/RPC ile korunur. 390/1440px lobi testi görsel gezinme ve RSVP'yi doğrular; bu test canlı oturumla kişisel profil erişimini doğrulamaz. Kişisel veri kayıtları veya gizlilik metni değiştirilmedi.
