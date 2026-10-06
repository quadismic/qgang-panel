# Disiplin başvuru merkezi etki incelemesi

1. Yeni veri kategorisi yok: mevcut şikâyet gerekçesi/hedefi ve itiraz gerekçesi/kararı kullanılıyor.
2. Başvuran kendi şikâyet ve itiraz durumunu ve kendi itirazına verilen review_note yanıtını görebilir. Başka başvuranların kayıtları kişisel ekranlarda sorgulanmaz. Mevcut yetkili inceleme ve RLS korunur; guest ekleme erişimi daraltılır. Üye araması mevcut kimlik alanlarından en çok 8 sonuç gösterir; askıdaki profiller mevcut RLS'ye tabidir.
3. Yeni sağlayıcı/aktarım yok.
4. Yeni çerez/takip yok.
5. Saklama ve silme süreleri değişmedi.
6. Kişisel veri başvuru yolları değişmedi; disiplin şikâyet/itiraz yolları bulunabilir hâle geldi.

Varsayılan aydınlatma taslağı ve gizlilik kategori açıklaması kendi başvuru/yanıt erişimini içerecek şekilde güncellendi. Canlı belge yayımı yapılmadı. Çerez/saklama metinleri teknik kapsam açısından değişmedi.

Kontroller: kişisel sorgular reporter_id/user_id/target_user_id ile sınırlı. API guest'i reddeder; başka kişiye ait karar, lider kararı, kesinleşmemiş/kaldırılmış karar reddedilir. PostgreSQL restrictive INSERT politikaları eski permissive izinler varken guest'i engeller. Üye izinleri korunur. İtiraz benzersizliği mevcut veritabanı constraint'iyle korunur. Başvuru listeleri son 100 kayıtla sınırlıdır. Tarayıcı görsel testi yapılmadı.

Eski disiplin arşivinin tüm authenticated hesaplara açık önceki SELECT politikası, ek restrictive politika ile disiplin yetkili yönetimine daraltıldı.
