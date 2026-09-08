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

### Yapılandırma ön-kontrolü

Public Firebase yapılandırması ya tamamen boş ya da eksiksiz olmalıdır. Development'ta tamamen boş yapılandırma bilinçli yerel modu açar. Şunlar hata kabul edilir:

- yalnız bazı zorunlu Firebase değerlerinin verilmesi,
- example/placeholder değerlerinin bırakılması,
- `EXPO_PUBLIC_APP_ENV` için development/production dışında değer,
- geçersiz emulator `host:port` biçimi,
- Firebase ana değerleri olmadan yalnız emulator adresi,
- production'da eksik Firebase yapılandırması,
- production'da emulator adresi veya development/test görünümlü proje ID'si.

Aktif kabuk/env değerlerini secret yazdırmadan kontrol et:

```bash
npm run check:firebase
npm run check:firebase -- --require-firebase
```

İkinci komut development'ta bile yerel modu kabul etmez. Production paketleme hattı `EXPO_PUBLIC_APP_ENV=production` ile bu kapıyı geçmeden çalıştırılmamalıdır. Çıktı yalnız ortam, çalışma modu, proje ID'si ve emulator hedefini gösterir; API key yazdırılmaz.

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
npm run check:firebase
```

`test:rules`, Java ve Firebase Firestore emulator binary’si gerektirir. İlk çalıştırmada Firebase CLI emulator bileşenini indirebilir.

### Security Rules CI

`.github/workflows/security-rules.yml`, Rules veya ilgili test/bağımlılık dosyaları değiştiğinde Firestore emulator testini GitHub Actions üzerinde çalıştırır. İş akışı:

- yalnız `contents: read` izni kullanır,
- Node 24 ve Temurin Java 21 kurar,
- `npm ci` ile kilit dosyasındaki bağımlılıkları yükler,
- `npm run test:rules` çalıştırır,
- aynı ref için eski çalışmayı iptal eder ve 10 dakikada zaman aşımına uğrar.

Checkout, Node ve Java action’ları hareketli major etiketlerine değil, doğrulanan release commit SHA’larına sabitlenmiştir. Dependabot veya bilinçli bakım PR’ı olmadan bu SHA’lar değiştirilmemelidir.

Rules kullanıcı belgesinde yalnız sözleşmedeki alanları kabul eder. İlgi alanları allowlist ile sınırlıdır; kayıt, gizleme ve ilgi listelerinde tekrar bulunamaz; aynı ID hem kayıtlı hem gizli olamaz. `updatedAt` istemcinin seçtiği tarih değil `request.time` olmalıdır. Kullanıcı yalnız kendi belgesini okuyabilir, yazabilir ve silebilir.

## Kullanıcı verisini silme

Uygulama içindeki Ayarlar ekranı silmeyi yalnız açık kullanıcı onayından sonra başlatır. Sıra bilinçlidir:

1. Firebase bağlı ve anonim kullanıcı mevcutsa yalnız `users/{uid}` belgesi silinir.
2. Uzak silme başarılıysa preference v1–v5 anahtarları ve bekleyen user-sync snapshot'ı cihazdan kaldırılır.
3. Anonim Firebase Authentication hesabı best-effort silinir.
4. Uygulama state'i ilk kullanım durumuna döner.

Uzak belge silme başarısızsa yerel snapshot tekrar deneme için korunur. Auth hesabı silme ayrı sonuçtur; başarısızlığı Firestore ve cihaz verisinin silindiği gerçeğini değiştirmez fakat kullanıcıya açıkça bildirilir. Katalog cache'i ortak içeriktir, kullanıcı verisi silme kapsamına girmez.

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

## Backup / export ve restore provası

Firestore managed export/import için billing açık olmalı ve Firebase projesi Blaze planında bulunmalıdır. Bucket Firestore veritabanına yakın bir konumda olmalı; Requester Pays veya Rapid bucket kullanılamaz. Firestore service agent'ın bucket erişimi ayrıca doğrulanır. Export belge başına read, import belge başına write ve Cloud Storage saklama maliyeti doğurur.

### Production export

Komutlar varsayılan olarak dry-run'dır ve `gcloud` ya da credential istemez:

```bash
npm run backup:firestore -- \
  --project=YOUR_PROD_PROJECT \
  --bucket=gs://YOUR_BACKUP_BUCKET \
  --timestamp=2026-09-08T01:02:03Z
