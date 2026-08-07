# N’apsak Product Spec ve Karar Günlüğü

**Sürüm:** 0.1

**Tarih:** 8 Ağustos 2026

**Durum:** Yaşayan doküman — mevcut kararların ilk konsolidasyonu
**Hedef konum:** Repo içinde `docs/PRODUCT_SPEC.md`

## 1. Bu dokümanın amacı

Bu dosya N’apsak’ın yalnızca ne yaptığını değil, ürün kararlarının **nedenini** kaydeder. Ürün sahibi, ChatGPT ve Codex aynı kurallara bakarak çalışmalıdır.

Bu dosyada üç karar statüsü kullanılır:

- **Kararlaştırıldı:** Yeni bir ürün kararı alınmadan değiştirilemez.
- **MVP kararı:** İlk sürüm için geçerlidir; kullanım verisi ve geri bildirimle değişebilir.
- **Açık soru:** Uygulamayı geliştiren agent kendi başına karar veremez; ürün görüşmesi gerekir.

Kod ile bu doküman çelişirse çelişki PR incelemesinde açıkça belirtilir. Agent sessizce dokümanı veya davranışı değiştiremez.

## 2. Ürün özeti

### 2.1 Tek cümlelik tanım — Kararlaştırıldı

N’apsak, “Bugün ne yapsak?” kararsızlığını kullanıcının ruh hâli, ilgi alanı, bütçesi, kişi sayısı, zamanı ve konumuna göre kısa sürede uygulanabilir önerilere dönüştüren; Ankara’dan başlayan mobil keşif ve planlama uygulamasıdır.

### 2.2 Çözülen problem — Kararlaştırıldı

Kullanıcının temel sorunu seçenek yokluğu değildir. İnternette binlerce mekân ve etkinlik vardır. Sorun:

- seçenek fazlalığı,
- neyin o ana uygun olduğunu bilememe,
- farklı sitelerde araştırma yapma zorunluluğu,
- “mekân buldum ama orada ne yapacağım?” boşluğu,
- grup içinde karar verememe,
- güncel olmayan veya güvenilmez bilgi,
- aynı popüler önerilerin tekrar tekrar gösterilmesidir.

N’apsak bir listeleme uygulaması olmamalıdır. Kullanıcıya araştırma yaptırmak yerine kararı küçültmeli ve eyleme geçirilebilir hâle getirmelidir.

### 2.3 Temel değer önerisi — Kararlaştırıldı

Kullanıcı 60 saniyeden kısa sürede şu üç cevabı alabilmelidir:

1. Ne yapalım?
2. Neden bu öneri bize uygun?
3. Şimdi nasıl başlayabiliriz?

## 3. Ürünün farkı

### 3.1 N’apsak ne değildir — Kararlaştırıldı

- Yalnızca Google Maps benzeri bir mekân listesi değildir.
- Yalnızca etkinlik bileti kataloğu değildir.
- Sonsuz kaydırmalı sosyal medya akışı değildir.
- Kullanıcıdan onlarca filtre doldurmasını isteyen bir arama formu değildir.
- Editoryal doğrulama olmadan internetten içerik toplayan bir öneri motoru değildir.

### 3.2 N’apsak’ın savunulabilir farkı — Kararlaştırıldı

Uygulamanın asıl farkı tek bir mekân önermekten çok, bağlama uygun **mikro planlar/Experience’lar** kurmasıdır. Örneğin yalnızca “Erimtan Müzesi” demek yerine “Erimtan → Ankara Kalesi yürüyüşü” gibi süre, sıra, bağlam ve gerekçe içeren uygulanabilir bir deneyim önerir.

Öneri kalitesi şu birleşimden doğar:

- kişisel bağlam,
- anlık plan bağlamı,
- editoryal seçki,
- doğrulanmış yer/etkinlik bilgisi,
- açıklanabilir sıralama,
- çeşitlilik ve tekrar önleme.

## 4. İçerik katmanları

### 4.1 Üst seçici — Kararlaştırıldı

Ana öneri alanındaki içerik sırası:

`N’apsak · Mekân · Etkinlik · Fikir`

`N’apsak` varsayılan seçenektir.

### 4.2 N’apsak / Experience — Kararlaştırıldı

