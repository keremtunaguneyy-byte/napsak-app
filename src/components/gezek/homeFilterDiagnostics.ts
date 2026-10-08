import type { ResultFilter } from '../../resultFilters';

export type FilterTiming = {
  metric: 'filter_press_to_commit' | 'filter_press_to_frame_opportunity';
  durationMs: number;
  sequence: number;
  cold: boolean;
};

/** Local timings only: frame callbacks are not proof that Android painted. */
export function createFilterTimingRecorder(
  now: () => number,
  nextFrame: (callback: () => void) => void,
  record: (timing: FilterTiming) => void,
) {
  const visited = new Set<ResultFilter>();
  let sequence = 0;
  let pending: { filter: ResultFilter; start: number; sequence: number; cold: boolean } | undefined;
  return {
    press(filter: ResultFilter) {
      pending = { filter, start: now(), sequence: ++sequence, cold: !visited.has(filter) };
    },
    commit(filter: ResultFilter) {
      visited.add(filter);
      if (!pending || pending.filter !== filter) return;
      const current = pending;
      pending = undefined;
      record({ metric: 'filter_press_to_commit', durationMs: now() - current.start, sequence: current.sequence, cold: current.cold });
      nextFrame(() => nextFrame(() => {
        // A superseding press makes this frame unrelated to the original trial.
        if (sequence !== current.sequence) return;
        record({ metric: 'filter_press_to_frame_opportunity', durationMs: now() - current.start, sequence: current.sequence, cold: current.cold });
      }));
    },
  };
}
