# Etkinlik sistemi — kişisel veri etki incelemesi ve metin taslağı

Durum: geliştirme taslağı. Yayımlanmış aydınlatma/saklama metinleri değiştirilmedi. Bu belge hukuki uygunluk veya sağlayıcı sözleşmesi onayı değildir.

## FEATURE_REVIEW yanıtları

1. **Yeni veri: evet.** Etkinlik önerisi, düzenleyici kimliği, katılım yanıtı, sıra tarihi, yoklama, tarihsel rumuz ve hesaba bağlantısı. Açıklama/yer alanlarına gereksiz özel nitelikli bilgi yazılmamalıdır.
2. **Amaç/erişim değişikliği: evet.** Topluluk etkinliklerini planlama ve doğrulanmış kurumsal arşiv oluşturma. Görünürlük aktif topluluk ve yetkili yönetimle sınırlı; anonim ziyaretçiye kapalı. Hukuki sebep kurum tarafından değerlendirilip metin taslağında kesinleştirilmeli. Puanlama veya yaptırım amacı eklenmez.
3. **Sağlayıcı/aktarım: mevcut Wix'ten mevcut Supabase'e tarihsel aktarım.** Yeni sağlayıcı eklenmez; yeni veri kategorilerinin mevcut sağlayıcı/aktarım düzeninde değerlendirilmesi gerekir. Kaynak Wix verileri silinmez/değiştirilmez. Salt okunur önizleme yapılmıştır, canlı aktarım yapılmamıştır.
4. **Çerez/takip: yeni araç yok.** Mevcut oturum kullanılır. JSON önizlemesi yerel dosyadan okunur; tarayıcı kalıcı depolamasına yazılmaz. Yeni dış medya yükleme akışı eklenmez.
5. **Saklama: ayrı değerlendirme gerekli.** Yaklaşan etkinlik RSVP verileri operasyonel, gerçekleşmiş katılım arşiv verisidir. Süreleri sayısal olarak uydurulmadı; Saklama Yönetimi taslağında kurumca belirlenmeli. Kod otomatik yeni bir silme süresi uygulamaz. Hesap silinince katılım rumuzu anonimleşir, kaynak anahtarındaki rumuz kaldırılır, kullanıcı bağlantısı ve ilgili işlem aktörü kaldırılır. Serbest metinde kişisel bilgi olması halinde mevcut inceleme/anonimleştirme süreci gerekir.
6. **İlgili kişi hakları: etkilenir ve korunur.** Kendi RSVP/katılım/öneri/düzenlediği etkinlik verileri Verilerim çıktısına eklenir; etkinlik erişimi/üyelik geri alınmış olsa da kişinin kendi çıktısı çalışır. Düzeltme/silme başvuruları mevcut Gizlilik başvuru akışından alınır. Eşleşmeyen tarihsel rumuzlarda hesap doğrulaması gerekir.

## Aydınlatma metni için ek paragraf taslağı

Topluluk etkinliklerini planlamak, katılım yanıtlarını yönetmek ve gerçekleşen etkinliklerin arşivini tutmak amacıyla etkinlik önerileriniz, düzenleyici bilgileriniz, katılım yanıtınız ve doğrulanmış katılım kayıtlarınız işlenir. Geçmiş etkinliklerdeki rumuzlar, doğrulanmış kimlik eşleştirmesiyle hesabınıza bağlanabilir. Katılım yanıtı gerçekleşmiş katılım anlamına gelmez. Doğrulanmış katılımınız topluluk içindeki etkinlik arşivinde ve profilinizin Faaliyetler alanında gösterilir. Bu kayıtlar otomatik puan veya yaptırım oluşturmaz. Kayıtlarınıza erişim, düzeltme ve silme/anonimleştirme taleplerinizi Gizlilik başvuru alanından iletebilirsiniz.

Yayımdan önce hukuki sebep, saklama ölçütü ve sağlayıcı/aktarım açıklamaları mevcut metinle birlikte tamamlanmalı; taslak sürüm yönetimi üzerinden yayımlanmalı.

## Erişim ve doğrulama

- `events.view`: toplulukta etkinlik/arşiv; herkese açık konum/katılımcı listesi yok.
- `events.propose`: kendi önerisini verir/görür. Diğer üyelerin önerisini okuyamaz.
- `events.manage`: taslak ve öneri yönetimi; yayımlama ayrı izin gerektirir.
- `events.publish`: durum değiştirme; düzenleme yetkisi de gereklidir.
- `events.attendance`: gerçek katılımı doğrulama/düzeltme. Tarihsel kimlik/kaynak değiştirme yetkisi vermez.
- `events.archive`: önizleme/tekrarsız aktarım ve açık onaylı tarihsel kimlik eşleştirmesi.
- `events.settings`: sabit tür kimlikleri korunarak ad/açıklama/sıra yönetimi.

`test-events-db.cjs` gerçek PostgreSQL RLS/RPC denemeleri; `test-events.cjs` önizleme, tarihler ve kimlik ayrımlarını doğrular. İşlem izi private şemada, ham açıklama/konum/rumuz değerlerini tekrar kopyalamadan değişen alan adlarıyla tutulur. Anonim ve sıradan üye yazma girişimleri test edilir.
