export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const WS_BASE_URL =
  // @ts-ignore
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WS_BASE_URL) ||
  (typeof globalThis !== 'undefined' && (globalThis as unknown as { process?: { env?: Record<string, string> } }).process?.env?.EXPO_PUBLIC_WS_BASE_URL) ||
  'ws://localhost:3000/ws/';

export const API_TIMEOUT_MS = 10000; // 10 seconds.