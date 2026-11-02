export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const WS_BASE_URL =
  import.meta.env.VITE_SOCKET_URL ?? API_BASE_URL;

export const API_TIMEOUT_MS = 10_000;
