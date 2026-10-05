import {cache} from "react";import {createClient} from "@/lib/supabase/server";
export const getPrivacyCapabilities=cache(async()=>{const s=await createClient();const {data}=await s.rpc("privacy_capabilities");const v=data as {requests?:boolean;documents?:boolean;founder?:boolean}|null;return {requests:v?.requests===true,documents:v?.documents===true,founder:v?.founder===true};});
export const privacyReviewFields={categories:"Veri kategorileri",purposes:"İşleme amaçları",legal_basis:"Hukuki sebepler",recipients:"Alıcılar",transfers:"Yurt dışı aktarım",retention:"Saklama ve imha"} as const;
export const retentionFields={security_logs_days:"Güvenlik günlükleri (gün)",notifications_days:"Okunmuş bildirimler (gün)",aster_days:"Aster sohbetleri (gün)",unused_media_days:"Kullanılmayan görseller (gün)",requests_years:"Sonuçlanmış başvurular (yıl)",destruction_audit_years:"İmha işlem kayıtları (yıl)",review_interval_days:"İmha inceleme aralığı (gün)"} as const;
export const defaultPrivacyBodies:Record<string,string>={
 aydinlatma:`Veri sorumlusu: Ömer Faruk Karabul.

Yayım öncesi taslak: Kategori bazlı hukuki sebepler, sağlayıcı aktarım güvenceleri ve başvuru usulü doğrulanmalıdır.

Hesap ve kimlik: Rumuz, ad, e-posta ve sağlayıcı kimliği giriş ve hesap eşleştirme için işlenir. E-posta genel profilde yayımlanmaz.
Profil: Avatar, banner ve biyografi profil sunumuna hizmet eder. Görsel bağlantıları herkese açık olabilir.
Üyelik: Kabul tarihi, rütbe, görev ve eski üye eşleşmesi topluluk işleyişi için kullanılır. Doğrulama dayanakları yetkili alanlarla sınırlıdır.
Doğum bilgisi: Tam tarih kullanıcıya özeldir; diğer kişilere yalnız görünürlük tercihi kadar bilgi gösterilir.
Yayın ve yorum: Yayımlanan içerik ziyaretçiler tarafından görülebilir; taslaklar yetkiye tabidir.
Rozet: Aktif kazanımlar gösterilir; ayrıntılı atama ve düzeltme gerekçeleri yetkili alanlarda tutulur.
Disiplin: Karar, savunma, delil ve itirazlara işlem için gerekli kişiler erişir.
Bütçe: Mali takip için işlem kayıtları tutulur; anonimlik tercihi gözetilir.
Aster ve güvenlik: Talep edilen yardım ve güvenli işletim için konuşma/teknik kayıtlar işlenir. Özel üye verileri genel bilgi kaynağına dönüştürülmez.

Veriler giriş sağlayıcısından, formlardan, içeriklerden ve topluluk işlemlerinden elektronik ortamda elde edilir. Her işleme faaliyeti için uygun hukuki sebep ayrıca belirlenir. Bu metni görmek veya giriş yapmak açık rıza yerine geçmez.

Google, Supabase ve Vercel hizmetleri kullanılır. Yurt dışı işleme ve alt işleyenlerin kapsamı ayrıca değerlendirilir. Aster sağlayıcısı ve planına göre veri kapsamı açıklanır. İnceleme tamamlanmadan aktarım uygunluğu varsayılmaz.

Veriler amaç için gereken süreyle sınırlı tutulur. Hesap kapatma bütün kayıtların silinmesi anlamına gelmez. Silme talepleri kategori bazında değerlendirilir. Kurumsal tarihçe sınırsız kişisel veri saklama gerekçesi değildir.

İşleme hakkında bilgi isteme, düzeltme, şartları varsa silme/yok etme, alıcılara bildirim isteme, yalnız otomatik analiz sonucu aleyhe sonuca itiraz ve hukuka aykırı işleme nedeniyle zararın giderilmesini isteme hakları vardır. Gizlilik ve Verilerim alanı veya aşağıdaki e-posta kanalları kullanılabilir. Başvuru usulü ve ölçülü kimlik doğrulaması gözetilir.`,
 cerezler:`Oturum ve zorunlu işlevler
Supabase oturum çerezleri giriş ve oturum devamı için kullanılır. Bu sürümde uygulama kodunda reklam veya analiz takipçisi tespit edilmemiştir. Sağlayıcı katmanındaki teknik kayıtlar ayrıca değerlendirilir.

Dış içerik
Yazı içindeki YouTube videoları ve dış görseller yükleme düğmesine basıldığında ilgili sağlayıcıdan yüklenir. IP adresi ve teknik istek bilgileri sağlayıcıya iletilebilir. Profil/avatar gibi diğer medya alanlarının kapsamı ayrıca değerlendirilir.`,
 saklama:`Saklama ve imha düzeni
Profil, doğum tarihi ve hesap bağlantıları: Hesap ve işleme amacı devam ederken tutulur; amaç sona erdiğinde imha değerlendirmesi yapılır.
Kullanılmayan avatar/banner dosyaları: 30 gün.
Genel güvenlik günlükleri ve okunmuş bildirimler: 90 gün.
Aster sohbetleri: Varsayılan 90 gün; kurumsal hafızaya alınacak kayıtlar ayrı değerlendirilir.
Sonuçlanmış kişisel veri başvuruları: Gerekli kayıtlarla sınırlı 3 yıl.
İmha işlem kayıtları: En az 3 yıl.
Yayın, yorum, üyelik, rozet, disiplin ve bütçe kayıtları: İlgili işleme amacı, haklar ve varsa kanuni saklama yükümlülüğü esas alınır; kategoriye özgü karar kaydedilir.

Aylık imha incelemesi yapılır. Somut uyuşmazlık nedeniyle bekletme gerekçeli, süreli ve gözden geçirilebilir olmalıdır. Geçerli silme başvuruları aylık işi bekleterek geciktirilmez. Yedeklerin yaşam döngüsü ve sağlayıcı imha işlemleri ayrıca takip edilir.

Bu metnin yayımlanması teknik imha işlemlerini tek başına çalıştırmaz.`
};

export const getPublishedPrivacyDocument=cache(async(slug:string)=>{const s=await createClient();const {data}=await s.rpc("get_published_privacy_document",{document_slug:slug}).maybeSingle();const value=data as {title?:unknown;body?:unknown;revision?:unknown;published_at?:unknown}|null;return value&&typeof value.title==="string"&&typeof value.body==="string"&&typeof value.revision==="number"&&typeof value.published_at==="string"?{title:value.title,body:value.body,revision:value.revision,published_at:value.published_at}:null;});
