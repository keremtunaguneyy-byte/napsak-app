# N’apsak — Durum ve sıradaki iş

Kontrol tarihi: 6 Eylül 2026. Bu bir yayına hazır raporu değildir.

## Sürüm ayrımı

- GitHub main bu turda API üzerinden okundu: cb21941f644f51685f49b37246c983a4e20e8fad, Add Ankara 101 city guide (#18).
- Mevcut yerel uygulama: agent/ankara-101-editorial, 6a453ab. Main üzerine dört commit: 50c8b16 editoryal rehber, 9cb1601 fotoğraf, 1e2cb07 mobil sıkıştırma, 6a453ab Android geri gezinme.
- Bu belge işi main cb21941 tabanlı ayrı agent/project-memory-20260906 dalında hazırlanıyor. Uygulama commitlerini ana dala taşımaz.
- Eski çalışma kopyasındaki PRODUCT_SPEC değişikliği korunuyor. İlişkili mekân-plan özelliğinin onaylı metni belge dalına da aktarılacak; özelliğin kodlandığı iddia edilmiyor.

## Gerçekte nerede kaldık?

| Alan | Durum | Sıradaki kanıt/iş |
|---|---|---|
| Ürün motoru | Experience, Mekân, Etkinlik, Fikir; beşli sonuç, gerekçe, çeşitlilik kodu var | İlgili testlerin güncel sonucu |
| Kullanıcı | Onboarding, tercihler, kayıt/gizleme/geri alma ve yerel kalıcılık var | Güncelleme/geri dönüş regresyonu |
| Ankara 101 | İlk sürüm main'de; gelişmiş editoryal görünüm yerel dalda | Dört commit'in doğrulaması ve PR durumu |
| Backend | Firebase Auth/Firestore, repository, cache, validation, sync kodu var | Canlı ortam ve deploy edilmiş kural kanıtı |
| Ana sayfa/marka | Tasarım sohbetinde çalışılıyor; yeni görünüm uygulanmış değil | Onaylı ekran + tasarım şartnamesi |
| Bağlam eskimesi | Tercih kaydı var; seçim zaman damgası yok | Ürün kuralı, sonra migration |
| Etkinlik | Yerel 12 kayıt 7–22 Ağustos tarihli; 6 Eylül için geçmiş | Kaynaklı güncel veri; remote ayrıca doğrulanmalı |
| Mekân → plan | Kullanıcı onaylı iş, ilişki verisi mevcut | Aşağıdaki kabul kriterleriyle uygulama |

Bu tur `npm run typecheck` başladı fakat süreç sonucu ortamın ağ/onay iptali nedeniyle alınamadı. Başarılı test olarak sayılmaz. Belge değişiklikleri için diff ve dosya bağlantıları kontrol edilecek; uygulama testlerinin geçtiği iddia edilmeyecek.

## Çalışma sırası

1. Bu belge paketini incelenebilir PR olarak kaydet. Tasarım sohbetine START_HERE + DESIGN_SPEC ver.
2. Ankara 101 yerel değişikliklerinin uzak branch/PR durumunu doğrula; ilgili kontrolleri çalıştır; tamamlanmış görsel işi kaybetmeden ayrı PR'da ilerlet.
3. Tasarım sürerken mekân-plan bağlantısını küçük uygulama işi olarak ele al. Yeni görünümün bitmesini gerektirmez.
4. Kaynaklı etkinlik yenilemesi ve boş durumunu tamamla.
5. Yeni tasarım seçildiğinde tokenlar ve ana sayfa bileşenlerini uygula; beşli öneri davranışını koru.
6. Bağlam eskimesi kararını migration ve kullanıcı durumlarıyla uygula.
7. Yayın öncesi teknik temellerin açık maddelerini kanıtlarıyla kapat.

## İlk ürün işi: mekân detayından planlara geçiş

Onay kaynağı: mevcut konuşma ve PRODUCT_SPEC §9.4.

- Seçili mekânın ID'si Experience.points[].placeId içinde aranır.
- Gizlenen, süresi dolmuş ve mevcut uygunluk kurallarına uymayan planlar gösterilmez.
- Başlık: Bu mekânı kullanan N’apsak planları. Eşleşme yoksa bölüm gizli.
- Kart mevcut plan detayını açar; kaydetme/gizleme davranışını bozmaz.
- Test: eşleşen ID, benzer isimli farklı ID, gizlenen/expired plan, boş sonuç ve mevcut uygunluk filtresi.
- Veri şeması değişikliği gerekmemesi beklenir; uygulama incelemesinde doğrulanır.

## Teknik temeller — tamamlandı denmeyen kontrol listesi

Kullanıcının eski listesi on başlık: (1) kullanıcı/eşzamanlılık, (2) veri/database, (3) ölçek/maliyet, (4) güvenlik, (5) kimlik, (6) hata/loglama, (7) test/e2e, (8) gizlilik/KVKK, (9) altyapı/deploy, (10) performans. Önceki özette (11) yedek/kurtarma ve (12) analitik/içerik operasyonu ayrıca ayrıştırıldı; on iki maddenin tamamı birebir eski kullanıcı alıntısı değildir.

Öncelik: mevcut backend'in dev/prod ve yetki durumunu kanıtla → test/cihaz regresyonu → hata izleme, yedek/restore ve veri silme akışları → ölçümlü performans/maliyet/yük kontrolü. Azure'a geçiş ayrı onaylı teknik karar gerektirir; mevcut Firebase yönü sırf eski notta Azure geçtiği için değiştirilmez. Sayısal kapasite ve maliyet ölçüm olmadan ilan edilmez.
