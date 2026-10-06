import test from 'node:test';
import assert from 'node:assert/strict';
import { embeddedCatalog } from '../src/data/catalog';
import type { RecommendationItem } from '../src/recommendations';
import { homeActionLabel, homeIllustration, homeItemMeta, homeItemTitle, homePhoto } from '../src/components/gezek/gezekHomePresentation';

const catalog = embeddedCatalog('ankara');
const plan: RecommendationItem = { ...catalog.experiences[0], score: 0, reasons: [] };
const place: RecommendationItem = { ...catalog.places[0], kind: 'place', score: 0, reasons: [] };
const event: RecommendationItem = { ...catalog.events[0], score: 0, reasons: [] };
const idea: RecommendationItem = { ...catalog.ideas[0], score: 0, reasons: [] };

test('Home artwork follows content semantics, never a title or photo-name heuristic', () => {
  assert.equal(homeIllustration({ ...place, name: 'K0 match · ticket · Gezek' }), 'place');
  assert.equal(homeIllustration({ ...event, title: 'Hamamönü kahve' }), 'event');
  assert.equal(homeIllustration({ ...idea, title: 'Kuğulu Park' }), 'idea');
  assert.equal(homePhoto(place.id), undefined);
  assert.equal(homePhoto('unverified-photo'), undefined);
});

test('plans use a reliable declared dominant category or neutral artwork', () => {
  assert.equal(homeIllustration({ ...plan, category: 'Kahve', primaryInterests: ['Kahve'] }), 'place');
  assert.equal(homeIllustration({ ...plan, category: 'Lezzet', primaryInterests: ['Lezzet'] }), 'place');
  assert.equal(homeIllustration({ ...plan, category: 'Etkinlik', primaryInterests: ['Etkinlik'] }), 'event');
  assert.equal(homeIllustration({ ...plan, category: 'Kahve', primaryInterests: ['Sanat'] }), 'neutral');
  assert.equal(homeIllustration({ ...plan, category: 'Doğa', primaryInterests: ['Doğa'] }), 'neutral');
  assert.equal(homeIllustration({ ...plan, category: 'Sanat', primaryInterests: ['Sanat'] }), 'neutral');
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
