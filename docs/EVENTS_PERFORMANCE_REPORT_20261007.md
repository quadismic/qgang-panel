# Etkinlik sekmesi performansı — 2026-10-07

Yaklaşan Etkinlikler / Etkinlik Arşivi geçişinde sayfa, birbirinden bağımsız tür, etkinlik, öneri ve kendi katılım yanıtı sorgularını sırayla bekliyordu. Bu, ağ/veritabanı beklemelerini üst üste ekliyordu. Sekmelerde bekleyen geçiş bilgisi de bulunmuyordu.

Bu dört sorgu aynı yetki kontrolünden sonra Promise.all ile paralel çalışır. Katılımcı profil sorgusu yalnız arşivde katılımcı filtresi seçilince yapılır; listede kullanılmayan etkinlik açıklaması taşınmaz. Sekme bağlantısı bekleyen sunucu geçişinde erişilebilir “Yükleniyor…” durumu gösterir. Filtreler, RLS, izinler ve katılım davranışı korunur; kullanıcı verisine paylaşılan cache eklenmez. Diğer sayfalar değişmez.

Regresyon testi, dört sorgunun herhangi biri sonuçlanmadan hepsinin başlamasını zorunlu kılar; yaklaşan görünümde gereksiz profil sorgusu yapılmadığını da doğrular. Etkinlik domain/API/DB/sunum testleri, typecheck, lint ve production build geçti.

Uygulama ve veritabanı Tokyo bölgesindedir; bölge uyuşmazlığı yoktur. Canlı HTTP zamanlama denemesi ağ/SSL zaman aşımına takıldı; gerçek oturumlu geçiş için milisaniye veya hızlanma oranı iddia edilmez. Bu inceleme başka canlı gecikme kaynaklarının tamamını dışlamaz. Üretim verisi değiştirilmedi; deploy yapılmadı.
