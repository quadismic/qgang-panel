# 23.10.2026 — Güvenlik düzeltmeleri veri etki incelemesi

Durum: kaynak paketinde hazırlanmıştır; canlı ayar/metin değiştirilmemiştir.

1. Yeni kişisel veri kategorisi yok. Steam bağlantısının başlatan hesaba ait olduğunu doğrulamak için mevcut kullanıcı kimliği, rastgele meydan okuma ve son geçerlilik zamanı yalnız kısa ömürlü birinci taraf güvenlik çerezinde tutulur. Bu değerler uygulama veritabanına veya analiz hizmetine kaydedilmez.
2. Amaç/görünürlük genişlemez. Yayın yayımlama, üyelik hiyerarşisi ve askıya alma kontrolleri mevcut yetkileri uygulama ve doğrudan veri API'sinde tutarlı uygular. Askıdaki hesapların kişisel veri başvuru yolları korunur. Sahte bildirim ekleme ve bildirim gövdesini değiştirme kapatılır; gerçek rozet işlemlerinin sunucu bildirimleri korunur.
3. Yeni sağlayıcı yok. Steam/Supabase/Vercel mevcut sağlayıcılardır. Bu çalışma bunların sözleşmelerinin veya aktarımlarının hukuki uygunluğunu onaylamaz.
4. Yeni zorunlu güvenlik çerezi: `__Host-qg-steam-link`; yalnız kullanıcı Steam bağlama işlemini başlattığında oluşur. Secure, HttpOnly, SameSite=Lax, host-only, Path=/; en çok 10 dakika. Her callback'te tüketilir. Analiz/reklam amacı yok. HTTP yerel geliştirmede eşdeğer ad `qg-steam-link`tir.
5. Mevcut veri saklama süreleri değişmez. Yeni geçici challenge süresi 10 dakikadır; başarılı/başarısız dönüşte aynı çerez yolu ile silinir.
6. Başvuru/silme/düzeltme hakları korunur. Oturum veya sağlayıcı hesabı silinmez; dosya boyutu/tür ve görsel çözümleme kontrolleri güçlenir.

## Çerez metnine eklenecek taslak

> Steam hesabınızı bağlamak istediğinizde, işlemin sizin oturumunuzda başlatıldığını doğrulamak ve başka bir hesabın izinsiz bağlanmasını önlemek için `__Host-qg-steam-link` adlı birinci taraf güvenlik çerezi kullanılır. Bu çerez en fazla 10 dakika saklanır ve bağlantı dönüşü işlendiğinde silinir. Reklam veya kullanım analizi amacı taşımaz.

Mevcut Çerez ve Dış İçerik Bilgisi metniyle karşılaştırılarak Gizlilik > Yönetim > Metinler ve Düzen ekranındaki taslağa eklenmelidir. Yayımlanmış metinler bu paket tarafından değiştirilmez. AGENTS.md ve FEATURE_REVIEW.md uyarınca bu çerez açıklamasının incelemesi canlıya geçişte tamamlanmalıdır.

## Teknik doğrulama

Gerçek handler ile state hatası, doğru oturum/doğru imzalı dönüş, cookie tüketimi, yinelenen callback ve Origin denetimi test edilir. DB testleri askıya alma, hiyerarşi, yayımlama ve bildirim erişimini sınar. Gerçek kullanıcıların oturumlarına veya kişisel kayıtlarına test amaçlı müdahale edilmemiştir.
