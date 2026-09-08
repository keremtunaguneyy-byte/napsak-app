# N’apsak cihaz ve kullanıcı yolculuğu kabul sözleşmesi

Bu belge, imzalı release build hazır olmadan önce test kapsamını ve kanıt biçimini sabitler. Testin planlanması veya development build üzerinde prova edilmesi, `release_device_matrix_unverified` yayın engelini kapatmaz. Engel ancak `RELEASE_RUNBOOK.md` içindeki koşullara uygun imzalı release build, gerçek cihaz matrisi ve erişilebilir HTTPS kanıtı birlikte doğrulandığında kapanabilir.

Bu sözleşme framework'ten bağımsızdır. Repository'de belirli bir E2E framework'ü, kesin cihaz modeli veya minimum işletim sistemi sürümü kararlaştırılmamıştır; bunlar açık karardır.

## Kanıt seviyeleri

- **Otomatik sözleşme kanıtı:** Mevcut birim, regresyon, katalog, erişilebilirlik veya performans kontrolünün ilgili davranışı kod seviyesinde doğrulaması.
- **Development provası:** Expo Go, development build, simülatör veya emülatörde akışın hazırlanması ve hata ayıklanması. Release kabulü değildir.
- **Release kanıtı:** Sabit commit/build kimliğinden üretilmiş imzalı release build'in gerçek cihazda çalıştırılması ve sonuçlarının kaydedilmesi.

Bir senaryoda otomatik kontrol bulunması, gerçek arayüz ve dış uygulama davranışını kanıtlamaz. Release kanıtı istenen adımlar development provasıyla başarılı görünse bile açık kalır.

## Ortak kanıt kuralları

Her başarısızlık kaydında mümkün olan en küçük ve kişisel veri içermeyen kanıt tutulur:

- senaryo kimliği ve adım numarası,
- platform, cihaz sınıfı ve işletim sistemi,
- build türü, commit ve build kimliği,
- UTC zaman damgası,
- beklenen ve gözlenen sonuç,
- yeniden üretme adımları,
- kişisel veri veya secret içermeyen ekran görüntüsü/video,
- izin verilen hata kodu ya da temizlenmiş cihaz logu,
- varsa issue veya artifact bağlantısı.

Konum, kullanıcı tercihi, içerik kimliği, Firebase/Sentry anahtarı, token veya serbest kullanıcı verisi kanıta eklenmez. Kanıt paylaşılmadan önce log ve görseller bu alanlar açısından kontrol edilir.

## Cihaz matrisi kayıt şablonu

Her cihaz/build birleşimi için aşağıdaki kayıt doldurulur:

```yaml
platform: android | ios
device_class: low | medium | target-ios | undecided
device_model: undecided
operating_system: undecided
build_type: development-probe | signed-release
commit_sha: <40-karakter-SHA>
build_id: <imzalı-build-kimliği>
test_date_utc: <ISO-8601>
scenario_results:
  - scenario_id: J01
    result: pass | fail | blocked | not-run
evidence_or_issue_url: <HTTPS-bağlantı-veya-boş>
notes: <kişisel-veri-ve-secret-içermeyen-not>
```

`device_model`, `operating_system` ve hedef iOS kapsamı, ürün/yayın sahipleri tarafından ayrıca kararlaştırılana kadar `undecided` kalır. Development provasında build kimliği yoksa kullanılan Expo/development artifact'i açıkça belirtilir; bu kayıt release kanıtına dönüştürülmez.

## Kritik kullanıcı yolculukları

### J01 — Yeni kullanıcı onboarding

