# Kullanıcı adı ve misafir erişimi etki incelemesi

1. Yeni veri kategorisi yok; gerçek ad/soyad form gereksinimi kaldırıldı. display_name alanı seçilmiş kullanıcı adı olarak korunuyor.
2. Misafir yayın sorgusu üyeye özel profiles ilişkisinden ayrıldı. Mevcut yayımlanmış içerik erişimi kullanılıyor, profil erişimi genişletilmiyor. Disiplin menüleri, sayfa ve doğrudan veritabanı kayıt erişimi oturumsuz veya guest rolündeki hesaplar için kapalı.
3. Yeni sağlayıcı/aktarım yok. Google adını yeni profil ve bağlı hesap etiketi olarak kopyalama kaldırıldı; Discord etiketi preferred_username/user_name ile sınırlı. Supabase Auth sağlayıcı metadata'sı hâlâ Google adını içerebilir; bunun toplanmadığı iddia edilmiyor.
4. Yeni çerez/takip yok.
5. Saklama süreleri değişmedi. Eski profil/bağlı hesap değerleri ve geçmiş kayıtlar topluca silinmedi. Profil eşitlemesi Google etiketini sonraki oturum/profil ziyaretinde boşaltır.
6. Mevcut profil düzenleme ve kişisel veri başvuru seçenekleri korunuyor.

Aydınlatmanın kod içindeki varsayılan taslağı ve gizlilik sayfasının kategori açıklaması kullanıcı adı/rumuz olarak güncellendi; gerçek ad zorunluluğu olmadığı, sağlayıcı metadata'sında ve önceki kayıtlarda ad bulunabileceği açıklanıyor. Canlı yönetim tablosundaki üç belge boş taslak (revizyon 0); yayımlanmış sürüm yok. Bu paket belge yayımlamaz. Çerez/saklama metninde yeni teknik kapsam oluşmadı.

## Ad bilgisi bulunabilecek diğer yerler
- Supabase Auth users/identities sağlayıcı metadata'sı: Google full_name/name. Uygulama artık yeni profil/Google etiketine kopyalamıyor; sağlayıcı metadata'sını değiştirmiyor.
- Önceden oluşmuş profiles.display_name/handle ve connected_accounts.provider_handle: eski adlar bulunabilir. Kullanıcı adı mevcut düzenleme ekranından değiştirilebilir.
- Eski Discord eşitleme/import kayıtları provider_handle içinde full_name/name taşımış olabilir; yeni profil eşitlemesi yalnız sağlayıcı kullanıcı adını alır.
- Eski üye/disiplin arşivindeki target_name/issued_by_name ve bütçedeki supporter_name gibi serbest metinler: kullanıcı/topluluk adlarıdır, gerçek ad yazılmış olabilir. Toplu silme yapılmadı.
- Veri sorumlusu Ömer Faruk Karabul adı aydınlatmada korunur; bu kullanıcıdan gerçek ad toplama alanı değildir.

## Doğrulama
Canlı salt okunur anon rolüyle liste ve detay sütunları erişimi başarılı (3 yayın). Yerel PostgreSQL: yeni kullanıcı gerçek isim metadata'sından profil adı türetmez, rumuz uzunluk kuralına uyar; restrictive disiplin politikaları guest'e kayıt göstermez, önceki üye erişimi korunur. Türkçe rumuz dönüşümleri ve mevcut Kodeks SSR testi başarılı. TypeScript/ESLint başarılı. Gerçek tarayıcı görsel doğrulaması tamamlanmadı.
