import { writeFileSync } from 'node:fs';
import { distanceInKm } from '../src/domain';
import { experiences } from '../src/data/experiences';
import { places } from '../src/data/places';
import type { Experience, Place } from '../src/types';

// Existing Ankara catalog bounds: tests/domain.test.cjs (not a new eligibility gate).
const inBounds = (p: { latitude: number; longitude: number }) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude)
  && p.latitude >= 38 && p.latitude <= 41 && p.longitude >= 30.5 && p.longitude <= 34.5;
const same = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => a.latitude === b.latitude && a.longitude === b.longitude;
export function auditExperienceStarts(catalog: readonly Experience[], linkedPlaces: readonly Place[]) {
  return catalog.map(experience => {
    const reasons: string[] = [];
    const first = experience.points[0];
    const links = linkedPlaces.filter(place => place.id === first?.placeId);
    const place = links.length === 1 ? links[0] : undefined;
    if (catalog.filter(item => item.id === experience.id).length !== 1) reasons.push('duplicate Experience ID');
    if (!first) reasons.push('no ordered stops');
    if (first && links.length !== 1) reasons.push(links.length ? 'ambiguous first Place ID' : 'missing first Place linkage');
    if (first && experience.points.filter(point => point.placeId === first.placeId).length !== 1) reasons.push('duplicate first-stop linkage');
    if (!inBounds(experience)) reasons.push('Experience coordinates invalid/outside Ankara bounds');
    for (const [index, point] of experience.points.entries()) {
      const matches = linkedPlaces.filter(p => p.id === point.placeId);
      if (matches.length !== 1) reasons.push(`stop ${index + 1}: missing/ambiguous Place linkage`);
      if (!inBounds(point)) reasons.push(`stop ${index + 1}: invalid/outside Ankara bounds`);
      if (matches.length === 1) {
        if (!inBounds(matches[0])) reasons.push(`stop ${index + 1}: Place coordinates invalid/outside Ankara bounds`);
        if (!same(point, matches[0])) reasons.push(`stop ${index + 1}: coordinates differ from linked Place`);
        if (matches[0].cityId !== experience.cityId) reasons.push(`stop ${index + 1}: cityId mismatch`);
      }
    }
    if (place && !same(experience, place)) reasons.push('Experience coordinates differ from first Place');
    return { id: experience.id, title: experience.title, orderedStopIds: experience.points.map(p => p.placeId),
      firstStopId: first?.placeId, firstPlaceId: place?.id, firstPlaceTitle: place?.name,
      experienceCoordinates: [experience.latitude, experience.longitude],
      firstPlaceCoordinates: place ? [place.latitude, place.longitude] : undefined,
      distanceKm: place && inBounds(experience) && inBounds(place) ? distanceInKm(experience, place) : undefined,
      pass: reasons.length === 0, reason: reasons.join('; ') || 'Exact first-stop match; all ordered links/coordinates valid' };
  });
}
if (process.argv.includes('--write')) {
  const rows = auditExperienceStarts(experiences, places);
  const clean = (s: unknown) => String(s ?? 'missing').replaceAll('|', '\\|');
  const report = '# Experience start coordinate audit\n\nBaseline: `746aad3a19b78d0e0da5fb286898758b0cbba0a0`; 2026-10-14. Stable-ID resolution only. Ordered `points[]` array is the route order; the schema has no separate stop ID or numeric order field. First stop ID below is its `placeId` at index 0. Bounds: latitude [38,41], longitude [30.5,34.5], matching existing Ankara catalog tests. All stops and linked Places were checked, including finite coordinates, exact equality and city linkage. This checks internal catalog integrity, not external coordinate/geocoding accuracy.\n\n'
    + `Result: ${rows.filter(r => r.pass).length}/${rows.length} PASS. No catalog repair.\n\n`
    + '| Experience ID | Title | Ordered stop IDs | First stop ID | First Place ID/title | Experience lat, lon | First Place lat, lon | Separation km | Result | Exact reason |\n|---|---|---|---|---|---|---|---|---|---|\n'
    + rows.map(r => [r.id, r.title, r.orderedStopIds.join(' → '), r.firstStopId, `${r.firstPlaceId} / ${r.firstPlaceTitle}`, r.experienceCoordinates.join(', '), r.firstPlaceCoordinates?.join(', '), r.distanceKm, r.pass ? 'PASS' : 'FAIL', r.reason].map(clean).join(' | ')).map(line => `| ${line} |`).join('\n') + '\n';
  writeFileSync('docs/evidence/experience-distance/coordinate-audit.md', report);
  writeFileSync('docs/evidence/experience-distance/coordinate-audit.json', JSON.stringify(rows, null, 2) + '\n');
  console.log(`${rows.filter(r => r.pass).length}/${rows.length} PASS`);
  if (rows.length !== 52 || rows.some(r => !r.pass)) process.exitCode = 1;
}
