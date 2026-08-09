import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { embeddedCatalog } from '../src/data/catalog';

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
};
const planned: { collection: keyof typeof ankaraIds; id: string }[] = [];

async function main(): Promise<void> {
  for (const collectionName of Object.keys(ankaraIds) as (keyof typeof ankaraIds)[]) {
    const docs = await db.collection(collectionName).get();
    for (const document of docs.docs) {
      if (document.data().cityId === undefined && ankaraIds[collectionName].has(document.id)) planned.push({ collection: collectionName, id: document.id });
    }
  }
  console.log('Catalog migration plan', { projectId, environment, apply, addAnkaraCityId: planned.length });
  if (!apply || !planned.length) return;
  for (let offset = 0; offset < planned.length; offset += 400) {
    const batch = db.batch();
    for (const item of planned.slice(offset, offset + 400)) batch.update(db.collection(item.collection).doc(item.id), { cityId: 'ankara' });
    await batch.commit();
  }
  console.log('Catalog migration applied', { updated: planned.length });
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
