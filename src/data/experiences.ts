import { Experience } from '../types';
import { places } from './places';

type ExperienceDraft = Omit<
  Experience,
  'kind' | 'lifecycle' | 'expiresAt' | 'points' | 'sources' | 'cityId' | 'district' | 'latitude' | 'longitude' | 'lastVerifiedAt'
> & { pointIds: string[] };

const placeById = new Map(places.map(place => [place.id, place]));

function buildExperience(draft: ExperienceDraft): Experience {
  const { pointIds, ...data } = draft;
  const linkedPlaces = pointIds.map(id => {
    const place = placeById.get(id);
    if (!place) throw new Error(`Experience references unknown place: ${id}`);
    return place;
  });
  const first = linkedPlaces[0];
  const sourceUrls = new Set<string>();
  const sources = linkedPlaces.flatMap(place => {
    if (sourceUrls.has(place.sourceUrl)) return [];
    sourceUrls.add(place.sourceUrl);
    return [{ label: place.name, url: place.sourceUrl, verifiedAt: place.verifiedAt }];
  });
  const lastVerifiedAt = linkedPlaces.map(place => place.verifiedAt).sort()[0];
  return {
    ...data,
    kind: 'experience',
    lifecycle: 'evergreen',
    cityId: first.cityId,
    points: linkedPlaces.map(place => ({ placeId: place.id, name: place.name, latitude: place.latitude, longitude: place.longitude })),
    sources,
    district: first.district,
    latitude: first.latitude,
    longitude: first.longitude,
    lastVerifiedAt,
  };
}

const allGroups = ['Tek', '2 kişi', '3–4 kişi', '5+'] as const;
const smallGroups = ['Tek', '2 kişi', '3–4 kişi'] as const;

/**
 * Curated Ankara micro-plans. Sources verify the linked places; route order and
 * duration are editorial estimates, so cards explicitly ask users to re-check
 * current opening/access conditions instead of inventing a weekly schedule.
 */
