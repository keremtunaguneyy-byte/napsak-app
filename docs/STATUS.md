# N’apsak — Durum ve sıradaki iş

Kontrol tarihi: 7 Eylül 2026. Bu bir yayına hazır olma raporu değildir.

## Son güncelleme — #21 main'de, #19 entegre ve test edildi

- #21 telefonda temel akışla doğrulandı ve squash merge ile main'e alındı: `dcde744`. Mekân detayı, ilgili uygun planlar, plan detayı, kaydet/gizle/geri al artık main'dedir.
- #19, güncel main ile `393d860` merge commit'inde birleştirildi. Ankara 101 gezinmesi ve #21 PlaceDetails birlikte korundu. Dal main'in 6 commit önünde, 0 gerisindedir; PR hâlâ taslak ve birleşik cihaz testi bekliyor.
- Birleşik #19 dalında TypeScript, 49/49 test, katalog parity, 2.560 mekân + 640 Experience stres senaryosu ve font/fotoğraflarla 665 modüllük Android export başarılı.
- #20 ortak belge paketi bu güncellemeyle merge'e hazırlanıyor. Tasarım ayrı sohbetle paralel sürüyor.
- Sonraki kapı: #19 birleşik cihaz testi. Sonra güncel etkinlik paketi; ardından onaylanan ana sayfa ve anlık bağlam eskimesi.

## Planlama tahmini — ölçülmüş tamamlanma oranı değildir

Mevcut kod, taslak PR'lar ve açık yayın işleri birlikte değerlendirilince kaba aralıklar: işlevsel MVP kod kapsamı %60–75, tasarım/marka %25–35, yayına hazırlık %20–30; genel ürün hazırlığı yaklaşık %45–55. Bunlar süre/maliyet vaadi veya test başarı oranı değildir. Öneri ve kalıcılık kodları ileride; nihai ana sayfa, cihaz onayı, güncel içerik ve operasyon geride olduğu için genel oran daha düşüktür. Sabit kabul listesi oluşturulunca bu öznel aralıkların yerine tamamlanan kabul maddeleri sayılmalıdır.

## Sürüm ayrımı

- GitHub main: dcde744, #21 mekân-plan bağlantısı dâhil.
- Ankara 101 aday sürümü: #19 / agent/ankara-101-editorial / 393d860; main'in üstüne entegre, henüz merge edilmedi.
- Bu belge işi ayrı agent/project-memory-20260906 dalında hazırlanıyor; uygulama commitlerini taşımaz.
- Eski çalışma kopyasındaki PRODUCT_SPEC değişikliği korunuyor. İlişkili mekân-plan özelliğinin onaylı metni belge dalına da aktarılacak; özelliğin kodlandığı iddia edilmiyor.

## Gerçekte nerede kaldık?

| Alan | Durum | Sıradaki kanıt/iş |
|---|---|---|
| Ürün motoru | Experience, Mekân, Etkinlik, Fikir; beşli sonuç, gerekçe, çeşitlilik kodu var | İlgili testlerin güncel sonucu |
| Kullanıcı | Onboarding, tercihler, kayıt/gizleme/geri alma ve yerel kalıcılık var | Güncelleme/geri dönüş regresyonu |
| Ankara 101 | İlk sürüm main'de; gelişmiş editoryal görünüm #19'da entegre ve otomatik testli | Birleşik telefon testi, sonra merge |
| Backend | Firebase Auth/Firestore, repository, cache, validation, sync kodu var | Canlı ortam ve deploy edilmiş kural kanıtı |
| Ana sayfa/marka | Tasarım sohbetinde çalışılıyor; yeni görünüm uygulanmış değil | Onaylı ekran + tasarım şartnamesi |
| Bağlam eskimesi | Tercih kaydı var; seçim zaman damgası yok | Ürün kuralı, sonra migration |
| Etkinlik | Yerel 12 kayıt 7–22 Ağustos tarihli; 6 Eylül için geçmiş | Kaynaklı güncel veri; remote ayrıca doğrulanmalı |
| Mekân → plan | #21 main'de; kullanıcı temel telefon akışını doğruladı | Tasarım sistemiyle görsel uyarlama, erişilebilirlik turu |

Bu tur `npm run typecheck` başladı fakat süreç sonucu ortamın ağ/onay iptali nedeniyle alınamadı. Başarılı test olarak sayılmaz. Belge değişiklikleri için diff ve dosya bağlantıları kontrol edilecek; uygulama testlerinin geçtiği iddia edilmeyecek.

## Çalışma sırası

1. #19 birleşik sürümü telefonda doğrula; uygunsa merge et.
2. Kaynaklı güncel etkinlik paketi ve dürüst boş durumu tamamla.
3. Tasarım sohbetinden onaylı devir gelince tokenlar ve ana sayfa bileşenlerini uygula; beşli öneri davranışını koru.
4. Anlık bağlamın eskime kuralını kullanıcıyla kararlaştır; timestamp + geriye uyumlu migration ile uygula.
5. Backend dev/prod, kurallar, hata izleme, yedek/restore, veri silme ve gizlilik kontrollerini kanıtla.
6. Gerçek cihaz matrisi, performans, erişilebilirlik ve yayın/rollback provasıyla MVP çıkış kapısını kapat.

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
