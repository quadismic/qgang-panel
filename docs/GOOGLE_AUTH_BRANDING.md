# Q-GANG Google giriş kimliği

Ekran görüntüsünde Google uygulama adı yerine `kttebbvinfmauthmayqp.supabase.co` gösteriyor. Kodda `/auth` route eklemek bu Google ekranını değiştirmez.

## Öncelikli çözüm: marka doğrulaması

Google Cloud projesindeki Google Auth Platform → Branding:
- App name: Q-GANG.
- App logo: mevcut Q-GANG amblemi (kare PNG; Google 120×120 öneriyor).
- Homepage: https://q-gang.com.
- Authorized domains: q-gang.com.
- User support email: proje sahibinin izlediği mevcut adres; tahminle yeni adres yazılmamalı.
- Privacy policy ve terms: gerçekten yayımlanmış, erişilebilir sayfalar. URL uydurulmamalı.
- Search Console ile alan adı sahipliği doğrulaması.
- Verify Branding → onay sonrası Publish branding.

Google, uygulama adı ve logosunu ancak doğrulanıp yayımlanmış marka için gösteriyor. Bu işlem Google yönetim hesabı ve gerçek hukuk metinleri gerektirir. Mevcut ayarlar bu çalışma sırasında değiştirilmedi.

## İsteğe bağlı: Supabase özel auth alan adı

`auth.q-gang.com` seçeneği Supabase'in ücretli plan üzerindeki ücretli Custom Domains eklentisidir. Yeni abonelik otomatik başlatılmadı.

1. Supabase General Settings → Custom Domains.
2. auth.q-gang.com için proje alan adına CNAME ve Supabase'in verdiği doğrulama TXT kayıtları.
3. Sertifika/doğrulama tamamlanmadan aktivasyon yapılmamalı.
4. Google OAuth client authorized redirect URI listesine `https://auth.q-gang.com/auth/v1/callback` eklenmeli. Mevcut Supabase callback korunmalı.
5. Bundan sonra Supabase alan adı aktive edilmeli.
6. Yeni ve mevcut kullanıcılar için giriş, oturum yenileme ve çıkış kontrol edilmeli.

`https://q-gang.com/auth` uygulamanın bir yolu olabilir; Supabase'in desteklediği özel alan adı modeli alt alan adıdır. Callback'i sırf görsel gerekçeyle uygulama route'una yönlendirmek kimlik doğrulamasını bozabilir.

Kaynaklar:
- https://support.google.com/cloud/answer/15549049
- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/guides/platform/custom-domains
