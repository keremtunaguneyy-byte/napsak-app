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
