# Üyelik Değerlendirmeleri — geliştirme raporu

## Uygulanan akış
Topluluk → Üyelik Değerlendirmeleri bağlantısı ve `/uyelik-degerlendirmeleri` ekranı eklendi. Yıl/Romen sıra otomatik; kapsam onayı ve manuel kayıt ayrı adımlar. PLATFORM otomatik eklenmez. Başlangıçtan sonra kapsam kilitli; iptal kayıtları korur. Dönemler ERA'dan bağımsızdır.

Teğmen+ değerlendirici kadrosu başlangıçta hazırlanır, Lider dönem için düzenler. Değerlendirme, görüşme, özel nihai karar, kesinleştirme, yönetim erişimi ve arşiv tek dosya altında yürür. Bilgi yok yanıtı tamamlanmış sayılır; C/D somut gerekçe ister. Üyelik/rütbe/yaptırım değişikliği otomatik yapılmaz. Sonlandırma için yayımlanmış Kodeks KARAR bağlantısı ve açıklama imkânı/iletişim girişimi zorunludur.

## Teknik yapı ve güvenlik
`20261019215819_membership_reviews.sql`: private şemasında dönem, değerlendirici, kapsam kişisi, kanaat, görüşme, özel karar, minimal paylaşım projeksiyonu ve işlem izi. Özel tablolara istemci erişimi kapalıdır. Public invoker RPC → yetkili private definer fonksiyonları; her işlemde güncel rol/yetki/askı kontrolü, dönem kilidi ve uygun kayıtlarda optimistic revision kontrolü uygulanır. API aynı-origin ve no-store kullanır; sunucu hata ayrıntılarını dışarı vermez.

Erişim Merkezi: görüntüleme, hazırlık, değerlendirme, koordinasyon, görüşme yürütme ve gizli okuma ayrı izinlerdir. Varsayılan Vekilharç hazırlık/koordinasyon yapar; başkasının kanaatini/görüşme notunu okuyamaz. Liderlik/karar/paylaşım yalnız Liderindir. Rol düşürme ve yetki geri alma hemen etkili olur. Görüşme koordinasyonu gizli notları döndürmez. Yayınlanan karar projeksiyonu özel gerekçeyi ve bireysel değerlendirmeleri içermez.

Taslaklar 900ms beklemeyle sunucuya kaydedilir; kişi değişiminde bekleyen kayıt tamamlanır. Hata formu korur ve gezinmeyi durdurur. Yeni manuel kişi için mükerrer uyarısı; sonradan hesap eşleştirmesinde Lider onayı/gerekçesi ve aynı dönem çift kayıt engeli vardır.

## Görsel ve işlev doğrulama
- Gerçek Chromium, 390px ve 1440px; gerçek React ekranı + API interception üzerinden gerçek PGlite PostgreSQL komut/snapshot akışı. Hazırlık, değerlendirme, koordinatör, Lider ve yalnız paylaşılan karar izleyicisi kontrol edildi.
- Uzun başlığın global important hero kurallarıyla çakışması yalnız modül kapsamındaki CSS ile giderildi. Ekran görüntüleri incelendi; yatay taşma, kesilen hero, 44px altı görünen form kontrolü ve tarayıcı hatası yok.
- PostgreSQL: explicit kapsam, manuel mükerrer/eşleştirme, anonim erişim reddi, özel tablo erişimi, yazar izolasyonu, gizli görüşme, ayrı kesinleştirme/paylaşım, arşiv, rütbe/yetki geri alma, saklama bekletmesi ve anonimleştirme testleri geçti. Gizlilik ve Kodeks revizyon kontrolü ilk başlatmayı engelliyor.
- API: kimlik, origin, UUID/payload, no-store, conflict ve hata sızıntısı kontrolleri geçti.
- Mevcut gizlilik DB ve origin regresyonları geçti. React erişim, form durumu, asenkron kayıt sırası ve erişilebilir kontrol incelemesi tamamlandı.

## Yayına hazırlık
Canlı migration uygulanmadı; deploy yapılmadı. Yerel test, gerçek Supabase/PostgREST ve üretim oturumlarının yerine geçmez; yayına alma sırasında migration ve gerçek oturumlarla smoke kontrolü yapılmalı.

Migration gizlilik metinlerine yalnız taslak ekler; mevcut yayın değişmez. İlk değerlendirmeyi başlatmadan önce Liderin aydınlatma/saklama taslaklarını ve hukuki koşulları mevcut inceleme süreciyle yayımlaması gerekir. Kodeks 03.09.01/01 aktif revizyonu dönem başında yakalanır; değişirse yeni dönem gerekir. Ayrıntılar `docs/privacy/FEATURE_REVIEW.md` içinde.

## Son kontrol sonucu
`npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run test:membership-reviews`, `QG_BROWSER_PATH=/tmp/qgang-chromium npm run test:membership-reviews-ui`, `node scripts/test-privacy-db.cjs` ve `node scripts/test-privacy-origin.cjs` geçti. Build mevcut globals.css autoprefixer ve Supabase Edge Runtime uyarılarıyla tamamlandı; bu değişiklik ortak CSS veya middleware düzeltmesi içermiyor. Geçici QA rotası build öncesi kaldırıldı.
