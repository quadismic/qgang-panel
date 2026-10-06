# Q-GANG UI Convergence Report — 2026-10-06

## Kanonik sistem ve kapsam

QG_UI_SPEC.md mevcut başarılı örnekleri ve tokenları belgeler. Koyu törensel kimlik korunur; operasyonel kontroller bronz ortak primitive katmanına yakınlaştırılır. Aşağıdaki route envanteri kaynak dosyalarını gösterir; Türkçe public adresler mevcut rewrite/alias düzenini kullanır. Statüler kod incelemesine dayanır, görsel onay değildir.

| Kaynak route | Durum | Açıklama |
|---|---|---|
| `/account` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/announcements` | Canonical | Kanonik referans pattern; bu sınıflandırma kod temellidir. |
| `/budget` | Canonical | Kanonik referans pattern; bu sınıflandırma kod temellidir. |
| `/campfires/[slug]` | Legacy | Özel kontrol ve durum düzenleri korunuyor; toplu yeniden yazılmadı. |
| `/control/access` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/control/community/[id]` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/control/community` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/control/design` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/control/moderation` | Structural Review Required | Yoğun yönetim akışının bilgi mimarisi ayrı tasarım incelemesi gerektiriyor. |
| `/control` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/control/publications` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/control/system` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/entities/aster` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/gizlilik/cerezler` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/gizlilik` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/gizlilik/saklama` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/gizlilik/verilerim` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/gizlilik/yonetim/metinler` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/gizlilik/yonetim` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/gizlilik/yonetim/saklama` | Structural Review Required | Yoğun yönetim akışının bilgi mimarisi ayrı tasarım incelemesi gerektiriyor. |
| `/login` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/maintenance` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/members` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/onboarding` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/penalties` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/profile/edit` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/profile` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/publications/[slug]` | Canonical | Kanonik referans pattern; bu sınıflandırma kod temellidir. |
| `/publications` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/rozetler` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |
| `/rules` | Canonical | Kanonik referans pattern; bu sınıflandırma kod temellidir. |
| `/settings` | Legacy | Özel kontrol ve durum düzenleri korunuyor; toplu yeniden yazılmadı. |
| `/u/[handle]` | Minor Drift | Mevcut kimlik korunuyor; özel yerel stiller ve görsel doğrulama kalıyor. |

Kodeksin üç alt görünümü, yayın stüdyosu, topluluk yönetimi/yetkili düzenleme, yorumlar, profil düzenleyici ve ortak dialoglar da bileşen düzeyinde incelendi.

## Uygulanan güvenli değişiklikler

- Primitives: Input/Select ref desteği; Textarea ve LoadingState mevcut stillerle eklendi.
- RichTextEditor: compact/standard/editorial yoğunluğu ve açık accessible label; toolbar 44px, sayaç 12px, ortak yüklenme durumu.
- ProfileEditor/MemberProfileEditor: kısa biyografi, ortak form kontrolleri, yetkili formda responsive grid; Kullanıcı Adı etiketi.
- AnnouncementComposer, CodexComposer, DisciplineComposer/Requests, PublicationStudio/CoverField: ortak form ve aksiyon stilleri, editör etiketleri.
- AccessMatrixEditor: ortak aksiyonlar, aria-pressed, klavyeyle erişilen yatay tablo bölgesi.
- MemberPicker: ortak kontroller, yardımcı durum bağlantısı, hata niteliği; mevcut arama/seçim akışı korunur.
- BirthDateFields, BadgeManagement, DesignEditor, CommunityManagement, CodexCompilation/Workspace, AccountIdentityManager: güvenli kontrol standardizasyonları.
- ASTER, kişisel veri ve gizlilik yönetim ekranları: mevcut veri akışını koruyan ortak kontrol kullanımları.
- Bütçe/duyuru yükleme göstergeleri ortaklaştırıldı. Geniş CSS refactor yapılmadı.

## Korunan referanslar ve kalan sapmalar

Bütçe/duyuru defteri, yayın kartları, Kodeks okuma türleri, Topluluk heraldik portreleri korunur. Eski özel form, notice/durum, metadata, rozet ve editör araçları tamamen kaldırılmadı. Tüm error/empty ekranları zorla aynı metne dönüştürülmedi. Kontrol radius ve renkleri ortaklaştırılırken sayfa container mimarisi korunur.

## Design review required

Moderasyon ve saklama yönetimi yoğun ekranlarının yapısal sadeleşmesi; profil/hesap/settings görev sınırları; tüm token dışı stillerin daha geniş konsolidasyonu. Bu alanlar bu pakette yeniden tasarlanmadı.

## Accessibility ve responsive

Editör label, yardımcı metin, yetki toggle state, tablo klavye erişimi ve mobil 44px hedefler iyileştirildi. Kontrast, bütün durumlar ve tüm küçük özel kontrollerin uygunluğu henüz ölçülmedi. 1440/390px tarayıcı regresyonu bu oturumda Chromium socket() Operation not permitted hatası nedeniyle çalıştırılamadı.

Önceki results.json dosyası 76 deneme içeriyor fakat 44 yönlendirme hatası var; bu dosya başarılı tam site denetimi kanıtı değildir. Önceki konuşmadaki 76 ekranın tamamının geçtiği ifadesi bu kanıtla doğrulanamıyor. Fixture route ile düzeltilecek test harness mevcut; final değişiklikler için yeniden çalıştırılması gerekir.

## İş mantığı

Backend, database, migration, endpoint, yetkilendirme ve veri modeli değişmedi. Form action, alan adları, doğrulama sınırları ve API işlemleri korundu. Yerel test fixture verileri gerçek sistemden bağımsızdır; üretim route'u oluşturulmaz.

## Teknik doğrulama

TypeScript (`tsc --noEmit`), repository lint (`npm run lint`), production build (`npm run build`) ve `git diff --check` geçti.

Geçen testler: rich-text + rich-text-db; auth-onboarding; guest-identity; member-search; discipline-requests; public-codex; public-announcements; community-directory; publication-comments; test:documents (document-db, badge-document-routes, codex-pdf).

Tarayıcı testleri: ui-convergence Chromium socket kısıtı nedeniyle başlayamadı; access-ui varsayılan Playwright browser binary bulunamadığı için başlayamadı. Bunlar başarılı test olarak sayılmadı. UI test harness artık hatalı route/status/overflow/clipping/etiket sonuçlarında başarısız çıkış verir; eski script yalnız sonuç kaydederek başarı izlenimi verebiliyordu. Push, merge ve deploy yapılmadı. Görsel kontrol engeli çözülmeden paket tam doğrulanmış deploy-ready olarak sunulmaz.