- **Ön koşul:** Yerel kullanıcı verisi bulunmayan temiz uygulama durumu.
- **Adımlar:** Uygulamayı aç; “Hadi başlayalım”ı seç; ruh hâli, ilgi, bütçe, kişi sayısı ve süre adımlarını tamamla; “Tercihlerimi kaydet ve 5 plan ver” ile ilerle.
- **Beklenen:** Adımlar doğru sırada açılır; zorunlu seçim olmadan ilgili devam eylemi etkinleşmez; tamamlanınca sonuç ekranı açılır ve kullanıcı yeniden karşılama ekranına düşmez.
- **Tür:** Manuel arayüz akışı; tercih migration ve öneri davranışının bir bölümü otomatik regresyonla desteklenir.
- **Kanıt seviyesi:** Development provası hazırlanabilir; imzalı release üzerinde yeniden yürütülmesi gerekir.
- **Cihaz/hizmet:** Development için emülatör/simülatör veya Expo Go; release için matristeki gerçek cihaz ve imzalı build. Dış servis zorunlu değildir.
- **Başarısızlık kanıtı:** Takılan adım, seçim durumu, görünen hata, temizlenmiş log ve mümkünse kısa ekran kaydı.

### J02 — Tercihlerin kaydedilmesi ve geri dönüş

- **Ön koşul:** J01 tamamlanmış ve en az bir tercih seti kaydedilmiş olmalı.
- **Adımlar:** Uygulamayı tamamen kapat; yeniden aç; sonuç ekranındaki tercih özetini kontrol et; tercihleri düzenle; uygulamayı yeniden başlat.
- **Beklenen:** İlgi alanları ve mevcut plan bağlamı korunur; düzenlenen değerler yeniden açılışta yüklenir; mevcut kullanıcı karşılama ekranına dönmez.
- **Tür:** Manuel arayüz akışı; kalıcılık ve migration kuralları otomatik testlerle desteklenir.
- **Kanıt seviyesi:** Development provası hazırlanabilir; gerçek release kalıcılığı imzalı build'de doğrulanır.
- **Cihaz/hizmet:** Yerel depolama erişimi olan test cihazı; uzaktan eşitleme bu senaryonun ön koşulu değildir.
- **Başarısızlık kanıtı:** Kapanış öncesi/sonrası değer farkı, adımlar, cihaz logu ve kişisel değerleri maskeleyen görsel.

### J03 — Öneri grubunun oluşması ve yenilenmesi

- **Ön koşul:** Tamamlanmış tercihler ve gizlenmemiş yeterli katalog içeriği.
- **Adımlar:** Sonuçları aç; beşli öneri grubunu incele; “Bana farklı şeyler göster”i seç; yeni grubu ve kaydırma konumunu kontrol et.
- **Beklenen:** Uygun içeriklerden en fazla beş sonuç oluşur; sahte kart üretilmez; sonuçlar gerekçe taşır; yenileme yeni deterministik batch üretir ve öneri bölümüne döner.
- **Tür:** Karma; uygunluk, çeşitlilik ve rotasyon otomatik testlidir, görsel grup ve kaydırma manuel doğrulanır.
- **Kanıt seviyesi:** Otomatik ve development kanıtı hazırlanabilir; release arayüzü gerçek cihazda tekrarlanır.
- **Cihaz/hizmet:** Yerel katalog yeterlidir; release kabulü için gerçek cihaz gerekir.
- **Başarısızlık kanıtı:** Sonuç sayısı, yinelenen/gerekçesiz kart, tetikleyici adım ve temizlenmiş ekran kaydı.

### J04 — İçerik türleri arasında geçiş

- **Ön koşul:** Sonuç ekranı açık.
- **Adımlar:** Sırayla N’apsak, Mekân, Etkinlik ve Fikir sekmelerini seç; her seçimden sonra başlıkları ve boş durumu incele.
- **Beklenen:** Seçili sekme görünür ve erişilebilirlik durumunda seçili olarak işaretlidir; yalnız ilgili içerik türü gösterilir; etkinlik yoksa dürüst boş durum görünür.
- **Tür:** Manuel arayüz akışı; filtreleme kuralları otomatik testlerle desteklenir.
- **Kanıt seviyesi:** Development provası hazırlanabilir; release kabulü gerçek cihazda yapılır.
- **Cihaz/hizmet:** Uygulama kataloğu; dış servis zorunlu değildir.
- **Başarısızlık kanıtı:** Seçili sekme, yanlış içerik türü/boş durum ve ilgili ekran görüntüsü.