Bir veya daha fazla noktayı, eylemi veya sırayı birleştiren uygulanabilir mikro plandır. Şunları içerebilir:

- kısa rota,
- kültür planı,
- kahve + yürüyüş,
- spor + dinlenme,
- gün batımı planı,
- belirli sürede yapılabilecek bir semt keşfi.

Experience yalnızca iki mekânı yan yana yazmak değildir. Planın neden birlikte anlamlı olduğu, tahmini süresi, bütçesi ve uygulanabilirlik koşulları bulunmalıdır.

### 4.3 Mekân — Kararlaştırıldı

Tekil ve gidilebilir bir yerdir: kafe, park, müze, restoran, spor alanı vb. Kullanıcı belirli bir yer aramak veya yalnızca mekân görmek istediğinde kullanılır.

### 4.4 Etkinlik — Kararlaştırıldı

Belirli tarih/saat veya dönemle sınırlı; çoğu zaman bilet, kayıt veya program bilgisi gerektiren içeriktir. Süresi geçen etkinlik gösterilmez. Kaynak ve son doğrulama bilgisi zorunludur.

### 4.5 Fikir — Kararlaştırıldı

Belirli bir işletmeye veya canlı programa bağlı olmak zorunda olmayan yapılabilir aktivite fikridir. Örneğin evde temalı film gecesi veya fotoğraf yürüyüşü gibi zamansız öneriler bu katmanda bulunabilir.

### 4.6 Ankara 101 — Gelecek kapsam / Kararlaştırıldı

Şehrin zamansız ve temel deneyimlerini sunan ayrı bir editoryal sınıf olacaktır. Experience, etkinlik veya mekân akışını kalabalıklaştırmadan daha sonra geliştirilecektir.

## 5. Kullanıcı bağlamı ve tercihler

### 5.1 Kalıcı tercihler — Kararlaştırıldı

- İlgi alanları kalıcı profil tercihidir.
- Kullanıcı bunları daha sonra düzenleyebilmelidir.
- Eski kullanıcıların kayıtları sürüm değişikliklerinde kaybolmamalıdır.

### 5.2 Anlık plan bağlamı — Kararlaştırıldı

Aşağıdakiler kullanıcının değişmez profili sayılmaz; mevcut “bugün ne yapacağız?” oturumuna aittir:

- ruh hâli,
- bütçe,
- kişi sayısı,
- konum,
- kullanılabilir süre.

Bu değerler teknik olarak kolaylık için cihazda tutulsa bile ürün anlamında kalıcı kişilik özelliği gibi yorumlanmamalıdır.

### 5.3 Mevcut seçenekler — MVP kararı

Ruh hâli:

- Enerjik
- Sakin
- Sosyal
- Meraklı

İlgi alanları:

- Kahve
- Sanat
- Doğa
- Lezzet
- Etkinlik

Bütçe:

- Ücretsiz
- ₺
- ₺₺
- ₺₺₺
- Fark etmez

Kişi sayısı:

- Tek
- 2 kişi
- 3–4 kişi
- 5+

Süre:

- 30–60 dk
- 1–2 saat
- 3–4 saat
- Yarım gün
- Fark etmez

### 5.4 Onboarding ilkesi — Kararlaştırıldı

- Akış kısa, açık ve adımlı olmalıdır.
- Yeni alan eklenmesi eski kullanıcıların onboarding’ini kendiliğinden sıfırlamamalıdır.
- Veri şeması sürümlenmeli ve geriye uyumlu migration içermelidir.
- Kullanıcı sonuç ekranından anlık tercihlerini kolayca değiştirebilmelidir.

## 6. Öneri motoru ilkeleri

### 6.1 Uygunluk önce, sıralama sonra — Kararlaştırıldı

Bir içerik önce gösterilmeye **uygun** olmalıdır. Uygun olmayan içerik yüksek editoryal puanla kurtarılamaz.

Hard filter örnekleri:

- seçili ilgi alanıyla hiç eşleşmeme,
- kullanıcının “Bana göre değil” diyerek gizlemesi,
- süresi dolmuş etkinlik/canlı deneyim,
- seçilen süreye sığmayan Experience.

### 6.2 Süre filtresi — Kararlaştırıldı

