# Q-GANG Panel

Q-GANG topluluk platformunun kaynak deposu.

## Branch düzeni

- `main`: çalışan/stabil production baseline
- `qgang-ui-v1`: aktif geliştirme ve Q-GANG UI dönüşümü

## Mevcut mimari

Frontend, `index.html` üzerinden çalışır ve Wix/Velo HTTP Functions API'sine bağlanır:

`https://www.q-gang.com/_functions/qgang`

Wix backend'in gerçek production kaynağı Wix tarafında `http-functions.js` olarak tutulur. Repository'ye alınacak backend dosyası bu production kaynağın birebir kopyası olmalıdır; eksik veya tahmini backend kodu production'a alınmaz.

## Deployment ilkesi

1. Production veri/backend'i korunur.
2. Geliştirme önce `qgang-ui-v1` branch'inde yapılır.
3. Frontend-backend bağlantısı doğrulanmadan `main` değiştirilmez.
4. Görsel dönüşüm sırasında API sözleşmesi korunur.
5. Yeni özellik, stabilizasyon ve UI dönüşümünden ayrı ele alınır.

## Güvenlik

Token, şifre, API secret veya özel anahtar repository'ye commit edilmez.
