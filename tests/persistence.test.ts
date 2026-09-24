import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clearPreferences,
  emptyPreferences,
  LEGACY_PREFERENCE_STORAGE_KEYS,
  loadPreferences,
  migratePreferences,
  PREFERENCE_STORAGE_KEY,
  PreferenceStorage,
  serializePreferences,
} from '../src/persistence';

type MemoryStoreOptions = {
  failSet?: boolean;
  failRemove?: string;
};

function memoryStore(
  entries: Array<[string, string]> = [],
  options: MemoryStoreOptions = {},
): { data: Map<string, string>; events: string[]; store: PreferenceStorage } {
  const data = new Map(entries);
  const events: string[] = [];
  return {
    data,
    events,
    store: {
      getItem: async key => {
        events.push(`get:${key}`);
        return data.get(key) ?? null;
      },
      setItem: async (key, value) => {
        events.push(`set:${key}`);
        if (options.failSet) throw new Error('write failed');
        data.set(key, value);
      },
      removeItem: async key => {
        events.push(`remove:${key}`);
        if (options.failRemove === key) throw new Error('remove failed');
        data.delete(key);
      },
    },
  };
}

const v4Key = LEGACY_PREFERENCE_STORAGE_KEYS[0];
const v3Key = LEGACY_PREFERENCE_STORAGE_KEYS[1];
const v2Key = LEGACY_PREFERENCE_STORAGE_KEYS[2];
const v1Key = LEGACY_PREFERENCE_STORAGE_KEYS[3];

test('canonical v5 remains authoritative and stale legacy copies are cleaned', async () => {
  const canonical = migratePreferences({ ...emptyPreferences, saved: ['canonical-place'], mood: 'Sakin' });
  const legacy = migratePreferences({ ...emptyPreferences, saved: ['legacy-place'] });
  const { data, store } = memoryStore([
    [PREFERENCE_STORAGE_KEY, serializePreferences(canonical)],
    [v4Key, serializePreferences(legacy)],
    [v1Key, serializePreferences(legacy)],
  ]);

  assert.deepEqual(await loadPreferences(store), canonical);
  assert.equal(data.get(PREFERENCE_STORAGE_KEY), serializePreferences(canonical));
  assert.equal(LEGACY_PREFERENCE_STORAGE_KEYS.some(key => data.has(key)), false);
});

test('v4 is persisted to v5 before any legacy key is removed', async () => {
  const legacy = migratePreferences({ ...emptyPreferences, dismissed: ['legacy-place'], interests: ['Sanat'] });
  const { data, events, store } = memoryStore([[v4Key, serializePreferences(legacy)]]);

  assert.deepEqual(await loadPreferences(store), legacy);
  const writeIndex = events.indexOf(`set:${PREFERENCE_STORAGE_KEY}`);
  const firstRemoveIndex = events.findIndex(event => event.startsWith('remove:'));
  assert.ok(writeIndex >= 0);
  assert.ok(firstRemoveIndex > writeIndex);
  assert.equal(data.get(PREFERENCE_STORAGE_KEY), serializePreferences(legacy));
  assert.equal(data.has(v4Key), false);
});

test('multiple legacy copies preserve newest-supported precedence before cleanup', async () => {
  const v4 = migratePreferences({ ...emptyPreferences, saved: ['from-v4'] });
  const v3 = migratePreferences({ ...emptyPreferences, saved: ['from-v3'] });
  const v1 = migratePreferences({ ...emptyPreferences, saved: ['from-v1'] });
  const { data, store } = memoryStore([
    [v1Key, serializePreferences(v1)],
    [v3Key, serializePreferences(v3)],
    [v4Key, serializePreferences(v4)],
  ]);

  assert.deepEqual(await loadPreferences(store), v4);
  assert.equal(data.get(PREFERENCE_STORAGE_KEY), serializePreferences(v4));
  assert.equal(LEGACY_PREFERENCE_STORAGE_KEYS.some(key => data.has(key)), false);
});

