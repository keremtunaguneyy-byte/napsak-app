# Gezek adlandırma sınırı

28 Eylül 2026. **Gezek** kamuya açık ürün adıdır; **N’apsak** önceki çalışma adıdır. Bu çalışma uygulamanın görünen adını, kullanıcı metinlerini, sonuç sekmesini (**Planlar**) ve güncel belge başlıklarını eşitler. Öneri davranışı, veri modeli, servis bağlantıları ve dağıtım kimlikleri değişmez. Sonraki aşama görsel tasarımın tamamlanmasıdır.

## Korunan teknik kimlikler

| Sınıf | Bugünkü değer / örnek | Korunma nedeni |
|---|---|---|
| npm paketi ve depo | `napsak-app`, `package-lock.json`, GitHub repo yolu | Paket/depo kimliği ve kilit dosyası değişimi bu görsel adlandırma için gerekli değil. |
| Expo ve EAS | slug `napsak-app`, owner `napsaks-team`, `@napsaks-team/napsak-app`, project ID `af043dd8-412f-403e-81c3-6e0af8e024d6` | EAS proje ve güncelleme sürekliliği. Görünen Expo `name` artık `Gezek`. |
| Platform uygulama kimliği | iOS `bundleIdentifier=com.getnapsak`; Android `package=com.getnapsak` | İmzalı uygulama, mağaza ve yüklü beta sürekliliği ayrı dağıtım kararı gerektirir. |
| Yerel veri | `@napsak/preferences/v1`–`v5`, `@napsak/user-sync/v1`–`v2` ve deleted-UID anahtarı, `@napsak/catalog/v3/` | Saklanan veri, migration, silme ve cache sürekliliği. |
| Ortam ve servis | `NAPSAK_BUILD_MODE`, `NAPSAK_PRIVACY_POLICY_URL`, `NAPSAK_SUPPORT_URL`, kanıt değişkenleri, Firebase/Sentry proje örnekleri ve `demo-napsak` | Build/CI sözleşmeleri ve bağlı ortam değerleri korunur. Gerçek Firebase yapılandırması ve proje ID'leri değiştirilmedi. |
| Kod ve sözleşmeler | `experience`/`Experience`, katalog ID'leri, Firestore yolları, analytics olay anahtarları, URL/deep-link sözleşmeleri | Bunlar marka etiketi değil; sıralama, veri veya istemci sözleşmeleridir. |

Bu adların test fixture'ları ve doğrulamaları da korunur. Eski PR/commit açıklamaları, tarihsel STATUS ve DECISIONS kayıtları, eski tasarım referansları ve önceki N’apsak adını belgeleyen notlar geçmişin doğru kaydı olarak kalır. Varlık dosyaları (`assets/icon.png`, Android ikonları, splash ve favicon) bu çalışmada değişmedi; görsel tasarım aşamasında değerlendirilecek. Mevcut ikon eski adı yazmıyor, ancak yeni marka için onaylı nihai görsel değildir.

Audit kapsamı: uygulama/izin metinleri ve güncel ürün belgeleri kamuya açık ad olarak güncellendi; `Planlar` yalnız sonuç/Experience yüzeyinin etiketi oldu. Eski adın geri kalan eşleşmeleri tarihsel belge/PR kaydı, iç kod yorumu, paket/depo/EAS/Firebase kimliği, ortam değişkeni, platform ID'si, saklama anahtarı veya bunların test fixture'ıdır. Eski ada sahip varlık dosya yolu bulunmadı. Repository'de tanımlı bir Expo `scheme` değeri yok; bu çalışmada deep-link sözleşmesi eklenmedi.

## Dağıtım kimliği için sonraki karar

Repository içindeki `app.json`, EAS bağlamı ve testlerde `com.getgezek` kullanımına rastlanmadı. Bu yalnız yerel yapılandırma gözlemidir; Apple, Google, Expo, hukuki veya küresel kullanılabilirlik kanıtı değildir. Kapalı beta dağıtımından önce `com.getnapsak` kimlikleriyle devam edilip edilmeyeceğine karar verilmeli. Kimlik değişimi istenirse Apple Developer ve Google Play uygunluğu, signing/provisioning, EAS proje/güncelleme bağı, Firebase/Auth ve deep-link etkileri, mevcut kurulumların güncelleme yolu ve mağaza kayıtları ayrı doğrulanmalı; onaylı migration planı ve gerçek cihaz kanıtı alınmalıdır. Bu PR hiçbir bundle/package kimliğini veya production servisini taşımadı.
