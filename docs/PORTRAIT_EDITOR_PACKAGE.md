# Çerçeve / taç ve ortak yazı editörü paketi

Branch: `fix/portrait-editor-package`. Production deploy veya production migration yapılmadı. Ücretli servis ya da veritabanı branch'i oluşturulmadı.

## Değişiklikler

- Profil ve Topluluk kartları aynı `RankPortrait` bileşenini kullanır. Avatar, çerçeve ve taç tek SVG koordinat alanındadır. Eski `rankPortrait` / `memberPlatePortrait` mutlak konum kuralları bu bileşene uygulanmaz. Taç için bileşenin kendi yüksekliğinde yer ayrılır.
- Profil rütbesi normal belge akışındadır; düzenleme düğmesiyle örtüşmez. Mobilde profil tek sütuna iner. Topluluk kartlarında isim için esnek alan ve daha uygun mobil yazı boyutu kullanılır.
- Ortak editör: kalın, italik, altı/üstü çizili, başlıklar, paragraf, alıntı, listeler, dört hizalama, bağlantı ekleme/kaldırma, tablo ve satır/sütun işlemleri, biçim temizleme, geri/ileri alma, önizleme, kelime/karakter sayacı.
- Ctrl/Cmd+B, I, U, K, Z ve Shift+Z; Word/HTML yapıştırma. Türkçe yazım denetimi tarayıcı/cihaz desteğini kullanır; ücretli dil denetimi servisi yoktur.
- Koyu/bronz araç çubuğu, mobilde açılan ek seçenekler. Editör kodu ihtiyaç olduğunda ayrı yüklenir.
- Duyuru, hüküm, yayın/özet, profil hakkında, disiplin gerekçesi, itiraz, bildirim, bütçe açıklaması ve mevcut gönderi bileşenleri ortak editöre bağlandı. İsim, başlık, kullanıcı adı, URL ve SEO metadata alanları düz metin kalır.
- İçerik hem kayıtta hem gösterimde izin listesiyle temizlenir. Script, iframe, olay işleyicileri ve tehlikeli URL şemaları korunmaz. Düz metin kayıtları HTML olarak yorumlanmaz.
- Eski düz metin ve yeni biçimli metin aynı okuyucuda desteklenir. Karakter sınırları görünen metne uygulanır; ayrıca depolanan metin uzunluğu sınırlandırılır.

## Veritabanı

`20260929074842_rich_text_content_limits.sql` hazırlanmıştır; canlıya uygulanmamıştır. Canlı CHECK constraint'leri yalnızca okunarak doğrulandı.

Biyografi, profil yorumu, rapor gerekçesi, bütçe açıklaması, disiplin/itiraz ve yayın alanları biçimlendirme ek yükünü kabul eder. Mevcut veriler dönüştürülmez veya silinmez. Eski feed tabloları olmayan kurulumlar da desteklenir. Veri erişim politikaları ve rol yetkileri değiştirilmez. Yeni kısıtlar `NOT VALID` ile eklenir: yeni/güncellenen kayıtlar denetlenir, eski veriye toplu müdahale yapılmaz.

## Doğrulama

- `npm run test:rich-text`: eski metin, XSS, URL güvenliği, entity çözümleme, karakter sınırları, kayıt/yeniden açma; yerel PostgreSQL motorunda migration ve CHECK kontrolleri.
- `npm run test:editor-ui`: 320, 360, 390, 600, 768, 1024, 1366, 1920, 2560 px Chromium kontrolü; taşma, klavye kısayolu, link reddi, Word yapıştırma, yaslama, tablo, boş içerik engeli, form verisinin tekrar açılması, server rendering ve profil modalı.
- TypeScript, ESLint, production build ve `git diff --check` çalıştırıldı. UI testi geçici rotalar kullandığından, sonrasında `npm run build` route type dosyalarını yeniler.
- Mevcut PostCSS bağımlılığı aynı ana sürümde güvenlik düzeltmesini içeren sürüme sabitlendi (`overrides`). Production dependency audit: 0 açık.
- UI testi gerçek bileşenleri sentetik verilerle kullanır; test rotaları otomatik oluşturulur ve kaldırılır. Production hesabıyla veri yazma veya gerçek cihaz/Safari testi yapılmaz.
- UI testi için `npx playwright install chromium`; mevcut tarayıcı kullanılacaksa `QG_BROWSER_PATH=/path/to/chromium npm run test:editor-ui`.

## Yayına alma sınırı

Kullanıcı deploy onayından sonra yalnız bu yeni migration uygulanmalı ve uygulama aynı paketle yayımlanmalıdır; çalışma ağacındaki eski, takip edilmeyen migration dosyaları topluca uygulanmamalıdır. Ardından yetkili hesapla duyuru/yayın/profil kaydı ve mobil ekran kontrolü gerekir.

Biçimli içerik kaydedildikten sonra geri alınacak bir uygulama sürümü de `RichText` okuyucusunu korumalıdır; eski düz metin okuyucusunda biçimlendirme işaretleri görünür.

Mevcut tabandan gelen Supabase Edge Runtime ve eski CSS `end` hizalama build uyarıları bu paketin kapsamı dışında korunmuştur. Build'i engellemezler. Önceden mevcut takip edilmeyen dosyalar otomatik silinmemiştir.
