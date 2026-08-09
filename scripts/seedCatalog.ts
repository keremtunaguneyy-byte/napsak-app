import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { FieldPath, getFirestore } from 'firebase-admin/firestore';

import { embeddedCatalog } from '../src/data/catalog';
import { parseCatalogSnapshot } from '../src/data/catalogValidation';

type Environment = 'development' | 'production';

function argument(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find(item => item.startsWith(prefix))?.slice(prefix.length);
}

const projectId = argument('project') ?? process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID;
const environment = (argument('environment') ?? 'development') as Environment;
const apply = process.argv.includes('--apply');
const confirmation = argument('confirm-production');
const parsedSnapshot = parseCatalogSnapshot(embeddedCatalog('ankara'));

if (!parsedSnapshot) throw new Error('Embedded catalog failed runtime validation.');
const snapshot = parsedSnapshot;
if (environment !== 'development' && environment !== 'production') throw new Error('Use --environment=development or --environment=production.');

const counts = {
  cities: snapshot.cities.length,
  places: snapshot.places.length,
  experiences: snapshot.experiences.length,
  events: snapshot.events.length,
  ideas: snapshot.ideas.length,
  guides: snapshot.guides.length,
};

if (!apply) {
  console.log('Catalog seed dry run', { environment, projectId: projectId ?? '(not required for dry run)', version: snapshot.catalogVersion, counts });
  process.exit(0);
}
if (!projectId) throw new Error('Apply mode requires --project=<firebase-project-id>.');
if (environment === 'production' && confirmation !== projectId) {
  throw new Error('Production seed requires --confirm-production=<same-project-id>.');
}

if (!getApps().length) initializeApp({ projectId, credential: applicationDefault() });
const db = getFirestore();

async function upsertCollection(name: string, values: { id: string }[]): Promise<void> {
  for (let offset = 0; offset < values.length; offset += 400) {
    const batch = db.batch();
    for (const value of values.slice(offset, offset + 400)) batch.set(db.collection(name).doc(value.id), value, { merge: false });
    await batch.commit();
  }
}

async function main(): Promise<void> {
  await upsertCollection('cities', snapshot.cities);
  await upsertCollection('places', snapshot.places);
  await upsertCollection('experiences', snapshot.experiences);
  await upsertCollection('events', snapshot.events);
  await upsertCollection('ideas', snapshot.ideas);
  await upsertCollection('guides', snapshot.guides);
  await db.collection('catalogMeta').doc(snapshot.cityId).set({
    cityId: snapshot.cityId,
    schemaVersion: snapshot.schemaVersion,
    catalogVersion: snapshot.catalogVersion,
    updatedAt: new Date().toISOString(),
  }, { merge: false });

  // Cheap read-back guard: IDs must exist after the write. Full parity lives in checkCatalogParity.ts.
  for (const [name, expected] of Object.entries(counts)) {
    const result = await db.collection(name).orderBy(FieldPath.documentId()).limit(expected + 1).get();
    if (result.size < expected) throw new Error(`${name}: seed read-back found ${result.size}, expected at least ${expected}.`);
  }
  console.log('Catalog seed complete', { environment, projectId, version: snapshot.catalogVersion, counts });
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
