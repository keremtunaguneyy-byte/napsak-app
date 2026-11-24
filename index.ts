import { registerRootComponent } from 'expo';

import App from './App';
import { initializeObservability, ObservedApp } from './src/observability';

// Expo inlines each public environment variable into standalone bundles.
initializeObservability({
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_SERVICE_TIER: process.env.EXPO_PUBLIC_SERVICE_TIER,
  EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(ObservedApp(App));