```

Gerçek export iki hedefin de birebir onayını ister:

```bash
npm run backup:firestore -- \
  --project=YOUR_PROD_PROJECT \
  --bucket=gs://YOUR_BACKUP_BUCKET \
  --confirm-production=YOUR_PROD_PROJECT \
  --confirm-bucket=gs://YOUR_BACKUP_BUCKET \
  --apply
```

Çıktı `gs://BUCKET/firestore/PROJECT/TIMESTAMP` biçiminde proje ve zamana göre ayrılır. `--async` kullanılmadığı için `gcloud` komutu operasyon tamamlanana kadar bekler. Terminal kapanırsa operasyon iptal olmaz; durum `gcloud firestore operations list --project=PROJECT` ve `gcloud firestore operations describe OPERATION --project=PROJECT` ile kontrol edilir.

### Ayrı recovery projesine restore

Import aynı kimlikteki belgelerin üstüne yazabilir ve exportta olmayan mevcut belgeleri silmez. Bu nedenle script production hedefini kabul etmez; restore yalnız boş, ayrı ve atılabilir bir recovery projesine yapılır.

Dry-run:

```bash
npm run restore:firestore -- \
  --source-project=YOUR_PROD_PROJECT \
  --target-project=YOUR_RECOVERY_PROJECT \
  --target-environment=recovery \
  --source=gs://YOUR_BACKUP_BUCKET/firestore/YOUR_PROD_PROJECT/EXPORT_PREFIX
```

Gerçek import, hedef proje ID'si ve boş hedef ifadesini ayrı ayrı ister:

```bash
npm run restore:firestore -- \
  --source-project=YOUR_PROD_PROJECT \
  --target-project=YOUR_RECOVERY_PROJECT \
  --target-environment=recovery \
  --source=gs://YOUR_BACKUP_BUCKET/firestore/YOUR_PROD_PROJECT/EXPORT_PREFIX \
  --confirm-target=YOUR_RECOVERY_PROJECT \
  --confirm-empty-target=EMPTY_RECOVERY_TARGET_YOUR_RECOVERY_PROJECT \
  --apply
```

Import tamamlandıktan sonra Rules/index tanımları ayrıca deploy edilir; export indeks tanımlarını taşımaz. Katalog `npm run test:catalog -- --project=YOUR_RECOVERY_PROJECT` ile karşılaştırılır. Kullanıcı belgesi sayısı ve örnek sahibine erişim, kişisel alanları loglamadan admin doğrulamasıyla kontrol edilir. Restore provası ancak operation success, katalog parity ve bu kullanıcı-verisi kontrolü birlikte release kaydına işlendiğinde tamamlanmış sayılır.

### Kanıt kaydı

Her export/restore kaydında tarih, kaynak proje, hedef recovery proje, GCS prefix, operation adı/sonucu, katalog sürümü ve doğrulayan kişi bulunur. Secret, service-account anahtarı veya kullanıcı belgesi içeriği repoya yazılmaz. En az bir farklı proje restore provası yapılmadan “yedek sistemi doğrulandı” denmez.

## Sonraki sertleştirme

- App Check önce development/monitoring modunda doğrulanacak, sonra enforcement açılacak.
- Hata/okuma telemetrisi eklendiğinde `catalogMeta` check sayısı, tam refresh sayısı, fallback oranı ve kullanıcı başına belge okuması izlenecek.
- İstanbul veya daha büyük katalogda geohash/bölgesel aday daraltma eklenmeden istemci read limitleri körlemesine yükseltilmeyecek.
