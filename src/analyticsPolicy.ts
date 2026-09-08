import type { PerformanceDurationBucket, PerformanceMetric } from './performancePolicy';

export const ANALYTICS_SCHEMA_VERSION = 2 as const;

export type AnalyticsScreen =
  | 'welcome'
  | 'mood'
  | 'interest'
  | 'budget'
  | 'group'
  | 'duration'
  | 'results'
  | 'saved'
  | 'hidden'
  | 'guides_landing'
  | 'guides_classics'
  | 'guides_insider'
  | 'settings';

export type AnalyticsFilter = 'all' | 'experience' | 'place' | 'event' | 'idea';
export type AnalyticsItemKind = 'experience' | 'place' | 'event' | 'idea' | 'guide' | 'route';

export type ProductAnalyticsInput =
  | { name: 'screen_viewed'; properties: { screen: AnalyticsScreen } }
  | { name: 'preference_flow_completed'; properties: { mode: 'onboarding' | 'update' } }
  | { name: 'context_refresh_answered'; properties: { action: 'confirm' | 'edit' } }
  | { name: 'recommendation_batch_viewed'; properties: { filter: AnalyticsFilter; count: number; trigger: 'initial' | 'filter' | 'rotate' } }
  | { name: 'recommendation_action'; properties: { action: 'save' | 'unsave' | 'dismiss' | 'restore'; itemKind: AnalyticsItemKind; rank?: number } }
  | { name: 'external_action'; properties: { action: 'map' | 'source'; itemKind: AnalyticsItemKind } }
  | { name: 'location_permission_result'; properties: { result: 'granted' | 'denied' | 'error' } }
  | { name: 'performance_sampled'; properties: { metric: PerformanceMetric; durationBucket: PerformanceDurationBucket } };

export type ProductAnalyticsEvent = ProductAnalyticsInput & {
  schemaVersion: typeof ANALYTICS_SCHEMA_VERSION;
};

const EXACT_KEYS: Record<ProductAnalyticsInput['name'], readonly string[]> = {
  screen_viewed: ['screen'],
  preference_flow_completed: ['mode'],
  context_refresh_answered: ['action'],
  recommendation_batch_viewed: ['filter', 'count', 'trigger'],
  recommendation_action: ['action', 'itemKind', 'rank'],
  external_action: ['action', 'itemKind'],
  location_permission_result: ['result'],
  performance_sampled: ['metric', 'durationBucket'],
};

const SCREENS = new Set<AnalyticsScreen>(['welcome', 'mood', 'interest', 'budget', 'group', 'duration', 'results', 'saved', 'hidden', 'guides_landing', 'guides_classics', 'guides_insider', 'settings']);
const FILTERS = new Set<AnalyticsFilter>(['all', 'experience', 'place', 'event', 'idea']);
const ITEM_KINDS = new Set<AnalyticsItemKind>(['experience', 'place', 'event', 'idea', 'guide', 'route']);

function exactProperties(name: ProductAnalyticsInput['name'], properties: Record<string, unknown>): boolean {
  const allowed = EXACT_KEYS[name];
  return !!allowed && Object.keys(properties).every(key => allowed.includes(key));
}

export function createProductAnalyticsEvent(input: ProductAnalyticsInput): ProductAnalyticsEvent {
  if (!input || typeof input !== 'object' || !input.properties || typeof input.properties !== 'object') {
    throw new Error('Analytics event must contain an allowlisted name and properties object.');
  }
  const properties = input.properties as Record<string, unknown>;
  if (!exactProperties(input.name, properties)) throw new Error(`Analytics event ${input.name} contains a forbidden property.`);

  switch (input.name) {
    case 'screen_viewed':
      if (Object.keys(properties).length !== 1 || !SCREENS.has(input.properties.screen)) throw new Error('Analytics screen is not allowlisted.');
      break;
    case 'preference_flow_completed':
      if (Object.keys(properties).length !== 1 || !['onboarding', 'update'].includes(input.properties.mode)) throw new Error('Preference flow mode is invalid.');
      break;
    case 'context_refresh_answered':
      if (Object.keys(properties).length !== 1 || !['confirm', 'edit'].includes(input.properties.action)) throw new Error('Context refresh action is invalid.');
      break;
    case 'recommendation_batch_viewed':
      if (Object.keys(properties).length !== 3 || !FILTERS.has(input.properties.filter) || !Number.isInteger(input.properties.count) || input.properties.count < 0 || input.properties.count > 5 || !['initial', 'filter', 'rotate'].includes(input.properties.trigger)) {
        throw new Error('Recommendation batch analytics properties are invalid.');
      }
      break;
    case 'recommendation_action':
      if (!['save', 'unsave', 'dismiss', 'restore'].includes(input.properties.action) || !ITEM_KINDS.has(input.properties.itemKind) || (input.properties.rank !== undefined && (!Number.isInteger(input.properties.rank) || input.properties.rank < 1 || input.properties.rank > 5))) {
        throw new Error('Recommendation action analytics properties are invalid.');
      }
      break;
    case 'external_action':
      if (Object.keys(properties).length !== 2 || !['map', 'source'].includes(input.properties.action) || !ITEM_KINDS.has(input.properties.itemKind)) throw new Error('External action properties are invalid.');
      break;
    case 'location_permission_result':
      if (Object.keys(properties).length !== 1 || !['granted', 'denied', 'error'].includes(input.properties.result)) throw new Error('Location permission result is invalid.');
      break;
    case 'performance_sampled':
      if (
        Object.keys(properties).length !== 2
        || !['app_ready', 'recommendation_compute'].includes(input.properties.metric)
        || !['lt_10_ms', '10_49_ms', '50_199_ms', '200_999_ms', 'gte_1000_ms'].includes(input.properties.durationBucket)
      ) throw new Error('Performance sample properties are invalid.');
      break;
    default:
      throw new Error('Analytics event name is not allowlisted.');
  }

  return { ...input, schemaVersion: ANALYTICS_SCHEMA_VERSION };
}
