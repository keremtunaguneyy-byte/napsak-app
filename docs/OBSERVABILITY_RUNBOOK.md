# N’apsak hata gözlemi runbook

## Amaç

Üretim hatalarını sürüm ve güvenli uygulama alanıyla ilişkilendirerek görmek; kullanıcı tercihi, konum, kullanıcı kimliği, URL veya serbest metin göndermemek.

## Veri sınırı

Sentry olaylarında `user`, `request`, breadcrumb, extra, serbest mesaj, transaction ve fingerprint gönderilmez. Exception mesajı sabit `Application error` değerine çevrilir. Yalnız şu uygulama etiketleri kabul edilir:

- `app_area`
- `failure_code`
- `screen`
- `environment`

SDK `sendDefaultPii: false` ile başlar. Session Replay ve performans tracing bu aşamada kapalıdır. Ekran görüntüsü eklenmez. Kullanıcı UID'si Sentry'ye hiçbir zaman verilmez.

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

`SENTRY_AUTH_TOKEN` repoya veya `EXPO_PUBLIC_*` değişkenine yazılmaz. Sentry DSN yoksa development uygulaması hata raporlamayı kapalı tutarak çalışır. Production release kapısı DSN, organizasyon, proje ve build tokenını zorunlu tutar:

```bash
npm run check:observability
npm run check:observability:release
```

## Canlı doğrulama

1. Ayrı development Sentry projesi oluştur.
2. Development DSN ve build sırlarını EAS ortamına ekle.
3. Yeni development build üret; source map yükleme adımının başarılı olduğunu kaydet.
4. Kontrollü test hatası gönder.
5. Olayda okunabilir stack trace, doğru release/environment ve güvenli etiketleri doğrula.
6. `user`, `request`, breadcrumb, tercih, konum ve UID bulunmadığını doğrula.
7. Alarm eşiği, sorumlu kişi ve kapatma kaydını release runbook'una ekle.

Bu canlı doğrulama tamamlanmadan “üretim hata izleme hazır” denmez.
