# Topluluk ve Kodeks yerleşimi — 6 Ekim 2026

Yerel geliştirme; canlıya uygulanmadı.

## Veri etkisi incelemesi

1. Yeni veri kategorisi: yok. Mevcut hesap kimliği, avatar, rütbe, üyelik ve askı durumu kullanılır. Doğum tarihi, e-posta ve özel gerekçeler listelenmez.
2. Erişim: mevcut `members.view` kapısı korunur. Önceki SECURITY DEFINER hesap defteri de tüm hesapları okuyabiliyordu ancak son 100 kayıtla sınırlıydı. Yeni RPC aynı kapıyı korur; sunucuda filtreleme ve 20 kayıtlık sayfalama sağlar. Yetki genişletilmez. İşlem yetkileri mevcut endpointlerde kalır.
3. Yeni sağlayıcı/aktarım: yok.
4. Yeni çerez/takip: yok. Avatar mevcut görsel kaynağıyla gösterilir; yeni avatar URL'si veya sağlayıcı eklenmez.
5. Saklama/imha: değişmez.
6. Başvuru/düzeltme/silme: mevcut araçlar korunur; seçilen hesabın mevcut yönetim ekranına ulaşımı iyileşir.

Mevcut yayımlanmış metinlere müdahale edilmedi. Bu değişiklik için yeni hukuki metin kapsamı gerektiren amaç veya alıcı değişikliği tespit edilmedi; sitenin önceden eksik yayımları tamamlanmış sayılmaz.

## Doğrulama ve yayım

`node scripts/test-community-directory.cjs`: yerel PostgreSQL/PGlite üzerinde 125 hesap, 100 kayıt sınırının aşılması, sayfalama, aktif/pasif/üyeliksiz/askıya alınmış kayıtlar, hedef hesaba erişim, numara araması, izin reddi, anonim reddi ve geçersiz filtreler.

Önce `community_directory_pagination` migration'ı, sonra uyumlu kod yayımlanmalı. Eski hesap defteri RPC'si değiştirilmez. Canlı migration, push ve deploy Liderin ayrı onayı beklenerek yapılır.
