import type { ResultFilter } from './resultFilters';

export type ManagementCaller = 'results' | 'saved' | 'guides';
export type ManagementOrigin = { screen: ManagementCaller; scrollY: number; filter: ResultFilter; focus: 'settings' | 'hidden' };
export type ManagementSession = { origin: ManagementOrigin; hiddenFrom: 'settings' | 'results' };

/** A management host borrows the caller's context; it owns no recommendation run. */
export function managementBack(screen: 'settings' | 'hidden', session: ManagementSession): ManagementCaller | 'settings' {
  return screen === 'hidden' && session.hiddenFrom === 'settings' ? 'settings' : session.origin.screen;
}
export function managementTab(origin: ManagementOrigin): 'home' | 'saved' | 'guides' {
  return origin.screen === 'results' ? 'home' : origin.screen;
}
