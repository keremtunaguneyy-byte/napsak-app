import { createHash } from 'node:crypto';
import { CatalogSnapshot } from '../src/data/catalog';
import { FIRESTORE_READ_LIMITS, MAX_CATALOG_PAYLOAD_BYTES } from '../src/data/catalogPublication';
import { parseCatalogSnapshot } from '../src/data/catalogValidation';
import { compareCatalogVersions } from '../src/data/catalogVersion';
import { retiredEvents } from '../src/data/retiredEvents';
import { guideMedia } from './catalogOperations/guideMedia';
import { eventHealth, geography } from './catalogOperations/health';
import { instant } from './catalogOperations/records';
import { savedDestinations } from './catalogOperations/savedDestinations';

export function requireNewer(version: string, base: string) {
  if (compareCatalogVersions(version, base) !== 1) throw Error(`Release ${version} must be newer than ${base}.`);
}

export function candidateDigest(base: string, payload: string) {
  return createHash('sha256').update(JSON.stringify([base, payload])).digest('hex');
}

export function checkSize(payload: string) {
  if (Buffer.byteLength(payload, 'utf8') > MAX_CATALOG_PAYLOAD_BYTES) throw Error('Catalog exceeds the release document byte limit.');
}

export function parsePayload(payload: string) {
  checkSize(payload);
  const snapshot = parseCatalogSnapshot(JSON.parse(payload));
  if (!snapshot || snapshot.cityId !== 'ankara' || !Number.isFinite(instant(snapshot.fetchedAt))) {
    throw Error('Invalid Ankara catalog snapshot, timestamp, schema, IDs or references.');
  }
  if (snapshot.places.length > FIRESTORE_READ_LIMITS.placesPerCity || snapshot.experiences.length > FIRESTORE_READ_LIMITS.experiencesPerCity
    || snapshot.events.length > FIRESTORE_READ_LIMITS.eventsPerCity || snapshot.ideas.length > FIRESTORE_READ_LIMITS.globalIdeas
    || snapshot.guides.length > FIRESTORE_READ_LIMITS.guidesPerCity) throw Error('Catalog exceeds refresh inventory limits.');
  return snapshot;
}

export function validateCandidate(payload: string, previous: CatalogSnapshot, now: Date) {
  const snapshot = parsePayload(payload);
  requireNewer(snapshot.catalogVersion, previous.catalogVersion);
  const saved = savedDestinations(snapshot);
  if (!saved.passed) throw Error('Saved destination collision: ' + saved.issues.map(issue => issue.id).join(', '));
  const retired = new Set(retiredEvents.map(event => event.id));
  const families = ['places', 'experiences', 'events', 'guides', 'ideas'] as const;
  for (const family of families) {
    const ids = new Set(snapshot[family].map(item => item.id));
    for (const id of ids) {
      if (retired.has(id)) throw Error('Reserved retired Event ID: ' + id);
    }
    for (const item of previous[family]) {
      if (!ids.has(item.id) && !(family === 'events' && retired.has(item.id))) {
        throw Error(`Removing ${family}/${item.id} requires a shipped personal-history policy.`);
      }
    }
  }
  const guides = guideMedia(snapshot.guides);
  if (!guides.passed || guides.unexpectedCatalogIds.length) throw Error('Guide approval or media mismatch: ' + [...guides.missingGuideMedia, ...guides.unexpectedCatalogIds].join(', '));
  const geo = geography(snapshot);
  if (geo.invalid.length || geo.failures.length) throw Error('Invalid coordinates or route: ' + [...geo.invalid, ...geo.failures.map(f => f.id)].join(', '));
  const events = eventHealth(snapshot, now);
  if (!events.healthy || events.records.some(e => e.startQuality !== 'zoned_iso' || e.endState === 'invalid')) {
    throw Error('Event timing or health failed: ' + events.issues.map(issue => issue.code).join(', '));
  }
  return snapshot;
}
