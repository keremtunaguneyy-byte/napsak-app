/** Reject superseded requests and departed views, without pretending to cancel the OS request. */
export function createLocationRequestGuard() {
  let generation = 0;
  return {
    begin: () => ++generation,
    isCurrent: (request: number) => request === generation,
    invalidate: () => { generation++; },
  };
}
