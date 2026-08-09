import { Guide } from '../types';

export const guides: Guide[] = [
  {
    id: 'guide-ankara-kalesi', kind: 'guide', cityId: 'ankara', title: 'Ankara Kalesi ve çevresi',
    summary: 'Kale surlarından başlayıp eski Ankara sokakları, hanlar ve müzeler arasında yürüyebileceğin klasik şehir rotası.',
    category: 'Tarih', district: 'Altındağ', sourceLabel: 'Ankara İl Kültür ve Turizm Müdürlüğü',
    sourceUrl: 'https://ankara.ktb.gov.tr/TR-391180/sehir--alisveris-turizmi.html', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-hamamonu', kind: 'guide', cityId: 'ankara', title: 'Hamamönü sokakları',
    summary: 'Restore edilmiş Ankara evleri, tarihî çarşılar ve Taceddin çevresini yavaş tempolu bir yürüyüşle keşfet.',
    category: 'Mahalle', district: 'Altındağ', sourceLabel: 'Ankara İl Kültür ve Turizm Müdürlüğü',
    sourceUrl: 'https://ankara.ktb.gov.tr/TR-391154/tarih--kultur-turizmi.html', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-anadolu-medeniyetleri', kind: 'guide', cityId: 'ankara', title: 'Anadolu Medeniyetleri Müzesi',
    summary: 'Paleolitik Çağ’dan başlayarak Anadolu tarihini güçlü bir koleksiyon ve tarihî bedesten atmosferinde izle.',
    category: 'Müze', district: 'Altındağ', sourceLabel: 'T.C. Kültür ve Turizm Bakanlığı',
    sourceUrl: 'https://muze.gov.tr/muze-detay?DistId=AMM&SectionId=AMM01', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-cumhuriyet-muzesi', kind: 'guide', cityId: 'ankara', title: 'II. Meclis: Cumhuriyet Müzesi',
    summary: 'Cumhuriyetin erken dönemini, Meclis salonlarını ve siyasal hafızayı tarihî yapının içinde oku.',
    category: 'Müze', district: 'Altındağ', sourceLabel: 'T.C. Kültür ve Turizm Bakanlığı',
    sourceUrl: 'https://muze.gov.tr/muze-detay?DistId=MRK&SectionId=CUM01', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-etnografya-muzesi', kind: 'guide', cityId: 'ankara', title: 'Etnografya Müzesi',
    summary: 'Anadolu’nun gündelik yaşamını, el sanatlarını ve kültürel mirasını Namazgâh Tepesi’ndeki simge yapıda gör.',
    category: 'Müze', district: 'Altındağ', sourceLabel: 'T.C. Kültür ve Turizm Bakanlığı',
    sourceUrl: 'https://muze.gov.tr/muze-detay?DistId=MRK&SectionId=AET01', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-resim-heykel', kind: 'guide', cityId: 'ankara', title: 'Resim ve Heykel Müzesi',
    summary: 'Cumhuriyet dönemi sanatını Arif Hikmet Koyunoğlu’nun tasarladığı etkileyici Türk Ocağı binasında keşfet.',
    category: 'Müze', district: 'Altındağ', sourceLabel: 'T.C. Kültür ve Turizm Bakanlığı',
    sourceUrl: 'https://muze.gov.tr/muze-detay?DistId=MRK&SectionId=ARE01', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-aslanhane', kind: 'guide', cityId: 'ankara', title: 'Aslanhane Camii',
    summary: 'UNESCO Dünya Mirası listesindeki ahşap direkli yapıyı ve çevresindeki eski Ankara dokusunu birlikte gör.',
    category: 'Tarih', district: 'Altındağ', sourceLabel: 'Ankara İl Kültür ve Turizm Müdürlüğü',
    sourceUrl: 'https://ankara.ktb.gov.tr/TR-359166/-aslanhane-camii-ahi-serafettin-unesco-dunya-miras-list-.html', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-ulus-kultur-hatti', kind: 'guide', cityId: 'ankara', title: 'Başkent Kültür Turu',
    summary: 'Ulus, Anıtkabir, Hamamönü, Ulucanlar ve Kale duraklarını belediyenin 402 numaralı kültür hattıyla bağla.',
    category: 'Şehir Rotası', district: 'Merkez', sourceLabel: 'Ankara Büyükşehir Belediyesi',
    sourceUrl: 'https://www.ankara.bel.tr/haberler/402-numarali-baskent-kultur-turu-bayramda-da-yollarda-18275', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-gordion', kind: 'guide', cityId: 'ankara', title: 'Gordion Müzesi ve antik kent',
    summary: 'Frig uygarlığının izlerini, tümülüsleri ve Gordion buluntularını Ankara merkezinin dışına uzanan bir günlük rotada keşfet.',
    category: 'Tarih', district: 'Polatlı', sourceLabel: 'T.C. Kültür ve Turizm Bakanlığı',
    sourceUrl: 'https://muze.gov.tr/muze-detay?DistId=MRK&SectionId=GOR01', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-eymir', kind: 'guide', cityId: 'ankara', title: 'Eymir Gölü çevresi',
    summary: 'Göl manzarası eşliğinde yürüyüş veya bisiklet için şehir merkezine yakın, uzun soluklu bir doğa kaçamağı planla.',
    category: 'Doğa', district: 'Gölbaşı', sourceLabel: 'Ankara İl Kültür ve Turizm Müdürlüğü',
    sourceUrl: 'https://ankara.ktb.gov.tr/Eklenti/48859%2Cankararehberi2016pdf.pdf?0=', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-mogan', kind: 'guide', cityId: 'ankara', title: 'Mogan Gölü ve Gölbaşı',
    summary: 'Göl kıyısı yürüyüşü, açık hava molası ve gün batımı için Gölbaşı’nda sakin bir yarım gün ayır.',
    category: 'Doğa', district: 'Gölbaşı', sourceLabel: 'Ankara İl Kültür ve Turizm Müdürlüğü',
    sourceUrl: 'https://ankara.ktb.gov.tr/Eklenti/48859%2Cankararehberi2016pdf.pdf?0=', verifiedAt: '2026-08-09',
  },
  {
    id: 'guide-tunali-kugulu', kind: 'guide', cityId: 'ankara', title: 'Tunalı ve Kuğulu Park hattı',
    summary: 'Kuğulu Park’tan başlayıp Tunalı Hilmi Caddesi boyunca mağazalar, pasajlar ve kahve durakları arasında şehir temposuna karış.',
    category: 'Mahalle', district: 'Çankaya', sourceLabel: 'Ankara İl Kültür ve Turizm Müdürlüğü',
    sourceUrl: 'https://ankara.ktb.gov.tr/TR-391180/sehir--alisveris-turizmi.html', verifiedAt: '2026-08-09',
  },
];
