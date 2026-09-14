const assert = require('node:assert/strict');
const test = require('node:test');
const {
  androidApplicationIdSyntaxValid,
  externalEvidenceBlockerOpen,
  iosBundleIdentifierSyntaxValid,
} = require('../.test-build/releaseIdentity.js');

test('Android accepts valid two- and three-segment application IDs', () => {
  assert.equal(androidApplicationIdSyntaxValid('com.getnapsak'), true);
  assert.equal(androidApplicationIdSyntaxValid('com.getnapsak.app'), true);
});

test('Android rejects one-segment, malformed, uppercase, and placeholder IDs', () => {
  for (const value of [
    'getnapsak',
    '.com.getnapsak',
    'com.',
    'com..getnapsak',
    'com.1getnapsak',
    'com.get-napsak',
    'Com.getnapsak',
    'com.getnapsak!',
    'com.example',
    'your_company.app',
  ]) {
    assert.equal(androidApplicationIdSyntaxValid(value), false, value);
  }
});

test('iOS accepts valid two- and three-segment bundle identifiers', () => {
  assert.equal(iosBundleIdentifierSyntaxValid('com.getnapsak'), true);
  assert.equal(iosBundleIdentifierSyntaxValid('com.getnapsak.app'), true);
  assert.equal(iosBundleIdentifierSyntaxValid('com.get-napsak'), true);
});

test('iOS rejects one-segment, malformed, and placeholder identifiers', () => {
  for (const value of [
    'getnapsak',
    '.com.getnapsak',
    'com.',
    'com..getnapsak',
    'com.1getnapsak',
    'com._getnapsak',
    'com.getnapsak!',
    'com.example',
    'your-company.app',
  ]) {
    assert.equal(iosBundleIdentifierSyntaxValid(value), false, value);
  }
});

test('external evidence remains independent from syntax validity', () => {
  assert.equal(externalEvidenceBlockerOpen(true, true), true);
  assert.equal(externalEvidenceBlockerOpen(true, false), false);
  assert.equal(externalEvidenceBlockerOpen(false, false), true);
});
