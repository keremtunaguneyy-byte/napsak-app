# Gezek teknik devir notu

25 Kasım 2026 · Doğrulanan `main`: `aed45c1c188a29e5f7e0810fc52a7594268d4adb`

## Yeni çalışma oturumu

1. `git fetch origin` çalıştır ve `git rev-parse origin/main` ile güncel tabanı doğrula.
2. [Açık PR'ları](https://github.com/keremtunaguneyy-byte/napsak-app/pulls) ve çalışacağın PR'ın son commit'indeki GitHub Actions sonuçlarını kontrol et.
3. [Başlangıç rehberi](START_HERE.md), [durum](STATUS.md) ve [karar kayıtları](DECISIONS.md) ile bağlamı yükle.
4. Paket veya cihaz testi sonucunu kaydederken kaynak commit'i, derleme profilini, cihazı ve test sonuçlarını belirt.

## Teknik kilometre taşları

| İş | Kanıt |
|---|---|
| Etkinlik kataloğu yenilemesi | [PR #85](https://github.com/keremtunaguneyy-byte/napsak-app/pull/85) ve [uygulama raporu](EVENT_REFRESH_NOV_2026_REPORT.md) |
| Katalog yayınlama ve geri alma | [PR #86](https://github.com/keremtunaguneyy-byte/napsak-app/pull/86) ve [operatör rehberi](CATALOG_PUBLISHING_RUNBOOK.md) |
| Home L1 v2 | [PR #87](https://github.com/keremtunaguneyy-byte/napsak-app/pull/87) |
| Android çalışma zamanı yapılandırması ve katalog açılışı | [PR #88](https://github.com/keremtunaguneyy-byte/napsak-app/pull/88) · Birleştirildi · `aed45c1` |

## Android doğrulaması

Önizleme ve bağlantılı beta paketlerinin derleme profillerini kaydet. Cihaza kurulan APK'yı derleme çıktıları ve commit ile ilişkilendir. Önizleme cihaz testi ile bağlantılı Firebase kabulünün sonuçlarını ayrı kaydet. [Cihaz kabul rehberi](DEVICE_ACCEPTANCE_RUNBOOK.md) ve [yayın rehberi](RELEASE_RUNBOOK.md)

Bu devir notunu teknik kilometre taşı değiştiğinde güncelle. Güncel PR durumu için canlı GitHub kaydını kullan.
