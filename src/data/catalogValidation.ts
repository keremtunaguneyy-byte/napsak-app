import {
  City, Event, Experience, GroupSizePreference, Guide, Idea, Interest, KNOWN_GROUP_SIZES,
  KNOWN_INTERESTS, KNOWN_MOODS, Mood, Place, PriceLevel,
} from '../types';
import { CATALOG_SCHEMA_VERSION, CatalogMeta, CatalogSnapshot } from './catalog';

type ObjectValue = Record<string, unknown>;

const isObject = (value: unknown): value is ObjectValue => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const stringsIn = <T extends string>(value: unknown, allowed: readonly T[]): value is T[] =>
  Array.isArray(value) && value.every(item => typeof item === 'string' && allowed.includes(item as T));
const isPrice = (value: unknown): value is PriceLevel => Number.isInteger(value) && [0, 1, 2, 3].includes(value as number);
const isHttps = (value: unknown): value is string => isString(value) && value.startsWith('https://');

export function isCity(value: unknown): value is City {
  if (!isObject(value) || !isString(value.id) || !isString(value.name) || !isString(value.countryCode) || !isString(value.timezone)) return false;
  if (!['active', 'planned', 'paused'].includes(String(value.status)) || !isObject(value.center)) return false;
  return isNumber(value.center.latitude) && isNumber(value.center.longitude);
}

export function isPlace(value: unknown): value is Place {
  if (!isObject(value)) return false;
  return isString(value.id) && isString(value.cityId) && isString(value.name) && isString(value.district)
    && isString(value.address) && KNOWN_INTERESTS.includes(value.category as Interest)
    && stringsIn<Mood>(value.moods, KNOWN_MOODS) && stringsIn<Interest>(value.interests, KNOWN_INTERESTS)
    && isPrice(value.priceLevel) && isNumber(value.editorialScore) && isString(value.note)
    && isNumber(value.latitude) && isNumber(value.longitude) && isHttps(value.sourceUrl) && isString(value.verifiedAt);
}

export function isIdea(value: unknown): value is Idea {
  if (!isObject(value)) return false;
  return value.kind === 'idea' && isString(value.id) && isString(value.title)
    && KNOWN_INTERESTS.includes(value.category as Interest) && stringsIn<Mood>(value.moods, KNOWN_MOODS)
    && stringsIn<Interest>(value.interests, KNOWN_INTERESTS) && isPrice(value.priceLevel)
    && isNumber(value.editorialScore) && isString(value.note) && isString(value.actionLabel)
    && isHttps(value.actionUrl) && stringsIn<GroupSizePreference>(value.groupSizes, KNOWN_GROUP_SIZES);
}

export function isEvent(value: unknown): value is Event {
  if (!isObject(value)) return false;
  return value.kind === 'event' && isString(value.id) && isString(value.title) && isString(value.venue)
    && isString(value.cityId) && isString(value.city) && isString(value.startsAt)
    && (value.endsAt === undefined || isString(value.endsAt)) && KNOWN_INTERESTS.includes(value.category as Interest)
    && stringsIn<Mood>(value.moods, KNOWN_MOODS) && stringsIn<Interest>(value.interests, KNOWN_INTERESTS)
    && isPrice(value.priceLevel) && isNumber(value.editorialScore) && isString(value.note)
    && isHttps(value.sourceUrl) && isString(value.sourceLabel) && isString(value.verifiedAt)
    && stringsIn<GroupSizePreference>(value.groupSizes, KNOWN_GROUP_SIZES);
}