test('a failed canonical write returns migrated preferences and preserves every legacy copy', async () => {
  const v4 = migratePreferences({ ...emptyPreferences, saved: ['retryable-place'] });
  const v2 = migratePreferences({ ...emptyPreferences, saved: ['older-place'] });
  const { data, events, store } = memoryStore([
    [v4Key, serializePreferences(v4)],
    [v2Key, serializePreferences(v2)],
  ], { failSet: true });

  assert.deepEqual(await loadPreferences(store), v4);
  assert.equal(data.has(PREFERENCE_STORAGE_KEY), false);
  assert.equal(data.has(v4Key), true);
  assert.equal(data.has(v2Key), true);
  assert.equal(events.some(event => event.startsWith('remove:')), false);
});

test('legacy cleanup failure after a successful write does not hide usable v5 state', async () => {
  const v4 = migratePreferences({ ...emptyPreferences, saved: ['canonicalized-place'] });
  const { data, store } = memoryStore([[v4Key, serializePreferences(v4)]], { failRemove: v4Key });

  assert.deepEqual(await loadPreferences(store), v4);
  assert.equal(data.get(PREFERENCE_STORAGE_KEY), serializePreferences(v4));
  assert.equal(data.has(v4Key), true);
  assert.deepEqual(await loadPreferences(store), v4);
});

test('repeated legacy migration is idempotent', async () => {
  const legacy = migratePreferences({ ...emptyPreferences, saved: ['stable-place'] });
  const { data, events, store } = memoryStore([[v3Key, serializePreferences(legacy)]]);

  assert.deepEqual(await loadPreferences(store), legacy);
  assert.deepEqual(await loadPreferences(store), legacy);
  assert.equal(data.get(PREFERENCE_STORAGE_KEY), serializePreferences(legacy));
  assert.equal(events.filter(event => event === `set:${PREFERENCE_STORAGE_KEY}`).length, 1);
});

test('clearPreferences still removes canonical and every legacy key', async () => {
  const { data, store } = memoryStore([
    [PREFERENCE_STORAGE_KEY, '{}'],
    ...LEGACY_PREFERENCE_STORAGE_KEYS.map(key => [key, '{}'] as [string, string]),
  ]);

  await clearPreferences(store);
  assert.equal(data.size, 0);
});

test('legacy canonicalization preserves current field migration and sanitization', async () => {
  const { data, store } = memoryStore([[v1Key, JSON.stringify({
    saved: ['a', 'a'],
    dismissed: ['b'],
    mood: 'Sakin',
    interests: ['Sanat', 'Invalid'],
    budget: 'invalid',
    duration: '1–2 saat',
    onboardingCompleted: true,
  })]]);

  const expected = {
    saved: ['a'],
    dismissed: ['b'],
    mood: 'Sakin' as const,
    interests: ['Sanat' as const],
    budget: undefined,
    groupSize: undefined,
    duration: '1–2 saat' as const,
    contextConfirmedAt: undefined,
    onboardingCompleted: true,
  };
  assert.deepEqual(await loadPreferences(store), expected);
  assert.equal(data.get(PREFERENCE_STORAGE_KEY), serializePreferences(expected));
});

test('malformed legacy JSON remains retryable and is not promoted or cleaned', async () => {
  const older = migratePreferences({ ...emptyPreferences, saved: ['older-readable-place'] });
  const { data, store } = memoryStore([
    [v2Key, '{broken'],
    [v1Key, serializePreferences(older)],
  ]);

  assert.deepEqual(await loadPreferences(store), emptyPreferences);
  assert.equal(data.has(PREFERENCE_STORAGE_KEY), false);
  assert.equal(data.get(v2Key), '{broken');
  assert.equal(data.get(v1Key), serializePreferences(older));
});

test('malformed v5 keeps current no-fallback behavior without deleting legacy data', async () => {
  const legacy = migratePreferences({ ...emptyPreferences, saved: ['legacy-place'] });
  const { data, store } = memoryStore([
    [PREFERENCE_STORAGE_KEY, '{broken'],
    [v4Key, serializePreferences(legacy)],
  ]);

  assert.deepEqual(await loadPreferences(store), emptyPreferences);
  assert.equal(data.get(PREFERENCE_STORAGE_KEY), '{broken');
  assert.equal(data.get(v4Key), serializePreferences(legacy));
});
