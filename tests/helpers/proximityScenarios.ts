import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { embeddedCatalog } from '../../src/data/catalog';
import { isValidCoordinates } from '../../src/domain';
import { KNOWN_BUDGETS, KNOWN_DURATIONS, KNOWN_GROUP_SIZES, KNOWN_INTERESTS, KNOWN_MOODS, type Interest } from '../../src/types';
import type * as Engine from '../../src/recommendations';

export const catalog = embeddedCatalog('ankara');
export const auditNow = new Date('2026-10-21T12:00:00+03:00');
export const origins = ['kugulu-park', 'cer-modern', 'goksu-parki', 'ahmet-taner-kislali-parki', 'mavi-gol'].map(id => {
  const place = catalog.places.find(item => item.id === id);
  assert.ok(place && place.status === 'active' && place.verifiedAt && place.sourceUrl && isValidCoordinates(place), `Unverified origin: ${id}`);
  return { id, latitude: place.latitude, longitude: place.longitude, sourceUrl: place.sourceUrl, verifiedAt: place.verifiedAt };
});

// Fixed matrices: no clock, GPS, remote catalog or mutable random source.
export function* parityOptions() {
  const interests: Interest[][] = [[], ...KNOWN_INTERESTS.map(interest => [interest]), ['Sanat', 'Doğa'], ['Kahve', 'Lezzet']];
  let index = 0;
  for (const mood of KNOWN_MOODS) for (const chosen of interests) for (const budget of KNOWN_BUDGETS) {
    for (const duration of [undefined, ...KNOWN_DURATIONS]) for (const seed of [0, 37]) {
      const i = index++;
      yield {
        ...catalog, mood, interests: chosen, budget, duration, seed,
        groupSize: [undefined, ...KNOWN_GROUP_SIZES][i % 5],
        coordinates: i % 6 === 5 ? undefined : origins[i % 6],
        now: i % 2 ? auditNow : new Date('2026-10-13T12:00:00+03:00'),
        dismissed: i % 3 ? [] : [catalog.places[0].id, catalog.experiences[0].id, catalog.events[0].id, catalog.ideas[0].id],
        previousBatch: i % 4 ? [] : [...catalog.places.slice(0, 5), ...catalog.experiences.slice(0, 5), ...catalog.events.slice(0, 5), ...catalog.ideas.slice(0, 5)].map(item => item.id),
      };
    }
  }
}

/** Hash full JSON results, including order, distance, raw scores, reasons and data. */
export function defaultFingerprint(engine: typeof Engine, proximityPolicy?: 'default') {
  const hash = createHash('sha256');
  let cases = 0;
  let calls = 0;
  let eligiblePlaces = 0;
  let eligibleExperiences = 0;
  const capture = (value: unknown) => { calls++; hash.update(JSON.stringify(value)); hash.update('\n'); };
  for (const base of parityOptions()) {
    const options = { ...base, ...(proximityPolicy ? { proximityPolicy } : {}) };
    cases++;
    const places = engine.recommendPlaces({ ...options, limit: 1000 });
    const experiences = engine.recommendExperiences({ ...options, limit: 1000 });
    eligiblePlaces += places.length;
    eligibleExperiences += experiences.length;
    capture(places);
    capture(experiences);
    capture(engine.recommendPlaces({ ...options, limit: 5 }));
    capture(engine.recommendExperiences({ ...options, limit: 5 }));
    capture(engine.recommendExperiencesForPlace(catalog.places[cases % catalog.places.length], { ...options, limit: 5 }));
    for (const filter of ['all', 'experience', 'place', 'event', 'idea'] as const) {
      const first = engine.recommendAll({ ...options, filter, limit: 5 });
      capture(first);
      capture(engine.recommendAll({ ...options, filter, limit: 5, seed: options.seed + 1, previousBatch: first.map(item => item.id) }));
    }
  }
  return { cases, calls, eligiblePlaces, eligibleExperiences, fullResultsSha256: hash.digest('hex') };
}