### J05 — Detay ekranı

- **Ön koşul:** En az bir mekân sonucu görünür.
- **Adımlar:** “Mekânı incele”yi seç; detay içeriğini, geri dönüşü ve mevcut eylemleri kontrol et.
- **Beklenen:** Doğru mekân detayı açılır; uygulama içi geri dönüş çalışır; kaydetme ve harita/kaynak eylemleri erişilebilir kalır.
- **Tür:** Manuel arayüz akışı.
- **Kanıt seviyesi:** Development provası hazırlanabilir; release build'de gerçek cihaz kanıtı gerekir.
- **Cihaz/hizmet:** Detay için dış servis gerekmez; dış bağlantıyı gerçekten açmak ilgili uygulama/ağ gerektirir.
- **Başarısızlık kanıtı:** Açılan içerik, geri dönüş sonucu, hata mesajı ve ekran kaydı.

### J06 — Mekândan ilgili plana geçiş

- **Ön koşul:** `Experience.points[].placeId` ile bir plana bağlı mekân; plan gizlenmemiş, süresi dolmamış ve mevcut tercihlere uygun olmalı.
- **Adımlar:** Mekân detayını aç; “Bu mekânı kullanan N’apsak planları” bölümünden bir plan seç; plan detayını aç; mekâna dön.
- **Beklenen:** Yalnız ID ile ilişkili ve uygun planlar gösterilir; benzer başlık eşleşme sayılmaz; eşleşme yoksa bölüm gizlenir; plan ve mekân arasında geri dönüş çalışır.
- **Tür:** Karma; ilişki/uygunluk otomatik testlidir, detay geçişi manuel doğrulanır.
- **Kanıt seviyesi:** Development provası hazırlanabilir; release akışı gerçek cihazda tekrarlanır.
- **Cihaz/hizmet:** Yerel katalog; dış servis zorunlu değildir.
- **Başarısızlık kanıtı:** Mekân/plan ilişki koşulu, yanlış veya eksik bölüm, adım ve temizlenmiş görsel.

### J07 — Kaydetme ve kayıttan çıkarma

- **Ön koşul:** Kaydedilmemiş bir öneri görünür.
- **Adımlar:** Öneriyi kaydet; Kaydedilenler'e geç; içeriği aç; kayıttan çıkar; başka türlerde en az iki içeriği sırayla kaydet ve sıralamayı kontrol et.
- **Beklenen:** Kayıt anında durum değişir; bütün türler tek listede yer alır; son kaydedilen üsttedir; çıkarılan içerik listeden kalkar; yeniden kaydedilen içerik üste taşınır.
- **Tür:** Karma; kimlik/sıralama kuralları otomatik testlidir, birleşik ekran manuel doğrulanır.
- **Kanıt seviyesi:** Development provası hazırlanabilir; release kalıcılığı gerçek cihazda doğrulanır.
- **Cihaz/hizmet:** Yerel depolama; dış servis zorunlu değildir.
- **Başarısızlık kanıtı:** İşlem öncesi/sonrası sıra, görünmeyen/yanlış tür ve ekran kaydı.

### J08 — Gizleme, anlık geri alma ve Gizlenen Öneriler'den geri getirme

