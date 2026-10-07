import test from 'node:test';
import assert from 'node:assert/strict';
import { embeddedCatalog } from '../src/data/catalog';
import type { RecommendationItem } from '../src/recommendations';
import { homeActionLabel, homeArtwork, homeItemMeta, homeItemTitle } from '../src/components/gezek/gezekHomePresentation';
import { homeExperienceDetailEntry, openHomeRecommendation } from '../src/homeNavigation';
import { googleMapsUrlForExperiencePoints } from '../src/mapLinks';

const catalog = embeddedCatalog('ankara');
const plan: RecommendationItem = { ...catalog.experiences[0], score: 0, reasons: [] };
const place: RecommendationItem = { ...catalog.places[0], kind: 'place', score: 0, reasons: [] };
const event: RecommendationItem = { ...catalog.events[0], score: 0, reasons: [] };
const idea: RecommendationItem = { ...catalog.ideas[0], score: 0, reasons: [] };

test('Home artwork uses stable content identity independent of title or mutable categories', () => {
  for (const item of [plan, place, event, idea]) {
    const visual = homeArtwork(item, 'Hero');
    assert.equal(visual.type, 'artwork');
    const renamed = { ...item, title: 'unrelated name', name: 'unrelated name' };
    assert.deepEqual(homeArtwork(renamed, 'Hero'), visual);
  }
  assert.deepEqual(homeArtwork({ kind: 'place', id: 'unverified-photo' }, 'Hero'), { type: 'neutral', layout: 'Hero' });
});

test('Home metadata uses actual distances, durations, stop counts and prices', () => {
  assert.equal(homeItemMeta({ ...place, district: 'Çankaya', priceLevel: 0 }), 'Çankaya · Bedava');
  assert.equal(homeItemMeta({ ...place, district: 'Çankaya', distance: 1.25, priceLevel: 2 }), 'Çankaya · 1.3 km · ₺₺');
  assert.equal(homeItemMeta({ ...plan, minDurationMinutes: 60, maxDurationMinutes: 120, priceLevel: 1 }), `${plan.points.length} durak · 1 sa–2 sa · ₺`);
  assert.equal(homeItemTitle(place), place.name);
  assert.equal(homeItemTitle(plan), plan.title);
});

test('Home action copy preserves each content kind and optional Idea action', () => {
  assert.equal(homeActionLabel(plan), 'Planı incele');
  assert.equal(homeActionLabel(place), 'Mekânı incele');
  assert.equal(homeActionLabel(event), 'Etkinliği incele');
  assert.equal(homeActionLabel({ ...idea, actionLabel: undefined, actionUrl: undefined }), 'Fikri incele');
  assert.equal(homeActionLabel({ ...idea, actionUrl: 'https://example.com/verified-source', actionLabel: 'Resmî kaynağı aç' }), 'Resmî kaynağı aç');
});

test('Planı incele opens the exact selected internal plan rather than an external action', () => {
  const calls: unknown[][] = [];
  const actions = {
    openPlaceDetail: (id: string) => calls.push(['place', id]),
    openExperienceDetail: (entry: { placeId: string; planId: string }) => calls.push(['plan', entry]),
    unavailableExperience: () => calls.push(['unavailable']),
    openEvent: () => calls.push(['external-event']), openIdea: () => calls.push(['external-idea']),
    showIdea: () => calls.push(['idea']),
  };
  for (const experience of catalog.experiences) {
    calls.length = 0;
    openHomeRecommendation({ ...experience, score: 0, reasons: [] }, catalog.places, actions);
    assert.deepEqual(calls, [['plan', { placeId: experience.points[0].placeId, planId: experience.id }]]);
  }
  calls.length = 0;
  openHomeRecommendation(plan, [], actions);
  assert.deepEqual(calls, [['unavailable']]);
});

test('plans sharing a place keep distinct selected IDs; titles are not navigation keys', () => {
  const sameTitle = { ...plan, id: 'different-plan', title: plan.title };
  assert.equal(homeExperienceDetailEntry(plan, catalog.places)?.planId, plan.id);
  assert.equal(homeExperienceDetailEntry(sameTitle, catalog.places)?.planId, 'different-plan');
  assert.equal(homeExperienceDetailEntry({ ...plan, points: [] }, catalog.places), undefined);
});

test('real catalog plan URLs preserve the selected point IDs, coordinates and order', () => {
  const places = new Map(catalog.places.map(item => [item.id, item]));
  for (const experience of catalog.experiences) {
    for (const point of experience.points) {
      const linked = places.get(point.placeId)!;
      assert.ok(linked, `${experience.id}: missing ${point.placeId}`);
      assert.equal(point.latitude, linked.latitude, experience.id);
      assert.equal(point.longitude, linked.longitude, experience.id);
    }
    const url = new URL(googleMapsUrlForExperiencePoints(experience.points)!);
    const expected = experience.points.map(point => `${point.latitude},${point.longitude}`);
    const actual = experience.points.length === 1 ? [url.searchParams.get('query')] : [
      url.searchParams.get('origin'), ...(url.searchParams.get('waypoints')?.split('|') ?? []), url.searchParams.get('destination'),
    ];
    assert.deepEqual(actual, expected, experience.id);
  }
});
