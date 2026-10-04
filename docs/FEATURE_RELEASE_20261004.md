# Q-GANG — 04.10.2026 lokal değişiklik paketi

Çalışma dalı: `wave/2-access-management`. Main, uzaktaki dallar ve canlı veritabanı bu paket hazırlanırken değiştirilmedi. Push/deploy yapılmadı.

## Yapılanlar

- [x] Rozetlerin dört normatif türü; rütbe, görev ve erişimden bağımsız katalog/profil görünümü.
- [x] İlk Halka: Türkiye saatiyle 2026 üyeliğe kabul penceresi; hesap oluşturma tarihi kullanılmaz.
- [x] Kıdem: toplam 730 aktif gün; pasif dönemler hesaba katılmaz.
- [x] Müellif: aktif üye ve yayımlanmış eser; yayın sonradan kaldırıldığında kazanım korunur.
- [x] Liyakat yalnız Lider; takdir nişanları Lider/Vekilharç; Lider atamasını Vekilharç geri alamaz.
- [x] Gerekçeli verme/geri alma, Liderin dayanaklı kayıt düzeltmesi, yeni atama satırıyla yeniden verme.
- [x] Silinmeyen işlem tarihçesi; otomatik kazanım koşulu ve kaynak kaydı; ayrıntılı gerekçeler yönetimle sınırlı.
- [x] Lider katalog tanımı/koşul düzenleme ve emeklilik; emeklilik eski kazanımları kaldırmaz.
- [x] Kaptan teklifi yönetimin yazılı iletişim kanalında; atamada isteğe bağlı teklif eden kaydı. Teklif/onay kuyruğu eklenmedi.
- [x] Mevcut hüküm numaraları korunur; yeni kayıtların ve alt hükümlerin numaraları DB kilidiyle ayrılır. Yeni form numarası kullanıcıdan kabul edilmez.
- [x] Kural/ilke/yönerge renkleri ve ortak tür/önem etiketleri; disiplin bağlantısı karar sekmesi yanında; düzenle düğmesi ayrıştırıldı.
- [x] Tarihsel kararlardaki eksik dayanak açıklaması görünümden kaldırıldı; kaynak kaydı korunur, dayanak uydurulmaz.
- [x] Lider/Vekilharç için uygulama kapsamı isteğe bağlı; Kaptan için zorunlu.
- [x] Kodeks PDF: koyu kapak, açık metin gövdesi, gömülü Türkçe fontlar, tıklanabilir içindekiler/sayfa numaraları, bookmark ve dayanak bağlantıları, isteğe bağlı ayrı icra eki.
- [x] Derleme kimliği, DB anlık görüntüsü, kaynak/PDF SHA-256 hashleri, değiştirilemeyen READY kayıtları ve özel Storage nesneleri.
- [x] Mevcut güncel PDF yeniden kullanılır; değişiklik/ileri tarihli yürürlük güncellik karşılaştırmasına yansır. Yeni üretimde yetki, yazılı onay, hız ve boyut sınırı vardır.
- [x] Profil yorumları: aktif üye yazımı, yeni yorumları aç/kapat, eski yorumların görünürlüğü, yazar/profil sahibi/yönetim silme, 30 saniye hız sınırı ve sayfalama.
- [x] Profil banner yüksek öncelikli preload; yorumlar Suspense ile ayrılır; gereksiz toplu menü prefetch kaldırıldı.
- [x] Laptop poster/başlık düzeni ve sidebar kimliği; BÜTÇE başlığı ve daha kompakt hareket satırları.

## Canlıya geçiş sırası — henüz uygulanmadı

Onay sonrası önce sırasıyla migration:

1. `20261004095558_badge_directive_compliance.sql`
2. `20261004101000_profile_comments_and_codex_numbering.sql`
3. `20261004101500_codex_document_engine.sql`

Ardından bu kod paketinin deploy'u. Yeni kod eski şemayla yayınlanmamalıdır. SQL tek seferlik migration olarak hazırlanmıştır; elle tekrar çalıştırılmaz.

Migration mevcut üyelerin geçmişte kesintisiz aktif olduğunu varsaymaz. Önceden güvenilir dönem kaydı bulunmadığından ilk izleme dönemi migration anında başlar. Önceki hak kazanımlarını Lider delil göstererek tanıyabilir. Mevcut rozetler otomatik olarak kaldırılmaz. Eski atamaların tarihsel veren rütbesi bilinmiyorsa tahmin edilmez; bunları geri alma Liderde kalır. Mevcut atama/geri alma bilgilerinin tarihçesi aktarılarak korunur.

Katalogda mevcut üç otomatik koşul modeli düzenlenebilir. Yeni otomatik/tarihsel rozet modellerinin oluşturulması uygulama incelemesi gerektirir; yeni takdir/yüksek onur rozetleri katalog ekranından oluşturulur. Kazanılmış bir rozetin normatif türü yerinde dönüştürülmez; yeni tanım/emeklilik yöntemi kullanılmalıdır.

Kaynak hash algoritması, RPC'nin döndürdüğü snapshot dizisinin Node `JSON.stringify` UTF-8 çıktısının SHA-256'sıdır. Artifact hash'i üretilen PDF byte dizisinin SHA-256'sıdır. Hashler dijital imza değildir. PDF onay ifadesi güvenlik kontrolünün yerine geçmez; yetki/RLS, hız ve boyut limitleri backend tarafından uygulanır.

PDF üretimi Kodeks içinde çalışır. Aster için aynı belge servisi kullanılabilir; Aster'ın konuşma akışına bağlama ayrı aşamadır. Rozet Yönergesi bu commit ile Kodeks'te kendiliğinden yayımlanmaz.

## Kontroller

- Temiz `npm ci --no-audit --no-fund`.
- `npm run test:badges`: gerçek SQL/RLS; yetkiler, tekrar atama, tarihçe, gizli gerekçeler, Türkiye saati sınırları, kesintili aktif dönem toplamı, yayın kaldırma sonrası koruma, emeklilik ve koşul değişimi.
- `npm run test:documents`: gerçek SQL/RLS; numara/alt hüküm, 99 sonrası numara, immutable snapshot/READY kaydı, NULL artifact reddi, özel dosya erişimi, yorum sahipliği/hız sınırı; API doğrulama/önbellek/başarısızlık; gerçek PDF üretimi.
- `node scripts/test-codex-db.cjs`, `node scripts/test-codex-routes.cjs`, `node scripts/test-wave-release.cjs`, `npm run test:rich-text`.
- `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- Örnek PDF Poppler ile render edilip kapak/metin/içindekiler/ek sayfaları görsel incelendi; Türkçe karakterler ve hedef/bookmark kayıtları doğrulandı.

Tarayıcı oturumundaki kullanıcı akışları bu ortamda Chromium bulunmadığı için doğrulanamadı. Şema canlıya uygulanmadığından yeni özellikler üzerinde gerçek Supabase kullanıcı oturumu testi de yapılmadı. Migration ve deploy sonrasında Lider/Vekilharç/Kaptan/Üye ile atama yetkileri, profil yorumları, laptop/mobil görünüm ve PDF indirme uçtan uca kontrol edilmelidir. SQL testleri PGlite üzerinde çalışır; pg_cron yalnız desteklenen Supabase ortamında günlük görevi kurar.