- **Ön koşul:** Gizlenmemiş bir öneri görünür.
- **Adımlar:** “Bana göre değil”i seç; anlık “Geri al”ı kullan; yeniden gizle; Gizlediğim öneriler ekranından tekil geri getir; tekrar gizleyip tümünü geri getir.
- **Beklenen:** Gizlenen içerik sonuç havuzundan çıkar; anlık geri alma son öğeyi geri getirir; gizlenenler ekranı tekil ve toplu geri getirmeyi destekler; boş durum gerçeği yansıtır.
- **Tür:** Karma; gizleme/geri getirme yardımcıları otomatik testlidir, bütün arayüz akışı manueldir.
- **Kanıt seviyesi:** Development provası hazırlanabilir; release cihazında yeniden doğrulanır.
- **Cihaz/hizmet:** Yerel depolama; dış servis zorunlu değildir.
- **Başarısızlık kanıtı:** Gizlenen kimliği açığa çıkarmadan kart başlığı maskelenmiş ekran, işlem sırası ve log.

### J09 — Çok duraklı Google Maps rotası

- **Ön koşul:** En az iki geçerli koordinatlı noktası olan Experience ve cihazda URL'yi karşılayabilen harita/tarayıcı.
- **Adımlar:** Experience için “Rotayı haritada aç”ı seç; açılan Google Maps rotasının başlangıç, ara durak, bitiş ve yürüyüş modunu kontrol et.
- **Beklenen:** Katalog sırası korunur; ilk nokta başlangıç, son nokta bitiş, aradakiler waypoint olur; `travelmode=walking` kullanılır.
- **Tür:** URL üretimi otomatik, gerçek dış uygulama geçişi manuel.
- **Kanıt seviyesi:** Development provası hazırlanabilir; release kanıtı imzalı build ve gerçek cihazda alınır.
- **Cihaz/hizmet:** Google Maps uygulaması veya uyumlu tarayıcı ve ağ bağlantısı.
- **Başarısızlık kanıtı:** Kişisel konum içermeyen oluşturulmuş URL, katalog durak sırası, dış uygulama sonucu ve ekran kaydı.

### J10 — Tek duraklı harita davranışı

- **Ön koşul:** Tek geçerli koordinatlı Experience ve harita/tarayıcı.
- **Adımlar:** Experience üzerindeki “Haritada aç” eylemini seç; açılan hedefi kontrol et.
- **Beklenen:** Directions yerine tek koordinat için Google Maps search URL'si açılır; çok duraklı rota etiketi gösterilmez.
- **Tür:** URL üretimi otomatik, dış uygulama geçişi manuel.
- **Kanıt seviyesi:** Development provası hazırlanabilir; release cihazında doğrulanır.
- **Cihaz/hizmet:** Google Maps veya uyumlu tarayıcı ve ağ.
- **Başarısızlık kanıtı:** Üretilen URL türü, eylem etiketi ve dış uygulama sonucu.

### J11 — Geçersiz koordinat davranışı

- **Ön koşul:** Boş, sayı olmayan veya sınır dışı koordinat içeren kontrollü test verisi.
- **Adımlar:** Harita URL üretimini otomatik testte çalıştır; arayüz provasındaki kontrollü geçersiz veri için harita eylemini dene.
- **Beklenen:** URL üretilmez; uygulama çökmez; kullanıcı “Harita açılamadı” mesajını görür.
- **Tür:** Otomatik sözleşme testi ve manuel hata akışı.
- **Kanıt seviyesi:** Otomatik/development kanıtı hazırlanabilir; kontrollü fixture release paketinde yoksa production verisi bozulmadan release provası yapılmaz.
- **Cihaz/hizmet:** Otomatik test ortamı; manuel prova için kontrollü build/fixture.
- **Başarısızlık kanıtı:** Kişisel konum içermeyen fixture, beklenmeyen URL/çökme, hata ekranı ve stack'in temizlenmiş bölümü.

### J12 — Altı saat ve gün değişimi bağlam yenilemesi

