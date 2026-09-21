# N’apsak yayın ve geri dönüş kapısı

Bu belge bir sürümün mağazaya gönderilmeye hazır olduğunu varsaymaz. `npm run check:release` açık engellerin bilinen listeyle aynı kaldığını doğrular; sıfır engel anlamına gelmez. Gerçek yayın yalnız `npm run check:release:strict` ve manuel kanıtlar birlikte geçtiğinde yapılır.

## Şu an açık kapılar

| Engel adı | Kapı | Kapanma kanıtı |
|---|---|---|
| `android_package_unverified` | Android paket kimliği | Onaylı `expo.android.package=com.getnapsak`; imzalı artifact içindeki application ID’nin aynı olduğunu gösteren kanıt; erişilebilir olduğunda aynı kimliğe ait Google Play kanıtı |
| `ios_bundle_identifier_unverified` | iOS bundle kimliği | Onaylı `expo.ios.bundleIdentifier=com.getnapsak`; Apple bundle kimliği veya imzalı artifact içinde aynı değeri gösteren kanıt; erişilebilir olduğunda aynı kimliğe ait App Store Connect kanıtı |
| `privacy_policy_url_unverified` | Gizlilik politikası adresi | Yayında çalışan HTTPS gizlilik politikası adresi |
| `production_firebase_unverified` | Production Firebase | Ayrı production proje değerleri; emulator ve dev/test proje yok |
| `production_sentry_unverified` | Production Sentry | DSN, org, proje, build tokenı, source map ve dashboard olayı |
| `release_device_matrix_unverified` | Cihaz matrisi | İmzalı release build ile düşük/orta Android ve hedef iOS test kaydı |
| `restore_drill_unverified` | Restore provası | Ayrı recovery projede başarılı operation + katalog/kullanıcı kontrol kaydı |
| `support_url_unverified` | Destek adresi | Yayında çalışan HTTPS destek adresi |

`release-readiness.json` yalnız bilinen açık engelleri sabitler. Android ve iOS kimliklerinin söz dizimi ayrı denetlenir; söz diziminin geçerli olması dış kimlik veya imzalı build kanıtı değildir ve bu iki engeli kendiliğinden kapatmaz. Bir engelin bu dosyadan silinmesi onun kapandığını kanıtlamaz; denetim girdisi ve ilgili dış kanıt da bulunmalıdır.

## Doğrulanmış EAS proje kimliği

14 Eylül 2026'da authenticated `eas project:info`, repository bağlantısıyla gerçek EAS projesinin eşleştiğini gösterdi:

- owner: `napsaks-team`
- slug: `napsak-app`
- fullName: `@napsaks-team/napsak-app`
- project ID: `af043dd8-412f-403e-81c3-6e0af8e024d6`

Bu kanıt `eas_project_id_unverified` engelini kapatır.

## EAS build yapılandırma durumu

Repository'de `eas.json` bulunur. EAS CLI alt sınırı `>= 24.3.0`, `appVersionSource` değeri `remote` olarak tanımlıdır. Her build profili adlandırılmış EAS ortamını ve `EXPO_PUBLIC_APP_ENV` değerini açıkça bağlar:

| EAS profili | EAS ortamı | Uygulama ortamı | Build modu | Gerekli değişkenler |
|---|---|---|---|---|
| `development` | `development` | `development` | `local` | Profildeki `EXPO_PUBLIC_APP_ENV`, `NAPSAK_BUILD_MODE`; Firebase/Sentry değerleri yok |
| `preview` | `preview` | `development` | `local` | Profildeki `EXPO_PUBLIC_APP_ENV`, `NAPSAK_BUILD_MODE`; Firebase/Sentry değerleri yok |
| `production` | `production` | `production` | `connected` | Profildeki iki kimlik değeri; eksiksiz public Firebase config; `EXPO_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` |

`development` ve `preview` internal dağıtımlı standart build'lerdir. Eski `developmentClient: true` kaldırıldı: paket `expo-dev-client` içermiyor ve runbook'ta development-client build gerektiren bir kabul akışı yok. Bu profiller gömülü katalog ve yerel depolamayla çalışır. `preview` ortamına Firebase/Sentry değeri eklenirse build ön-kontrolü başarısız olur; bağlı preview için ayrı bir onaylı ortam tasarımı gerekir. Yerel Expo geliştirmesinde `.env.development` ile bağlanan development Firebase akışı bu EAS profillerinden ayrıdır. `production` profili `autoIncrement: true` kullanır. `submit.production` boş bir yerel config placeholder'ıdır ve store bağlantısı veya submission kanıtı değildir.

