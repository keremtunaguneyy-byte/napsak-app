# Etkinlik katalog operasyonu

Bu runbook, Ankara etkinlik kataloğunun kullanıcıya güncel ve dürüst öneriler sunması için gereken düzenli kontrolü tanımlar.

## İki ayrı güvenlik katmanı

1. Uygulama çalışma anında `startsAt` zamanı geçmiş etkinlikleri sonuçlardan eler. Güncel kayıt kalmazsa sahte etkinlik üretmez.
2. `Event Catalog Health` GitHub Actions işi her gün 07:15 Türkiye saatinde kataloğun yenilenmesi gerekip gerekmediğini kontrol eder.

İkinci katmanın başarısız olması, geçmiş etkinliğin kullanıcıya gösterildiği anlamına gelmez. İçerik ekibine yenileme gerektiğini bildirir.

## Sağlıklı katalog ölçütleri

- En az 5 yaklaşan etkinlik bulunur; bu sayı bir tam öneri grubunu besler.
- En ileri tarihli yaklaşan etkinlik en az 7 gün sonradır.
- Her kaynağın `verifiedAt` tarihi en fazla 7 gün eskidir.
- `startsAt` ISO tarih-saatleri ve `verifiedAt` `YYYY-MM-DD` değerleri geçerlidir.
- Gelecekteymiş gibi yazılmış doğrulama tarihi kabul edilmez.

Yerelde çalıştırma:

```bash
npm run check:events
```

## Kontrol başarısız olursa

1. Actions özetindeki sorun koduna bak.
2. `src/data/events.ts` içindeki kaynak bağlantılarını tek tek aç.
3. Tarih, saat, mekân, fiyat notu ve etkinliğin hâlâ satışta/yayında olduğunu kaynaktan doğrula.
4. Geçersiz veya geçmiş kayıtları sil; yeni doğrulanmış kayıtları ekle.
5. Yalnız gerçekten yeniden kontrol edilen kayıtlarda `verifiedAt` değerini değiştir.
6. `npm run check:events`, `npm test`, `npm run test:catalog` ve `npm run typecheck` çalıştır.
7. Değişikliği normal PR ve inceleme süreciyle yayınla.

Otomasyon internetten etkinlik kazıyıp kendi başına “doğru” ilan etmez. Kaynak sayfasının içeriği insan tarafından doğrulanır; otomasyon envanter, tarih ve doğrulama yaşını denetler.

## Sorun kodları

| Kod | Anlamı |
|---|---|
| `no_upcoming_events` | Yaklaşan etkinlik kalmadı |
| `insufficient_upcoming_events` | Bir beşli öneri grubunu dolduracak kayıt yok |
| `short_catalog_horizon` | Son etkinlik 7 günden daha yakın |
| `stale_verification` | Kaynak doğrulaması 7 günden eski |
| `invalid_start` | Etkinlik başlangıç zamanı geçersiz |
| `invalid_verification` | Doğrulama tarihi geçersiz |
| `future_verification` | Doğrulama tarihi gelecekte |

## Sınırlama

Başarılı otomatik kontrol, kaynak sayfasının o dakika erişilebilir olduğunu veya etkinliğin iptal edilmediğini kanıtlamaz. Düzenli kaynak doğrulamasının yerine geçmez; ne zaman yapılması gerektiğini görünür kılar.
