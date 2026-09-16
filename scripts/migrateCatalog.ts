import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { CATALOG_SCHEMA_VERSION, embeddedCatalog } from '../src/data/catalog';
import { isHardExcludedPlace } from '../src/contentPolicy';

const projectId = process.argv.find(item => item.startsWith('--project='))?.slice('--project='.length);
const apply = process.argv.includes('--apply');
const environment = process.argv.find(item => item.startsWith('--environment='))?.slice('--environment='.length) ?? 'development';
const confirmation = process.argv.find(item => item.startsWith('--confirm-production='))?.slice('--confirm-production='.length);
if (!projectId) throw new Error('Migration inspection requires --project=<firebase-project-id>.');
if (environment === 'production' && apply && confirmation !== projectId) throw new Error('Production migration requires --confirm-production=<same-project-id>.');

if (!getApps().length) initializeApp({ projectId, credential: applicationDefault() });
const db = getFirestore();
const known = embeddedCatalog('ankara');
const ankaraIds = {
  places: new Set(known.places.map(item => item.id)),
  experiences: new Set(known.experiences.map(item => item.id)),
  events: new Set(known.events.map(item => item.id)),
  guides: new Set(known.guides.map(item => item.id)),
};
const planned: { collection: keyof typeof ankaraIds; id: string }[] = [];
const remotePlacePreflight = {
  hardExcludedIds: [] as string[],
  deprecatedIds: [] as string[],
  verificationRequiredIds: [] as string[],
  missingOrInvalidStatusIds: [] as string[],
};

async function main(): Promise<void> {
  for (const collectionName of Object.keys(ankaraIds) as (keyof typeof ankaraIds)[]) {
    const docs = await db.collection(collectionName).get();
    for (const document of docs.docs) {
      if (document.data().cityId === undefined && ankaraIds[collectionName].has(document.id)) planned.push({ collection: collectionName, id: document.id });
    }
  }
  const placeDocs = await db.collection('places').get();
  for (const document of placeDocs.docs) {
    const data = document.data();
    const identity = {
      id: document.id,
      name: typeof data.name === 'string' ? data.name : document.id,
      aliases: Array.isArray(data.aliases) ? data.aliases.filter((item): item is string => typeof item === 'string') : undefined,
    };
    if (isHardExcludedPlace(identity)) remotePlacePreflight.hardExcludedIds.push(document.id);
    if (data.status === 'deprecated') remotePlacePreflight.deprecatedIds.push(document.id);
    else if (data.status === 'verification_required') remotePlacePreflight.verificationRequiredIds.push(document.id);
    else if (data.status !== 'active') remotePlacePreflight.missingOrInvalidStatusIds.push(document.id);
  }
  const meta = (await db.collection('catalogMeta').doc('ankara').get()).data();
  console.log('Catalog migration plan', {
    projectId,
    environment,
    apply,
    addAnkaraCityId: planned.length,
    targetSchemaVersion: CATALOG_SCHEMA_VERSION,
    remoteSchemaVersion: meta?.schemaVersion ?? '(missing)',
    schemaMismatch: meta?.schemaVersion !== CATALOG_SCHEMA_VERSION,
    remotePlacePreflight,
    note: 'Preflight only: hard-excluded and status findings are never deleted or rewritten by this migration.',
  });
  if (!apply || !planned.length) return;
  for (let offset = 0; offset < planned.length; offset += 400) {
    const batch = db.batch();
    for (const item of planned.slice(offset, offset + 400)) batch.update(db.collection(item.collection).doc(item.id), { cityId: 'ankara' });
    await batch.commit();
  }
  console.log('Catalog migration applied', { updated: planned.length });
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