export const experiences: Experience[] = [
  buildExperience({
    id: 'xp-hacibayram-augustus', title: 'Hacı Bayram’da Roma Ankara’sını oku',
    description: 'Meydanı dolaş; Augustus Tapınağı kalıntılarındaki Roma dönemi izlerine odaklan.',
    note: 'İki nokta yan yana: kısa sürede tarih katmanları arasında geçiş yapabileceğin sakin bir merkez rotası.',
    pointIds: ['haci-bayram-veli', 'augustus-tapinagi'], experienceType: 'culture', category: 'Sanat',
    moods: ['Meraklı', 'Sakin'], primaryInterests: ['Sanat'], secondaryInterests: [], groupSizes: [...allGroups],
    minDurationMinutes: 30, maxDurationMinutes: 60, priceLevel: 0,
    availabilityNote: 'Açık alan erişimini ve ibadet saatlerindeki yoğunluğu gitmeden önce kontrol et.',
    weather: 'dry', reservation: 'not-required', confidenceScore: .96, editorialScore: 9.2,
  }),
  buildExperience({
    id: 'xp-botanik-atakule-short', title: 'Botanik Parkı’ndan Atakule’ye kısa manzara turu',
    description: 'Parkın eğimli yollarında kısa bir tur at; kapanışı Atakule çevresinde şehir manzarasıyla yap.',
    note: 'Birbirine çok yakın iki noktayı tek saate sığdıran, gün batımına da uyarlanabilen kısa plan.',
    pointIds: ['botanik-parki', 'atakule'], experienceType: 'outdoors', category: 'Doğa',
    moods: ['Sakin', 'Sosyal'], primaryInterests: ['Doğa'], secondaryInterests: ['Lezzet'], groupSizes: [...allGroups],
    minDurationMinutes: 45, maxDurationMinutes: 60, priceLevel: 0,
    availabilityNote: 'Park ve kule erişimini, özellikle akşam saatlerini güncel kaynaklardan kontrol et.',
    weather: 'dry', reservation: 'not-required', confidenceScore: .92, editorialScore: 9.0,
  }),
  buildExperience({
    id: 'xp-tunali-kugulu-short', title: 'Tunalı kahvesi + Kuğulu kısa turu',
    description: 'Kahveni al; Kuğulu Park çevresinde ekransız, tempolu bir turla bir saati tamamla.',
    note: 'Uzun plan yapmadan dışarı çıkmak isteyenler için kahve ve kısa yürüyüşü tek karara indirir.',
    pointIds: ['coffee-lab-tunali', 'kugulu-park'], experienceType: 'food-and-walk', category: 'Kahve',
    moods: ['Sakin', 'Sosyal'], primaryInterests: ['Kahve'], secondaryInterests: ['Doğa'], groupSizes: [...allGroups],
    minDurationMinutes: 45, maxDurationMinutes: 60, priceLevel: 2,
    availabilityNote: 'Kafe çalışma saatini ve park koşullarını gitmeden önce kontrol et.',
    weather: 'dry', reservation: 'not-required', confidenceScore: .94, editorialScore: 9.1,
  }),
  buildExperience({
    id: 'xp-meclis-duo-short', title: 'Birinci Meclis’ten İkinci Meclis’e 500 metrelik tarih',
    description: 'Kurtuluş Savaşı Müzesi’yle başla; Cumhuriyet Müzesi’ne yürüyüp anlatının devamını gör.',
    note: 'Yakın iki yapıyı kronolojik sıraya koyar; kısa sürede Cumhuriyet tarihine odaklı bir çerçeve sunar.',
    pointIds: ['kurtulus-savasi-muzesi', 'cumhuriyet-muzesi'], experienceType: 'culture', category: 'Sanat',
    moods: ['Meraklı', 'Sakin'], primaryInterests: ['Sanat'], secondaryInterests: [], groupSizes: [...smallGroups],
    minDurationMinutes: 45, maxDurationMinutes: 60, priceLevel: 1,
    availabilityNote: 'İki müzenin güncel ziyaret saatlerini kontrol et; bu süre hızlı tur içindir.',
    weather: 'indoor', reservation: 'not-required', confidenceScore: .95, editorialScore: 9.0,
  }),
  buildExperience({
    id: 'xp-cer-genclik-short', title: 'CerModern’den Gençlik Parkı’na sanat molası',
    description: 'CerModern’de tek bir sergi bölümüne odaklan; ardından Gençlik Parkı gölüne kısa yürüyüş yap.',
    note: 'Tam sergi turu yerine “bir bölüm + temiz hava” kurgusuyla bir saate sığan merkez planı.',
    pointIds: ['cer-modern', 'genclik-parki'], experienceType: 'micro-route', category: 'Sanat',
    moods: ['Meraklı', 'Enerjik'], primaryInterests: ['Sanat'], secondaryInterests: ['Doğa', 'Etkinlik'], groupSizes: [...allGroups],
    minDurationMinutes: 45, maxDurationMinutes: 60, priceLevel: 1,
    availabilityNote: 'CerModern sergi ve ziyaret saatlerini güncel programdan kontrol et.',
    weather: 'any', reservation: 'not-required', confidenceScore: .92, editorialScore: 8.8,
  }),
  buildExperience({
    id: 'xp-erimtan-kale', title: 'Erimtan’dan Kale surlarına çık',
    description: 'Erimtan koleksiyonunu gez; ardından Hisar sokaklarından Ankara Kalesi’ne yürü.',
    note: 'Arkeoloji koleksiyonunu bulunduğu tarihî çevreyle bağlayan, müze çıkışında bitmeyen bir keşif.',
    pointIds: ['erimtan', 'ankara-kalesi'], experienceType: 'culture', category: 'Sanat',
    moods: ['Meraklı', 'Enerjik'], primaryInterests: ['Sanat'], secondaryInterests: ['Doğa'], groupSizes: [...smallGroups],
    minDurationMinutes: 90, maxDurationMinutes: 120, priceLevel: 1,
    availabilityNote: 'Müze saatini ve Kale çevresindeki hava koşullarını kontrol et.',
    weather: 'any', reservation: 'not-required', confidenceScore: .97, editorialScore: 9.7,
  }),
  buildExperience({
    id: 'xp-kugulu-segmenler', title: 'Kuğulu’dan Seğmenler’e yeşil mola',
    description: 'Kuğulu Park’ta kısa bir turla başla; Çankaya yönünde Seğmenler Parkı’na yürüyüp tempoyu düşür.',
    note: 'Şehrin ortasında iki yeşil alanı yaya bağlayan; koşu değil, akış hissi veren kısa rota.',
    pointIds: ['kugulu-park', 'segmenler-parki'], experienceType: 'outdoors', category: 'Doğa',
    moods: ['Sakin', 'Enerjik'], primaryInterests: ['Doğa'], secondaryInterests: ['Kahve'], groupSizes: [...allGroups],
    minDurationMinutes: 75, maxDurationMinutes: 105, priceLevel: 0,
    availabilityNote: 'Yağış ve zemin koşullarını kontrol et.', weather: 'dry', reservation: 'not-required',
    confidenceScore: .94, editorialScore: 9.3,
  }),
  buildExperience({
    id: 'xp-cer-cso', title: 'CerModern’den CSO Ada’ya kültür hattı',
    description: 'CerModern’de güncel sergiyi gör; Talatpaşa Bulvarı hattında CSO Ada çevresine geç.',
    note: 'Yakın iki kültür odağını bir araya getirir; konser varsa ayrıca bilet ve program kontrolü gerekir.',
    pointIds: ['cer-modern', 'cso-ada'], experienceType: 'culture', category: 'Sanat',
    moods: ['Meraklı', 'Sosyal'], primaryInterests: ['Sanat'], secondaryInterests: ['Etkinlik'], groupSizes: [...smallGroups],
    minDurationMinutes: 90, maxDurationMinutes: 120, priceLevel: 2,
    availabilityNote: 'Sergi ve CSO Ada programını ayrı ayrı kontrol et.', weather: 'any', reservation: 'recommended',
    confidenceScore: .95, editorialScore: 9.5,
  }),
  buildExperience({
    id: 'xp-ulucanlar-hamamonu', title: 'Ulucanlar’dan Hamamönü’ne yakın tarih rotası',
    description: 'Cezaevi müzesindeki yakın tarih anlatısından sonra Hamamönü sokaklarına yürüyüp mola ver.',
    note: 'Yoğun müze deneyimini açık hava ve kısa mola ile dengeleyen yürünebilir bir Altındağ planı.',
    pointIds: ['ulucanlar-cezaevi', 'hamamonu'], experienceType: 'culture', category: 'Sanat',
    moods: ['Meraklı', 'Sakin'], primaryInterests: ['Sanat'], secondaryInterests: ['Kahve', 'Lezzet'], groupSizes: [...smallGroups],
    minDurationMinutes: 90, maxDurationMinutes: 120, priceLevel: 1,
    availabilityNote: 'Müze saatini ve Hamamönü’ndeki işletmeleri güncel kaynaklardan kontrol et.',
    weather: 'any', reservation: 'not-required', confidenceScore: .91, editorialScore: 9.2,
  }),
  buildExperience({
    id: 'xp-goksu-loop', title: 'Göksu’da tempo + göl turu',
    description: 'Göl çevresinde tempolu yürüyüş yap; dönüşte kıyıda sakin bir dinlenme bölümü bırak.',
    note: 'Aynı noktada iki farklı modu birleştirir: önce hareket, sonra bilinçli şekilde yavaşlama.',
    pointIds: ['goksu-parki'], experienceType: 'active', category: 'Doğa',
    moods: ['Enerjik', 'Sakin'], primaryInterests: ['Doğa'], secondaryInterests: ['Etkinlik'], groupSizes: [...allGroups],
    minDurationMinutes: 75, maxDurationMinutes: 120, priceLevel: 0,
    availabilityNote: 'Park erişimini, hava ve zemin koşullarını kontrol et.', weather: 'dry', reservation: 'not-required',
    confidenceScore: .93, editorialScore: 9.1,
  }),
  buildExperience({
    id: 'xp-etnografya-resim', title: 'Etnografya’dan Resim ve Heykel’e iki müze',
    description: 'Aynı tepedeki iki koleksiyonu art arda gezerek halk sanatlarından modern Türk resmine geç.',
    note: 'İki komşu koleksiyonu tematik sıraya koyar; aradaki geçiş yürüyüşten çok anlatı değişimidir.',
    pointIds: ['etnografya-muzesi', 'resim-heykel'], experienceType: 'culture', category: 'Sanat',
    moods: ['Meraklı', 'Sakin'], primaryInterests: ['Sanat'], secondaryInterests: [], groupSizes: [...smallGroups],
    minDurationMinutes: 180, maxDurationMinutes: 210, priceLevel: 1,
    availabilityNote: 'İki müzenin güncel ziyaret saatlerini kontrol et.', weather: 'indoor', reservation: 'not-required',
    confidenceScore: .97, editorialScore: 9.5,
  }),
  buildExperience({
    id: 'xp-roma-meclis', title: 'Roma Hamamı’ndan Birinci Meclis’e zaman çizgisi',
    description: 'Roma dönemi kalıntılarıyla başla; Cumhuriyet Caddesi üzerinden Kurtuluş Savaşı Müzesi’ne geç.',
    note: 'Ankara’nın iki uzak tarih katmanını aynı yürüyüşte karşılaştırmaya zorlayan kronolojik sıçrama.',
    pointIds: ['roma-hamami', 'kurtulus-savasi-muzesi'], experienceType: 'culture', category: 'Sanat',
    moods: ['Meraklı', 'Enerjik'], primaryInterests: ['Sanat'], secondaryInterests: [], groupSizes: [...smallGroups],
    minDurationMinutes: 180, maxDurationMinutes: 240, priceLevel: 1,
    availabilityNote: 'İki müzenin ziyaret saatlerini ve açık hava koşullarını kontrol et.',
    weather: 'dry', reservation: 'not-required', confidenceScore: .96, editorialScore: 9.4,
  }),
  buildExperience({
    id: 'xp-kelime-erimtan-kale', title: 'Kelimeden arkeolojiye, Kale’den han molasına',
    description: 'Kelime Müzesi’yle başla; Erimtan ve Ankara Kalesi’nden sonra Çukurhan çevresinde mola ver.',
    note: 'Aynı yamaçta dil, arkeoloji, kent manzarası ve kahve/yemek molasını tek deneyime dönüştürür.',
    pointIds: ['kelime-muzesi', 'erimtan', 'ankara-kalesi', 'divan-cukurhan'], experienceType: 'culture', category: 'Sanat',
    moods: ['Meraklı', 'Sosyal'], primaryInterests: ['Sanat'], secondaryInterests: ['Doğa', 'Kahve', 'Lezzet'], groupSizes: [...smallGroups],
    minDurationMinutes: 180, maxDurationMinutes: 240, priceLevel: 2,
    availabilityNote: 'İki müzenin saatlerini ve Kale koşullarını ayrı ayrı kontrol et.',
    weather: 'any', reservation: 'recommended', confidenceScore: .95, editorialScore: 9.7,
  }),
  buildExperience({
    id: 'xp-odtu-double-museum', title: 'ODTÜ’de bilimden arkeolojiye',
    description: 'Yerleşke erişimini önceden kontrol et; Bilim ve Teknoloji ile Arkeoloji müzelerini birlikte gez.',
    note: 'Tek kampüste iki farklı bilgi alanını birleştirir; erişim kontrolü bu planın zorunlu ilk adımıdır.',
    pointIds: ['odtu-bilim-teknoloji', 'odtu-arkeoloji'], experienceType: 'culture', category: 'Sanat',
    moods: ['Meraklı', 'Sakin'], primaryInterests: ['Sanat'], secondaryInterests: ['Etkinlik'], groupSizes: [...smallGroups],
    minDurationMinutes: 180, maxDurationMinutes: 210, priceLevel: 0,
    availabilityNote: 'Yerleşke erişimini ve iki müzenin açık olduğu saatleri önceden doğrula.',
    weather: 'indoor', reservation: 'recommended', confidenceScore: .94, editorialScore: 9.2,
  }),
  buildExperience({
    id: 'xp-anitkabir-maltepe', title: 'Anıtkabir’den Maltepe’ye Cumhuriyet rotası',
    description: 'Müze ve tören alanını gez; ardından Maltepe yönüne yürüyüp Ankara usulü yemek molası ver.',
    note: 'Yoğun tarih ziyaretinin sonuna yerel ve dinlendirici bir yemek durağı ekler.',
    pointIds: ['anitkabir', 'duveroğlu'], experienceType: 'food-and-walk', category: 'Sanat',
    moods: ['Meraklı', 'Sosyal'], primaryInterests: ['Sanat'], secondaryInterests: ['Lezzet'], groupSizes: [...allGroups],
    minDurationMinutes: 180, maxDurationMinutes: 240, priceLevel: 2,
    availabilityNote: 'Anıtkabir ziyaret saatini ve restoranın güncel çalışma durumunu kontrol et.',
    weather: 'any', reservation: 'recommended', confidenceScore: .95, editorialScore: 9.3,
  }),
  buildExperience({
    id: 'xp-mogan-halfday', title: 'Mogan kıyısında yarım günlük reset',
    description: 'Kıyı parkurunda uzun yürüyüşe çık; göl manzaralı iki kısa dinlenme bölümü planla.',
    note: 'Hedef yalnız adım sayısı değil; tempolu yürüyüş ile bilinçli dinlenmeyi aynı güne yerleştirmek.',
    pointIds: ['mogan-parki'], experienceType: 'outdoors', category: 'Doğa',
    moods: ['Sakin', 'Enerjik'], primaryInterests: ['Doğa'], secondaryInterests: [], groupSizes: [...allGroups],
    minDurationMinutes: 240, maxDurationMinutes: 300, priceLevel: 0,
    availabilityNote: 'Hava, park erişimi ve dönüş saatini kontrol et.', weather: 'dry', reservation: 'not-required',
    confidenceScore: .93, editorialScore: 9.1,
  }),
  buildExperience({
    id: 'xp-eymir-halfday', title: 'Eymir’de yürüyüş + göl kıyısı molası',
    description: 'Göl çevresinde seçtiğin bölümde uzun yürüyüş yap; dönüşten önce kıyıda sakin mola bırak.',
    note: 'Ulaşım ve giriş koşulu nedeniyle hazırlık isteyen; karşılığında şehirden kopma hissi veren yarım gün.',
    pointIds: ['eymir-golu'], experienceType: 'active', category: 'Doğa',
    moods: ['Enerjik', 'Sakin'], primaryInterests: ['Doğa'], secondaryInterests: ['Etkinlik'], groupSizes: [...allGroups],
    minDurationMinutes: 240, maxDurationMinutes: 330, priceLevel: 0,
    availabilityNote: 'ODTÜ’nün güncel giriş, araç ve ziyaret kurallarını önceden kontrol et.',
    weather: 'dry', reservation: 'recommended', confidenceScore: .97, editorialScore: 9.6,
  }),
  buildExperience({
    id: 'xp-gordion-halfday', title: 'Gordion’da Frigya’ya yarım gün',
    description: 'Müze koleksiyonuyla başla; örenyeri çevresinde Frig başkentinin ölçeğini yerinde gör.',
    note: 'Merkez dışı ulaşımı haklı çıkaran, tek mekân ziyaretinden daha bütünlüklü bir arkeoloji planı.',
    pointIds: ['gordion-muzesi'], experienceType: 'culture', category: 'Sanat',
    moods: ['Meraklı', 'Enerjik'], primaryInterests: ['Sanat'], secondaryInterests: ['Doğa'], groupSizes: [...allGroups],
    minDurationMinutes: 300, maxDurationMinutes: 360, priceLevel: 1,
    availabilityNote: 'Müze/örenyeri saatlerini, ulaşımı ve hava koşullarını önceden kontrol et.',
    weather: 'dry', reservation: 'recommended', confidenceScore: .98, editorialScore: 9.7,
  }),
  buildExperience({
    id: 'xp-beypazari-halfday', title: 'Beypazarı çarşısında tarih + yerel tat',
    description: 'Tarihî çarşı sokaklarını yürü; yerel ürünleri inceleyip yöresel yemek molası ver.',
    note: 'Şehir dışı ulaşımı, sokak keşfini ve yemeği tek yarım günlük karara dönüştürür.',
    pointIds: ['beypazari-tarihi-carsi'], experienceType: 'food-and-walk', category: 'Lezzet',
    moods: ['Meraklı', 'Sosyal'], primaryInterests: ['Lezzet'], secondaryInterests: ['Sanat', 'Kahve'], groupSizes: [...allGroups],
    minDurationMinutes: 300, maxDurationMinutes: 360, priceLevel: 2,
    availabilityNote: 'Ulaşım süresini, açık işletmeleri ve hava durumunu önceden kontrol et.',
    weather: 'dry', reservation: 'recommended', confidenceScore: .93, editorialScore: 9.4,
  }),
  buildExperience({
    id: 'xp-kizilcahamam-halfday', title: 'Kızılcahamam’da jeoloji + orman havası',
    description: 'Jeopark Müzesi’nde bölgenin oluşumunu öğren; ardından Soğuksu Millî Parkı’nda kısa parkur seç.',
    note: 'Müzede öğrendiğini arazide görmeye devam ettiren; bilgi ve doğa yürüyüşünü birbirine bağlayan plan.',
    pointIds: ['kizilcahamam-jeopark', 'soguksu-milli-parki'], experienceType: 'outdoors', category: 'Doğa',
    moods: ['Meraklı', 'Enerjik'], primaryInterests: ['Doğa'], secondaryInterests: ['Sanat'], groupSizes: [...allGroups],
    minDurationMinutes: 300, maxDurationMinutes: 360, priceLevel: 1,
    availabilityNote: 'Müze saatini, millî park erişimini ve hava/parkur koşullarını önceden kontrol et.',
    weather: 'dry', reservation: 'recommended', confidenceScore: .94, editorialScore: 9.5,
  }),
];
