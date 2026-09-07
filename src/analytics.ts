import { captureOperationalError } from './observability';
import { createProductAnalyticsEvent, ProductAnalyticsEvent, ProductAnalyticsInput } from './analyticsPolicy';

export interface AnalyticsTransport {
  send(event: ProductAnalyticsEvent): Promise<void> | void;
}

let transport: AnalyticsTransport | undefined;

export function configureAnalyticsTransport(next?: AnalyticsTransport): void {
  transport = next;
}

export function trackProductEvent(input: ProductAnalyticsInput): void {
  const event = createProductAnalyticsEvent(input);
  if (!transport) return;
  try {
    Promise.resolve(transport.send(event)).catch(error => {
      captureOperationalError(error, 'remote_sync', 'analytics_transport_failed');
    });
  } catch (error) {
    captureOperationalError(error, 'remote_sync', 'analytics_transport_failed');
  }
}
