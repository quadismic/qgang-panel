# Topluluk ve Kodeks düzenlemesi

Hazırlanan paket henüz push/deploy edilmedi. Canlı veritabanı değişmedi.

- Topluluk şemasında rütbe satırları ortalanır; kartlar ekran genişliğine göre sarılır, mobilde iki ve dar ekranlarda tek sütun kullanılır.
- Topluluk Kimlikleri varsayılan olarak tüm kayıtlı hesapları sayfalar. Ad/rumuz/topluluk numarası, üyelik/rütbe/askı durumu filtreleri ve mevcut yönetim ekranına geçiş eklendi.
- Kodeks sekmeleri ortak kenar boşluğu ve üç eşit sütun kullanır. PDF ve disiplin araçları ayrı satırdadır.
- Kurallar/ilkeler dizin ve okuyucu düzenini korur. Yönergeler ayrı belge listesi; icra kararları son yayımlanandan geriye sıralı tam genişlikte listedir. Belge seçildiğinde bağımsız okuyucu ve listeye dönme düğmesi açılır. Dayanaklar, geçmiş ve düzenleme korunur.

Gerekli migration: `20261006175845_community_directory_pagination.sql`. Önce migration, sonra kod deploy'u; her ikisi ayrı onaya tabidir. Migration eski RPC'yi değiştirmez ve yeni veri oluşturmaz.

Kontroller: TypeScript, değişen dosyalarda ESLint, Git whitespace kontrolü, gerçek yerel PostgreSQL/PGlite hesap/erişim testi, API kimlik doğrulama/sayfalama testi ve React sunucu render'ında Kodeks liste/okuyucu testi.

Tarayıcı görsel doğrulaması tamamlanamadı: Chromium kurulumu ağdan geçerli arşiv alamadı. Bu nedenle piksel hizaları ve gerçek mobil etkileşimler yayım öncesi ayrıca kontrol edilmelidir. Remote build, PDF üretimi, push, merge, canlı migration veya deploy çalıştırılmadı.

## Yorum editörü ve dipnot ek paketi

- Ekli tasarım esas alınarak kompakt yorum araç çubuğu gruplandırıldı: temel biçimler, başlıklar, listeler/alıntı, bağlantı/görsel/tablo, önizleme ve diğer araçlar.
- Koyu/bronz editör kartı, boş alan ipucu, sayaç ve cihaz yazım denetimi bilgisi. Mevcut 500 karakter sınırı korunur; referanstaki 500 kelime ibaresi veri sözleşmesini değiştirmek için kullanılmaz.
- Gönder düğmesi sağda; yayın yorumlarında Yayınlara dön bağlantısı solda.
- Dipnot düğmesi ve Ctrl+Alt+F (Mac Cmd+Option+F) aynı düzenleyiciyi açar. Seçili metni değiştirmeden seçimin sonuna dipnot eklenir. Mevcut dipnotlar tıklanarak düzenlenebilir; otomatik numaralandırma ve kaynak bağlantıları korunur.
- Kontroller: `test-footnote-shortcut.cjs`, `test-footnote-editor.cjs`, `test-rich-text.cjs`, TypeScript ve değişen TSX dosyalarında ESLint. Gerçek tarayıcı görsel doğrulaması tamamlanmadı.
- Bu ek paket yeni migration gerektirmez; önceki topluluk dizini paketinin migration ihtiyacı sürer. Push/deploy ve canlı DB değişikliği yapılmadı.

## Bütçe Defteri

Referanstaki koyu/bronz kompakt kayıt listesi uygulandı. Masaüstünde tarih, kategori, başlık/kısa açıklama, tutar ve işlem menüsü; mobilde yeniden sıralanan kart düzeni. Yeni/eski ve yüksek/düşük tutar sıralaması, yedi başlangıç kaydı ve onar kayıt daha gösterme, satır altında tam açıklama. Silme mevcut endpoint ve onayla sınırlı; yeni düzenleme işlemi eklenmedi.

Anonim destekçi adı istemciye aktarılmadan kaldırılır. Mevcut veri okuma/işlem yetkileri ve gelir/gider hesapları korunur. Bu UI ekinde migration gerekmez. Önceki topluluk migration gereksinimi devam eder. TypeScript, ESLint, sıralama/anonimlik/yetkili işlem görünürlüğü kontrolleri geçti; tarayıcı piksel doğrulaması yapılmadı.

## Misafir Kodeks düzeltmesi

