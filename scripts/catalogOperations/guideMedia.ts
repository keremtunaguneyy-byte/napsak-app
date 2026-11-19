import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import manifest from '../../docs/ankara101/asset-manifest.json';
import approval from '../../docs/ankara101/final-guide-comparison.json';
import { GUIDE_PRESENTATIONS } from '../../src/ankara101Reader';
import type { Guide } from '../../src/types';

export const guideRegistry = 'src/components/gezek/ankara101Assets.ts';

type Presentations = Readonly<Partial<Record<string, { mediaKey: string }>>>;

// Evaluate the repository's registry with Metro-style numeric image handles.
// The adapter records asset requests and never loads code or decodes images.
function readBindings(source: string) {
  const paths = new Map<number, string>();
  const handles = new Map<string, number>();
  const code = ts.transpileModule(source, {
    fileName: guideRegistry,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, verbatimModuleSyntax: false },
  }).outputText;
  const entries: [string, unknown][] = runInNewContext(code + '\nObject.entries(exports.ANKARA101_MEDIA ?? {});', {
    exports: {},
    require: (request: string) => {
      if (typeof request !== 'string' || !/^\.\.?\/.+\.png$/.test(request)) throw Error('Unsupported Guide registry import');
      const asset = resolve(dirname(guideRegistry), request);
      const existing = handles.get(asset);
      if (existing !== undefined) return existing;
      const handle = handles.size + 1;
      handles.set(asset, handle);
      paths.set(handle, request);
      return handle;
    },
  }, { filename: guideRegistry, timeout: 1000 });
  return new Map(entries.map(([key, handle]) => [key, typeof handle === 'number' ? paths.get(handle) : undefined]));
}

export function guideMedia(
  guides: readonly Guide[],
  source = readFileSync(guideRegistry, 'utf8'),
  presentations: Presentations = GUIDE_PRESENTATIONS,
) {
  const bindings = readBindings(source);
  const catalogIds = new Set(guides.map(g => g.id));
  const approved = new Map(approval.guides.map(guide => [guide.guideId, guide.image.mediaKey]));
  if (!approved.size || approved.size !== approval.guides.length) throw Error('Invalid approved Guide ledger');
  const expectedKeys = new Set(approved.values());
  const masters = new Map(manifest.filter(entry => entry.role === 'editorial_media_master').map(entry => [entry.guide_id, entry]));
  const records = [...approved.keys()].sort().map(id => {
    const key = approved.get(id)!;
    const presentation = presentations[id];
    const presentationKey = presentation?.mediaKey ?? null;
    const binding = presentationKey === null ? undefined : bindings.get(presentationKey);
    const master = masters.get(id);
    function bindingStatus() {
      if (presentationKey === null) return null;
      if (!bindings.has(presentationKey)) return 'guide_media_binding_missing';
      if (!binding || !master) return 'guide_media_unresolved';
      const path = resolve(dirname(guideRegistry), binding);
      if (!statSync(path, { throwIfNoEntry: false })?.isFile()) return 'guide_media_unresolved';
      const approvedPath = resolve(master.file.replace(/^assets\//, 'assets/ankara101/production/'));
      if (path !== approvedPath) return 'guide_media_alternate_asset';
      const digest = createHash('sha256').update(readFileSync(path)).digest('hex');
      return digest === master.sha256 ? 'guide_media_explicit' : 'guide_media_unresolved';
    }
    const media = bindingStatus();
    const present = catalogIds.has(id);
    const issues: string[] = [];
    if (!present) issues.push('guide_catalog_missing');
    if (!presentation) issues.push('guide_presentation_missing');
    else if (presentationKey !== key) issues.push('guide_presentation_media_key_mismatch');
    if (media !== null && media !== 'guide_media_explicit') issues.push(media);
    // This flag records an absent or unapproved source at a reachable media slot.
    const fallback = present && Boolean(presentation) && (presentationKey !== key || media !== 'guide_media_explicit');
    if (fallback) issues.push('guide_media_fallback');
    return { id, key, presentationKey, catalogPresent: present, binding: binding ?? null, media, fallback, issues };
  });
  const missingGuideMedia = records.filter(r => r.issues.length).map(r => r.id);
  const unexpectedPresentationIds = Object.keys(presentations).filter(id => !approved.has(id)).sort();
  return {
    passed: missingGuideMedia.length === 0 && unexpectedPresentationIds.length === 0,
    total: records.length,
    resolved: records.length - missingGuideMedia.length,
    missingGuideMedia,
    records,
    unexpectedCatalogIds: [...catalogIds].filter(id => !approved.has(id)).sort(),
    unexpectedPresentationIds,
    unexpectedBindingKeys: [...bindings.keys()].filter(key => !expectedKeys.has(key)).sort(),
  };
}
