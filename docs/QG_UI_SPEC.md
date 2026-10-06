# Q-GANG Canonical UI Spec

Mevcut koddan çıkarılan standart; yeni tasarım dili değildir. Kaynaklar: globals.css, ui-primitives.css, Primitives, Dialog, OverflowMenu, LoadMore ve mevcut ekran bileşenleri.

## Referans düzenler

| Referans | Kanonik kullanım |
|---|---|
| Ana sayfa ve Topluluk | Törensel kimlik, amblem, portre ve bölüm girişi |
| Bütçe | Tarih/kategori/açıklama/tutar hizalı mali kayıtlar |
| Duyurular | Kronolojik defter, kısa özet, açılan tam metin |
| Yayınlar | Editoryal kart ve uzun okuma yüzeyi |
| Kodeks | Hüküm/yönerge/karar için farklı normatif okuma düzenleri |

## Katmanlar ve tokenlar

Kimlik katmanı serif, bronz, kontrollü kırmızı vurgu ve heraldik öğeler kullanır. Operasyonel katman sans-serif, sade yüzey, okunabilir kontroller ve divider kullanır. Her içerik grubu kart değildir; yeni yüzey yalnız görev veya etkileşim sınırında açılır.

| Rol | Mevcut karşılık |
|---|---|
| Display / section / normatif başlık | --qg-display-font; sayfanın mevcut başlık ölçeği |
| UI ve form | --qg-ui-font; kontrol metni 14px, mobilde 16px |
| Metadata | --qg-muted; 12px / 1.5 |
| Body | Mevcut qgProse okuma düzeni |
| Overline | kicker; kısa kategori/kurumsal etiket |
| Temel / yükseltilmiş yüzey | #100c08 / #17100a |
| Divider / kontrol sınırı | #493421 / #6b4d2d |
| Kontrol metni / vurgu / destructive | #dfcdb6 / #c39a67 / #d88775 |
| Kontrol radius / yükseklik | 6px / en az 44px |
| Form alanı / grup aralığı | 8px / 20px |

Bronz normal birincil işlemler içindir. Kırmızı kritik/destructive ve normatif vurguya ayrılır. Durum anlamı yalnız renk ile aktarılmaz. Container genişlikleri ve törensel hero ölçekleri mevcut sayfa bağlamına göre korunur; bütün ekranlar tek genişliğe zorlanmaz.

## Ortak kontroller

Button: primary, secondary, tertiary, destructive. IconButton: erişilebilir ad ve QGIcon. Input/Select/Textarea: aynı sınır, yüzey, focus ve disabled davranışı; label tüketici tarafından sağlanır. Ref aktarımı React 19 ref prop ile korunur.

Badge ve Metadata anlamsal türleri birleştirir; norm türleri NormBadge üzerinden korunur. OverflowMenu seyrek/destructive işlemleri toplar. LoadMore dili: [N] KAYIT DAHA GÖSTER ↓; içerik için label parametresi kullanılabilir.

Dialog: accessible name, showModal ile focus trap ve arka plan kilidi, üst pencere için Escape, kapanışta focus restore. SurfaceLayer, kırpma, Kodeks ve hesap silme aynı davranışı kullanır. Bu paket önceki dialog altyapısını yeniden yazmaz.

EmptyState kısa; ErrorState hatayı boş içerikten ayırır. LoadingState role=status ve reduced-motion desteği kullanır. Ekrana özel iş durumları kendi metinlerini korur.

## Editör yoğunluğu ve mobil

280–500 karakter kısa içerik compact; orta uzunluk standard; uzun yayın editorial. Toolbar dokunma hedefleri 44px. Label içerik rolünü belirtir. Biçimlendirme ve kayıt serileştirmesi değişmez.

760px altında yetkili profil formu tek sütuna geçer; aksiyonlar sarılır, kontrol fontu 16px olur. Uzun tablo kendi bölgesinde kaydırılır, sayfa taşması oluşturmaz. Yerel CSS düzeltmeleri yapılır; geniş !important temizliği yapılmaz.

## Doğrulama sınırı

Bu standardın tüm ekranlara görsel uygunluğu 1440 ve 390px tarayıcı regresyonu ile ayrıca doğrulanmalıdır. Kod incelemesi ölçülmüş kontrast veya tamamlanmış görsel doğrulama değildir.
