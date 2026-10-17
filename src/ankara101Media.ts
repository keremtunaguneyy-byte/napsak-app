/** One selected hero may decode before navigation; never hold a tap indefinitely. */
export const ANKARA101_IMAGE_HOLD_MS = 200;
export type Ankara101Warmup = { token: number; mediaKey: string; width: number; height: number };
type Schedule = (callback: () => void, ms: number) => () => void;
const schedule: Schedule = (callback, ms) => { const timer = setTimeout(callback, ms); return () => clearTimeout(timer); };
export function createAnkara101ImageOpening(emit: (request?: Ankara101Warmup) => void, clock: Schedule = schedule) {
  let sequence = 0;
  let pending: { request: Ankara101Warmup; commit: () => void; stop: () => void } | undefined;
  const recent: string[] = [];
  const remember = (key: string) => { const i = recent.indexOf(key); if (i >= 0) recent.splice(i, 1); recent.push(key); if (recent.length > 3) recent.shift(); };
  const cancel = () => { if (!pending) return; pending.stop(); pending = undefined; emit(undefined); };
  const finish = (token: number, decoded: boolean) => {
    if (!pending || pending.request.token !== token) return;
    const current = pending;
    if (decoded) remember(current.request.mediaKey);
    cancel(); current.commit();
  };
  return {
    remember, cancel, finish,
    start(mediaKey: string, width: number, height: number, commit: () => void) {
      cancel();
      if (recent.includes(mediaKey)) { remember(mediaKey); commit(); return; }
      const request = { token: ++sequence, mediaKey, width, height };
      pending = { request, commit, stop: () => {} };
      pending.stop = clock(() => finish(request.token, false), ANKARA101_IMAGE_HOLD_MS);
      emit(request);
    },
  };
}

/** Text remains mounted; only nearby thumbnail image views consume decode work. */
export function visibleAnkara101Media(frames: Record<string, { y: number; height: number }>, y: number, height: number) {
  return Object.entries(frames).filter(([, f]) => f.height > 0 && f.y + f.height >= y - 80 && f.y <= y + height + 80)
    .sort((a, b) => Math.abs(a[1].y + a[1].height / 2 - y - height / 2) - Math.abs(b[1].y + b[1].height / 2 - y - height / 2))
    .slice(0, 4).map(([id]) => id).sort();
}
