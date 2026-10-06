# UI convergence production deployment — 2026-10-06

Kullanıcı açık yayın onayı: deploy.

- URL: https://q-gang.com
- Project: prj_Zpp6Buu4ur6hyXemuKXQ08I5Iw1M / qgang-panel
- Team: team_K7u9TtWelfJgaoHBeBOwdJID
- Environment: production
- Deployment: dpl_2R4HfXdqYw4dnAmkjZiC2X39B7r5
- Status: READY, aliasError null; q-gang.com ve www.q-gang.com bağlı.
- Remote commit: dc801e54444f512bd048ac40602f8b6578dd00dc
- Local tested commit: 3fdc69447e2c03fcdb5d335d650f188dbfdcb1d7
- Identical source tree: 2d50f96fa81925e5d51cb418c35c440ac626c1a6

GitHub bağlantısı üzerinden aynı dosya ağacı oluşturuldu; ui/community-codex-layout dalı lease kontrollü fast-forward güncellendi. Main değiştirilmedi. Sabit remote commit'ten ayrı production deployment oluşturuldu. Migration veya canlı veri değişikliği yok.

Vercel production build tamamlandı. HTTP login ve ana sayfa 200. Dört canlı CSS dosyası 200; 701544a1da61e9a4.css içinde yeni qgTextarea ve qgEditor-compact kuralları doğrulandı. Yayın sonrası deployment-scoped error/fatal taramasında kayıt bulunmadı (kısa gözlem penceresi; gelecekteki hataları garanti etmez).

Bakım modu hâlâ açık; genel ziyaretçi ana sayfada bakım ekranını görüyor. Desktop/mobile görsel regresyon bu oturumdaki socket kısıtı nedeniyle tamamlanmadı. HTTP/statik dosya doğrulaması etkileşimli tarayıcı testi değildir. QG_UI_SPEC ve UI_CONVERGENCE_REPORT hazırlık aşamasındaki yayın durumunu anlatır; güncel yayın durumu bu belgededir.
