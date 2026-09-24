# N’apsak hata gözlemi runbook

## Amaç

Üretim hatalarını sürüm ve güvenli uygulama alanıyla ilişkilendirerek görmek; kullanıcı tercihi, konum, kullanıcı kimliği, URL veya serbest metin göndermemek.

## Veri sınırı

Repository'de doğrulanan JavaScript event scrubber, uygulamanın yakaladığı Sentry olaylarından `user`, `request`, breadcrumb, extra, serbest mesaj, transaction ve fingerprint alanlarını kaldırır. Exception mesajı sabit `Application error` değerine çevrilir. Yalnız şu uygulama etiketleri kabul edilir:

- `app_area`
- `failure_code`
- `screen`
- `environment`

SDK `sendDefaultPii: false` ile başlar. Session Replay ve performans tracing bu aşamada kapalıdır. Ekran görüntüsü uygulama koduyla eklenmez ve kullanıcı UID'si uygulamanın Sentry user/context alanına verilmez. Bu repository kanıtı native SDK/envelope alanlarını, session veya installation tanımlayıcılarını, cihaz/OS metadata'sını, transport başlıklarını ya da Sentry'nin görebileceği ağ/IP bilgisini tek başına doğrulamaz. Bunlar connected-beta build ve gerçek dashboard envelope incelemesiyle ayrıca kanıtlanmalıdır.

## Ortam değişkenleri

Runtime için:

```text
EXPO_PUBLIC_SENTRY_DSN=https://PUBLIC_KEY@ORG.ingest.sentry.io/PROJECT_ID
```

Kaynak haritası yükleyen EAS/CI build ortamında ayrıca:

```text
SENTRY_ORG=organization-slug
SENTRY_PROJECT=project-slug
SENTRY_AUTH_TOKEN=secret-build-token
```

`SENTRY_AUTH_TOKEN` repoya veya `EXPO_PUBLIC_*` değişkenine yazılmaz. Sentry DSN yoksa development uygulaması hata raporlamayı kapalı tutarak çalışır. Production release kapısı DSN, organizasyon, proje ve build tokenını zorunlu tutar.

EAS `development` ve `preview` profilleri local modda Sentry yapılandırması olmadan build edilir. Ayrı `connected-beta` profili `beta` EAS ortamı, beta/development adlı Sentry projesi ve `environment=beta` olay etiketi gerektirir. Production profili `environment=production` kullanır ve beta/development adlı Sentry projesini reddeder. DSN public config olsa da hedef projeye ait olduğu yalnız canlı dashboard kanıtıyla doğrulanabilir; build preflight DSN ile proje slug'ının aynı hesaba ait olduğunu ispatlamaz. Beta ve production için ayrı Sentry projeleri kullanılmalıdır.

`app.json` içindeki `@sentry/react-native/expo` eklentisi kaynak haritası yükleme yoludur. EAS build ortamında `SENTRY_ORG`, `SENTRY_PROJECT` ve gizli `SENTRY_AUTH_TOKEN` bulunmalıdır. Expo/Sentry tarafından üretilen release ve dağıtım kimliği dashboard olayında build artifact'iyle karşılaştırılır; başarılı preflight veya eklentinin varlığı okunabilir stack ya da başarılı upload kanıtı değildir. Normal repository testleri token istemez, canlı olay göndermez.

```bash
npm run check:observability
npm run check:observability:release
npm run check:build -- --profile=connected-beta
```

## Canlı doğrulama

1. Ayrı beta ve production Sentry projeleri oluştur.
2. Beta DSN ve build sırlarını yalnız beta EAS ortamına ekle; production değerlerini ayrı tut.
3. Yeni connected-beta build üret; source map yükleme adımının başarılı olduğunu kaydet.
4. Kontrollü test hatası gönder.
5. Olayda okunabilir stack trace, doğru release/environment ve güvenli etiketleri doğrula.
6. Scrub edilen `user`, `request`, breadcrumb, tercih, konum ve UID alanlarının bulunmadığını; ayrıca native/session/device/transport/IP metadata sınırını gerçek event/envelope üzerinde kaydet.
7. Alarm eşiği, sorumlu kişi ve kapatma kaydını release runbook'una ekle.

Beta doğrulaması production Sentry kanıtı değildir. Production için ayrı DSN, release/source map ve dashboard olayı doğrulanmadan “üretim hata izleme hazır” denmez.

## Yerel hata sınırı testi

DSN olmadan yalnız kullanıcıya gösterilen güvenli render-failure ekranını doğrulamak için development sunucusu şu şekilde başlatılır:

```bash
EXPO_PUBLIC_OBSERVABILITY_TEST_MODE=true npx expo start -c
```

Ayarlar içindeki `Hata ekranını dene` düğmesi yalnız bu koşulda ve production dışı ortamda görünür. Düğme kontrollü render hatası üretir; `Yeniden dene` uygulamayı yeniden kurar. Bu test Sentry dashboard teslimini veya source map'i kanıtlamaz.
