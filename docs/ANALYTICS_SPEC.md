# N’apsak ürün analitiği sözleşmesi

## Durum

#28 sağlayıcıdan bağımsız olay sözleşmesini ve uygulama bağlantılarını kurdu. #34 şema v2'de yalnız kaba süre kovalarını ekler. Herhangi bir analytics transport'u varsayılan olarak bağlı değildir; bu nedenle bu aşamalar kullanıcı cihazından veri göndermez.

## Veri minimizasyonu

Olaylarda şunlar yasaktır:

- Firebase UID, hesap veya kalıcı cihaz/session kimliği
- ruh hâli, ilgi alanları, bütçe, kişi sayısı veya süre seçiminin değeri
- koordinat, semt, adres veya açılan URL
- mekân/etkinlik/plan/rehber kimliği ya da adı
- serbest metin
- cihaz reklam kimliği, IP saklama talebi veya otomatik ekran kaydı

Transport yalnız `createProductAnalyticsEvent` tarafından doğrulanan sürümlü olayları alabilir. Bilinmeyen property sessizce temizlenmez; geliştirici hatası olarak reddedilir.

## İzinli olaylar

| Olay | İzinli alanlar | Amaç |
|---|---|---|
| `screen_viewed` | allowlist ekran adı | Akışta nerede kayıp olduğunu görmek |
| `preference_flow_completed` | onboarding/update | Akışın tamamlanıp tamamlanmadığını ölçmek |
| `context_refresh_answered` | confirm/edit | Altı saat/yeni gün kartının işe yarayıp yaramadığını görmek |
| `recommendation_batch_viewed` | içerik filtresi, 0–5 sonuç, tetik | Boş sonuç ve yenileme kullanımını ölçmek |
| `recommendation_action` | save/unsave/dismiss/restore, tür, 1–5 sıra | Öneri kalitesini içerik kimliği toplamadan karşılaştırmak |
| `external_action` | map/source, tür | Önerinin eyleme dönüşüp dönüşmediğini görmek |
| `location_permission_result` | granted/denied/error | Konum akışındaki teknik kaybı görmek; koordinat gönderilmez |
| `performance_sampled` | app_ready/recommendation_compute, kaba süre kovası | Ham süre veya kullanıcı bağlamı olmadan performans dağılımını görmek |

## Sağlayıcı kapısı

Provider seçilmeden önce şu maddeler ayrıca onaylanır:

1. Veri bölgesi ve saklama süresi.
2. IP, cihaz kimliği, autocapture, session replay ve person profile'ın kapalı olduğu kanıt.
3. Kullanıcıya gösterilecek açıklama/izin davranışı.
4. Silme ve toplu export prosedürü.
5. Development olayının beklenen şemayla ulaştığı test.

Bu kapılar kapanmadan “canlı analitik var” denmez.
