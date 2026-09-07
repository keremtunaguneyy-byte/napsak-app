import { registerRootComponent } from 'expo';

import App from './App';
import { initializeObservability, ObservedApp } from './src/observability';

initializeObservability(process.env);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(ObservedApp(App));
