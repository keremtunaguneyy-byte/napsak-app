const assert = require('node:assert/strict');
const { places } = require('../.test-build/data/places.js');
const { experiences } = require('../.test-build/data/experiences.js');
const { durationEligible, recommendExperiences, recommendPlaces } = require('../.test-build/recommendations.js');
const { KNOWN_MOODS, KNOWN_INTERESTS, KNOWN_BUDGETS, KNOWN_DURATIONS, KNOWN_GROUP_SIZES } = require('../.test-build/types.js');

const interestSets = [[]];
for (let mask = 1; mask < 1 << KNOWN_INTERESTS.length; mask++) {
  interestSets.push(KNOWN_INTERESTS.filter((_, bit) => mask & (1 << bit)));
}
const report = { scenarios: 0, empty: 0, interestMismatch: 0, duplicates: 0, diversityProblems: 0, rotationChecks: 0, overlapTotal: 0 };
let budgetChanges = 0;
let groupChanges = 0;
const ids = values => values.map(value => value.id);
const eligible = interests => places.filter(place => !interests.length || interests.some(interest => place.category === interest || place.interests.includes(interest)));

for (const mood of KNOWN_MOODS) for (const interests of interestSets) for (const budget of KNOWN_BUDGETS) for (const groupSize of KNOWN_GROUP_SIZES) {
  report.scenarios++;
  const options = { places, mood, interests, budget, groupSize, dismissed: [], limit: 5, seed: 71 };
  const first = recommendPlaces(options);
  if (eligible(interests).length && !first.length) report.empty++;
  if (first.some(place => interests.length && !interests.some(interest => place.category === interest || place.interests.includes(interest)))) report.interestMismatch++;
  if (new Set(ids(first)).size !== first.length) report.duplicates++;
  // Diversity is meaningful only where preferences permit several catalogue categories.
  const eligibleCategories = new Set(eligible(interests).map(place => place.category));
  if (first.length === 5 && eligibleCategories.size >= 3 && new Set(first.map(place => place.category)).size < 2) report.diversityProblems++;
  const repeat = recommendPlaces(options);
  assert.deepEqual(ids(first), ids(repeat), 'deterministic mode changed output');
  const dismissed = first.slice(0, 2).map(place => place.id);
  assert.ok(recommendPlaces({ ...options, dismissed }).every(place => !dismissed.includes(place.id)), 'dismissed item returned');
  const second = recommendPlaces({ ...options, seed: 72, previousBatch: ids(first) });
  if (eligible(interests).length >= 10) {
    report.rotationChecks++;
    report.overlapTotal += second.filter(place => ids(first).includes(place.id)).length;
  }
}

// Ranking sensitivity checks compare broad, otherwise-identical scenarios rather than brittle exact orders.
for (const mood of KNOWN_MOODS) for (const interests of interestSets) {
  const base = { places, mood, interests, dismissed: [], limit: 10, seed: 19 };
  if (ids(recommendPlaces({ ...base, budget: 'Ücretsiz' })).join() !== ids(recommendPlaces({ ...base, budget: '₺₺₺' })).join()) budgetChanges++;
  if (ids(recommendPlaces({ ...base, groupSize: 'Tek' })).join() !== ids(recommendPlaces({ ...base, groupSize: '5+' })).join()) groupChanges++;
}
report.averageBatchOverlap = report.rotationChecks ? Number((report.overlapTotal / report.rotationChecks).toFixed(3)) : 0;
report.budgetSensitiveProfiles = budgetChanges;
report.groupSensitiveProfiles = groupChanges;
console.log('\nRecommendation stress analysis');
console.table(report);
assert.equal(report.empty, 0);
assert.equal(report.interestMismatch, 0);
assert.equal(report.duplicates, 0);
assert.equal(report.diversityProblems, 0);
assert.ok(report.averageBatchOverlap <= 1, `average overlap too high: ${report.averageBatchOverlap}`);
assert.ok(budgetChanges > 10, 'budget does not materially affect enough profiles');
assert.ok(groupChanges > 10, 'group size does not materially affect enough profiles');

const experienceReport = { scenarios: 0, empty: 0, interestMismatch: 0, durationMismatch: 0, duplicates: 0, rotationChecks: 0, overlapTotal: 0 };
for (const mood of KNOWN_MOODS) for (const interests of interestSets) for (const duration of KNOWN_DURATIONS) {
  experienceReport.scenarios++;
  const options = { experiences, mood, interests, duration, dismissed: [], limit: 5, seed: 91, now: new Date('2026-08-08T00:00:00Z') };
  const eligibleExperiences = experiences.filter(item => durationEligible(item, duration) && (!interests.length || interests.some(interest => item.primaryInterests.includes(interest) || item.secondaryInterests.includes(interest))));
  const first = recommendExperiences(options);
  if (eligibleExperiences.length && !first.length) experienceReport.empty++;
  if (first.some(item => interests.length && !interests.some(interest => item.primaryInterests.includes(interest) || item.secondaryInterests.includes(interest)))) experienceReport.interestMismatch++;
  if (first.some(item => !durationEligible(item, duration))) experienceReport.durationMismatch++;
  if (new Set(ids(first)).size !== first.length) experienceReport.duplicates++;
  const repeat = recommendExperiences(options);
  assert.deepEqual(ids(first), ids(repeat), 'Experience deterministic mode changed output');
  const dismissed = first.slice(0, 2).map(item => item.id);
  assert.ok(recommendExperiences({ ...options, dismissed }).every(item => !dismissed.includes(item.id)), 'dismissed Experience returned');
  if (eligibleExperiences.length >= 10) {
    const second = recommendExperiences({ ...options, seed: 92, previousBatch: ids(first) });
    experienceReport.rotationChecks++;
    experienceReport.overlapTotal += second.filter(item => ids(first).includes(item.id)).length;
  }
}
experienceReport.averageBatchOverlap = experienceReport.rotationChecks ? Number((experienceReport.overlapTotal / experienceReport.rotationChecks).toFixed(3)) : 0;
console.log('\nExperience stress analysis');
console.table(experienceReport);
assert.equal(experienceReport.empty, 0);
assert.equal(experienceReport.interestMismatch, 0);
assert.equal(experienceReport.durationMismatch, 0);
assert.equal(experienceReport.duplicates, 0);
assert.equal(experienceReport.averageBatchOverlap, 0);
