import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import * as engine from '../src/recommendations';
import type { RecommendationItem } from '../src/recommendations';
import type { BudgetPreference, DurationPreference, GroupSizePreference, Interest, Mood } from '../src/types';
import { auditNow, catalog, defaultFingerprint, origins } from '../tests/helpers/proximityScenarios';

const baselinePath = 'docs/evidence/proximity-engine-b2/default-baseline.json';
const measurementPath = 'docs/evidence/proximity-engine-b2/sequence-measurements.json';
const command = process.argv[2];
if (command === 'capture-default') {
  // Run BEFORE editing the engine. Reproduce from the recorded base using this script/helper.
  const baseline = { baselineCommit: '6244fa49b35669a04e5e5578f8b8a3dd0ec5eb41', ...defaultFingerprint(engine) };
  writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`, { flag: 'wx' });
  console.log(baseline);
} else if (command === 'verify-default') {
  const { baselineCommit: _base, ...expected } = JSON.parse(readFileSync(baselinePath, 'utf8'));
  for (const policy of [undefined, 'default'] as const) assert.deepEqual(defaultFingerprint(engine, policy), expected);
  console.log('Omitted and explicit default: exact full-result baseline parity', expected);
} else if (command === 'measure') {
  type Profile = { id: string; mood: Mood; interests: Interest[]; budget: BudgetPreference; duration: DurationPreference; groupSize: GroupSizePreference };
  const profiles: Profile[] = [
    { id: 'broad-calm', mood: 'Sakin', interests: [], budget: 'Fark etmez', duration: 'Fark etmez', groupSize: 'Tek' },
    { id: 'coffee-social', mood: 'Sosyal', interests: ['Kahve'], budget: '₺₺', duration: '1–2 saat', groupSize: '2 kişi' },
    { id: 'art-curious', mood: 'Meraklı', interests: ['Sanat'], budget: 'Fark etmez', duration: '3–4 saat', groupSize: 'Tek' },
    { id: 'nature-active', mood: 'Enerjik', interests: ['Doğa'], budget: 'Fark etmez', duration: 'Yarım gün', groupSize: '5+' },
    { id: 'food-social', mood: 'Sosyal', interests: ['Lezzet'], budget: '₺₺₺', duration: '1–2 saat', groupSize: '3–4 kişi' },
    { id: 'events-curious', mood: 'Meraklı', interests: ['Etkinlik'], budget: '₺', duration: 'Fark etmez', groupSize: '2 kişi' },
    { id: 'free-short', mood: 'Enerjik', interests: ['Sanat', 'Doğa'], budget: 'Ücretsiz', duration: '30–60 dk', groupSize: 'Tek' },
    { id: 'free-mixed', mood: 'Sakin', interests: ['Kahve', 'Lezzet'], budget: 'Ücretsiz', duration: '1–2 saat', groupSize: '2 kişi' },
  ];
  const median = (values: number[]) => {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return (sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2);
  };
  function metrics(batches: RecommendationItem[][], profile: Profile) {
    const items = batches.flat();
    const unique = new Set(items.map(item => item.id)).size;
    const mainDistances = batches.flatMap(batch => batch[0] && 'distance' in batch[0] && batch[0].distance !== undefined ? [batch[0].distance] : []);
    const experiences = items.filter(item => item.kind === 'experience');
    return {
      groups: batches.length, results: items.length,
      mainCardMedianKm: median(mainDistances),
      groupsOver30Km: batches.filter(batch => batch.some(item => 'distance' in item && item.distance !== undefined && item.distance > 30)).length,
      uniqueResults: unique, repeatAppearances: items.length - unique,
      adjacentRepeatAppearances: batches.slice(1).reduce((sum, batch, i) => sum + batch.filter(item => batches[i].some(previous => previous.id === item.id)).length, 0),
      emptyGroups: batches.filter(batch => !batch.length).length,
      partialGroups: batches.filter(batch => batch.length > 0 && batch.length < 5).length,
      primaryMatches: profile.interests.length ? experiences.filter(item => profile.interests.some(interest => item.primaryInterests.includes(interest))).length : 0,
      primaryOpportunities: profile.interests.length ? experiences.length : 0,
      moodMatches: items.filter(item => item.moods.includes(profile.mood)).length,
      groupMatches: items.filter(item => item.kind === 'experience' ? item.groupSizes.includes(profile.groupSize) : item.kind === 'place' && engine.placeGroupSignal(item, profile.groupSize) > 0).length,
      exactBudgetMatches: items.filter(item => item.priceLevel === engine.budgetPreferencePriceLevel(profile.budget)).length,
      averageDurationFit: experiences.length ? experiences.reduce((sum, item) => sum + engine.durationFitSignal(item, profile.duration), 0) / experiences.length : null,
    };
  }
  const rows = [];
  const aggregates = [];
  for (const filter of ['experience', 'place'] as const) for (const proximityPolicy of ['default', 'nearby'] as const) {
    const allBatches: RecommendationItem[][] = [];
    const groupRows: ReturnType<typeof metrics>[] = [];
    for (const coordinates of origins) for (const profile of profiles) {
      const batches: RecommendationItem[][] = [];
      let previousBatch: string[] = [];
      const hash = createHash('sha256');
      for (let step = 0; step < 16; step++) {
        const result = engine.recommendAll({ ...catalog, ...profile, coordinates, filter, proximityPolicy, now: auditNow, dismissed: [], limit: 5, seed: 1000 + step, previousBatch });
        assert.equal(new Set(result.map(item => item.id)).size, result.length);
        assert.ok(result.every(item => Number.isFinite(item.score) && 'distance' in item && Number.isFinite(item.distance)));
        if (profile.budget === 'Ücretsiz') assert.ok(result.every(item => item.priceLevel === 0));
        batches.push(result);
        hash.update(JSON.stringify(result)); hash.update('\n');
        previousBatch = result.map(item => item.id);
      }
      const measured = metrics(batches, profile);
      rows.push({ filter, policy: proximityPolicy, origin: coordinates.id, profile: profile.id, ...measured, resultSha256: hash.digest('hex') });
      groupRows.push(measured);
      allBatches.push(...batches);
    }
    const total = (key: 'uniqueResults' | 'repeatAppearances' | 'adjacentRepeatAppearances' | 'primaryMatches' | 'primaryOpportunities' | 'moodMatches' | 'groupMatches' | 'exactBudgetMatches') => groupRows.reduce((sum, row) => sum + row[key], 0);
    aggregates.push({
      filter, policy: proximityPolicy, sequences: groupRows.length,
      groups: allBatches.length, results: allBatches.flat().length,
      mainCardMedianKm: median(allBatches.flatMap(batch => batch[0] && 'distance' in batch[0] ? [batch[0].distance!] : [])),
      groupsOver30Km: groupRows.reduce((sum, row) => sum + row.groupsOver30Km, 0),
      meanUniquePerSequence: total('uniqueResults') / groupRows.length,
      repeatAppearances: total('repeatAppearances'), adjacentRepeatAppearances: total('adjacentRepeatAppearances'),
      emptyGroups: groupRows.reduce((sum, row) => sum + row.emptyGroups, 0),
      partialGroups: groupRows.reduce((sum, row) => sum + row.partialGroups, 0),
      primaryMatches: total('primaryMatches'), primaryOpportunities: total('primaryOpportunities'),
      moodMatches: total('moodMatches'), groupMatches: total('groupMatches'), exactBudgetMatches: total('exactBudgetMatches'),
    });
  }
  const report = {
    schemaVersion: 1, now: auditNow.toISOString(), catalogVersion: catalog.catalogVersion,
    batchesPerSequence: 16, seeds: '1000..1015; previous batch = immediately preceding same policy/surface result',
    origins, profiles,
    definitions: {
      mainCardMedianKm: 'Median over nonempty group first-card great-circle distances; even count averages middle pair.',
      groupsOver30Km: 'Groups with at least one result whose distance is strictly greater than 30 km.',
      uniqueResults: 'Distinct IDs within one 16-batch sequence; aggregate uses mean per sequence.',
      repeatAppearances: 'Total appearances minus distinct IDs within each sequence; summed over independent sequences.',
      primaryOpportunities: 'Experience appearances in profiles with explicit interests; no-interest profiles excluded.',
      groupMatches: 'Experience groupSizes includes selection; Place uses existing positive placeGroupSignal.',
      exactBudgetMatches: 'Structured price equals selected band; indifferent budget never counted as exact.',
      averageDurationFit: 'Existing durationFitSignal mean per sequence, Experience only.',
    },
    limitations: 'Synthetic preference profiles; embedded verified coordinates, not fresh GPS or independently re-surveyed locations. Straight-line distance is not travel time. No new acceptance thresholds; no native/device/release claim.',
    aggregates, sequences: rows,
  };
  writeFileSync(measurementPath, `${JSON.stringify(report, null, 2)}\n`);
  console.table(aggregates);
} else {
  throw new Error('Use capture-default (before engine edits), verify-default, or measure');
}
