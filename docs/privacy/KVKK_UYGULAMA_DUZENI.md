# Q-GANG kişisel veri uygulama düzeni — yayım öncesi taslak

Veri sorumlusu: Ömer Faruk Karabul. Hazırlık tarihi: 5 Ekim 2026.
Bu belge kodun uygulanma durumunu ve tamamlanacak hukuki/operasyonel kararları ayırır. Tamamlanmış KVKK uygunluğu beyanı değildir.

## Erişim düzeni

- Doğum bilgisi sahibine tam; diğer oturum açmış kişilere yalnız görünürlük tercihi kadar döner. LİDER sıfatı bu projeksiyonu aşmaz.
- Doğum günü hatırlatmaları gizli tercihindeki ve askıya alınmış profilleri dışarıda bırakır. 29 Şubat için artık yıl olmayan yıllarda 28 Şubat gösterimi kullanılır.
- Tam doğum tarihi özel kayıtta tutulur; mevcut profil alanlarının güncellenmesi özel kaydı senkronize eder. Geçersiz tarih bütün güncellemeyi geri çevirir.
- Başvuru sahibi yalnız kendi taleplerini/tarihçesini okur. LİDER ve kişi bazında yetkilendirilmiş görevliler başvuruları değerlendirir. Yönetim rütbesi otomatik erişim sağlamaz; silme/hesap kapatma sonuçlandırması LİDER’e ayrılır.
- Talep ve yanıt işlemleri RPC ile yapılır. API rolleri tarihçeye doğrudan ekleme, değiştirme veya silme yapamaz.
- Aynı türden açık başvuru yinelenemez. Bir kullanıcı günde en fazla beş başvuru açabilir; eşzamanlı istekler kullanıcı satırı kilidiyle sınırlanır.
- Yeni POST uçları oturum ve aynı origin kontrolü yapar. Veri indirme yanıtı önbelleğe alınmaz.

## Veri envanteri ve saklama ölçütleri

| Kategori | İşleme amacı | Erişim | Saklama/imha ölçütü |
|---|---|---|---|
| Hesap/sağlayıcı kimliği | Oturum, hesap eşleştirme | Sahibi; gerekli sunucu işlemleri | Hesap ilişkisi ve kanıtlanmış güvenlik/hak ihtiyacı; kapanışta sağlayıcı hesap bağları ayrıca değerlendirilir |
| Profil/görseller | Kullanıcının kendini tanıtması | Tercihe göre profil ziyaretçisi; mevcut görsel kovaları herkese açık | Kapanış/silme kararında profil ve kullanılmayan görsel nesneleri birlikte ele alınır |
| Doğum bilgisi | Kullanıcı tercihiyle profil/hatırlatma | Sahibi; filtrelenmiş projeksiyon | Amaç ortadan kalkınca özel tarih kaydı ve eski üye kaynağı birlikte değerlendirilir |
| Üyelik/eski kayıtlar | Kabul, görev, kimlik eşleştirme | Gösterim alanları ile doğrulama dayanağı ayrı | Tarihsel aidiyet sınırsız kişisel veri saklamayı haklı kılmaz; kaydı kişiye bağlama gereği ayrıca incelenir |
| Yayın/yorum | İçerik ve iletişim | Yayımlanan içerik ziyaretçilerce; taslaklar yetkiye göre | Eser sahipliği, üçüncü kişi hakları ve kullanıcı talebi birlikte değerlendirilir |
| Rozet/tarihçe | Kazanım gösterimi, işlem denetimi | Aktif rozet açık; ayrıntılı gerekçe yetkili alan | Tarihçe gerekiyorsa kişisel açıklamalar azaltılır; yönergedeki koruma hükmü imha yükümlülüğünü bertaraf etmez |
| Disiplin/delil/itiraz | Topluluk düzeni ve hakların korunması | İlgili üye ve işlem için yetkili kişiler | Uyuşmazlık, hak koruma ve ölçülülük değerlendirmesi; delilin türü özel nitelikli veri olabilir |
| Bütçe | Mali takip | İlgili izinler; anonimlik tercihi | Uygulanabilir mali/kanuni saklama yükümlülüğü ayrıca belirlenir |
| Aster | Kullanıcının istediği yardım | Konuşma sahibi; modele gönderilen sınırlı bağlam | Sağlayıcı ve plan doğrulanır; sohbet ve model tarafındaki saklama ayrı ele alınır |
| Güvenlik/oturum | Kötüye kullanım önleme | Teknik olarak gerekli kişiler | Riskle orantılı somut süre; Vercel/Supabase günlük ve yedek süreleri ayrıca doğrulanır |
| KVKK başvurusu | İlgili kişi hakkının kullanılması | Sahibi ve veri sorumlusu | Yanıt ve hak koruma için gereken süre; gerekçesiz süresiz saklama yapılmaz |

