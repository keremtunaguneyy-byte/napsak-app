import { createHash } from 'node:crypto';
import { CatalogSnapshot } from '../src/data/catalog';
import { FIRESTORE_READ_LIMITS, catalogPayloadFits } from '../src/data/catalogPublication';
import { parseCatalogSnapshot } from '../src/data/catalogValidation';
import { compareCatalogVersions } from '../src/data/catalogVersion';
import { insiderRoutes } from '../src/data/insiderRoutes';
import { resolveHiddenItems } from '../src/hiddenItems';
import { resolveSavedEntries } from '../src/saved';
import { retiredEvents } from '../src/data/retiredEvents';
import { guideMedia } from './catalogOperations/guideMedia';
import { eventHealth, geography } from './catalogOperations/health';
import { instant } from './catalogOperations/records';
import { personalCatalogItems, savedDestinations } from './catalogOperations/savedDestinations';

export function requireNewer(version: string, base: string) {
  if (compareCatalogVersions(version, base) !== 1) throw Error(`Release ${version} must be newer than ${base}.`);
}

export function payloadDigest(payload: string) {
  return createHash('sha256').update(payload).digest('hex');
}

export function candidateDigest(base: string, payload: string, expectedSchema1Version?: string, rollbackPayload?: string) {
  const input = expectedSchema1Version === undefined ? [base, payload] : [base, payload, expectedSchema1Version];
  if (rollbackPayload !== undefined) input.push(payloadDigest(rollbackPayload));
  return payloadDigest(JSON.stringify(input));
}

export function checkSize(payload: string) {
  if (!catalogPayloadFits(payload)) throw Error('Catalog exceeds the release document byte limit.');
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
  validateEventHealth(snapshot, now);
  return snapshot;
}

export function validateRollback(payload: string, active: CatalogSnapshot, now: Date) {
  const target = parsePayload(payload);
  const saved = savedDestinations(target);
  if (!saved.passed) throw Error('Saved destination collision: ' + saved.issues.map(issue => issue.id).join(', '));

  requireSavedHiddenContinuity(active, target, 'Rollback');
  validateEventHealth(target, now);
}

export function requireSavedHiddenContinuity(active: CatalogSnapshot, target: CatalogSnapshot, operation: 'Cutover' | 'Rollback') {
  const currentItems = personalCatalogItems(active);
  const targetItems = personalCatalogItems(target);
  const ids = [...new Set([...currentItems, ...active.guides].map(item => item.id))];
  const savedAfter = new Map(resolveSavedEntries(ids, targetItems, target.guides, insiderRoutes).map(row => [row.id, row.type]));
  const hiddenAfter = new Map(resolveHiddenItems(targetItems, ids).map(row => [row.id, row.kind]));
  const missingSaved = resolveSavedEntries(ids, currentItems, active.guides, insiderRoutes)
    .filter(row => savedAfter.get(row.id) !== row.type);
  const missingHidden = resolveHiddenItems(currentItems, ids).filter(row => hiddenAfter.get(row.id) !== row.kind);
  const missing = [...new Set([...missingSaved, ...missingHidden].map(row => row.id))].sort();
  if (missing.length) throw Error(`${operation} would lose Saved/Hidden destinations: ${missing.join(', ')}`);
}

function validateEventHealth(snapshot: CatalogSnapshot, now: Date) {
  const events = eventHealth(snapshot, now);
  if (!events.healthy || events.records.some(e => e.startQuality !== 'zoned_iso' || e.endState === 'invalid')) {
    throw Error('Event timing or health failed: ' + events.issues.map(issue => issue.code).join(', '));
  }
}