- `30–60 dk`: maksimum süresi 60 dakikayı aşan planlar elenir.
- `1–2 saat`: seçilen aralığa sığmayan planlar elenir.
- `3–4 saat` ve `Yarım gün`: daha uzun rotaları açar.
- `Fark etmez`: süre nedeniyle eleme yapmaz.

Süre yalnızca küçük bir skor bonusu değildir; gerçek uygunluk kapısıdır.

### 6.3 Sıralama sinyalleri — Kararlaştırıldı

Uygun adaylar arasında en az şu sinyaller değerlendirilir:

- ruh hâli uyumu,
- ilgi alanı uyumu,
- kişi sayısı,
- bütçe,
- mesafe,
- kullanılabilir süre,
- editoryal kalite,
- kaynak güveni,
- güncellik,
- yenilik ve çeşitlilik.

Skorların ağırlıkları uygulama verisi olmadan “nihai doğrular” değildir. Ağırlıklar MVP kararıdır ve test/analitik verisiyle ayarlanmalıdır.

### 6.4 Çeşitlilik — Kararlaştırıldı

- Aynı sonuç grubu içinde kategori ve ilçe yığılması azaltılmalıdır.
- “Bana farklı şeyler göster” yeni ve tekrarsız bir grup üretmelidir.
- Davranış test edilebilir olması için deterministik seed mantığını desteklemelidir.
- Sonuç havuzu küçükse boş ekran yerine kontrollü fallback kullanılabilir.

### 6.5 Açıklanabilirlik — Kararlaştırıldı

Her öneri, kullanıcıya kısa bir “neden sana uygun” gerekçesi göstermelidir. Sistem yalnızca puan üretmemeli; puanın anlamını kullanıcı diline çevirmelidir.

## 7. Experience veri kalitesi

### 7.1 Asgari veri sözleşmesi — Kararlaştırıldı

Bir Experience mümkün olduğunca şunları taşımalıdır:

- benzersiz kimlik,
- başlık,
- kısa eylem odaklı açıklama,
- bağlı noktalar,
- deneyim türü,
- ruh hâli ve ilgi etiketleri,
- uygun kişi sayısı,
- minimum/maksimum süre,
- fiyat seviyesi,
- ilçe ve koordinatlar,
- uygun gün/saat,
- hava koşulu,
- rezervasyon gereksinimi,
- kaynak URL’si,
- son doğrulama tarihi,
- gerekiyorsa bitiş tarihi,
- güven skoru,
- editoryal skor.

### 7.2 Yaşam döngüsü — Kararlaştırıldı

- `evergreen`: kalıcı/zamansız.
- `seasonal`: dönemsel; geçerlilik kontrolü gerekir.
- `live`: kısa süreli ve güncel; bitiş zamanı zorunlu olmalıdır.

Süresi dolmuş `seasonal` veya `live` içerik sonuçlara giremez.

### 7.3 Kaynak politikası — Kararlaştırıldı

- Öncelik kurumların resmî siteleri, belediye ve güvenilir birincil kaynaklardır.
- Sosyal medya söylentisiyle özellik, saat, fiyat veya “gizli detay” uydurulamaz.
- Kaynağın yalnız mekânın varlığını doğrulaması, önerilen rotadaki tüm iddiaları otomatik doğrulamaz.
- Değişken bilgiler statik katalogda sonsuza kadar doğru kabul edilmez.

## 8. Temel kullanıcı davranışları

### 8.1 Kaydetme — Kararlaştırıldı

Kullanıcı öneriyi kaydedebilir, kaydedilenlerden çıkarabilir ve haritada açabilir. Eski veya artık katalogda bulunmayan kimlikler uygulamayı bozmadan yok sayılmalıdır.

### 8.2 “Bana göre değil” — Kararlaştırıldı

- Öneriyi sonuç havuzundan kalıcı olarak gizler.
- İşlemden hemen sonra “Geri al” sunulur.
- Kullanıcının daha sonra gizlediklerini görebileceği ayrı bir “Gizlediğim öneriler” ekranı bulunmalıdır.

### 8.3 Yenileme — Kararlaştırıldı

“Bana farklı şeyler göster” aynı kartları sırayı değiştirerek sunmakla yetinmemeli; mümkünse yeni bir sonuç grubu üretmelidir.