- **Ön koşul:** Onboarding tamamlanmış ve `contextConfirmedAt` bulunan kullanıcı; test saati denetlenebilir olmalı.
- **Adımlar:** Aynı yerel günde altı saat dolmadan uygulamayı aç; sonra altı saat veya daha eski doğrulama zamanı ile aç; ayrı olarak yerel takvim gününü değiştir; karttan “Aynı, devam et” ve “Güncelle” yollarını dene.
- **Beklenen:** Altı saat dolmadan doğrudan sonuçlar açılır; altı saat sonunda veya gün değişince mevcut sonuçları silmeden doğrulama kartı görünür; onay zamanı yeniler; güncelleme kısa tercih akışını açar.
- **Tür:** Zaman kuralı otomatik, arayüz ve yerel gün davranışı manuel.
- **Kanıt seviyesi:** Development provası hazırlanabilir; saat dilimi/uygulama yaşam döngüsü release cihazında doğrulanır.
- **Cihaz/hizmet:** Denetlenebilir saatli test ortamı; release için gerçek cihaz. Testte gerçek kullanıcı saatini yanıltıcı biçimde değiştirmeden fixture tercih edilir.
- **Başarısızlık kanıtı:** Saat dilimi, maskelenmiş zaman damgası, beklenen dal, görünen ekran ve temizlenmiş log.

### J13 — Ankara 101 akışları

- **Ön koşul:** Uygulama ana navigasyonu açık ve gömülü Ankara 101 içeriği erişilebilir.
- **Adımlar:** Ankara 101'i aç; Ankara Klasikleri'nde içindekiler, bölüm gezinmesi, kaydetme ve kaynak eylemlerini dene; Bir Ankaralı Gibi rotasını aç, kaydet, haritaya gönder ve geri dön; Android'de donanım geri davranışını kontrol et.
- **Beklenen:** İki editoryal yön ayrı açılır; okuma ilerlemesi ve geri gezinme çalışır; kayıtlar Kaydedilenler'e yansır; kaynak/harita açılamazsa uygulama çökmeden hata gösterir.
- **Tür:** İçerik sözleşmesinin bir bölümü otomatik, uçtan uca editoryal akış manuel.
- **Kanıt seviyesi:** Development provası hazırlanabilir; release cihazlarında görsel/geri gezinme ve dış bağlantı yeniden doğrulanır.
- **Cihaz/hizmet:** Gerçek platform geri davranışı için Android cihaz; kaynak/harita için ağ ve dış uygulama.
- **Başarısızlık kanıtı:** Alt görünüm, geri eylemi, kayıt durumu, hata mesajı ve ekran kaydı.

### J14 — Çevrimdışı ve başarısız ağ davranışı

- **Ön koşul:** Daha önce açılmış uygulama; gömülü katalog; ağ durumunu kontrollü açıp kapatabilen test ortamı.
- **Adımlar:** Ağı kapatıp uygulamayı başlat; öneri ve yerel kaydet/gizle işlemlerini dene; konum, kaynak ve harita bağlantısını dene; ağı açıp yeniden başlat.
- **Beklenen:** Gömülü katalog kullanılabilir kalır; yerel tercihler otorite olarak saklanır ve uzaktan eşitleme daha sonra yeniden denenebilir; dış bağlantı/konum başarısızlığı kullanıcıya açıklanır; uygulama çökmez veya sahte çevrimiçi başarı göstermez.
- **Tür:** Bazı fallback kuralları otomatik testli, ağ geçişi ve kullanıcı mesajları manuel.
- **Kanıt seviyesi:** Development ağ profiliyle hazırlanabilir; signed release ve gerçek cihaz/ağ geçişinde tekrarlanır.
- **Cihaz/hizmet:** Ağ kontrolü olan cihaz; production Firebase bu hazırlık PR'ında zorunlu değildir ve bağlıymış gibi gösterilmez.
- **Başarısızlık kanıtı:** Ağ profili, işlem, kullanıcı mesajı, temizlenmiş hata kodu ve tekrar çevrimiçi olma sonucu.

### J15 — Tüm kullanıcı verilerini silme

