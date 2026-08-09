const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { doc, getDoc, serverTimestamp, setDoc } = require('firebase/firestore');

let environment;

test.before(async () => {
  environment = await initializeTestEnvironment({
    projectId: 'demo-napsak',
    firestore: { rules: fs.readFileSync(path.join(process.cwd(), 'firestore.rules'), 'utf8') },
  });
});

test.after(async () => {
  await environment?.cleanup();
});

test.beforeEach(async () => {
  await environment.clearFirestore();
});

test('catalog reads require authentication and client catalog writes are denied', async () => {
  const anonymous = environment.unauthenticatedContext().firestore();
  const alice = environment.authenticatedContext('alice').firestore();
  await assertFails(getDoc(doc(anonymous, 'cities', 'ankara')));
  await assertSucceeds(getDoc(doc(alice, 'cities', 'ankara')));
  await assertFails(setDoc(doc(alice, 'cities', 'ankara'), { id: 'ankara' }));
  await assertFails(getDoc(doc(anonymous, 'guides', 'guide-ankara-kalesi')));
  await assertSucceeds(getDoc(doc(alice, 'guides', 'guide-ankara-kalesi')));
  await assertFails(setDoc(doc(alice, 'guides', 'guide-ankara-kalesi'), { id: 'guide-ankara-kalesi' }));
});

test('a user can write only a bounded valid document at their own uid', async () => {
  const alice = environment.authenticatedContext('alice').firestore();
  const bob = environment.authenticatedContext('bob').firestore();
  const valid = {
    schemaVersion: 1,
    saved: ['place-1'],
    dismissed: [],
    interests: ['Kahve'],
    deviceMigrationVersion: 1,
    updatedAt: serverTimestamp(),
  };
  await assertSucceeds(setDoc(doc(alice, 'users', 'alice'), valid));
  await assertSucceeds(getDoc(doc(alice, 'users', 'alice')));
  await assertFails(getDoc(doc(bob, 'users', 'alice')));
  await assertFails(setDoc(doc(bob, 'users', 'alice'), valid));
  await assertFails(setDoc(doc(alice, 'users', 'alice'), { ...valid, role: 'admin' }));
});

test('user state rejects oversized arrays', async () => {
  const alice = environment.authenticatedContext('alice').firestore();
  const oversized = {
    schemaVersion: 1,
    saved: Array.from({ length: 501 }, (_, index) => `item-${index}`),
    dismissed: [],
    interests: ['Kahve'],
    deviceMigrationVersion: 1,
    updatedAt: serverTimestamp(),
  };
  await assertFails(setDoc(doc(alice, 'users', 'alice'), oversized));
});

test('unknown collections are denied by default', async () => {
  const alice = environment.authenticatedContext('alice').firestore();
  await assertFails(getDoc(doc(alice, 'privateAdmin', 'anything')));
  assert.ok(true);
});
