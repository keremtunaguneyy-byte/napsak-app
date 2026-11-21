import { analyzeEventCatalog } from '../../src/eventOperations';
import { createExperienceEligibilityContext, isExperienceRecommendationEligible, isPlaceRecommendationEligible } from '../../src/contentPolicy';
import { isValidCoordinates } from '../../src/domain';
import { CatalogSnapshot } from '../../src/data/catalog';
import { resolveAnkara101Reader } from '../../src/ankara101Reader';
import { auditExperienceStarts } from '../auditExperienceStartCoordinates';
import { collisions, compare, counts, instant, occurrenceTime, kinds, Row, verificationBand } from './records';

export function lifecycle(c: CatalogSnapshot, rows: Row[], now: Date) {
  const valid = new Set(rows.filter(r => r.valid).map(r => r.item));
  const context = createExperienceEligibilityContext(c.places.filter(p => valid.has(p)), c.events.filter(e => valid.has(e) && Number.isFinite(occurrenceTime(e.startsAt))));
  function eligible({ item, valid }: Row) {
    if (!valid) return false;
    if (!('kind' in item)) return isPlaceRecommendationEligible(item);
    if (item.kind === 'experience') return isExperienceRecommendationEligible(item, context, now);
    if (item.kind === 'event') return occurrenceTime(item.startsAt) > now.getTime();
    return item.kind === 'idea';
  }
  function state({ item, valid }: Row) {
    if (!valid) return 'invalid';
    if (!('kind' in item)) return isPlaceRecommendationEligible(item) ? 'active' : item.status === 'active' ? 'excluded' : item.status;
    switch (item.kind) {
      case 'guide': return resolveAnkara101Reader(c.guides, item.id) ? 'editorial' : 'unresolved';
      case 'idea': return 'active';
      case 'event': {
        const start = instant(item.startsAt), end = instant(item.endsAt);
        if (!Number.isFinite(start) || (item.endsAt !== undefined && (!Number.isFinite(end) || end < start))) return 'invalid';
        return start > now.getTime() ? 'future' : 'expired';
      }
      case 'experience': {
        if (item.points.some(p => !context.placesById.has(p.placeId))) return 'unresolved';
        if (item.lifecycle === 'event_linked') {
          const event = context.eventsById.get(item.eventId);
          if (!event || event.cityId !== item.cityId) return 'unresolved';
          if (!Number.isFinite(occurrenceTime(event.startsAt))) return 'invalid';
          if (occurrenceTime(event.startsAt) <= now.getTime()) return 'expired';
        }
        if (item.lifecycle === 'conditional') return 'conditional';
        return isExperienceRecommendationEligible(item, context, now) ? 'active' : 'linked-place-ineligible';
      }
    }
  }
  return Object.fromEntries(kinds.map(kind => {
    const items = rows.filter(r => r.kind === kind);
    const measured = items.map(row => ({ key: row.key, state: state(row) }));
    const states = counts(measured.map(r => r.state));
    const declared = kind === 'place' ? counts(c.places.map(p => p.status || 'missing'))
      : kind === 'experience' ? counts(c.experiences.map(e => e.lifecycle || 'missing')) : undefined;
    return [kind, { total: items.length, eligible: kind === 'guide' ? null : items.filter(eligible).length,
      states, declared, flagged: measured.filter(r => ['invalid', 'unresolved'].includes(r.state)).map(r => r.key) }];
  }));
}
export function eventHealth(c: CatalogSnapshot, now: Date) {
  const events = [...c.events].sort((a, b) => compare(a.id, b.id));
  // The production health check uses Date.parse. Ambiguous or invalid local times cannot depend on host TZ here.
  const health = analyzeEventCatalog(events.map(e => Number.isFinite(occurrenceTime(e.startsAt)) ? e : { ...e, startsAt: '' }), now);
  return { ...health, issues: health.issues.sort((a, b) => compare(a.code, b.code)),
    records: events.map(e => ({ id: e.id, start: e.startsAt ?? null, end: e.endsAt ?? null,
      startQuality: Number.isFinite(instant(e.startsAt)) ? 'zoned_iso'
        : Number.isFinite(occurrenceTime(e.startsAt)) ? 'runtime_parseable_noncanonical' : 'invalid_or_unzoned',
      endState: e.endsAt === undefined ? 'unspecified' : !Number.isFinite(instant(e.endsAt)) || instant(e.endsAt) < occurrenceTime(e.startsAt)
        ? 'invalid' : instant(e.endsAt) <= now.getTime() ? 'ended' : 'future', verifiedAt: e.verifiedAt ?? null,
      verification: verificationBand(e.verifiedAt, now) })) };
}

export function geography(c: CatalogSnapshot) {
  const invalid: string[] = [], outside: string[] = [];
  const locations: [string, string][] = [];
  for (const p of [...c.places, ...c.experiences]) {
    const id = p.id;
    if (!isValidCoordinates(p)) invalid.push(id);
    else {
      if (p.latitude < 38 || p.latitude > 41 || p.longitude < 30.5 || p.longitude > 34.5) outside.push(p.id);
      if (!('kind' in p)) locations.push([p.latitude + ',' + p.longitude, p.id]); // Plan anchors intentionally reuse stop coordinates.
    }
  }
  const failures = auditExperienceStarts(c.experiences.map(e => ({ ...e, points: e.points ?? [] })), c.places).flatMap(r => {
    const reasons = r.pass ? [] : [r.reason];
    if (new Set(r.orderedStopIds).size !== r.orderedStopIds.length) reasons.push('repeated ordered Place');
    return reasons.length ? [{ id: r.id, reasons }] : [];
  }).sort((a, b) => compare(a.id, b.id));
  return { coordinatesChecked: c.places.length + c.experiences.length, invalid: invalid.sort(), outsideAnkara: outside.sort(),
    identicalPlaceCoordinates: collisions(locations), plansChecked: c.experiences.length,
    stopsChecked: c.experiences.reduce((n, e) => n + (e.points?.length ?? 0), 0), failures };
}