- **Ön koşul:** Tercih, kayıt ve gizlenen öğe bulunan kullanıcı; yerel-only prova ile Firebase bağlantılı prova birbirinden ayrılmalı.
- **Adımlar:** Ayarlar'dan “Tüm verilerimi sil”i seç; ilk uyarıda vazgeçmeyi doğrula; yeniden başlatıp yıkıcı onayı ver; uygulamayı kapatıp aç; uzaktaki silmenin başarısız olduğu kontrollü durumda tekrar dene.
- **Beklenen:** Vazgeçme veri değiştirmez; başarılı silme yerel v1–v5 verisini ve sync kuyruğunu temizler, kullanıcıyı welcome'a döndürür; uzak silme başarısızsa yeniden denenebilir yerel kayıt korunur; uzak veri silindikten sonraki anonim Auth hatası ayrı sonuç olarak bildirilir.
- **Tür:** Silme sırası ve hata dalları otomatik testli, ayarlar/onay/yeniden açılış manuel.
- **Kanıt seviyesi:** Yerel-only development provası hazırlanabilir; gerçek Firestore/Auth kanıtı ayrıca yapılandırılmış servis ve imzalı release cihazı gerektirir.
- **Cihaz/hizmet:** Yerel prova için dış servis yok; bağlı prova için yetkili Firebase ortamı ve test kullanıcısı gerekir.
- **Başarısızlık kanıtı:** Hangi silme aşamasının başarısız olduğu, izinli hata kodu, yeniden açılıştaki durum ve kişisel veri içermeyen ekran kaydı.

## İmzalı build öncesi hazırlık

Aşağıdakiler release artifact'i olmadan tamamlanabilir:

- J01–J15 için test verisi ve sıfırlama yöntemlerini hazırlamak.
- Mevcut otomatik testleri senaryo kimlikleriyle eşlemek.
- Development build/Expo Go üzerinde manuel adımları prova etmek.
- Cihaz matrisi ve hata kanıtı şablonlarını doldurulabilir hâle getirmek.
- Ölçüm araçlarını seçmeden önce gerekli ölçümleri ve veri alanlarını sabitlemek.
- Ağ profili, cihaz modeli, OS ve E2E framework kararlarını açık bırakmak.

Bu bölümün tamamlanması `release_device_matrix_unverified` durumunu değiştirmez.

## Yalnız imzalı release build ile kabul

Aşağıdakiler development sonucu ile kapatılamaz:

- düşük ve orta sınıf gerçek Android cihaz kabulü,
- hedef iOS cihaz kabulü,
- release yaşam döngüsü ve gerçek cihaz kalıcılığı,
- gerçek dış uygulama harita geçişleri,
- tekrarlı soğuk açılış p50/p95 ölçümü,
- bellek ve uzun liste jank/FPS kaydı,
- zayıf ağda refresh/fallback davranışı,
- yetkili ortam hazırsa gerçek Firebase/Auth veri silme kanıtı,
- aynı commit/build kimliğine bağlı, erişilebilir HTTPS sonuç paketi.

Kesin Android modelleri, hedef iOS modeli ve minimum OS sürümleri açık karardır. Karar verilene kadar matris tamamlanmış sayılamaz.

## Performans ölçüm prosedürü

### Tekrarlı soğuk açılış, p50 ve p95

1. Aynı commit'ten üretilmiş aynı imzalı build'i ve tek cihazı kullan.
2. Her örnekten önce uygulamayı işletim sistemi görevlerinden tamamen sonlandır; sıcak yeniden çizimi soğuk açılış sayma.
3. Aynı başlangıç durumu için 20 geçerli açılış ölç. Onboarding ve geri dönen kullanıcı durumlarını birbirine karıştırma.
4. Başlangıcı uygulama simgesine dokunma, bitişi kullanıcının ilk kullanılabilir ekranıyla tanımla; kullanılan ölçüm aracını kayda yaz.
5. Süreleri artan sıraya koy. En yakın sıra yöntemiyle p50 için `ceil(0.50 × n)`, p95 için `ceil(0.95 × n)` örneğini al; `n = 20` için bunlar sırasıyla 10. ve 19. örnektir.
6. Bütün ham süreleri, p50/p95'i, başarısız/atılan örneklerin gerekçesini ve cihaz/build kimliğini artifact'te sakla.

