import { City } from '../types';

export const cities: City[] = [
  {
    id: 'ankara',
    name: 'Ankara',
    countryCode: 'TR',
    timezone: 'Europe/Istanbul',
    center: { latitude: 39.9334, longitude: 32.8597 },
    status: 'active',
  },
];

export function cityName(cityId: string): string {
  return cities.find(city => city.id === cityId)?.name ?? cityId;
}