Okunmuş bildirimler/Aster için 90 gün, kullanılmayan medya için 30 gün, sonuçlanmış başvurular ve imha işlem kayıtları için 3 yıl, inceleme aralığı için 30 gün varsayılan ayarlara kaydedildi. Mevcut veri üzerinde imha yapılmadı. Bildirim/Aster/başvuru yürütücüsü ve aylık sayım görevi hazırdır; medya/sağlayıcı günlükleri ve diğer kategoriler için kapsam ayrı ele alınmalıdır. İşleme sebebi ortadan kalktığında kategori bazlı değerlendirme gözetilir.

## Başvuru işleyişi

1. Kullanıcı erişim, düzeltme, hesap kapatma veya silme/anonimleştirme talebi açar.
2. Sunucu mevcut oturumla sahipliği belirler; kullanıcıdan hedef üye kimliği kabul etmez.
3. LİDER inceleniyor durumu ve gerekçeli ara yanıt kaydeder.
4. İşlem uygulanmadan önce veriler kategori bazında ayrılır: silinecek, anonimleştirilecek, hukuki dayanakla geçici saklanacak, üçüncü kişi hakkı içeren.
5. Hesap kapatma, üyelikten ayrılma ve veri imhası ayrı kararlardır. Bu sürümde karar durumu otomatik `purge_member` veya Auth kullanıcı silme işlemi başlatmaz.
6. Gerekçeli sonuç kullanıcıya görünür; eski yanıtlar veritabanı olay tablosunda korunur.
7. Başvuru kanalları: ofkarabul@gmail.com ve quadismic@gmail.com. Kullanıcı herhangi birini kullanabilir; ikisine birden göndermesi gerekmez. Yeni adresler QGANG_PRIVACY_CONTACT_EMAILS sunucu ayarıyla eklenebilir. E-posta başvurusunun usul ve kimlik doğrulaması ayrıca değerlendirilir. Site formu kanunen mümkün diğer başvuru yollarını kaldırmaz.

Temel JSON indirme hesabın kendi profilini, üyelik/aktif dönem kayıtlarını, bağlantı adlarını, yayınlarını, kendi yorumlarını, görünür rozet atamalarını, başvurularını ve Aster konuşma başlıklarını kapsar. Tam erişim talebinin yerine geçmez. Deliller, üçüncü kişi verileri, ayrıntılı yönetim gerekçeleri, sağlayıcı günlükleri ve Aster mesajları ayrıca değerlendirilir. Her koleksiyon sayfalanır; 10.000 kayıt sınırında kısmi dosya sunulmaz ve başvuru üzerinden işlem istenir.

## Dış içerik

Yazı içindeki YouTube iframe ve dış görsel, kullanıcı yükleme düğmesine basana kadar gerçek iframe/img olarak oluşturulmaz. Q-GANG ve proje Supabase depolama görselleri doğrudan yüklenir. Bu tıklama bir içerik yükleme tercihidir; tek başına yurt dışı aktarım için hukuki güvence sayılmaz. Profildeki dış avatarlar ve sayfanın diğer medya alanları bu yazı bileşeninin kapsamına girmez.

## Sağlayıcı incelemesi

- Supabase DPA: https://supabase.com/legal/customer-resources/data-processing-addendum
  Müşteri/veri işleyen ilişkisi ve AB 2021/914 SCC tanımı bulunuyor. İncelenen metinde Türkiye'ye özgü hüküm bulunmadı; bu, ayrı sözleşme sunulamayacağı anlamına gelmez.
- Vercel DPA: https://vercel.com/legal/dpa
  Birincil işleme tesisleri ABD olarak belirtiliyor; başka işleme bölgeleri ve alt işleyenler de mümkün. Projenin Tokyo fonksiyon bölgesi bütün işleme faaliyetlerini Tokyo ile sınırlamaz.
- Türkiye aktarım rejimi: https://www.kvkk.gov.tr/Icerik/2053/Yurtdisina-Aktarim
  Sağlayıcının AB SCC belgesi otomatik olarak Türk standart sözleşmesinin yerine geçirilmemelidir. Uygulanacak güvence, sözleşmenin tarafları, alt işleyenler ve gerekli bildirim ayrıca kesinleştirilmelidir.
- Google OAuth, YouTube ve Aster sağlayıcısı için fiilî hizmet/plan ve veri kapsamı ayrı envanter satırlarına bağlanmalıdır.

Sağlayıcılara henüz mesaj gönderilmedi veya sözleşme imzalanmadı. Veri sorumlusu iki başvuru adresini bildirdi: ofkarabul@gmail.com ve quadismic@gmail.com.

## Güvenli yayımlama sırası

1. `20261005035644_privacy_workflows.sql`: uygulandı; yeni fonksiyonlar/tablolara erişim ve görünürlük filtreleri geriye uyumlu.
2. Yeni profil sorguları ve gizlilik ekranları build/test ile doğrulanır; mevcut dal üzerinde yayımlanır.
3. Ancak uyumlu uygulama canlıda doğrulandıktan sonra `20261005035647_birthday_column_lockdown.sql` uygulanır.
4. Doğrudan doğum sütunu sorgusunun reddedildiği, sahibin RPC üzerinden okuyabildiği, gizli yılın diğer kullanıcıya dönmediği canlı API üzerinde tekrar test edilir.