EAS build işçisi bağımlılıklar kurulduktan sonra `eas-build-post-install` ile `npm run check:build` çalıştırır. Kontrol `EAS_BUILD_PROFILE` ile etkin profili ve işçinin gerçek ortam değerlerini doğrular; değer bulunmaz veya profil ile çelişirse build durur. Yerel ön-kontrol için:

```bash
npm run check:build -- --profile=preview
npm run check:build -- --profile=production
```

İkinci komut yalnız yetkili production build ortamında gerekli değişkenler yüklüyken geçer. Gerçek EAS build komutları `eas build --profile preview --platform <android|ios>` ve `eas build --profile production --platform <android|ios>` biçimindedir; ilgili adlandırılmış EAS ortamının değişkenleri önceden ayrı ayrı tanımlanmalıdır. Kontrol uygulama adı, slug, owner, Android/iOS kimliği, aktif EAS proje ID'si, profil/ortam eşleşmesi, local/connected modu ve mevcut Firebase/Sentry yapılandırma doğrulamasını kapsar. Secret değerlerini yazdırmaz ve hiçbir servise bağlanmaz.

Başarılı ön-kontrol yalnız yapılandırmanın biçimini ve build niyetini kanıtlar. EAS hesabını, Firebase/Sentry servislerini, source map yüklemesini, imzalı artifact kimliğini, cihaz matrisini veya store bağlantısını canlı doğrulamaz. GitHub `Release Gate` aynı production ön-kontrolünü strict release kapısından önce çalıştırır; bu iki ayrı sonuçtan hiçbiri tek başına sekiz açık engeli kapatmaz.

Bu yapılandırma signed-build veya store kanıtı değildir. EAS build çalıştırılmadı; Android keystore, Apple certificate veya provisioning profile oluşturulmadı; Google Play ya da App Store Connect bağlantısı/submission yapılandırması yapılmadı. Bu nedenle `android_package_unverified` ve `ios_bundle_identifier_unverified` açık kalır; toplam sekiz yayın engeli değişmez.

## GitHub production ortamı

`Release Gate` elle çalıştırılır. Production environment koruması açılmalı ve şu değerler repo yerine GitHub Secrets/Variables içinde tutulmalıdır:

- Firebase public build değişkenleri
- `EXPO_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
- `NAPSAK_PRIVACY_POLICY_URL`, `NAPSAK_SUPPORT_URL`
- `NAPSAK_RESTORE_DRILL_EVIDENCE`, `NAPSAK_DEVICE_MATRIX_EVIDENCE`

GitHub production ortamındaki değerler ile EAS `production` ortamındaki değerler ayrı ayrı yönetilir; GitHub kapısının geçmesi bir EAS artifact'ına aynı değerlerin gömüldüğünü kanıtlamaz. Token, servis hesabı JSON’u, imzalama anahtarı veya kullanıcı verisi repoya yazılmaz.

## Yayın sırası

1. Sürüm commit’ini ve mağaza sürüm numarasını sabitle.
2. Katalog schema/cache namespace değiştiyse FIREBASE_RUNBOOK'taki remote dry-run preflight çıktısını incele; hard-excluded, deprecated, verification-required ve eksik/geçersiz status envanterini otomatik silme/yazma yapmadan doğrula.
3. App Quality, Security Rules, Event Operations ve Release Gate sonuçlarını kaydet.
4. İmzalı internal build’i cihaz matrisinde test et; soğuk açılış, bellek, jank ve kritik kullanıcı akışlarını ölç.
5. Production yedeğini ve son başarılı restore prova kaydını doğrula.
6. Önce küçük/staged dağıtım yap; hata oranı ve kritik akışları izle.
7. Sağlıklıysa kademeyi artır; değilse dağıtımı durdur ve aşağıdaki geri dönüşü uygula.

## Geri dönüş

- Katalog/içerik hatası: doğrulanmış önceki katalog sürümünü yeniden seed et; parity ve etkinlik sağlığını çalıştır.
- Firestore kuralı/indeks hatası: önceki sürümlenmiş kural/indeks commit’ini deploy et; emulator ve sahiplik testini tekrarla.
- Uygulama binary hatası: mağaza rollout’unu durdur; son sağlıklı binary’ye dön veya düzeltme sürümü çıkar. İmzalı eski artifact ve commit SHA kaydı korunur.
- Veri bozulması: normal uygulama akışını durdur; FIREBASE_RUNBOOK’taki ayrı recovery projesine restore prosedürünü uygula. Doğrudan production üstüne kör restore yapılmaz.

Her geri dönüşte başlangıç zamanı, tetikleyen belirti, etkilenen sürüm, karar sahibi, uygulanan commit/veri operation’ı ve kapanış kanıtı kaydedilir.