export function isExperience(value: unknown): value is Experience {
  if (!isObject(value)) return false;
  const lifecycleValid = value.lifecycle === 'evergreen'
    ? value.expiresAt === undefined
    : (value.lifecycle === 'seasonal' || value.lifecycle === 'live') && isString(value.expiresAt);
  return lifecycleValid && value.kind === 'experience' && isString(value.id) && isString(value.title)
    && isString(value.description) && isString(value.note) && isString(value.cityId) && isString(value.district)
    && KNOWN_INTERESTS.includes(value.category as Interest) && stringsIn<Mood>(value.moods, KNOWN_MOODS)
    && stringsIn<Interest>(value.primaryInterests, KNOWN_INTERESTS) && stringsIn<Interest>(value.secondaryInterests, KNOWN_INTERESTS)
    && stringsIn<GroupSizePreference>(value.groupSizes, KNOWN_GROUP_SIZES) && isPrice(value.priceLevel)
    && isNumber(value.minDurationMinutes) && isNumber(value.maxDurationMinutes)
    && isNumber(value.latitude) && isNumber(value.longitude) && isString(value.availabilityNote)
    && ['any', 'dry', 'indoor'].includes(String(value.weather))
    && ['not-required', 'recommended', 'required'].includes(String(value.reservation))
    && isString(value.lastVerifiedAt) && isNumber(value.confidenceScore) && isNumber(value.editorialScore)
    && Array.isArray(value.points) && value.points.length > 0 && value.points.every(point => isObject(point) && isString(point.placeId) && isString(point.name) && isNumber(point.latitude) && isNumber(point.longitude))
    && Array.isArray(value.sources) && value.sources.length > 0 && value.sources.every(source => isObject(source) && isString(source.label) && isHttps(source.url) && isString(source.verifiedAt));
}

export function isGuide(value: unknown): value is Guide {
  if (!isObject(value)) return false;
  return value.kind === 'guide' && isString(value.id) && isString(value.cityId) && isString(value.title)
    && isString(value.summary) && Array.isArray(value.paragraphs) && value.paragraphs.length > 0 && value.paragraphs.every(isString)
    && isNumber(value.readMinutes) && value.readMinutes > 0
    && (value.routeStops === undefined || (Array.isArray(value.routeStops) && value.routeStops.every(isString)))
    && (value.practicalNote === undefined || isString(value.practicalNote))
    && ['Tarih', 'Müze', 'Doğa', 'Mahalle', 'Şehir Rotası'].includes(String(value.category))
    && isString(value.district) && isString(value.sourceLabel) && isHttps(value.sourceUrl) && isString(value.verifiedAt);
}

export function parseCatalogMeta(value: unknown): CatalogMeta | undefined {
  if (!isObject(value) || !isString(value.cityId) || !isNumber(value.schemaVersion) || !isString(value.catalogVersion) || !isString(value.updatedAt)) return undefined;
  return value as CatalogMeta;
}

export function parseCatalogSnapshot(value: unknown): CatalogSnapshot | undefined {
  if (!isObject(value) || value.schemaVersion !== CATALOG_SCHEMA_VERSION || !isString(value.cityId)
    || !isString(value.catalogVersion) || !isString(value.fetchedAt)) return undefined;
  if (!Array.isArray(value.cities) || !value.cities.every(isCity)
    || !Array.isArray(value.places) || !value.places.every(isPlace)
    || !Array.isArray(value.experiences) || !value.experiences.every(isExperience)
    || !Array.isArray(value.events) || !value.events.every(isEvent)
    || !Array.isArray(value.ideas) || !value.ideas.every(isIdea)
    || !Array.isArray(value.guides) || !value.guides.every(isGuide)) return undefined;
  const snapshot = value as CatalogSnapshot;
  if (snapshot.cities.some(item => item.id !== snapshot.cityId)
    || snapshot.places.some(item => item.cityId !== snapshot.cityId)
    || snapshot.experiences.some(item => item.cityId !== snapshot.cityId)
    || snapshot.events.some(item => item.cityId !== snapshot.cityId)
    || snapshot.guides.some(item => item.cityId !== snapshot.cityId)) return undefined;
  if (!snapshot.cities.length || !snapshot.places.length || !snapshot.experiences.length || !snapshot.ideas.length || !snapshot.guides.length) return undefined;
  const hasUniqueIds = (items: { id: string }[]) => new Set(items.map(item => item.id)).size === items.length;
  if (!hasUniqueIds(snapshot.cities) || !hasUniqueIds(snapshot.places) || !hasUniqueIds(snapshot.experiences)
    || !hasUniqueIds(snapshot.events) || !hasUniqueIds(snapshot.ideas) || !hasUniqueIds(snapshot.guides)) return undefined;
  const placeIds = new Set(snapshot.places.map(item => item.id));
  if (snapshot.experiences.some(item => item.points.some(point => !placeIds.has(point.placeId)))) return undefined;
  return snapshot;
}
