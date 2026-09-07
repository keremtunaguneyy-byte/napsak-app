export type InsiderRouteStop = {
  name: string;
  note: string;
  detail: string;
};

export type InsiderRoute = {
  id: string;
  title: string;
  eyebrow: string;
  durationLabel: string;
  budgetLabel: string;
  intro: string;
  friendNote: string;
  mapUrl: string;
  stops: InsiderRouteStop[];
};

export const insiderRoutes: InsiderRoute[] = [
  {
    id: 'insider-kugulu-ayranci',
    eyebrow: 'ROTA 01',
    title: 'Kuğulu’dan Ayrancı’ya yavaş bir öğleden sonra',
    durationLabel: '4 saat',
    budgetLabel: 'Orta bütçe',
    intro: 'Saat 15.00 gibi Kuğulu’da buluşalım. Acelemiz yok; bu rota küçük sapmalarla güzelleşiyor.',
    friendNote: 'Ana caddeye bağlı kalma; en iyi duraklar iki sokak içeride. Yorulursan Ayrancı’dan Seğmenler’e taksiyle geçmek rotanın ruhunu bozmaz.',
    mapUrl: 'https://www.google.com/maps/dir/?api=1&origin=Ku%C4%9Fulu+Park+Ankara&destination=Se%C4%9Fmenler+Park%C4%B1+Ankara&waypoints=Tunal%C4%B1+Hilmi+Caddesi+Ankara%7CAyranc%C4%B1+Ankara&travelmode=walking',
    stops: [
      { name: 'Kuğulu Park', note: 'kısa bir başlangıç', detail: 'Parkın içinden küçük bir tur at. İlk kahveyi burada içme; rota boyunca daha sakin masalar çıkacak.' },
      { name: 'Tunalı pasajları', note: 'içeri sap', detail: 'Caddeyi dümdüz geçmek yerine eski pasajlara ve ara sokaklara gir. Ankara’nın gündelik yüzü vitrinlerden çok buralarda.' },
      { name: 'Ayrancı sokakları', note: 'kahve molası', detail: 'Hoşuna giden küçük bir masaya otur. Buradaki amaç “en iyi kahve”yi bulmak değil, mahallenin temposuna karışmak.' },
      { name: 'Seğmenler', note: 'günü çimlerde kapat', detail: 'Gün ışığı yumuşarken parka geç. Yanına küçük bir şey aldıysan son molayı çimlerde ver.' },
    ],
  },
];
