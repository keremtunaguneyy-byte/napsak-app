import { readFileSync } from 'node:fs';
import { deleteApp } from 'firebase-admin/app';
import { CatalogPublisher, openPublishingEmulator } from './catalogPublishing';

const usage = 'Use status [--expect-schema-1 <legacy-version>] | stage <base-version> <snapshot.json> [--expect-schema-1 <legacy-version> --rollback-snapshot <rollback.json>] | validate <digest> | approve <digest> | publish <digest> | confirm-good <active-version> | rollback <bad-version> <good-version> <new-version>.';

async function main() {
  const [command, ...args] = process.argv.slice(2);
  const { app, db } = openPublishingEmulator();
  try {
    const publisher = new CatalogPublisher(db);
    if (command === 'status' && !args.length) return await publisher.status();
    if (command === 'status' && args.length === 2 && args[0] === '--expect-schema-1') return await publisher.status(args[1]);
    if (command === 'stage' && args.length === 2) return await publisher.stage(args[0], JSON.parse(readFileSync(args[1], 'utf8')));
    if (command === 'stage' && args.length === 6 && args[2] === '--expect-schema-1' && args[4] === '--rollback-snapshot') {
      return await publisher.stage(args[0], JSON.parse(readFileSync(args[1], 'utf8')), args[3], JSON.parse(readFileSync(args[5], 'utf8')));
    }
    if (command === 'validate' && args.length === 1) return await publisher.reviewCandidate(args[0]);
    if (command === 'approve' && args.length === 1) return await publisher.reviewCandidate(args[0], true);
    if (command === 'publish' && args.length === 1) return await publisher.publish(args[0]);
    if (command === 'confirm-good' && args.length === 1) return await publisher.confirmGood(args[0]);
    if (command === 'rollback' && args.length === 3) return await publisher.rollback(args[0], args[1], args[2]);
    throw Error(usage);
  } finally {
    await deleteApp(app);
  }
}

main().then(console.log).catch(error => { console.error(error.message); process.exitCode = 1; });
