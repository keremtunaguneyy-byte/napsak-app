# N’apsak Firebase Runbook

Bu belge Firebase veri omurgasının geliştirme, production, seed, migration, maliyet sınırı ve backup sözleşmesidir.

## Ortamlar

Development ve production iki ayrı Firebase projesidir. Aynı Firestore veritabanını iki ortam için kullanmayız.

1. Firebase Console’da iki proje oluştur: `napsak-dev` ve `napsak-production` benzeri iki ayrı proje.
2. İkisinde de Authentication > Sign-in method altında **Anonymous** sağlayıcısını aç.
3. Cloud Firestore veritabanını oluştur.
4. Her projede bir Web app kaydı oluştur ve public config değerlerini ilgili `.env.*.example` dosyasından oluşturacağın yerel env dosyasına koy.
5. Service account/private key hiçbir zaman `EXPO_PUBLIC_*` değişkenine veya mobil bundle’a konmaz.

Uygulama Firebase env’i yoksa paket içindeki katalog + AsyncStorage ile çalışmaya devam eder. Firebase env’i varsa anonim Auth açılır ve remote repository/cache katmanı devreye girer.

## Firestore veri sözleşmesi

| Yol | Amaç | Mobil okuma | Mobil yazma |
|---|---|---|---|
| `cities/{cityId}` | Şehir metadata | Auth gerekli | Hayır |
| `catalogMeta/{cityId}` | Schema/catalog sürümü | Auth gerekli | Hayır |
| `places/{id}` | Mekân kataloğu | Auth gerekli | Hayır |
| `experiences/{id}` | Mikro plan kataloğu | Auth gerekli | Hayır |
| `events/{id}` | Tarihli etkinlik | Auth gerekli | Hayır |
| `ideas/{id}` | Şehirden bağımsız evergreen fikir | Auth gerekli | Hayır |
| `users/{uid}` | Kaydet/gizle/kalıcı ilgiler | Yalnız sahibi | Yalnız sahibi |

Katalog yazıları yalnız güvenilir seed/admin pipeline’ından gelir. Mobil istemci katalog belgesi yazamaz.

## Okuma ve maliyet sınırları

Her açılışta tüm katalog indirilmez. Akış:

1. APK içindeki katalog anında kullanılabilir.
2. Geçerli AsyncStorage cache varsa o kullanılabilir.
3. Remote `catalogMeta/{cityId}` tek belge olarak kontrol edilir.
4. `catalogVersion` değişmediyse koleksiyonlar tekrar okunmaz.
5. Değiştiyse yalnız aktif şehir dilimi yenilenir ve runtime validation’dan geçen snapshot cache’e alınır.

Tek refresh için istemci güvenlik sınırları:

- places: en fazla 1.500 + taşma kontrol belgesi,
- experiences: 500 + taşma kontrol belgesi,
- events: 500 + taşma kontrol belgesi,
- global ideas: 250 + taşma kontrol belgesi.

Sınır aşılırsa pahalı/kontrolsüz indirme yapmak yerine refresh hata verir ve son sağlam cache/embedded katalog korunur. Katalog büyüdüğünde bu limitleri yükseltmek yerine bölgesel/geohash sayfalama tasarlanmalıdır.

## Offline ve kullanıcı senkronizasyonu

Firestore JS SDK’nın React Native’de kalıcı Firestore persistence’ına güvenilmez. Katalog cache’i uygulamaya aittir.

Kaydet/gizle/ilgi değişikliği önce cihazda yazılır. Remote sync için tam ve idempotent kullanıcı snapshot’ı tek AsyncStorage queue kaydına coalesce edilir. Ağ hatasında queue silinmez; sonraki değişiklik/launch tekrar dener.

Eski cihaz ilk kez anonim Firebase kimliği aldığında remote kullanıcı belgesi yoksa mevcut `saved`, `dismissed` ve kalıcı `interests` bir kere remote’a taşınır. Cihaz verisi bu işlem başarısız olduğunda kaybolmaz.

## Lokal doğrulama

```bash
npm run typecheck
npm test
npm run test:stress
npm run test:catalog
npm run test:rules
```

`test:rules`, Java ve Firebase Firestore emulator binary’si gerektirir. İlk çalıştırmada Firebase CLI emulator bileşenini indirebilir.

## Seed

Dry-run varsayılandır ve credential istemez:

```bash
npm run seed:catalog
```

Development’a gerçek yazım:

```bash
npm run seed:catalog -- --apply --environment=development --project=YOUR_DEV_PROJECT
```

Production ayrıca proje kimliğini ikinci kez açıkça doğrulamayı zorunlu kılar:

```bash
npm run seed:catalog -- --apply --environment=production --project=YOUR_PROD_PROJECT --confirm-production=YOUR_PROD_PROJECT
```

Seed mevcut ID’leri upsert eder; katalogdan kaldırılmış uzak belgeleri otomatik silmez.

## Migration

Migration önce plan üretir. `--apply` verilmedikçe veri değiştirmez. İlk migration eski Ankara katalog belgelerinde eksik `cityId` alanını yalnız mevcut editoryal katalogda tanınan ID’ler için tamamlayabilir.

```bash
npm run migrate:catalog -- --project=YOUR_DEV_PROJECT
npm run migrate:catalog -- --project=YOUR_DEV_PROJECT --apply
```

Production apply, seed gibi `--confirm-production=<projectId>` gerektirir.

## Local / Firestore parity

Lokal sözleşme:

```bash
npm run test:catalog
```

Seed sonrası remote ID parity:

```bash
npm run test:catalog -- --project=YOUR_DEV_PROJECT
```

## Rules deploy

Önce emulator testi, sonra açık proje ID’siyle deploy:

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes --project YOUR_DEV_PROJECT
```

Production deploy aynı dosyaları kullanır fakat hedef proje ID’si açık verilmelidir.

## Backup / export hazırlığı

Production katalog migration/seed operasyonundan önce Firestore managed export alınmalıdır. Bucket ve retention politikası production kurulurken belirlenir. Örnek operasyon:

```bash
gcloud firestore export gs://YOUR_BACKUP_BUCKET/firestore/YYYY-MM-DD --project=YOUR_PROD_PROJECT
```

Export konumu, işlem zamanı ve ilgili katalog sürümü release kaydına yazılır. Restore işlemi otomatik script değildir; yanlış projeye geri yükleme riskini azaltmak için bilinçli operasyon olarak tutulur.

## Sonraki sertleştirme

- App Check önce development/monitoring modunda doğrulanacak, sonra enforcement açılacak.
- Hata/okuma telemetrisi eklendiğinde `catalogMeta` check sayısı, tam refresh sayısı, fallback oranı ve kullanıcı başına belge okuması izlenecek.
- İstanbul veya daha büyük katalogda geohash/bölgesel aday daraltma eklenmeden istemci read limitleri körlemesine yükseltilmeyecek.