İkinci migration henüz canlı veritabanında uygulanmamıştır. Bu nedenle eski canlı uygulamadaki doğrudan sütun erişimi açığı şu aşamada tamamen kapatılmış değildir.

## Doğrulama

- `node scripts/test-privacy-db.cjs`: gerçek PostgreSQL motorunda erişim, tarih ve başvuru sınırları.
- `node scripts/test-privacy-origin.cjs`: yerel/proxy hostlarında aynı kaynak kontrolü ve yabancı kaynakların reddi.
- `node scripts/test-external-content.cjs`: aktivasyon öncesi dış medya öğesi yokluğu.
- `node scripts/test-rich-text.cjs`: biçim, XSS, medya ve PDF sıralama regresyonları.
- `npm run build`: Next.js derleme ve TypeScript.
- Supabase security advisors: yeni fonksiyonların authenticated SECURITY DEFINER uyarıları, bilinçli kontrollü giriş noktaları olarak incelendi; anonim execute kapalı, sahiplik/yetki kontrolleri test edildi. Mevcut diğer genel advisor bulguları ayrıca ele alınmalıdır.
- Yerel HTTP ilk denemesi eksik Supabase ortam değişkeni nedeniyle 500 verdi; test sunucusunda yalnız anonim akış için geçersiz test anahtarı ve dış Supabase çağrıları için 403 test yanıtı kullanılır. Aynı origin kontrolü Next.js iç URL’si yerine Host/proxy protokolü ile doğrulandı. Bu, giriş yapılmış uçtan uca doğrulama sayılmaz.
- Yerel anonim HTTP kontrolleri: iki kamusal sayfa 200; üç yeni POST uçunda yabancı origin 403 ve oturumsuz aynı origin 401; özel sayfada akış içindeki NEXT_REDIRECT ile girişe yönlendirme ve formun gösterilmemesi doğrulandı.
- Gerçek Supabase, authenticated rol ve yalnız okunur/rollback kontrolü: sahibi için bir projeksiyon satırı; başkasının gizli tarih alanları veya yalnız gün/ay tercihiyle gizlediği yıl için açığa çıkan satır sayısı sıfır.
- Chromium bu ortamda kurulu değil; giriş yapılmış mobil/masaüstü tarayıcı akışı henüz görsel olarak doğrulanmadı.

## 5 Ekim 2026 — yönetim ve sürüm güncellemesi

- `privacy_governance` ve `privacy_retention_review` migrationları uygulandı.
- Başvuru/doküman görevi rütbeden bağımsız kişi bazında verilir. LİDER aktif topluluk üyelerini yetkilendirir; henüz kimseye yeni yetki atanmadı. Askıya alma veya aktif üyeliğin sona ermesi delege erişimini keser.
- Delege rutin erişim/düzeltme taleplerini yanıtlayabilir. Hesap kapatma/silme sonucunu ve metin yayımlamayı yalnız LİDER yapar.
- Aydınlatma, çerez ve saklama metinleri zengin yazı editörüyle düzenlenebilir. Taslak kamusal metni değiştirmez; eşzamanlı eski taslakla üzerine yazma engellenir. Yayım altı etki kontrolünü, gerekçeyi ve yeni sürüm kaydını gerektirir. Önceki sürümler değiştirilemez.
- Başvuru adresleri ve saklama ölçütleri panelden değişir. Yayımdan sonra ayar değişirse panel metin incelemesi uyarısı gösterir.
- `docs/privacy/FEATURE_REVIEW.md` ve repo `AGENTS.md` yeni özelliklerin veri etkisi incelemesini geliştirme sürecine bağlar. Hukuki etkiyi otomatik tespit eden bir sistem olduğu iddia edilmez.
- Zamanlanmış görev her gün 03:00 UTC'de, yapılandırılmış inceleme aralığının dolup dolmadığını kontrol eder; varsayılan 30 gündür. Yalnız sayım/inceleme kaydı oluşturur, veri silmez.
- İmha yürütücüsü yalnız okunmuş bildirimler, süresi dolan Aster sohbetleri ve sonuçlanmış kişisel veri başvurularını kapsar. Yayımlanmış saklama metni, LİDER oturumu ve `SURESI DOLAN KAYITLARI IMHA ET` ifadesi gerekir. Bekletmeler dikkate alınır; yeni mesajı olan sohbetler ve açık başvurular korunur. Sonuç sayıları en az üç yıl tutulacak imha kaydına işlenir.
- Bekletmeler en fazla bir yıllık, gerekçeli ve 30 günlük yeniden inceleme tarihli kayıtlardır. Gerekçesiz sınırsız bekletme oluşturulamaz.
- Profil/doğum tarihi, üyelik, yayın, yorum, rozet, disiplin, bütçe, Storage nesneleri ve sağlayıcı günlükleri bu otomatik seçim/imha kapsamına alınmadı. Kategori bazlı değerlendirme ve sağlayıcı işlemleri gereklidir.
- Gerçek üye verileri silinmedi, hukuki metinler henüz yayımlanmadı, uygulama deploy edilmedi. Son doğum sütunu erişim kısıtı hâlâ uyumlu uygulamanın yayımını bekler.
