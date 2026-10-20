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


## Üyelik Değerlendirmeleri — 2026-10-19
1. Yeni kayıtlar: dönem kapsamı, manuel kişi adı, değerlendirici kanaati/gerekçesi, görüşme ve açıklama kayıtları, özel karar gerekçesi ve ayrı paylaşım metni. Gereksiz özel nitelikli bilgi girilmemelidir.
2. Amaç üyelik ilişkisinin dönemsel incelenmesidir. Değerlendirici kendi kayıtlarını; görevli kendi görüşmesini görür. Koordinatör yalnız görev metadatasına erişir. Gizli okuma ayrı yetkidir; varsayılan Lider erişir. Karar paylaşımı bireysel kanaatleri kapsamaz.
3. Yeni sağlayıcı/alıcı yok; mevcut veritabanı kullanılır. Mevcut sağlayıcı/aktarım koşullarının hukuki uygunluğu varsayılmamıştır.
4. Yeni çerez, harici medya veya takip eklenmedi. Gizli form verisi localStorage'a yazılmaz; API cevapları no-store.
5. Kapanıştan itibaren varsayılan 24 ay, panelden 1–120 ay değiştirilebilir. Süre dolumu aylık saklama incelemesine dahil edilir; otomatik imha yoktur. Lider gerekçe/onayla kimlik ve öznel metinleri kaldırır; bir yıla kadar gerekçeli bekletme mümkündür. Asgari dönem/sonuç/işlem metadatası korunur.
6. Kişisel veri dışa aktarımına kişinin kapsam kimliği ve kendi yazdığı kanaatler eklenir; başkasının kanaatleri/gizli görüşme aktarılmaz. Mevcut başvuru ve düzeltme kanalı korunur; manuel hesap eşleştirmesi Lider onayıyla yapılır.

Migration aydınlatma ve saklama metinlerine yalnız TASLAK ekler; mevcut yayınları değiştirmez. Liderin metinleri ve hukuki sebep/saklama ölçütlerini inceleyerek mevcut altı kontrolle yayımlaması gerekir. Başlatma işlemi yayımlanmış metinlerde modül açıklaması yoksa sunucuda engellenir. Bu teknik kontrol hukuki uygunluk onayı değildir.

Erişim testleri: doğrudan özel tablo erişimi, başka yazarın kanaati, görevli olmayanın görüşme notu, erken karar paylaşımı, yetki geri alma ve rütbe düşürme reddi; süre/bekletme ve dışa aktarım izolasyonu PostgreSQL testinde kontrol edilir.
