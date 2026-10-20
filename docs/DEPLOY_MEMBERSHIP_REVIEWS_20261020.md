# Üyelik Değerlendirmeleri — üretim yayını

Tarih: 20.10.2026

- Üretim: https://q-gang.com
- Vercel: dpl_5uVSAUYfYFinXTtRdMASuJcf2Giz · READY · production
- Commit: c5c3ab1634381b54e949a0b7521897c73eb3445e
- Kaynak ağacı: 6398f1337f8986d4c67b6c18fd78351414d2bf5e; test edilen 2064a9c ile birebir aynı.
- Build süresi: yaklaşık 85 saniye. Alan adları yeni sürüme bağlandı.
- Supabase migration: 20261020072011 membership_reviews. Yerel kaynak 20261019215819_membership_reviews.sql; MCP uygulama zamanı nedeniyle canlı sürüm numarası farklıdır.

## Canlı doğrulama

Ana sayfa HTTP 200. Modül API'si oturumsuz HTTP 401 ve private/no-store. Modül sayfası Next.js streaming HTTP 200 içinde giriş sayfasına NEXT_REDIRECT/meta refresh döndürüyor; değerlendirme formu veya özel veri bulunmuyor.

Veritabanında sekiz özel tablo ve tamamında RLS doğrulandı. Anonim RPC çalıştırma izni yok. Aktif Lider kimliğiyle yalnız veri okuyan snapshot kontrolü ve gizlilik başlangıç kapısı test edildi; dönem/deneme verisi oluşturulmadı. Gerçek oturumlu tarayıcıda yeni dönem açılmadı.

Son bir saat için modül rotalarında runtime hata kümesi bulunmadı. Harici log drain yapılandırılmamış; uzun süreli gözlem bu kısa kontrolden çıkarılamaz.

## Kalan kullanım ön koşulu

Aydınlatma ve saklama metinleri taslak revision 1 olarak hazırlandı; published_revision alanları değiştirilmedi. Üretimde privacy_ready=false. Lider mevcut Gizlilik yönetim akışında taslakları inceleyip yayımlayana kadar değerlendirmeyi başlatamaz. Hazırlık yapılabilir. Hukuki içerik otomatik yayımlanmadı.

Önceki üretim sürümü: dpl_FEnwCzVecXUCEaX2eLqrExZXKzdf. Uygulama geri alınırsa eklenen private tablolar ve gizlilik taslakları korunabilir; veritabanına otomatik geri alma/silme uygulanmadı.
