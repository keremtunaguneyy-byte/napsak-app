import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { Firestore } from 'firebase-admin/firestore';
import { GoogleAuth, OAuth2Client } from 'google-auth-library';
import { isCatalogVersion } from '../src/data/catalogVersion';
import { CatalogPublisher } from './catalogPublishing';
import { candidateDigest, parsePayload } from './catalogPublishingValidation';

const projectId = 'napsak-dev';
const databaseId = '(default)';
const target = `${projectId}/${databaseId}`;
const city = 'ankara';
const digestPattern = /^[a-f0-9]{64}$/;
const usage = 'Use --target="napsak-dev/(default)" --operator=<email> with status [<legacy-version>] or validate <digest>. Writes require --allow-write and <stage|approve|publish|rollback> <manifest.json>.';

type Environment = Readonly<Record<string, string | undefined>>;
type Connection = { publisher: CatalogPublisher; close: () => Promise<void> };

async function connect(operator: string, env: Environment): Promise<Connection> {
  const token = env.GEZEK_CATALOG_ACCESS_TOKEN?.trim();
  if (!token) throw Error('Provide a short-lived Google operator token in GEZEK_CATALOG_ACCESS_TOKEN.');
  const identity = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
  });
  if (!identity.ok) throw Error('Could not verify the Google operator identity.');
  const profile = await identity.json() as { email?: string; verified_email?: boolean };
  if (profile.verified_email !== true || typeof profile.email !== 'string' || profile.email.toLowerCase() !== operator) {
    throw Error('The Google operator identity must match --operator.');
  }

  // Use the verified token itself. ADC and ambient project selection are intentionally avoided.
  const authClient = new OAuth2Client();
  authClient.setCredentials({ access_token: token });
  const auth = new GoogleAuth({ authClient, projectId });
  const db = new Firestore({ projectId, databaseId, host: 'firestore.googleapis.com', ssl: true, auth });
  return { publisher: new CatalogPublisher(db), close: () => db.terminate() };
}

function loadWriteOperation(command: string, file: string, operator: string) {
  const manifest = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown> | null;
  if (manifest?.target !== target || manifest.city !== city || manifest.operator !== operator || manifest.operation !== command) {
    throw Error('The manifest must match the target, city, operator and requested operation.');
  }

  if (command === 'rollback') {
    const { from, good, version } = manifest;
    if (!isCatalogVersion(from) || !isCatalogVersion(good) || !isCatalogVersion(version)) {
      throw Error('Use exact active, known-good and new versions for rollback.');
    }
    return (publisher: CatalogPublisher) => publisher.rollback(from, good, version);
  }

  const { mode, base, legacy, digest, candidateFile, rollbackFile } = manifest;
  const subsequent = mode === 'subsequent';
  if (mode !== undefined && !subsequent) throw Error('Unknown catalog publication mode.');
  if (!isCatalogVersion(base) || typeof digest !== 'string' || !digestPattern.test(digest) || typeof candidateFile !== 'string') {
    throw Error('Specify the exact base, SHA-256 digest and candidate snapshot file.');
  }
  if (subsequent && (legacy !== undefined || rollbackFile !== undefined)) {
    throw Error('A subsequent release must not include schema-1 cutover fields.');
  }
  if (!subsequent && (!isCatalogVersion(legacy) || typeof rollbackFile !== 'string')) {
    throw Error('A first cutover requires the exact base, legacy version, paired digest and both snapshot files.');
  }
  function readSnapshot(snapshotFile: string) {
    const input = readFileSync(resolve(dirname(file), snapshotFile));
    // Keep a BOM visible to the JSON parser and reject malformed UTF-8 before hashing.
    const bytes = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(input);
    parsePayload(bytes);
    const value: unknown = JSON.parse(bytes);
    if (JSON.stringify(value) !== bytes) throw Error('Use the exact serialized JSON snapshot bytes from the approval receipt.');
    return { bytes, value };
  }
  const candidate = readSnapshot(candidateFile);
  const rollback = typeof rollbackFile === 'string' ? readSnapshot(rollbackFile) : undefined;
  const expectedLegacy = isCatalogVersion(legacy) ? legacy : undefined;
  if (candidateDigest(base, candidate.bytes, expectedLegacy, rollback?.bytes, subsequent) !== digest) {
    throw Error(subsequent ? 'The snapshot file does not match the approved subsequent digest.'
      : 'The snapshot files do not match the approved paired digest.');
  }
  if (command === 'stage') return (publisher: CatalogPublisher) =>
    publisher.stage(base, candidate.value, expectedLegacy, rollback?.value, subsequent);
  if (command === 'approve') return (publisher: CatalogPublisher) => publisher.reviewCandidate(digest, true);
  return (publisher: CatalogPublisher) => publisher.publish(digest);
}

export async function runNapsakDevPublisher(
  args: string[], env: Environment = process.env, open = connect,
) {
  const { values, positionals } = parseArgs({
    args, allowPositionals: true,
    options: { target: { type: 'string' }, operator: { type: 'string' }, 'allow-write': { type: 'boolean' } },
  });
  if (values.target !== target) throw Error(`Use the exact target ${target}.`);
  if (env.FIRESTORE_EMULATOR_HOST !== undefined) throw Error('Unset FIRESTORE_EMULATOR_HOST for the Napsak Dev publisher.');
  const operator = values.operator?.toLowerCase();
  if (!operator || !/^[^\s@]+@[^\s@]+$/.test(operator)) throw Error('Specify the expected operator email.');
  const [command = 'status', argument, ...extra] = positionals;
  if (extra.length) throw Error(usage);

  let execute: (publisher: CatalogPublisher) => Promise<unknown>;
  switch (command) {
    case 'status':
      if (values['allow-write'] || (argument !== undefined && !isCatalogVersion(argument))) throw Error(usage);
      execute = publisher => publisher.status(argument);
      break;
    case 'validate':
      if (values['allow-write'] || !argument || !digestPattern.test(argument)) throw Error(usage);
      execute = publisher => publisher.reviewCandidate(argument);
      break;
    case 'stage':
    case 'approve':
    case 'publish':
    case 'rollback':
      if (!values['allow-write']) throw Error('This operation requires explicit --allow-write.');
      if (!argument) throw Error(usage);
      execute = loadWriteOperation(command, argument, operator);
      break;
    default:
      throw Error(usage);
  }

  const { publisher, close } = await open(operator, env);
  try {
    return { target, city, operator, result: await execute(publisher) };
  } finally {
    await close();
  }
}

if (require.main === module) {
  runNapsakDevPublisher(process.argv.slice(2)).then(console.log).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Catalog publisher failed.');
    process.exitCode = 1;
  });
}
