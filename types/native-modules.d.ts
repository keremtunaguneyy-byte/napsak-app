declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
  };
  export default AsyncStorage;
}

declare module 'expo-location' {
  export type LocationObject = { coords: { latitude: number; longitude: number } };
  export enum Accuracy { Balanced = 3 }
  export function requestForegroundPermissionsAsync(): Promise<{ status: string; canAskAgain: boolean }>;
  export function getCurrentPositionAsync(options: { accuracy: Accuracy }): Promise<LocationObject>;
}

declare module 'react-native-safe-area-context' {
  import type { ComponentType, PropsWithChildren } from 'react';
  import type { ViewProps } from 'react-native';

  type Edge = 'top' | 'right' | 'bottom' | 'left';
  export const SafeAreaProvider: ComponentType<PropsWithChildren>;
  export const SafeAreaView: ComponentType<ViewProps & { edges?: Edge[] }>;
}
