import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { embeddedCatalog } from '../src/data/catalog';
import { EmbeddedContentRepository } from '../src/data/contentRepository';
import { instant } from './catalogOperations/records';
import { audit, markdown } from './catalogOperations/report';

async function main() {
  const [at, out = 'docs/evidence/catalog-operations-quality', ...extra] = process.argv.slice(2);
  if (!Number.isFinite(instant(at)) || !out || extra.length) {
    throw new Error('Usage: npm run audit:catalog-operations -- <ISO instant with timezone> [output directory]');
  }
  const catalog = embeddedCatalog();
  const report = await audit(catalog, new Date(at), await new EmbeddedContentRepository().getCatalogMeta(catalog.cityId));
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'audit.json'), JSON.stringify(report, null, 2) + '\n');
  writeFileSync(join(out, 'summary.md'), markdown(report));
  if (!report.savedDestinations.passed || !report.artwork.guides.passed) process.exitCode = 1;
  console.log('Wrote catalog audit for ' + report.asOf + ' to ' + out);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
