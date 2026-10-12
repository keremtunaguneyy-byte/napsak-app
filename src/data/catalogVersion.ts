/** Catalog releases use a calendar date plus a positive, unpadded revision. */
function parseCatalogVersion(value: unknown): readonly [number, number] | undefined {
  if (typeof value !== 'string') return undefined;
  const match = /^(\d{4}-\d{2}-\d{2})\.([1-9]\d*)$/.exec(value);
  if (!match || match[0] !== value || match[1].startsWith('0000-')) return undefined;
  const day = Date.parse(`${match[1]}T00:00:00.000Z`);
  const revision = Number(match[2]);
  if (!Number.isFinite(day) || new Date(day).toISOString().slice(0, 10) !== match[1]
    || !Number.isSafeInteger(revision)) return undefined;
  return [day, revision];
}

export function isCatalogVersion(value: unknown): value is string {
  return parseCatalogVersion(value) !== undefined;
}

/** Undefined means unorderable input; callers must reject it, never guess. */
export function compareCatalogVersions(left: string, right: string): -1 | 0 | 1 | undefined {
  const a = parseCatalogVersion(left), b = parseCatalogVersion(right);
  if (!a || !b) return undefined;
  const difference = a[0] - b[0] || a[1] - b[1];
  return difference < 0 ? -1 : difference > 0 ? 1 : 0;
}
