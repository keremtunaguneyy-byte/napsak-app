# N’apsak — Tasarım ve Marka

6 Eylül 2026. Başlangıç kaydı; tüm eski konuşmaların eksiksiz aktarımı veya final tasarım sistemi değildir. Güncel ürün bağlamı PRODUCT_SPEC ve STATUS'tadır.

## Ürün karakteri ve kararlar

N’apsak kararsızlığı uygulanabilir mikro plana dönüştürür. Samimi, eğlenceli, yetişkinlere hitap eden bir uygulamadır. Harita uygulaması çağrışımı istenmiyor; logo için pin, pusula ve harita sembolü kullanılmamalı. Marka yazımı N’apsak?; soru işareti korunur.

Ana sayfanın beğenilen omurgası: üstte görünür/düzenlenebilir tercihler; kompakt Bugünlük planın; aynı beşlinin kalan dört sonucunu gösteren 2×2 Diğer N’apsak planları. Birinci eylem Planı incele. Yenileme ve kaydetme ayrı işlevlerdir. Beş uygun aday bulunamazsa sahte kart üretilmez.

İçerik seçici N’apsak / Mekân / Etkinlik / Fikir; alt gezinme Ana Sayfa / Kaydedilenler / Ankara 101. Sana göre, bu ayrı içerik katmanlarının kişisel önizlemesidir. Etkinlik yoksa uydurulmaz. Kaydettiklerin yalnız kayıt varsa görünür. Tekrarlayan Sana yakın mekânlar modülü eklenmez. Referansta görünen hava durumu, bildirim ve beşli alt menü özellik onayı değildir.

## Renk ve logo — henüz açık

Kullanıcı N'nin sağında soru işareti bulunan eski logo fikrini beğendi. Mor/turuncu renklerini seçmiş değildir. Renkleri tasarımcı gerekçeli biçimde önermelidir. Son geniş görsel seti genel olarak beğenilmedi; eski asistan finalist önerileri kullanıcı onayı sayılmaz.

6 Eylül tarihli diğer proje konuşmasında kullanıcı, seçilen birkaç logo geometrisi üzerinde 15–20 renk varyasyonu görebilmeyi istedi. Bu nedenle önceki devir belgesindeki “en fazla iki renk” kısıtı kullanıcı tercihi olarak dayatılmamalı. Düzen ve geometri sabitlenerek karşılaştırılabilir, düzenli bir renk panosu hazırlanabilir; kullanıcıdan renk teorisini çözmesi beklenmez. Kaç varyasyon üretileceği işin güncel talebine göre belirlenir.

## Referans envanteri

Bu dosyalar bu PR'a gömülü değildir; proje kaynaklarından ayrıca eklenmelidir. Dosyayı görmeden gördüğünü söyleme.

| Kimlik / dosya | Tarif ve kullanım |
|---|---|
| 88c7d8cd-147a-4e42-ab88-e8e4e83c016e.png | Beyaz zemin, ince siyah logo, pastel tercih çipleri, fotoğraflı ana plan, sarı eylem, 2×2 alternatifler. Beğenilen yapısal referans. |
| 215f7e7f-46e7-4956-beff-69cc0c11338e.png | Mavi başlık, beyaz logo/çipler, krem fotoğraflı ana kart, renkli alternatifler. Beğenilen başka görsel yön; bütün bileşenleri onay değil. |
| exec-ba730490-4d1c-4fec-ba01-b43108936c91.png | Dört logolu eski pano; sağ üstte mor N, sağında turuncu soru işareti ve sarı nokta. Geometri referansı; renk onayı değil. |

## Ankara 101 — korunacak ürün ayrımı

Ankara 101, şehrin kalıcı kültürünü ve yerel yaşamını anlatan ayrı editoryal rehberdir. Ana sayfanın kişiselleştirilmiş beşli plan motoruyla aynı şey değildir. İçerik, mekân adı listesinin ötesinde bağlam, okunabilir anlatı, pratik not ve kaynak taşımalıdır.

### Mevcut yerel uygulamadan doğrulanan karakter

Aşağıdakiler `agent/ankara-101-editorial`, `6a453ab` kod bulgularıdır; her piksel için son kullanıcı onayı iddiası değildir. GitHub main'deki ilk sürümle karıştırma.

- Girişte iki yön: **Ankara Klasikleri** (tarih, kültür, simge duraklar) ve **Bir Ankaralı Gibi** (yerel rotalar, küçük duraklar).
- Fotoğraflı, dergi/şehir rehberi hissi; Cormorant Garamond başlık ve Source Sans 3 gövde yazısı.
- Koyu üst alan `#0E100E`, kâğıt/krem yüzey `#F2E7CF`, bordo vurgu `#A73343`. Bunlar mevcut Ankara 101 renkleri; tüm uygulamanın nihai marka paleti değil.
- Klasiklerde bölüm/başlık, açıklama paragrafları, varsa rota durakları ve pratik bilgi; kaynak ve doğrulama tarihi veri modelinde bulunuyor.
- Yerel rota örneği Kuğulu’dan Ayrancı’ya yavaş bir öğleden sonra: Kuğulu → Tunalı pasajları → Ayrancı → Seğmenler. Durak başına kısa not ve ayrıntı, giriş ve arkadaş notu var.
- Kaynak dosyalar: App.tsx, src/data/guides.ts, src/data/insiderRoutes.ts, src/design/ankara101Theme.ts, assets/ankara101/.
- Son yerel geliştirmeler fotoğraf, mobil sıkıştırma ve Android geri gezinme davranışını içeriyor. Yeni tasarım bu düzeni görmeden Ankara 101'i sıfırdan kurmamalı.

Eski konuşmadaki tüm Ankara 101 nüansları bu turda bulunamadı. Eksik nüanslar bulunduğunda bu bölüme kaynak ve durumuyla eklenmeli; hayalî geçmiş karar yazılmamalı.

## Tamamlanacak tasarım sözleşmesi

Seçilen renk/font/boşluk/köşe değerleri; logo tek renk/ters renk/ikon; küçük ekran ve büyük yazı; dokunma alanları; kartların yükleniyor/boş/hata/kaydedildi durumları; fotoğraf kaynakları. Bağlam aynı yerel gün içinde altı saat korunur; altı saat sonunda veya gün değişiminde kullanıcıdan yeniden doğrulama istenir. Bu davranış #23 ile uygulanmıştır ve PRODUCT_SPEC §5.5 ile güncel uygulama davranışına bağlıdır; açık tasarım kararı değildir. Önce tasarım çıktısında neyin onaylı, neyin deneme olduğu belirtilmeli, sonra ilgili değerler buraya yazılmalıdır.