## 9. Bilgi mimarisi ve arayüz

### 9.1 Genel ilkeler — Kararlaştırıldı

- Ekranlar gereksiz seçeneklerle kalabalıklaştırılmaz.
- Ana karar akışı tek elde kullanılabilecek kadar kolay olmalıdır.
- Global bölümler daha sonra alt navigasyona taşınabilir; üst bölüm her şeyi taşıyan menüye dönüşmemelidir.
- Marka yazımı `N’apsak?` logo/başlık kullanımında soru işaretini korur; içerik sekmesinde `N’apsak` kullanılabilir.

### 9.2 Erişilebilirlik — Kararlaştırıldı

- Safe Area uyumu,
- küçük ve büyük ekran uyumu,
- en az 44 px dokunma alanı,
- ekran okuyucu etiketleri,
- yeterli renk kontrastı,
- yalnız renkle ifade edilmeyen durumlar.

### 9.3 Sonuç kartı — Kararlaştırıldı

İçerik türüne göre kartta mümkün olduğunca şunlar görünmelidir:

- başlık,
- kısa açıklama,
- neden önerildiği,
- süre,
- fiyat seviyesi,
- ilçe/mesafe,
- kaydet,
- “Bana göre değil”,
- haritada veya kaynakta açma.

## 10. Teknik ve veri ilkeleri

### 10.1 Mevcut platform — Kayıt

- React Native
- Expo SDK 57
- TypeScript
- AsyncStorage ile yerel kalıcılık
- Planlanan backend: Firebase Authentication, Firestore ve Cloud Functions

### 10.2 Geriye uyumluluk — Kararlaştırıldı

- Tercih şeması sürümlenir.
- Migration test edilmeden sürüm yükseltilmez.
- Kaydedilen ve gizlenen içerikler mümkün olduğunca korunur.
- Yeni alanlar eski kullanıcıyı onboarding’e zorlamamalıdır.

### 10.3 Test kapısı — Kararlaştırıldı

Her ilgili PR en az şunları doğrulamalıdır:

- TypeScript typecheck,
- birim/regresyon testleri,
- öneri motoru stress testi,
- değişen filtreler için sınır durumları,
- Android/Expo bundle veya eşdeğer yapılandırma kontrolü,
- mümkünse gerçek cihazda görsel/etkileşim testi.

Testin geçtiğini yazmak yeterli değildir; komut ve sonuç PR açıklamasında bulunmalıdır. Çalıştırılamayan kontrol açıkça belirtilmelidir.

## 11. MVP kapsam sınırları

### 11.1 Şimdiki odak — Kararlaştırıldı

- Ankara,
- kontrollü ve doğrulanabilir katalog,
- iyi çalışan onboarding/plan bağlamı,
- Experience + Mekân + Etkinlik + Fikir ayrımı,
- açıklanabilir öneri motoru,
- kaydetme, gizleme ve rotasyon,
- erişilebilir mobil arayüz.

### 11.2 Bu aşamada kapsam dışı — Kararlaştırıldı

- geniş sosyal ağ özellikleri,
- kullanıcıların serbestçe doğrulanmamış içerik yayımlaması,
- profil ekranını gereksiz özelliklerle doldurmak,
- tüm Türkiye’ye erken yayılmak,
- Ankara 101’i Experience MVP PR’ına sıkıştırmak,
- kullanıcı katkı formunu Experience MVP PR’ına eklemek.

## 12. Başarı ölçütleri — Öneri / henüz kesinleşmedi

MVP analitiği eklendiğinde izlenmesi önerilen metrikler:

- onboarding tamamlama oranı,
- ilk anlamlı öneriye ulaşma süresi,
- öneri kaydetme oranı,
- “Bana göre değil” oranı,
- yenileme sonrası kaydetme oranı,
- haritada/kaynakta açma oranı,
- geri dönen kullanıcı oranı,
- boş sonuç ve tekrar oranı,
- içerik türüne göre etkileşim.

Hedef sayılar gerçek kullanım tabanı oluşmadan uydurulmamalıdır.

## 13. Açık ürün soruları

Agent aşağıdaki konularda ürün sahibinin yerine karar veremez:

1. Ana sonuç ekranında aynı anda kaç öneri gösterilecek: 5 mi, 6 mı, kademeli “daha fazla” mı?
2. Experience kartında rota adımları kart üzerinde mi, ayrıntı ekranında mı gösterilecek?
3. Anlık plan bağlamı uygulama kapanınca ne kadar süre korunacak?
4. Konum verilmezse varsayılan merkez/ilçe seçimi nasıl yapılacak?
5. Bütçe filtre mi, sıralama sinyali mi, yoksa içerik türüne göre hibrit mi olacak?
6. Canlı etkinliklerin veri kaynağı ve doğrulama sıklığı ne olacak?
7. Kullanıcı katkıları yayınlanmadan önce hangi moderasyon sürecinden geçecek?
8. Ankara 101 ile evergreen Experience arasındaki kesin sınır nedir?
9. Alt navigasyonun nihai bölümleri nelerdir?
10. Profil olmadan kişiselleştirme ne kadar ileri götürülecek?

## 14. PR çalışma sözleşmesi

Her implementation brief şu sırayı izler:

1. İlgili ürün kararlarını ve kapsam dışı maddeleri belirt.
2. Değişecek kullanıcı davranışını açıkla.
3. Veri modeli ve migration etkisini belirt.
4. Kabul kriterlerini test edilebilir cümlelerle yaz.
5. Çalıştırılacak kontrolleri listele.
6. Agent uygulamayı ve testleri tamamlasın.
7. ChatGPT diff’i ürün uyumu, teknik kalite ve regresyon açısından incelesin.
8. Gerekirse aynı görev/branch üzerinde follow-up düzeltme yapılsın.
9. İnceleme tamamlanmadan merge yapılmasın.

## 15. Karar günlüğü

### 2026-08-08 — Ürün hafızasının repo içinde tutulması

**Karar:** Ürün ilkeleri ve karar gerekçeleri yaşayan bir dokümanda tutulacak; her geliştirme görevi bunu okuyacak.

**Neden:** Sohbetten Codex’e yapılan özet aktarımında nüans kaybını azaltmak, farklı agent’ların tutarlı davranmasını sağlamak ve eski kararların nedenini korumak.
**Sonuç:** Yeni kararlar bu dosyaya eklenmeli; önemli yön değişiklikleri eski kararı sessizce silmek yerine tarihli kayıtla değiştirmelidir.

### Önceki kararların konsolidasyonu

Bu ilk sürüm; onboarding, kalıcı/anlık tercih ayrımı, kaydetme, gizleme/geri alma, deterministik çeşitlilik, içerik türleri, Ankara 101, Experience ve erişilebilirlik üzerine daha önce alınan kararların toplu kaydıdır. Kesin tarihi bilinmeyen eski kararlar için sahte tarih üretilmemiştir.

### 2026-08-08 — Experience MVP veri güvenilirliği

**Karar:** Başlangıç Experience kataloğu 20 evergreen mikro plandan oluşacak. Planlar mevcut, kaynaklı mekân kayıtlarına bağlanacak; her bağlı noktanın kaynak ve doğrulama tarihi korunacak. Rota süresi editoryal tahmin olarak sunulacak, doğrulanmamış haftanın günleri veya çalışma saatleri üretilmeyecek.

**Neden:** Bir mekânın varlığını doğrulayan kaynak, rota içindeki her operasyonel ayrıntıyı otomatik olarak doğrulamaz. Veri modelinin dürüst belirsizlik taşıması, sahte kesinlikten daha değerlidir.
**Sonuç:** Kartlar güncel koşulları kontrol etme notu taşır. `seasonal` ve `live` kayıtlar tip seviyesinde `expiresAt` gerektirir; eksik veya geçersiz bitiş tarihi olan kayıtlar çalışma zamanında da elenir.

## 16. Değişiklik yönetimi

- Küçük açıklık düzeltmeleri doğrudan yapılabilir.
- Kullanıcı davranışını değiştiren kararlar tarihli karar günlüğüne eklenir.
- Eski karar yanlışlandıysa silinmez; “yerine geçen karar” belirtilir.
- Açık sorular kararlaştırıldıkça ilgili bölüme taşınır.
- Her önemli PR, bu dokümanı etkileyip etkilemediğini açıklamalıdır.