Repository'de release açılışı için sayısal başarı bütçesi yoktur; sonuç kaydedilir, eşik uydurulmaz. `check:performance` içindeki 25 ms p95 bütçesi yalnız saf öneri motoru CI benchmarkıdır ve cihaz açılışıyla karşılaştırılmaz.

### Bellek kullanımı

1. Platformun profiler aracını ve sürümünü kaydet.
2. Aynı imzalı build'de ilk kullanılabilir ekran, sonuç listesi, detay, Kaydedilenler ve Ankara 101 uzun içerik duraklarında bellek örneği al.
3. Her durakta yerleşmesi için kullanılan bekleme koşulunu kaydet; yalnız rastgele tek tepe değerini raporlama.
4. Başlangıç/kararlı/tepe değerlerini MB cinsinden cihaz ve build kaydına bağla.
5. Ekranlar arasında tekrarlı gezinme sonrası belleğin sürekli büyüyüp büyümediğini gözle ve profiler artifact'ini ilişkilendir.

Repository'de MB cinsinden kabul eşiği yoktur; eşik ayrıca kararlaştırılmadan geçme iddiası yazılmaz.

### Uzun liste jank/FPS

1. Sonuçlar, Kaydedilenler veya Ankara 101 içinde test edilebilen en uzun mevcut listeyi ve öğe sayısını kaydet.
2. Aynı yönde baştan sona ve sona geri en az üç kaydırma geçişi yap.
3. Platform profiler'ından FPS/frame-time ve janky frame çıktısını artifact olarak sakla.
4. Kaydırma sırasında görsel sıçrama, dokunma kaybı veya uzun bloklanmayı senaryo sonucu olarak ayrıca kaydet.

Repository'de FPS veya jank için sayısal geçiş eşiği yoktur; sonuçlar ölçülür, release kararı için sonradan onaylanacak bütçeye bırakılır.

### Zayıf ağ davranışı

1. Kullanılan ağ profilinin bant genişliği, gecikme, paket kaybı ve bağlantı kesme biçimini kaydet; repository varsayılan değer sağlamaz.
2. Uygulama açılışı, katalog refresh, konum, kaynak/harita bağlantısı ve varsa uzaktan tercih eşitlemesini ayrı ölç.
3. Gömülü katalog fallback'inin kullanılabilir kaldığını ve başarısız dış işlemin sahte başarı üretmediğini doğrula.
4. Ağ geri geldiğinde uygulamayı yeniden açıp katalog ve yerel tercihin korunmasını kontrol et.
5. Refresh süresi ve gözlenen fallback sonucunu kaydet; production Firebase yoksa development sonucu production kanıtı sayma.

Repository'de zayıf ağ profili veya kabul eşiği belirlenmemiştir; profil ve sonuç kanıtta açıkça yazılır.

## PR ve yayın kapısı doğrulaması

Bu sözleşmeyi değiştiren PR'da en az şu kontroller yürütülür:

```text
git diff --check
npm run typecheck
npm test
npm run check:release
```

`npm run check:release`, bilinen dokuz açık engelin değişmediğini doğrulamalıdır. Production girdileri ve dış kanıtlar bulunmadığı sürece `npm run check:release:strict` başarısız kalmalıdır; bu sözleşme strict kapıyı geçirmeye çalışmaz.

App Quality sonucu PR üzerinde kaydedilir. Yalnız doküman değişiklikleri Security Rules path filtresini tetiklemeyebilir; bu durum Rules kanıtını değiştirmez.
