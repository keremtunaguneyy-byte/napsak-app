import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { embeddedCatalog } from '../src/data/catalog';
import { parseCatalogSnapshot } from '../src/data/catalogValidation';

const parsedLocal = parseCatalogSnapshot(embeddedCatalog('ankara'));
if (!parsedLocal) throw new Error('Embedded catalog failed runtime validation.');
const local = parsedLocal;

const localCounts = {
  cities: local.cities.length,
  places: local.places.length,
  experiences: local.experiences.length,
  events: local.events.length,
  ideas: local.ideas.length,
};
const projectArg = process.argv.find(item => item.startsWith('--project='))?.slice('--project='.length);
if (!projectArg) {
  console.log('Local catalog parity passed', { version: local.catalogVersion, counts: localCounts });
  process.exit(0);
}

if (!getApps().length) initializeApp({ projectId: projectArg, credential: applicationDefault() });
const db = getFirestore();

function sortById(values: unknown[]): unknown[] {
  return [...values].sort((a, b) => {
    const aId = String((a as { id?: unknown }).id ?? '');
    const bId = String((b as { id?: unknown }).id ?? '');
    return aId.localeCompare(bId);
  });
}

async function documents(name: string, cityScoped: boolean): Promise<unknown[]> {
  let query: FirebaseFirestore.Query = db.collection(name);
  if (cityScoped) query = query.where('cityId', '==', local!.cityId);
  return sortById((await query.get()).docs.map(item => item.data()));
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]));
}

async function main(): Promise<void> {
  const meta = (await db.collection('catalogMeta').doc(local.cityId).get()).data();
  if (!meta || meta.catalogVersion !== local.catalogVersion || meta.schemaVersion !== local.schemaVersion) {
    throw new Error('Remote catalog metadata does not match the embedded catalog.');
  }
  const comparisons: [string, unknown[], unknown[]][] = [
    ['cities', local.cities, await documents('cities', false)],
    ['places', local.places, await documents('places', true)],
    ['experiences', local.experiences, await documents('experiences', true)],
    ['events', local.events, await documents('events', true)],
    ['ideas', local.ideas, await documents('ideas', false)],
  ];
  for (const [name, expected, actual] of comparisons) {
    const expectedCitySlice = name === 'cities' ? expected.filter(item => (item as { id: string }).id === local.cityId) : expected;
    const actualCitySlice = name === 'cities' ? actual.filter(item => (item as { id?: string }).id === local.cityId) : actual;
    const sortedExpected = sortById(expectedCitySlice);
    const sortedActual = sortById(actualCitySlice);
    if (JSON.stringify(canonical(sortedExpected)) !== JSON.stringify(canonical(sortedActual))) {
      const mismatchIndex = sortedExpected.findIndex((item, index) =>
        JSON.stringify(canonical(item)) !== JSON.stringify(canonical(sortedActual[index])),
      );
      const expectedId = (sortedExpected[mismatchIndex] as { id?: unknown } | undefined)?.id;
      const actualId = (sortedActual[mismatchIndex] as { id?: unknown } | undefined)?.id;
      throw new Error(
        `${name}: local/Firestore document parity failed at index ${mismatchIndex} (local id: ${String(expectedId)}, Firestore id: ${String(actualId)}).`,
      );
    }
  }
  console.log('Local/Firestore catalog parity passed', { projectId: projectArg, version: local.catalogVersion, counts: localCounts });
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
