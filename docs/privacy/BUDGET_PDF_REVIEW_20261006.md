# Mali defter PDF ve düzeltme paketi veri etkisi

1. Yeni veri kategorisi yok. Var olan tarih, kategori, açıklama, tutar ve anonimlik tercihi kullanılır.
2. PDF mevcut budget.view veya budget.manage kapısı ve oturumlu Supabase RLS ile okunur. Yeni role erişim verilmez. Yetkili kişi mevcut mali kayıtların indirilebilir kopyasını alır; anonim destekçi adı hem loader hem render katmanında gösterilmez.
3. Yeni sağlayıcı veya aktarım yok. PDF mevcut Node/PDFKit altyapısında oluşturulur; uzak görsel isteği yapılmaz.
4. Çerez veya takip yok.
5. Site PDF'i veritabanına veya Storage'a kaydetmez. Yanıt private no-store; indirilen yerel dosyanın saklanması kullanıcı kontrolündedir. Mevcut mali kayıt saklama düzeni değişmez.
6. Başvuru/düzeltme/silme yolları değişmez. Silme rumuzunun normalizasyonu client ve server'da aynı; yetki/hiyerarşi/tarihçe engelleri korunur.

Varsayılan aydınlatma TASLAĞI ve gizlilik kategori özeti PDF açıklamasıyla güncellendi. Mevcut veritabanındaki taslak/yayımlanmış belge değiştirilmedi. Metin yönetiminden mevcut taslağa aktarılacak ek: “Bütçe okuma veya yönetim yetkisi bulunan kişiler seçilen kapsamın mali defter PDF çıktısını indirebilir. Anonim destekçi adları çıktıda gösterilmez; çıktı sitede ayrıca saklanmaz.” Çerez ve sunucu saklama metnine yeni kapsam eklenmesi gerekmiyor.

Bu değişiklik hukuki uygunluk veya sağlayıcı sözleşmesi beyanı değildir. Erişim ve anonimlik testleri scripts/test-budget-pdf.cjs içindedir. Canlı yazma, migration ve belge yayımı yapılmadı.
