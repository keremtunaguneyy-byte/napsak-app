# N’apsak — Yeni karar kayıtları

Önceki tarihli kararların aslı PRODUCT_SPEC.md §15'te korunur. Durumlar: onaylı / öneri / açık / uygulanmış / doğrulanmış. Uygulanmış karar, test edilmiş anlamına gelmez.

## 2026-09-06 — Sohbetten bağımsız ortak proje hafızası

Durum: Kullanıcının açık isteği; bu belge PR'ında hazırlanıyor.

Ürün, tasarım, algoritma, operasyon ve durum bilgisi aynı repo docs klasöründe birbirine bağlı tutulacak. Kullanıcı başka sohbete veya yapay zekâya geçtiğinde projeyi baştan anlatmak istemiyor. İlgili dosyalar START_HERE'de tanımlı. Tüm tarihî konuşmaların eksiksiz arşivlendiği iddia edilmeyecek.

## 2026-09-06 — Tasarım devri

Durum: Tasarım ve Marka sohbeti kullanıcı tarafından açıldı. Son cevabı bu çalışma oturumunda doğrudan okunmuş değil.

Beğenilen ana sayfa yapısı ve N? logo geometrisi korunuyor; nihai palet açık. Mor/turuncu beğenisi renk kararı değildir. Kullanıcının karşılaştırmalı çok sayıda renk varyasyonu isteği DESIGN_SPEC'e işlendi. Önceki asistanın “yalnız iki varyasyon” önerisi bağlayıcı kullanıcı kararı değildir.

## 2026-09-06 — Ankara 101 durum düzeltmesi

Durum: GitHub main ve yerel kodla doğrulandı.

İlk Ankara 101 sürümü main cb21941 içinde; yerel 6a453ab üzerinde dört ek commit bulunuyor. PRODUCT_SPEC'in gelecekte yapılacak ifadesi eskimiş. Görsel ayrıntılar main'e geçmiş gibi raporlanmayacak. Dosyalar: PRODUCT_SPEC, DESIGN_SPEC, STATUS.

## Açık kararlar

- Anlık bağlamın ne zaman eskidiği ve kullanıcıyı engellemeden nasıl güncelleneceği.
- Ana sayfanın nihai paleti, logo çizimi ve tasarım tokenları.
- Güncel etkinlik kaynağı ve düzenli doğrulama sıklığı.
- Gerçek development/production servis durumu ve bağımsız yedekleme düzeni.

Yeni kayıt şablonu: tarih / karar / durum / gerekçe / önceki kararın yerine geçiyor mu / etkilenen dosyalar / kabul kriteri / uygulama ve test kanıtı.