Canlı salt okunur incelemede anon için numara/bölüm/dayanak gibi sayfa sütunlarının izni eksik ve okuma politikası yalnızca KARAR türüne açık bulundu. Misafir sorgusu yalnızca kamusal sütunları istiyor; profil ve sürüm geçmişi sorguları giriş gerektiriyor. Yeni `20261006181931_public_codex_read.sql` migration yayımlanmış KURAL/İLKE/YÖNERGE okuma politikasını ve gerekli dar sütun izinlerini ekler. Önce iki paket migration'ı uygulanmalı, sonra kod yayımlanmalı. Canlıya uygulanmadı. PostgreSQL erişim testi, Kodeks SSR testi, TypeScript ve ESLint geçti.

## Yayınlar, disiplin ve kullanıcı adı

Misafir yayın listesinde profiles ilişkisi sorgulanmıyor; var olan public publication RLS kullanılıyor. Disiplin desktop/mobile/Kodeks bağlantıları ve doğrudan sayfa erişimi guest/oturumsuz hesaplara kapalı. Yeni migration `20261006182627_guest_access_username_identity.sql` yeni hesap profil adının OAuth gerçek isminden türetilmesini kaldırır ve iki disiplin tablosuna restrictive guest engeli ekler. Kullanıcı Adı formu düzenlenebilir otomatik Türkçe rumuz üretir. Google bağlı hesap etiketi ad bilgisi kopyalamaz. Giriş gizlilik bağlantısı merkezli bronz stil aldı. Varsayılan aydınlatma taslağı ve gizlilik açıklaması güncellendi. Canlıya uygulanmadı; bu migration da kod yayımından önce uygulanmalıdır.

## Disiplin başvuru merkezi

Profilde yorumların altındaki Üyeyi Bildir formu kaldırıldı; üye ve üzeri için profil başlığında erişilebilir ••• menüsü ve önceden seçilmiş hedefle `/disiplin?tab=report&target=...` bağlantısı eklendi. Disiplin sayfası normal kullanıcılara Üye şikâyeti / Başvurularım / Karara itiraz gösterir. Yetkili yönetim önceki inceleme ekranını kullanır ve başvuru merkezine geçebilir. Kişisel listeler kullanıcı kimliğiyle filtrelenir (son 100 kayıt). Başka kişinin kararına itiraz edilemez; lider kararları, kesinleşmemiş/kaldırılmış kararlar ve daha önce itiraz edilmiş kararlar seçimden çıkarılır. Sunucu da sahiplik/uygunluk kontrolü yapar, kayıt hatasında başarı mesajı vermez. Yeni `20261006183216_member_discipline_requests.sql` guest'in doğrudan şikâyet/itiraz eklemesini de engeller. TypeScript, ESLint, API karar/sonuç testleri ve PostgreSQL erişim testleri geçti. Tarayıcı görsel doğrulaması henüz yok. Canlıya uygulanmadı.

## Duyurular UI

Referans görsel temelinde tarih sütunlu kompakt duyuru listesi, iki satırlık metin özeti, tür/önem/sabit rozetleri, satır içinde açılan tam metin ve yedişer kayıt gösterme eklendi. Mobilde tarih solda, içerik ve detay düğmesi sağda; tam metin bütün genişlikte açılır. İlk beş kayıt gösterilir. Duyuru anchor bağlantısı hedef kaydı görünür kılar ve açar. İcra kararı dayanak/Kodeks bağlantısı ve tarihsel/sürüm/yürürlük bilgileri korunur. İzinli duyuru silme ••• menüsündedir; karar silme eklenmedi. Yönetim yayımlama formu açılır panelde taşındı. Arama ve kategori GET filtreleri korunur; arama rich metnin düz metnini kullanır. Referanstaki SİSTEM türü veri modelinde olmadığından eklenmedi. Veri sorgusu/izinler/migration değişmedi. TypeScript, ESLint ve SSR davranış kontrolü geçti; gerçek tarayıcı görsel doğrulaması tamamlanmadı. Push/deploy yapılmadı.


## Ortak UI primitives / kabul edilen audit

P0 ortak action ve erişilebilir modal katmanı, LoadMore dili, sade navbar ve işlevsel QGIcon geçişleri; P1 misafir ana sayfa yayın sorgusu, disiplin gerekçe okuması ve mobil hedefler tamamlandı. Envanter, kalan eski kullanımlar ve test kapsamı `UI_PRIMITIVES_AUDIT_20261006.md` içinde. TypeScript, lint, production build ve 1440/390 px browser regresyonu geçti. Deploy yapılmadı; yayın onayı bekleniyor.
