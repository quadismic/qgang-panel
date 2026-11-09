# Misafir Kodeks okuma erişimi

1. Yeni veri kategorisi toplanmıyor.
2. Yayımlanmış KURAL, İLKE ve YÖNERGE metinleri ile numara, bölüm, dayanak ve güncelleme tarihi misafirlere açılıyor. Mevcut yayımlanmış KARAR erişimi korunuyor. Taslak, yayımlanmamış ve gelecekte yayımlanacak kayıtlar kapalı. Yürürlük tarihi ileride olan fakat yayımlanmış metinler mevcut okuyucudaki ileri tarih etiketiyle okunabilir. Arşiv kayıtları da okunabilir.
3. Yeni sağlayıcı/alıcı veya aktarım yok.
4. Yeni çerez veya takip aracı yok.
5. Saklama/silme süreleri değişmiyor.
6. Başvuru/düzeltme/silme seçenekleri değişmiyor.

Misafir sorgusundan yazar kimliği, iç değişiklik gerekçesi, uygulama kapsamı, profil listesi ve değişiklik geçmişi çıkarıldı. Bu alanlara yeni erişim verilmedi. Düzenleme yetkileri değişmedi. Kamusal metinlerde zaten yer alan kişisel bilgi yayımlama öncesi içerik incelemesi kapsamındadır.

Aydınlatma taslağı için erişim açıklaması: “Yayımlanan Kodeks hükümleri ve yönergeler, numaraları, dayanakları ve yayın/güncelleme tarihleri giriş yapmadan okunabilir. Taslaklar ve dahili düzenleme kayıtları kamusal erişime açılmaz.” Mevcut yayımlanan gizlilik metinleri değiştirilmedi; çerez ve saklama metninde teknik değişiklik gerekmiyor.

Yerel PostgreSQL erişim testleri: tüm dört yayımlanmış tür ve arşiv görünür; taslak, gelecek yayın ve yayın tarihi olmayan kayıtlar görünmez; dahili sütunlar ve yazma işlemleri reddedilir. Canlı migration uygulanmadı.

## Normatif Düzen okuyucusu (8 Kasım 2026)

Yeni Kodeks ekranı yalnızca yeni dönemin yayımlanmış Yönerge ve İcra Kararlarını listeler. Önceki belgeler bu ekranda listelenmez; kayıt, saklama ve mevcut RLS politikaları değişmez. Okuyucu iç değişiklik gerekçesini, yazar kimliğini veya sürüm geçmişini sorgulamaz. Yönetim, mevcut yetkili rollere ayrılır. Çerez ve veri aktarımında değişiklik yoktur; yayımlanmış gizlilik metinleri değiştirilmemiştir.

## Disiplin dosyası ve eski Kodeks temizliği

Eski Kodeks kayıtları, bağlı sürümler, taşınmış karar duyuruları ve eski PDF derlemeleri kaldırılır. Eski disiplin kararları, gerekçeleri ve yaptırımları kaldırılır. Yeni disiplin kararı, İcra Kararının özel erişimli bir alt kategorisidir.

Olay kaydı, varsa delil, üyenin açıklaması, gerekçe ve yeniden değerlendirme talebi disiplin işleminin yürütülmesi için kullanılır. Olay, delil ve ihbarcı bilgisi yetkili yönetimle sınırlıdır. İlgili üye kendisine iletilen olay özetini, kendi açıklamasını ve kararını görür; bildirimi yapan kişi kendi başvurusunun aşamasını izler. Özel disiplin İcra Kararı herkese açık Kodeks'e ve Duyurular'a aktarılmaz. Yetki ayrımı veritabanında ve arayüzde uygulanır. Yeni aktarım, sağlayıcı veya çerez yoktur. Genel disiplin saklama ve veri hakları süreçleri değişmez; yayımlanmış gizlilik metinleri değiştirilmemiştir.
