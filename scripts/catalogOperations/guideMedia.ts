import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import ts from 'typescript';
import manifest from '../../docs/ankara101/asset-manifest.json';
import { GUIDE_PRESENTATIONS, PRODUCTION_GUIDE_IDS } from '../../src/ankara101Reader';
import type { Guide } from '../../src/types';

export const guideRegistry = 'src/components/gezek/ankara101Assets.ts';

// Only the exported Metro registry's literal bindings are evidence. Comments and other registries are irrelevant.
function readBindings(source: string) {
  const file = ts.createSourceFile(guideRegistry, source, ts.ScriptTarget.Latest);
  const bindings = new Map<string, string | undefined>();
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement) || !statement.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== 'ANKARA101_MEDIA') continue;
      if (!declaration.initializer || !ts.isObjectLiteralExpression(declaration.initializer)) throw Error('Unsupported Guide media registry');
      for (const entry of declaration.initializer.properties) {
        if (!ts.isPropertyAssignment(entry) || !ts.isStringLiteral(entry.name)) throw Error('Unsupported Guide media key');
        const call = entry.initializer;
        const path = ts.isCallExpression(call) && ts.isIdentifier(call.expression) && call.expression.text === 'require'
          && call.arguments.length === 1 && ts.isStringLiteral(call.arguments[0]) ? call.arguments[0].text : undefined;
        bindings.set(entry.name.text, path);
      }
    }
  }
  return bindings;
}

export function guideMedia(guides: readonly Guide[], source = readFileSync(guideRegistry, 'utf8')) {
  const bindings = readBindings(source);
  const catalogIds = new Set(guides.map(g => g.id));
  const expected = [...PRODUCTION_GUIDE_IDS].sort();
  const expectedKeys = new Set(expected.map(id => GUIDE_PRESENTATIONS[id].mediaKey));
  const masters = new Map(manifest.filter(entry => entry.role === 'editorial_media_master').map(entry => [entry.guide_id, entry]));
  const records = expected.map(id => {
    const key = GUIDE_PRESENTATIONS[id].mediaKey;
    const binding = bindings.get(key);
    const master = masters.get(id);
    function bindingStatus() {
      if (!bindings.has(key)) return 'guide_media_binding_missing';
      if (!binding || !master) return 'guide_media_unresolved';
      const path = resolve(dirname(guideRegistry), binding);
      if (!statSync(path, { throwIfNoEntry: false })?.isFile()) return 'guide_media_unresolved';
      const approved = resolve(master.file.replace(/^assets\//, 'assets/ankara101/production/'));
      if (path !== approved) return 'guide_media_alternate_asset';
      const digest = createHash('sha256').update(readFileSync(path)).digest('hex');
      return digest === master.sha256 ? 'guide_media_explicit' : 'guide_media_unresolved';
    }
    const media = bindingStatus();
    const present = catalogIds.has(id);
    const issues: string[] = [];
    if (!present) issues.push('guide_catalog_missing');
    if (media !== 'guide_media_explicit') issues.push(media);
    // The native slot displays its placeholder when its source is absent or fails to load.
    const fallback = present && media !== 'guide_media_explicit';
    if (fallback) issues.push('guide_media_fallback');
    return { id, key, catalogPresent: present, binding: binding ?? null, media, fallback, issues };
  });
  const missingGuideMedia = records.filter(r => r.issues.length).map(r => r.id);
  return { passed: missingGuideMedia.length === 0, total: expected.length, resolved: expected.length - missingGuideMedia.length, missingGuideMedia, records,
    unexpectedCatalogIds: [...catalogIds].filter(id => !PRODUCTION_GUIDE_IDS.includes(id)).sort(),
    unexpectedBindingKeys: [...bindings.keys()].filter(key => !expectedKeys.has(key)).sort() };
}
