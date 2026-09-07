import { Guide } from '../types';

export const guides: Guide[] = [
  {
    id: 'guide-ankara-kalesi', kind: 'guide', cityId: 'ankara', title: 'Ankara Kalesi ve çevresi',
    summary: 'Kale surlarından başlayıp eski Ankara sokakları, hanlar ve müzeler arasında yürüyebileceğin klasik şehir rotası.',
    paragraphs: [
      'Ankara Kalesi, şehre yukarıdan bakılan bir seyir noktası olmanın ötesinde eski Ankara’nın katmanlarını bir arada gösterir. Hisar çevresindeki dar sokaklar, farklı dönemlerde onarılmış surlar ve yamaç boyunca sıralanan yapılar başkentin Cumhuriyet’ten çok daha eski hikâyesini görünür kılar.',
      'Rotayı yalnız kale kapısında bitirme. Çengelhan ve Samanpazarı yönüne inerken hanlara, küçük dükkânlara ve sokak dokusuna zaman ayır; Anadolu Medeniyetleri Müzesi’ni de aynı güne ekleyerek yürüyüşü bütünlüklü bir tarih hattına dönüştür.',
    ], readMinutes: 3, routeStops: ['Hisar Kapısı', 'Kale içi sokakları', 'Çengelhan', 'Anadolu Medeniyetleri Müzesi'], practicalNote: 'Yokuş ve taş zemin için rahat ayakkabı seç; rotayı gündüz tamamlamak daha konforlu olur.',
    category: 'Tarih', district: 'Altındağ', sourceLabel: 'Ankara İl Kültür ve Turizm Müdürlüğü',
    sourceUrl: 'https://ankara.ktb.gov.tr/TR-391180/sehir--alisveris-turizmi.html', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-hamamonu', kind: 'guide', cityId: 'ankara', title: 'Hamamönü sokakları',
    summary: 'Restore edilmiş Ankara evleri, tarihî çarşılar ve Taceddin çevresini yavaş tempolu bir yürüyüşle keşfet.',
    paragraphs: [
      'Hamamönü, geleneksel Ankara evi ölçeğini ve sokak ritmini topluca hissedebileceğin bir mahalle yürüyüşü sunar. Restore edilmiş cepheler, avlular ve küçük meydanlar bölgeyi hızlıca tüketilecek bir fotoğraf durağından çok yavaş gezilen bir açık hava rotasına dönüştürür.',
      'Ana aksın kalabalığından birkaç sokak uzaklaş; Taceddin Dergâhı ve Mehmet Âkif Ersoy Müze Evi çevresini de yürüyüşe kat. Böylece mahalleyi yalnız yenilenmiş dükkânlarla değil, Ankara’nın kültürel hafızasıyla birlikte okursun.',
    ], readMinutes: 2, routeStops: ['Hamamönü Meydanı', 'Sanat Sokağı', 'Taceddin Dergâhı', 'Mehmet Âkif Ersoy Müze Evi'], practicalNote: 'Hafta sonu yoğunluğundan kaçınmak için sabah saatleri daha sakin.',
    category: 'Mahalle', district: 'Altındağ', sourceLabel: 'Ankara İl Kültür ve Turizm Müdürlüğü',
    sourceUrl: 'https://ankara.ktb.gov.tr/TR-391154/tarih--kultur-turizmi.html', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-anadolu-medeniyetleri', kind: 'guide', cityId: 'ankara', title: 'Anadolu Medeniyetleri Müzesi',
    summary: 'Paleolitik Çağ’dan başlayarak Anadolu tarihini güçlü bir koleksiyon ve tarihî bedesten atmosferinde izle.',
    paragraphs: [
      'Anadolu Medeniyetleri Müzesi, Ankara 101’in tarih omurgasıdır. Mahmut Paşa Bedesteni ve Kurşunlu Han içinde kurulan sergi, Anadolu’nun çok uzun zaman çizgisini kronolojik bir anlatıyla takip etmeyi sağlar.',
      'Eserleri tek tek bitirmeye çalışma. Önce dönemlerin birbirine nasıl bağlandığını izle; ardından seni en çok çeken iki salona geri dön. Müze çıkışını kale yürüyüşüyle birleştirmek, içeride gördüğün tarih ile şehrin dokusu arasında güçlü bir bağ kurar.',
    ], readMinutes: 3, practicalNote: 'Ziyaret saatleri ve bilet koşulları değişebileceği için yola çıkmadan resmî kaynağı kontrol et.',
    category: 'Müze', district: 'Altındağ', sourceLabel: 'T.C. Kültür ve Turizm Bakanlığı',
    sourceUrl: 'https://muze.gov.tr/muze-detay?DistId=AMM&SectionId=AMM01', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-cumhuriyet-muzesi', kind: 'guide', cityId: 'ankara', title: 'II. Meclis: Cumhuriyet Müzesi',
    summary: 'Cumhuriyetin erken dönemini, Meclis salonlarını ve siyasal hafızayı tarihî yapının içinde oku.',
    paragraphs: [
      'Ulus’taki II. Türkiye Büyük Millet Meclisi binası, Cumhuriyet’in kurumlaşma dönemini doğrudan mekânın içinde anlatır. Genel kurul salonu, çalışma odaları ve döneme ait belgeler siyasi tarihin soyut başlıklarını gündelik ölçekte görünür hâle getirir.',
      'Burayı tek başına bir müze durağı gibi değil, Ulus’taki Cumhuriyet yapıları zincirinin parçası olarak düşün. Yakındaki I. Meclis, Ankara Palas çevresi ve meydanla birlikte yürüdüğünde başkentin nasıl kurulduğunu sokak üzerinde okumaya başlarsın.',
    ], readMinutes: 3, routeStops: ['Ulus Meydanı', 'I. Meclis', 'II. Meclis', 'Ankara Palas çevresi'], practicalNote: 'Ulus hattını yürüyerek gezmek için en az yarım gün ayır.',
    category: 'Müze', district: 'Altındağ', sourceLabel: 'T.C. Kültür ve Turizm Bakanlığı',
    sourceUrl: 'https://muze.gov.tr/muze-detay?DistId=MRK&SectionId=CUM01', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-etnografya-muzesi', kind: 'guide', cityId: 'ankara', title: 'Etnografya Müzesi',
    summary: 'Anadolu’nun gündelik yaşamını, el sanatlarını ve kültürel mirasını Namazgâh Tepesi’ndeki simge yapıda gör.',
    paragraphs: [
      'Etnografya Müzesi, tarih anlatısını hükümdarlar ve savaşlardan çıkarıp gündelik hayata taşır. Giysiler, dokumalar, ahşap işleri ve farklı bölgelerden toplanan nesneler Anadolu’daki yaşam biçimlerinin çeşitliliğini gösterir.',
      'Yapının kendisi de Cumhuriyet Ankara’sının kültür politikalarını anlatan önemli bir parçadır. Namazgâh Tepesi’ndeki konumu ve anıtsal mimarisi sayesinde koleksiyon ile erken başkent fikri aynı ziyarette birleşir.',
    ], readMinutes: 2, practicalNote: 'Aynı bölgede Resim ve Heykel Müzesi’ni de planlayarak iki koleksiyonu art arda görebilirsin.',
    category: 'Müze', district: 'Altındağ', sourceLabel: 'T.C. Kültür ve Turizm Bakanlığı',
    sourceUrl: 'https://muze.gov.tr/muze-detay?DistId=MRK&SectionId=AET01', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-resim-heykel', kind: 'guide', cityId: 'ankara', title: 'Resim ve Heykel Müzesi',
    summary: 'Cumhuriyet dönemi sanatını Arif Hikmet Koyunoğlu’nun tasarladığı etkileyici Türk Ocağı binasında keşfet.',
    paragraphs: [
      'Ankara Resim ve Heykel Müzesi, Cumhuriyet dönemi görsel sanatlarını tarihî Türk Ocağı binasının güçlü mimarisi içinde sunar. Galeriler arasında ilerlerken hem sanat tarihindeki değişimi hem de yeni başkentin kültürel temsil arayışını birlikte görürsün.',
      'Ziyareti hız yarışına çevirmemek için birkaç eser seçip onlara daha uzun bak. Bina ayrıntılarını ve Türk Ocağı Salonu’nu da koleksiyonun bir parçası gibi okumak, deneyimi sıradan bir galeri gezisinin ötesine taşır.',
    ], readMinutes: 2, practicalNote: 'Program ve geçici sergiler için ziyaret gününde resmî duyuruları kontrol et.',
    category: 'Müze', district: 'Altındağ', sourceLabel: 'T.C. Kültür ve Turizm Bakanlığı',
    sourceUrl: 'https://muze.gov.tr/muze-detay?DistId=MRK&SectionId=ARE01', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-aslanhane', kind: 'guide', cityId: 'ankara', title: 'Aslanhane Camii',
    summary: 'UNESCO Dünya Mirası listesindeki ahşap direkli yapıyı ve çevresindeki eski Ankara dokusunu birlikte gör.',
    paragraphs: [
      'Aslanhane Camii, ahşap direkli ve ahşap tavanlı Orta Çağ Anadolu camileri geleneğinin Ankara’daki güçlü örneklerinden biridir. Taş dış cepheden içeri girildiğinde ahşabın kurduğu sıcak ve ritmik mekân etkisi özellikle belirgindir.',
      'Yapıyı çevresinden koparma. Kale yamacındaki konumu, dar sokaklar ve Ahi Şerafeddin Türbesi ile birlikte düşünüldüğünde eski Ankara’nın dinî ve toplumsal merkezi daha anlaşılır hâle gelir.',
    ], readMinutes: 2, routeStops: ['Atpazarı', 'Aslanhane Camii', 'Ahi Şerafeddin Türbesi', 'Kale yamacı'], practicalNote: 'İbadet saatlerine saygılı biçimde, uygun kıyafetle ve sessizce ziyaret et.',
    category: 'Tarih', district: 'Altındağ', sourceLabel: 'Ankara İl Kültür ve Turizm Müdürlüğü',
    sourceUrl: 'https://ankara.ktb.gov.tr/TR-359166/-aslanhane-camii-ahi-serafettin-unesco-dunya-miras-list-.html', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-ulus-kultur-hatti', kind: 'guide', cityId: 'ankara', title: 'Başkent Kültür Turu',
    summary: 'Ulus, Anıtkabir, Hamamönü, Ulucanlar ve Kale duraklarını belediyenin 402 numaralı kültür hattıyla bağla.',
    paragraphs: [
      'Başkent Kültür Turu, birbirinden uzak görünen merkezî tarih duraklarını tek bir omurgada düşünmek için kullanışlıdır. Amaç her noktayı aynı gün tüketmek değil; Ankara’nın antik, Osmanlı ve Cumhuriyet katmanları arasındaki ilişkiyi kurmaktır.',
      'Hattı ilk keşif için yön bulma aracı olarak kullan, sonra ilgini çeken bölgelere ayrı günlerde geri dön. Kale ve Hamamönü yaya ritmine, Anıtkabir ise daha uzun ve odaklı bir ziyarete ihtiyaç duyar.',
    ], readMinutes: 3, routeStops: ['Ulus', 'Ankara Kalesi', 'Hamamönü', 'Ulucanlar', 'Anıtkabir'], practicalNote: 'Güzergâh ve sefer bilgisi değişebilir; hareket etmeden önce belediyenin güncel duyurusunu kontrol et.',
    category: 'Şehir Rotası', district: 'Merkez', sourceLabel: 'Ankara Büyükşehir Belediyesi',
    sourceUrl: 'https://www.ankara.bel.tr/haberler/402-numarali-baskent-kultur-turu-bayramda-da-yollarda-18275', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-gordion', kind: 'guide', cityId: 'ankara', title: 'Gordion Müzesi ve antik kent',
    summary: 'Frig uygarlığının izlerini, tümülüsleri ve Gordion buluntularını Ankara merkezinin dışına uzanan bir günlük rotada keşfet.',
    paragraphs: [
      'Gordion, Ankara’nın hikâyesini yalnız şehir merkeziyle sınırlamayan en güçlü duraklardan biridir. Frig başkentinin arkeolojik alanı, tümülüsler ve müze birlikte gezildiğinde antik yerleşimin ölçeği ve bölgedeki siyasal güç daha anlaşılır olur.',
      'Bu geziyi merkezdeki bir müzeye uğrar gibi planlama; ulaşım, açık alan yürüyüşü ve müze için tam gün ayır. Manzara ile buluntuları aynı sırada görmek, Gordion’u yalnızca “Kral Midas” başlığından çıkarıp gerçek bir kent deneyimine dönüştürür.',
    ], readMinutes: 3, routeStops: ['Gordion Müzesi', 'Midas Tümülüsü', 'Antik kent höyüğü'], practicalNote: 'Merkez dışı ulaşımı ve açık alan koşullarını önceden planla; su ve güneş koruması bulundur.',
    category: 'Tarih', district: 'Polatlı', sourceLabel: 'T.C. Kültür ve Turizm Bakanlığı',
    sourceUrl: 'https://muze.gov.tr/muze-detay?DistId=MRK&SectionId=GOR01', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-eymir', kind: 'guide', cityId: 'ankara', title: 'Eymir Gölü çevresi',
    summary: 'Göl manzarası eşliğinde yürüyüş veya bisiklet için şehir merkezine yakın, uzun soluklu bir doğa kaçamağı planla.',
    paragraphs: [
      'Eymir, Ankara’nın kuru ve yoğun şehir dokusundan kısa sürede ayrışan uzun bir göl çevresi deneyimi sunar. Buradaki asıl değer tek bir manzara noktası değil; yürüdükçe değişen kıyı, ağaçlık alan ve açık bozkır hissidir.',
      'Mesafeyi hafife alma. Kısa bir kahve molası, orta uzunlukta yürüyüş veya bisiklet turu birbirinden farklı planlardır. Vaktini ve dönüş enerjini hesaba katarak gölün yalnız bir bölümünü seçmek çoğu zaman daha keyiflidir.',
    ], readMinutes: 2, routeStops: ['Giriş', 'Göl kıyısı', 'Seyir molası', 'Dönüş hattı'], practicalNote: 'Giriş koşulları değişebilir; su, hava durumu ve dönüş saatini önceden kontrol et.',
    category: 'Doğa', district: 'Gölbaşı', sourceLabel: 'Ankara İl Kültür ve Turizm Müdürlüğü',
    sourceUrl: 'https://ankara.ktb.gov.tr/Eklenti/48859%2Cankararehberi2016pdf.pdf?0=', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-mogan', kind: 'guide', cityId: 'ankara', title: 'Mogan Gölü ve Gölbaşı',
    summary: 'Göl kıyısı yürüyüşü, açık hava molası ve gün batımı için Gölbaşı’nda sakin bir yarım gün ayır.',
    paragraphs: [
      'Mogan, uzun ve düz kıyı hattı sayesinde Ankara’da zahmetsiz bir açık hava günü için iyi bir başlangıçtır. Park alanları, yürüyüş yolu ve göl manzarası farklı yaş ve tempo gruplarını aynı planda buluşturabilir.',
      'Burayı yapılacaklar listesi gibi gezmek yerine günün ritmini yavaşlatan bir mola olarak düşün. Kısa yürüyüşü gün batımına yaklaştırmak ve kalabalık bölümlerden biraz uzaklaşmak göl deneyimini belirgin biçimde iyileştirir.',
    ], readMinutes: 2, practicalNote: 'Rüzgâr göl kıyısında merkezden daha sert hissedilebilir; mevsime göre ince bir katman taşı.',
    category: 'Doğa', district: 'Gölbaşı', sourceLabel: 'Ankara İl Kültür ve Turizm Müdürlüğü',
    sourceUrl: 'https://ankara.ktb.gov.tr/Eklenti/48859%2Cankararehberi2016pdf.pdf?0=', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-tunali-kugulu', kind: 'guide', cityId: 'ankara', title: 'Tunalı ve Kuğulu Park hattı',
    summary: 'Kuğulu Park’tan başlayıp Tunalı Hilmi Caddesi boyunca mağazalar, pasajlar ve kahve durakları arasında şehir temposuna karış.',
    paragraphs: [
      'Tunalı–Kuğulu hattı, Ankara’nın gündelik şehir hayatını anıtsal yapılardan çok sokak ritmi üzerinden tanıtır. Kuğulu Park’ın küçük ölçeği, Tunalı Hilmi Caddesi’nin hareketi ve ara sokaklardaki eski-yeni işletmeler bölgenin sürekli değişen karakterini kurar.',
      'Rotayı düz bir alışveriş caddesi yürüyüşüne indirgeme. Pasajlara gir, ara sokaklara sap ve zamanı varsa Seğmenler Parkı yönüne uzat. Bu hat Ankara’nın resmî başkent yüzünden daha kişisel ve yaşayan tarafına geçiş sağlar.',
    ], readMinutes: 2, routeStops: ['Kuğulu Park', 'Tunalı Hilmi Caddesi', 'Pasajlar', 'Seğmenler Parkı'], practicalNote: 'Akşam ve hafta sonu kalabalığı yüksektir; sakin keşif için hafta içi gündüz daha uygundur.',
    category: 'Mahalle', district: 'Çankaya', sourceLabel: 'Ankara İl Kültür ve Turizm Müdürlüğü',
    sourceUrl: 'https://ankara.ktb.gov.tr/TR-391180/sehir--alisveris-turizmi.html', verifiedAt: '2026-08-09',
  },
];
