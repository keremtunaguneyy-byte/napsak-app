import { ContentFilter } from './recommendations';

export type ResultFilter = Exclude<ContentFilter, 'all'>;
export const DEFAULT_RESULT_FILTER: ResultFilter = 'place';
export const RESULT_FILTERS: readonly { value: ResultFilter; label: string }[] = [
  { value: 'place', label: 'Mekân' },
  { value: 'event', label: 'Etkinlik' },
  { value: 'idea', label: 'Fikir' },
];
