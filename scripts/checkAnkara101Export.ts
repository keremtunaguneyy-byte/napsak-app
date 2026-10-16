import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GUIDE_PRESENTATIONS } from '../src/ankara101Reader';
import { ANKARA101_INSTANCES } from '../src/components/gezek/ankara101InstanceAssets';
import { ANKARA101_CUES } from '../src/components/gezek/ankara101CueAssets';
import { ANKARA101_BINDINGS } from '../src/components/gezek/ankara101BindingAssets';

// Importing the bitmap registry executes native require(). Read static asset paths
// from provenance instead; SVG XML is compared with the actual Android JS bundle.
const directory = process.argv[2];
if (!directory) throw new Error('Pass the Expo Android --no-bytecode output directory');
function files(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(path, entry.name)) : [join(path, entry.name)]);
}
const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
const exported = new Set(files(join(directory, 'assets')).map(path => digest(readFileSync(path))));
const manifest = JSON.parse(readFileSync('docs/ankara101/asset-manifest.json', 'utf8')) as { file: string; sha256: string }[];
const approvedSvg = Object.fromEntries(manifest.filter(asset => asset.file.endsWith('.svg')).map(asset => [asset.file, { xml: readFileSync(asset.file.replace('assets/', 'assets/ankara101/production/'), 'utf8') }]));
const fonts = JSON.parse(readFileSync('assets/ankara101/fonts/provenance.json', 'utf8')) as { records: { file: string; sha256: string }[] };
for (const asset of [...manifest.filter(asset => asset.file.endsWith('.png')), ...fonts.records]) {
  if (!exported.has(asset.sha256)) throw new Error(`Missing exact bundled asset: ${asset.file}`);
}
const bundle = files(join(directory, '_expo/static/js/android')).filter(path => path.endsWith('.js')).map(path => readFileSync(path, 'utf8')).join('\n');
for (const [id, config] of Object.entries(GUIDE_PRESENTATIONS)) {
  if (!bundle.includes(id) || !bundle.includes(config.mediaKey)) throw new Error(`Missing stable-ID runtime mapping: ${id}`);
}
for (const [key, asset] of Object.entries({ ...approvedSvg, ...ANKARA101_INSTANCES, ...ANKARA101_CUES, ...ANKARA101_BINDINGS })) {
  if (!bundle.includes(JSON.stringify(asset.xml))) throw new Error(`Missing exact SVG XML: ${key}`);
}
console.log({ guides: Object.keys(GUIDE_PRESENTATIONS).length, exactPngMasters: 12, exactFonts: fonts.records.length, exactSvgRecords: Object.keys({ ...approvedSvg, ...ANKARA101_INSTANCES, ...ANKARA101_CUES, ...ANKARA101_BINDINGS }).length });
