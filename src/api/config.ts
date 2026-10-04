import Constants from 'expo-constants';
import { Platform } from 'react-native';

const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const metroUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;
let metroHost: string | undefined;

if (metroUri) {
  try {
    metroHost = new URL(metroUri.includes('://') ? metroUri : `http://${metroUri}`).hostname;
  } catch {
    metroHost = undefined;
  }
}

const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const apiHost = metroHost && metroHost !== 'localhost' && metroHost !== '127.0.0.1'
  ? metroHost
  : defaultHost;

export const API_BASE_URL = configuredUrl?.replace(/\/$/, '') ?? `http://${apiHost}:3001`;
