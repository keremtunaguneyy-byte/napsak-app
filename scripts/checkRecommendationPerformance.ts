import { performance } from 'node:perf_hooks';
import { embeddedCatalog } from '../src/data/catalog';
import { RECOMMENDATION_P95_BUDGET_MS } from '../src/performancePolicy';
import { recommendAll } from '../src/recommendations';
import type { BudgetPreference, DurationPreference, GroupSizePreference, Interest, Mood } from '../src/types';

const catalog = embeddedCatalog('ankara');
const now = new Date('2026-09-08T12:00:00+03:00');
const moods: Mood[] = ['Enerjik', 'Sakin', 'Sosyal', 'Meraklı'];
const interests: Interest[][] = [[], ['Kahve'], ['Sanat', 'Doğa'], ['Lezzet'], ['Etkinlik']];
const budgets: BudgetPreference[] = ['Ücretsiz', '₺₺', 'Fark etmez'];
const groups: GroupSizePreference[] = ['Tek', '2 kişi', '5+'];
const durations: DurationPreference[] = ['30–60 dk', '1–2 saat', 'Yarım gün', 'Fark etmez'];
const filters = ['all', 'experience', 'place', 'event', 'idea'] as const;
const iterations = 5_000;
const samples: number[] = [];
let checksum = 0;

function run(index: number): void {
  const result = recommendAll({
    places: catalog.places,
    ideas: catalog.ideas,
    events: catalog.events,
    experiences: catalog.experiences,
    mood: moods[index % moods.length],
    interests: interests[index % interests.length],
    budget: budgets[index % budgets.length],
    groupSize: groups[index % groups.length],
    duration: durations[index % durations.length],
    filter: filters[index % filters.length],
    dismissed: [],
    limit: 5,
    seed: index,
    now,
  });
  checksum += result.length;
}

for (let index = 0; index < 250; index += 1) run(index);
for (let index = 0; index < iterations; index += 1) {
  const startedAt = performance.now();
  run(index);
  samples.push(performance.now() - startedAt);
}

samples.sort((a, b) => a - b);
const percentile = (ratio: number) => samples[Math.min(samples.length - 1, Math.ceil(samples.length * ratio) - 1)];
const report = {
  iterations,
  meanMs: Number((samples.reduce((sum, value) => sum + value, 0) / samples.length).toFixed(3)),
  p50Ms: Number(percentile(.5).toFixed(3)),
  p95Ms: Number(percentile(.95).toFixed(3)),
  p99Ms: Number(percentile(.99).toFixed(3)),
  budgetMs: RECOMMENDATION_P95_BUDGET_MS,
  checksum,
};

console.table(report);
if (report.p95Ms > RECOMMENDATION_P95_BUDGET_MS) {
  throw new Error(`recommendation_p95_budget_exceeded:${report.p95Ms}>${RECOMMENDATION_P95_BUDGET_MS}`);
}
