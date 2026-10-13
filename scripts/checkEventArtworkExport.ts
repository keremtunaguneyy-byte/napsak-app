import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { events } from '../src/data/events';
import { PRODUCTION_ASSET_INDEX } from '../src/components/gezek/productionAssetIndex';
import { PRODUCTION_ASSET_XML } from '../src/components/gezek/productionAssetXml';

// Expo --no-bytecode emits inspectable JS from the same Android Metro graph.
const directory = process.argv[2];
if (!directory) throw new Error('Pass the Expo Android --no-bytecode output directory');
const bundleDirectory = join(directory, '_expo/static/js/android');
const bundle = readdirSync(bundleDirectory).filter(path => path.endsWith('.js')).map(path => readFileSync(join(bundleDirectory, path), 'utf8')).join('\n');
const content: Readonly<Record<string, { artwork_key: string }>> = PRODUCTION_ASSET_INDEX.content;
const artwork: Readonly<Record<string, Readonly<Record<string, string>>>> = PRODUCTION_ASSET_INDEX.artwork;
const paths = new Set<string>();
let layoutReferences = 0;
for (const event of events) {
  const mapping = content[`event:${event.id}`];
  if (!mapping || !bundle.includes(event.id)) throw new Error(`Missing bundled Event: ${event.id}`);
  for (const layout of ['Hero', 'Square', 'Compact']) {
    const path = artwork[mapping.artwork_key]?.[layout];
    if (!path || !bundle.includes(path) || !bundle.includes(JSON.stringify(PRODUCTION_ASSET_XML[path].xml))) throw new Error(`Missing bundled SVG XML: ${event.id}/${layout}`);
    paths.add(path);
    layoutReferences++;
  }
}
console.log({ events: events.length, layoutReferences, uniqueAssets: paths.size, exactSvgXml: true });
